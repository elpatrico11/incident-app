import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  getBoundary,
  createIncident,
} from "../../api/services/reportIncidentService";
import { compressImage } from "../../utils/imageUtils";
import useAuthStore from "../../store/useAuthStore";
import * as turf from "@turf/turf";
import {
  BOUNDARY_GEOJSON_URL,
  DNI_TYGODNIA_OPTIONS,
  PORA_DNIA_OPTIONS,
} from "../../constants/reportIncidentConstants.js";
import { fetchCategories } from "../../utils/categories";

export function useReportForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  const [formData, setFormData] = useState({
    category: "",
    description: "",
    location: null,
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

  // Fetch categories on mount
  useEffect(() => {
    const getCategories = async () => {
      try {
        const fetchedCategories = await fetchCategories();
        setCategories(fetchedCategories);
      } catch (err) {
        setCategoriesError("Błąd podczas pobierania kategorii.");
        console.error("Error fetching categories:", err);
      } finally {
        setCategoriesLoading(false);
      }
    };

    getCategories();
  }, []);

  // Fetch boundary on mount
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

  // Set initial category from URL params (if any)
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

  // Cleanup image preview on unmount
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview.url);
    };
  }, [preview]);

  // Handlers
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDniTygodniaChange = (event) => {
    const { value } = event.target;
    setFormData((prev) => ({
      ...prev,
      dniTygodnia: typeof value === "string" ? value.split(",") : value,
    }));
  };

  const handlePoraDniaChange = (event) => {
    const { value } = event.target;
    setFormData((prev) => ({ ...prev, poraDnia: value }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsSubmitting(true);
    try {
      const compressedFile = await compressImage(file);

      // Extract the file extension from the MIME type
      const extension = compressedFile.type.split("/")[1]; // e.g. 'png'
      // Generate a new filename
      const newFileName = `${Date.now()}.${extension}`;
      // Create new File with updated name
      const renamedFile = new File([compressedFile], newFileName, {
        type: compressedFile.type,
      });

      const newPreview = {
        url: URL.createObjectURL(renamedFile),
        name: renamedFile.name,
      };

      if (preview) {
        // revoke old preview
        URL.revokeObjectURL(preview.url);
      }

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
      setPreview(null);
    }
    setFormData((prev) => ({ ...prev, image: null }));
  };

  const handleCaptchaChange = (value) => {
    setCaptchaValue(value);
    if (value) setCaptchaError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess("");
    setCaptchaError("");

    // Validation
    if (!formData.category || !formData.description || !formData.location) {
      setError("Proszę wypełnić wszystkie wymagane pola.");
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

    // Optional fields
    if (formData.dataZdarzenia) {
      data.append("dataZdarzenia", formData.dataZdarzenia);
    }
    if (formData.dniTygodnia.length > 0) {
      formData.dniTygodnia.forEach((day) => data.append("dniTygodnia", day));
    }
    if (formData.poraDnia) {
      data.append("poraDnia", formData.poraDnia);
    }
    if (formData.image) {
      data.append("image", formData.image);
    }
    if (!user && captchaValue) {
      data.append("captcha", captchaValue);
    }

    try {
      const created = await createIncident(data);
      setSuccess("Zgłoszenie zostało pomyślnie utworzone.");
      navigate(`/incidents/${created._id}`);
    } catch (err) {
      console.error("Error response:", err);
      const errorMessage =
        err.response?.data?.msg ||
        err.response?.data?.detail ||
        "Błąd podczas tworzenia zgłoszenia.";
      setError(errorMessage);

      if (!user && captchaRef.current) {
        captchaRef.current.reset();
        setCaptchaValue(null);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSnackbarClose = () => setSnackbarOpen(false);

  /**
   * A utility function for boundary checks using turf.js.
   */
  const handleMapClick = (latlng) => {
    if (!boundary) return;

    const { lat, lng } = latlng;
    const point = turf.point([lng, lat]);
    const polygon = turf.polygon(boundary.features[0].geometry.coordinates);
    const isInside = turf.booleanPointInPolygon(point, polygon);

    if (isInside) {
      setFormData((prev) => ({ ...prev, location: latlng }));
      setBoundaryError("");
    } else {
      setBoundaryError("Proszę wybrać lokalizację wewnątrz Bielska-Białej.");
      setSnackbarOpen(true);
    }
  };

  return {
    formData,
    setFormData,
    handleFormChange,
    handleDniTygodniaChange,
    handlePoraDniaChange,
    handleImageChange,
    handleRemoveImage,
    handleCaptchaChange,
    handleSubmit,
    handleSnackbarClose,
    handleMapClick,
    boundary,
    boundaryError,
    boundaryLoading,
    categories,
    categoriesError,
    categoriesLoading,
    user,
    preview,
    isSubmitting,
    error,
    success,
    snackbarOpen,
    captchaRef,
    captchaError,
    DNI_TYGODNIA_OPTIONS,
    PORA_DNIA_OPTIONS,
  };
}
