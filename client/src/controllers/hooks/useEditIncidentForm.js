import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchCategories,
  fetchBoundaryGeoJSON,
  fetchIncidentDetails,
  updateIncident,
} from "../../api/services/incidentService";
import * as turf from "@turf/turf";
import {
  DNI_TYGODNIA_OPTIONS,
  PORA_DNIA_OPTIONS,
} from "../../constants/incidentConstants";
import useAuthStore from "../../store/useAuthStore";

export function useEditIncidentForm(incidentId) {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Form data
  const [formData, setFormData] = useState({
    category: "",
    description: "",
    latitude: "",
    longitude: "",
    image: null,
    dataZdarzenia: "",
    dniTygodnia: [],
    poraDnia: "",
  });

  // Existing image from the server
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

  // Boundary
  const [boundary, setBoundary] = useState(null);
  const [boundaryLoading, setBoundaryLoading] = useState(true);
  const [boundaryError, setBoundaryError] = useState("");

  // Snackbar for boundary errors
  const [snackbarOpen, setSnackbarOpen] = useState(false);

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

  // 2) Fetch existing incident
  useEffect(() => {
    const getIncidentData = async () => {
      if (!user) return; // only fetch if user is known
      try {
        const inc = await fetchIncidentDetails(incidentId);
        const {
          category,
          description,
          location,
          images,
          user: incidentUser,
          dataZdarzenia,
          dniTygodnia,
          poraDnia,
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
          category,
          description,
          latitude: location.coordinates[1],
          longitude: location.coordinates[0],
          image: null, // reset to null
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

  // 3) Fetch boundary
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

  // If boundaryError changes, open snack
  useEffect(() => {
    if (boundaryError) {
      setSnackbarOpen(true);
    }
  }, [boundaryError]);

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

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormData((prev) => ({ ...prev, image: file }));

    // Generate image preview
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, image: null }));
    setExistingImage(null);
  };

  /**
   * Called when user clicks on map
   */
  const handleMapClick = (latlng) => {
    if (!boundary) return;

    const { lat, lng } = latlng;
    const point = turf.point([lng, lat]);
    const polygon = turf.polygon(boundary.features[0].geometry.coordinates);
    const isInside = turf.booleanPointInPolygon(point, polygon);

    if (isInside) {
      setFormData((prev) => ({
        ...prev,
        latitude: lat.toString(),
        longitude: lng.toString(),
      }));
      setBoundaryError("");
    } else {
      setBoundaryError("Proszę wybrać lokalizację wewnątrz Bielska-Białej.");
      setSnackbarOpen(true);
    }
  };

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
      image,
      dataZdarzenia,
      dniTygodnia,
      poraDnia,
    } = formData;
    // Validation
    if (!category || !description || !latitude || !longitude) {
      setError("Proszę wypełnić wszystkie wymagane pola.");
      setIsSubmitting(false);
      return;
    }

    // Boundary check
    if (boundary) {
      const point = turf.point([parseFloat(longitude), parseFloat(latitude)]);
      const polygon = turf.polygon(boundary.features[0].geometry.coordinates);
      const isInside = turf.booleanPointInPolygon(point, polygon);
      if (!isInside) {
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

    // Optional fields
    if (dataZdarzenia) {
      dataToSend.append("dataZdarzenia", dataZdarzenia);
    }
    if (dniTygodnia.length > 0) {
      dniTygodnia.forEach((day) => dataToSend.append("dniTygodnia", day));
    }
    if (poraDnia) {
      dataToSend.append("poraDnia", poraDnia);
    }
    if (image) {
      dataToSend.append("image", image);
    }

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
    handleFormChange,
    handleDniTygodniaChange,
    handlePoraDniaChange,
    handleImageChange,
    handleRemoveImage,
    handleMapClick,
    handleSubmit,
    handleSnackbarClose,
  };
}
