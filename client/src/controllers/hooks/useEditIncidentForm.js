import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as turf from "@turf/turf";
import {
  fetchCategories,
  fetchBoundaryGeoJSON,
  fetchIncidentDetails,
  updateIncident,
} from "../../api/services/incidentService";
import useAuthStore from "../../models/stores/useAuthStore";
import {
  DNI_TYGODNIA_OPTIONS,
  PORA_DNIA_OPTIONS,
} from "../../constants/incidentConstants";

/**
 * Helper function: forward geocode user-entered text (using Nominatim).
 * Returns { lat, lon, addressSingleLine } on success.
 */
async function forwardGeocodeSingleLine(query) {
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&addressdetails=1&q=${encodeURIComponent(
    query
  )}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Błąd wyszukiwania adresu (forward geocode).");

  const data = await res.json();
  if (!data.length) throw new Error("Nie znaleziono adresu.");

  const best = data[0];
  const lat = parseFloat(best.lat);
  const lon = parseFloat(best.lon);

  // Basic single-line formatting
  const a = best.address || {};
  const road = a.road || a.pedestrian || a.footway || query;
  const houseNum = a.house_number || "";
  const city = a.city || a.town || a.village || a.county || "Bielsko-Biała";
  const postcode = a.postcode || "";
  const country = a.country || "Polska";

  const parts = [];
  if (houseNum) parts.push(`${road} ${houseNum}`);
  else parts.push(road);
  if (postcode && city) parts.push(`${postcode}, ${city}`);
  else if (city) parts.push(city);
  parts.push(country);

  const addressSingleLine = parts.join(", ");
  return { lat, lon, addressSingleLine };
}

/**
 * Helper function: reverse geocode lat/lng => single-line address (Nominatim).
 */
