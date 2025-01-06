import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as turf from "@turf/turf";
import {
  getBoundary,
  createIncident,
} from "../../api/services/reportIncidentService";
import { compressImage } from "../../utils/imageUtils";
import useAuthStore from "../../models/stores/useAuthStore.js";
import {
  BOUNDARY_GEOJSON_URL,
  DNI_TYGODNIA_OPTIONS,
  PORA_DNIA_OPTIONS,
} from "../../constants/reportIncidentConstants.js";
import { fetchCategories } from "../../utils/categories";

/**
 * Converts a Nominatim address object into a nice single-line string,
 * e.g. "Działkowców 19, 43-380, Bielsko-Biała, Polska"
 */
function formatAddressSingleLine({ road, houseNum, postcode, city, country }) {
  const parts = [];
  const roadPart = houseNum ? `${road} ${houseNum}`.trim() : road;
  if (roadPart) parts.push(roadPart);
  if (postcode && city) {
    // "43-300, Bielsko-Biała"
    parts.push(`${postcode}, ${city}`);
  } else if (city) {
    parts.push(city);
  } else if (postcode) {
    parts.push(postcode);
  }
  if (country) parts.push(country);
  return parts.join(", ");
}

/**
 * Reverse geocoding => lat/lng to single-line address
 */
async function reverseGeocodeSingleLine(lat, lon) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Reverse geocode failed");
  }
  const data = await res.json();
  const a = data.address || {};

  const road = a.road || a.pedestrian || a.footway || "";
  const houseNum = a.house_number || "";
  const postcode = a.postcode || "";
  const city = a.city || a.town || a.village || a.county || "";
  const country = a.country || "";

  return formatAddressSingleLine({ road, houseNum, postcode, city, country });
}

/**
 * Forward geocoding => text query to lat/lng, restricted (somewhat) to Bielsko-Biała
 */
async function forwardGeocodeSingleLine(query) {
  // You can add a bounding box or "city=Bielsko-Biala" to limit results.
  // Example bounding box for Bielsko-Biała (approx):
  // &bounded=1&viewbox=19.0,49.84,19.15,49.78  (left, top, right, bottom)
  // Adjust as needed.
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&addressdetails=1&bounded=1&viewbox=19.0,49.84,19.15,49.78&q=${encodeURIComponent(
    query
  )}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Forward geocode failed");
  }
  const data = await res.json();
  if (!data.length) {
    throw new Error("No results found for that address.");
  }

  // We only take the first result (limit=1)
  const best = data[0];
  const lat = parseFloat(best.lat);
  const lon = parseFloat(best.lon);
  const a = best.address || {};

  const road = a.road || a.pedestrian || a.footway || query;
  const houseNum = a.house_number || "";
  const postcode = a.postcode || "";
  // prefer city, but fallback to (town/village/county)
  const city = a.city || a.town || a.village || a.county || "Bielsko-Biała";
  const country = a.country || "Polska";

  const addressSingleLine = formatAddressSingleLine({
    road,
    houseNum,
    postcode,
    city,
    country,
  });

  return { lat, lon, addressSingleLine };
}