async function reverseGeocodeSingleLine(lat, lon) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&addressdetails=1`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Błąd przy reverse geocoding.");

  const data = await res.json();
  const a = data.address || {};
  const road = a.road || a.pedestrian || "";
  const houseNum = a.house_number || "";
  const postcode = a.postcode || "";
  const city = a.city || a.town || a.village || a.county || "Bielsko-Biała";
  const country = a.country || "Polska";

  const parts = [];
  if (houseNum) parts.push(`${road} ${houseNum}`);
  else parts.push(road);
  if (postcode && city) parts.push(`${postcode}, ${city}`);
  else if (city) parts.push(city);
  parts.push(country);

  return parts.join(", ");
}

export function useEditIncidentForm(incidentId) {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // ----------------------------
  //        Form Data
  // ----------------------------
  const [formData, setFormData] = useState({
    category: "",
    description: "",
    latitude: "",
    longitude: "",
    address: "", // <--- new field to store textual address
    image: null,
    dataZdarzenia: "",
    dniTygodnia: [],
    poraDnia: "",
  });

  // Existing image from server
  const [existingImage, setExistingImage] = useState(null);
  // Local image preview
  const [imagePreview, setImagePreview] = useState(null);

  // UI states
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Categories
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");

  // Boundary (Bielsko-Biała)
  const [boundary, setBoundary] = useState(null);
  const [boundaryLoading, setBoundaryLoading] = useState(true);
  const [boundaryError, setBoundaryError] = useState("");
  // Snackbar for boundary errors
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // ----------------------------
  //     Fetching & Setup
  // ----------------------------

  // 1) Fetch categories
  useEffect(() => {
    const getCategories = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setCategoriesError("Błąd podczas pobierania kategorii.");
      } finally {
        setCategoriesLoading(false);
      }
    };
    getCategories();
  }, []);

  // 2) Fetch existing incident to edit
  useEffect(() => {
    if (!user) return; // only proceed if user is known (or you can omit this check)

    const getIncidentData = async () => {
      try {
        const inc = await fetchIncidentDetails(incidentId);
        if (!inc) {
          setError("Nie znaleziono takiego zgłoszenia.");
          return;
        }
        const {
          category,
          description,
          location,
          images,
          user: incidentUser,
          dataZdarzenia,
          dniTygodnia,
          poraDnia,
          address, // if the server returns 'address', we read it here
        } = inc;

        // Permission check (non-admin can only edit if same user)
        if (
          incidentUser &&
          incidentUser._id !== user._id &&
          user.role !== "admin"
        ) {
          setError("Nie masz uprawnień do edycji tego zgłoszenia.");
          return;
        }

        setFormData((prev) => ({
          ...prev,
          category: category || "",
          description: description || "",
          latitude: location?.coordinates[1]?.toString() || "",
          longitude: location?.coordinates[0]?.toString() || "",
          address: address || "", // read from server
          image: null,
          dataZdarzenia: dataZdarzenia ? dataZdarzenia.split("T")[0] : "",
          dniTygodnia: dniTygodnia || [],
          poraDnia: poraDnia || "",
        }));

        setExistingImage(images?.[0] || null);
      } catch (err) {
        console.error(err);
        setError("Błąd podczas pobierania zgłoszenia.");
      }
    };
    getIncidentData();
  }, [incidentId, user]);

  // 3) Fetch boundary data (Bielsko-Biała)
  useEffect(() => {
    const getBoundary = async () => {
      try {
        const data = await fetchBoundaryGeoJSON();
        setBoundary(data);
      } catch (err) {
        console.error("Error loading boundary GeoJSON:", err);
        setBoundaryError("Błąd podczas ładowania granicy miasta.");
        setSnackbarOpen(true);
      } finally {
        setBoundaryLoading(false);
      }
    };
    getBoundary();
  }, []);

  // if boundaryError changes => open snack
  useEffect(() => {
    if (boundaryError) setSnackbarOpen(true);
  }, [boundaryError]);

  // ----------------------------
  //       Field Handlers
  // ----------------------------
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
    setFormData((prev) => ({ ...prev, poraDnia: event.target.value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormData((prev) => ({ ...prev, image: file }));

    // Generate local preview
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, image: null }));
    setExistingImage(null);
  };

  // ----------------------------
  //   Map Click => Reverse Geocode
  // ----------------------------
  const handleMapClick = async (latlng) => {
    if (!boundary) return;
    const { lat, lng } = latlng;

    // Check boundary
    const point = turf.point([lng, lat]);
    const polygon = turf.polygon(boundary.features[0].geometry.coordinates);
    const isInside = turf.booleanPointInPolygon(point, polygon);

    if (!isInside) {
      setBoundaryError("Proszę wybrać lokalizację wewnątrz Bielska-Białej.");
      setSnackbarOpen(true);
      return;
    }

    try {
      // Reverse geocode => get textual address
      const addressSingleLine = await reverseGeocodeSingleLine(lat, lng);

      // Update form data
      setFormData((prev) => ({
        ...prev,
        latitude: lat.toString(),
        longitude: lng.toString(),
        address: addressSingleLine,
      }));
      setBoundaryError("");
    } catch (err) {
      console.error("Reverse geocode error:", err);
      // fallback: only coords
      setFormData((prev) => ({
        ...prev,
        latitude: lat.toString(),
        longitude: lng.toString(),
        address: "",
      }));
    }
  };

  // ----------------------------
  //  Searching (Forward Geocode)
  // ----------------------------
  const handleSearchAddress = async () => {
    if (!formData.address) return;
    try {
      setIsSubmitting(true);
      setError("");
      const { lat, lon, addressSingleLine } = await forwardGeocodeSingleLine(
        formData.address
      );

      // Check boundary
      if (boundary) {
        const point = turf.point([lon, lat]);
        const polygon = turf.polygon(boundary.features[0].geometry.coordinates);
        if (!turf.booleanPointInPolygon(point, polygon)) {
          setBoundaryError(
            "Wynik wyszukiwania jest poza granicami Bielska-Białej."
          );
          setSnackbarOpen(true);
          return;
        }
      }

      // If inside boundary => update form
      setFormData((prev) => ({
        ...prev,
        latitude: lat.toString(),
        longitude: lon.toString(),
        address: addressSingleLine,
      }));
    } catch (err) {
      console.error("Forward geocode error:", err);
      setError(err.message || "Nie znaleziono adresu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ----------------------------
  //        Submit Logic
  // ----------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    const {
      category,
      description,
      latitude,
      longitude,
      address,
      image,
      dataZdarzenia,
      dniTygodnia,
      poraDnia,
    } = formData;

    // Basic validation
    if (!category || !description || !latitude || !longitude) {
      setError("Proszę wypełnić wszystkie wymagane pola.");
      setIsSubmitting(false);
      return;
    }

    // Double-check boundary
    if (boundary) {
      const point = turf.point([parseFloat(longitude), parseFloat(latitude)]);
      const polygon = turf.polygon(boundary.features[0].geometry.coordinates);
      if (!turf.booleanPointInPolygon(point, polygon)) {
        setError("Wybrana lokalizacja jest poza granicą Bielska-Białej.");
        setIsSubmitting(false);
        return;
      }
    }

    // Build FormData
    const dataToSend = new FormData();
    dataToSend.append("category", category);
    dataToSend.append("description", description);
    dataToSend.append(
      "location",
      JSON.stringify({
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      })
    );
    // Single-line address
    dataToSend.append("address", address || "");

    // Optional fields
    if (dataZdarzenia) dataToSend.append("dataZdarzenia", dataZdarzenia);
    if (dniTygodnia.length > 0) {
      dniTygodnia.forEach((day) => dataToSend.append("dniTygodnia", day));
    }
    if (poraDnia) {
      dataToSend.append("poraDnia", poraDnia);
    }
    if (image) {
      dataToSend.append("image", image);
    }

    // Send to server
    try {
      const updated = await updateIncident(incidentId, dataToSend);
      setSuccess("Incydent został zaktualizowany pomyślnie.");
      navigate(`/incidents/${updated._id}`);
    } catch (err) {
      console.error(err);
      const serverMsg = err.response?.data?.msg;
      setError(serverMsg || "Błąd podczas aktualizacji zgłoszenia.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSnackbarClose = () => setSnackbarOpen(false);

  return {
    user,
    formData,
    setFormData,
    existingImage,
    imagePreview,
    categories,
    categoriesLoading,
    categoriesError,
    boundary,
    boundaryLoading,
    boundaryError,
    snackbarOpen,
    error,
    success,
    isSubmitting,
    DNI_TYGODNIA_OPTIONS,
    PORA_DNIA_OPTIONS,

    // Handlers
    handleFormChange,
    handleDniTygodniaChange,
    handlePoraDniaChange,
    handleImageChange,
    handleRemoveImage,
    handleMapClick,
    handleSearchAddress, // <--- new for forward geocoding
    handleSubmit,
    handleSnackbarClose,
  };
}