export function useReportForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  const [formData, setFormData] = useState({
    category: "",
    description: "",
    location: null, // { lat, lng }
    address: "", // "Działkowców 19, 43-380, Bielsko-Biała, Polska"
    image: null,
    dataZdarzenia: "",
    dniTygodnia: [],
    poraDnia: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [boundaryError, setBoundaryError] = useState("");
  const [boundary, setBoundary] = useState(null);
  const [boundaryLoading, setBoundaryLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");

  // reCAPTCHA
  const [captchaValue, setCaptchaValue] = useState(null);
  const [captchaError, setCaptchaError] = useState("");
  const captchaRef = useRef(null);

  // Image preview
  const [preview, setPreview] = useState(null);

  // 1) Fetch categories
  useEffect(() => {
    const getCats = async () => {
      try {
        const fetched = await fetchCategories();
        setCategories(fetched);
      } catch (err) {
        setCategoriesError("Błąd podczas pobierania kategorii.");
        console.error("Error fetching categories:", err);
      } finally {
        setCategoriesLoading(false);
      }
    };
    getCats();
  }, []);

  // 2) Fetch boundary for Bielsko-Biała
  useEffect(() => {
    const fetchBoundaryData = async () => {
      try {
        const data = await getBoundary(BOUNDARY_GEOJSON_URL);
        setBoundary(data);
      } catch (err) {
        console.error("Error loading boundary GeoJSON:", err);
        setBoundaryError("Nie udało się załadować granicy miasta.");
      } finally {
        setBoundaryLoading(false);
      }
    };
    fetchBoundaryData();
  }, []);

  // 3) Possibly pre-select category from URL
  useEffect(() => {
    if (categories.length > 0) {
      const params = new URLSearchParams(location.search);
      const selectedCategory = params.get("category");
      if (
        selectedCategory &&
        categories.some((cat) => cat.value === selectedCategory)
      ) {
        setFormData((prev) => ({ ...prev, category: selectedCategory }));
      }
    }
  }, [location.search, categories]);

  // Cleanup old preview on unmount
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview.url);
    };
  }, [preview]);

  // ========== Handlers ==========

  const handleFormChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddressChange = (e) => {
    setFormData((prev) => ({ ...prev, address: e.target.value }));
  };

  const handleDniTygodniaChange = (event) => {
    const { value } = event.target;
    setFormData((prev) => ({
      ...prev,
      dniTygodnia: typeof value === "string" ? value.split(",") : value,
    }));
  };

  const handlePoraDniaChange = (event) => {
    setFormData((prev) => ({ ...prev, poraDnia: event.target.value }));
  };

  // For image
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsSubmitting(true);
    try {
      const compressedFile = await compressImage(file);
      const extension = compressedFile.type.split("/")[1];
      const newFileName = `${Date.now()}.${extension}`;
      const renamedFile = new File([compressedFile], newFileName, {
        type: compressedFile.type,
      });

      const newPreview = {
        url: URL.createObjectURL(renamedFile),
        name: renamedFile.name,
      };
      if (preview) URL.revokeObjectURL(preview.url);

      setPreview(newPreview);
      setFormData((prev) => ({ ...prev, image: renamedFile }));
    } catch (err) {
      console.error("Error processing image:", err);
      setError("Błąd podczas przetwarzania zdjęcia. Szczegóły: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveImage = () => {
    if (preview) {
      URL.revokeObjectURL(preview.url);
    }
    setPreview(null);
    setFormData((prev) => ({ ...prev, image: null }));
  };

  // reCAPTCHA
  const handleCaptchaChange = (value) => {
    setCaptchaValue(value);
    if (value) setCaptchaError("");
  };

  /**
   * Clicking the map => Reverse geocode => single-line address
   */
  const handleMapClick = async (latlng) => {
    if (!boundary) return;
    const { lat, lng } = latlng;

    // boundary check
    const point = turf.point([lng, lat]);
    const polygon = turf.polygon(boundary.features[0].geometry.coordinates);
    const isInside = turf.booleanPointInPolygon(point, polygon);

    if (!isInside) {
      setBoundaryError("Proszę wybrać lokalizację wewnątrz Bielska-Białej.");
      setSnackbarOpen(true);
      return;
    }

    try {
      const addressSingleLine = await reverseGeocodeSingleLine(lat, lng);
      setFormData((prev) => ({
        ...prev,
        location: { lat, lng },
        address: addressSingleLine,
      }));
      setBoundaryError("");
    } catch (err) {
      console.error("Reverse geocode failed:", err);
      setFormData((prev) => ({
        ...prev,
        location: { lat, lng },
        address: "",
      }));
    }
  };

  /**
   * Searching by text => Forward geocode => single-line address => set marker
   */
  const handleSearchAddress = async () => {
    if (!formData.address) return;

    setIsSubmitting(true);
    setError("");
    try {
      const { lat, lon, addressSingleLine } = await forwardGeocodeSingleLine(
        formData.address
      );

      // Check if lat/lng is inside boundary (similar to handleMapClick)
      const point = turf.point([lon, lat]);
      const polygon = turf.polygon(boundary.features[0].geometry.coordinates);
      const isInside = turf.booleanPointInPolygon(point, polygon);

      if (!isInside) {
        setBoundaryError(
          "Wynik wyszukiwania jest poza granicami Bielska-Białej."
        );
        setSnackbarOpen(true);
        return;
      }

      // If inside, set new location + new address
      setFormData((prev) => ({
        ...prev,
        location: { lat, lng: lon },
        address: addressSingleLine,
      }));
    } catch (err) {
      console.error("Forward geocode error:", err);
      setError(err.message || "Nie znaleziono wyników.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Close boundary error
  const handleSnackbarClose = () => setSnackbarOpen(false);

  // ========== Submit ==========

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess("");
    setCaptchaError("");

    if (!formData.category || !formData.description) {
      setError("Proszę wypełnić wszystkie wymagane pola.");
      setIsSubmitting(false);
      return;
    }

    if (!formData.location) {
      setError("Proszę wybrać lokalizację na mapie lub przez wyszukiwanie.");
      setIsSubmitting(false);
      return;
    }

    if (!user && !captchaValue) {
      setCaptchaError("Proszę przejść weryfikację reCAPTCHA.");
      setIsSubmitting(false);
      return;
    }

    const data = new FormData();
    data.append("category", formData.category);
    data.append("description", formData.description);
    data.append(
      "location",
      JSON.stringify({
        type: "Point",
        coordinates: [formData.location.lng, formData.location.lat],
      })
    );
    data.append("address", formData.address || "");

    if (formData.dataZdarzenia)
      data.append("dataZdarzenia", formData.dataZdarzenia);
    if (formData.dniTygodnia.length > 0) {
      formData.dniTygodnia.forEach((day) => data.append("dniTygodnia", day));
    }
    if (formData.poraDnia) data.append("poraDnia", formData.poraDnia);
    if (formData.image) data.append("image", formData.image);
    if (!user && captchaValue) data.append("captcha", captchaValue);

    try {
      const createdIncident = await createIncident(data);
      setSuccess("Zgłoszenie zostało pomyślnie utworzone.");
      navigate(`/incidents/${createdIncident._id}`);
    } catch (err) {
      console.error("Error creating incident:", err);
      const errorMessage =
        err.response?.data?.msg ||
        err.response?.data?.detail ||
        "Błąd podczas tworzenia zgłoszenia.";
      setError(errorMessage);

      // if using captcha, reset on error
      if (!user && captchaRef.current) {
        captchaRef.current.reset();
        setCaptchaValue(null);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    setFormData,
    categories,
    categoriesLoading,
    categoriesError,
    boundary,
    boundaryError,
    boundaryLoading,
    error,
    success,
    isSubmitting,
    captchaRef,
    captchaError,
    preview,
    snackbarOpen,
    user,
    DNI_TYGODNIA_OPTIONS,
    PORA_DNIA_OPTIONS,

    // existing handlers
    handleFormChange,
    handleAddressChange,
    handleDniTygodniaChange,
    handlePoraDniaChange,
    handleImageChange,
    handleRemoveImage,
    handleCaptchaChange,
    handleMapClick,
    handleSubmit,
    handleSnackbarClose,

    // NEW search handler
    handleSearchAddress,
  };
}
