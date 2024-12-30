import { useState, useEffect, useCallback, useMemo } from "react";
import {
  fetchCategories as fetchCategoriesAPI,
  fetchIncidents as fetchIncidentsAPI,
  updateIncidentStatus as updateIncidentStatusAPI,
  deleteIncident as deleteIncidentAPI,
  fetchIncidentDetails as fetchIncidentDetailsAPI,
} from "../../api/services/incidentService";
import { SORT_OPTIONS, STATUS_COLORS } from "../../constants/incidentConstants";

const useIncidentManagement = () => {
  // Data States
  const [allIncidents, setAllIncidents] = useState([]);
  const [categories, setCategories] = useState([]);

  // Loading States
  const [loadingIncidents, setLoadingIncidents] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Feedback States
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Filter, Sort, Pagination States
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortOption, setSortOption] = useState("date_desc");
  const [searchQuery, setSearchQuery] = useState("");

  // Delete Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [incidentToDelete, setIncidentToDelete] = useState(null);

  // Pagination
  const itemsPerPageOptions = [5, 10, 20, 50];
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Fetch Categories
  const fetchCategories = useCallback(async () => {
    setLoadingCategories(true);
    try {
      const data = await fetchCategoriesAPI();
      setCategories(data || []);
    } catch (err) {
      setError("Błąd podczas pobierania kategorii.");
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  // Fetch Incidents
  const fetchIncidents = useCallback(async () => {
    setLoadingIncidents(true);
    setError("");
    setSuccess("");

    try {
      const params = {
        page: 1,
        limit: 1000,
        sort: sortOption,
      };

      if (filterStatus !== "All") params.status = filterStatus;
      if (filterCategory !== "All") params.category = filterCategory;

      const data = await fetchIncidentsAPI(params);
      setAllIncidents(data.incidents || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError("Błąd podczas pobierania zgłoszeń.");
      setAllIncidents([]);
      setTotalPages(1);
    } finally {
      setLoadingIncidents(false);
    }
  }, [filterStatus, filterCategory, sortOption]);

  // Initial Fetch
  useEffect(() => {
    fetchCategories();
    fetchIncidents();
  }, [fetchCategories, fetchIncidents]);

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  // Processed Incidents (Filtering, Searching, Sorting)
  const processedIncidents = useMemo(() => {
    let incidents = [...allIncidents];

    // Searching
    if (searchQuery.trim() !== "") {
      const searchLower = searchQuery.toLowerCase();
      incidents = incidents.filter((incident) => {
        return (
          (incident.category &&
            incident.category.toLowerCase().includes(searchLower)) ||
          (incident.description &&
            incident.description.toLowerCase().includes(searchLower))
        );
      });
    }

    // Sorting
    switch (sortOption) {
      case "date_desc":
        incidents.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "date_asc":
        incidents.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "category_asc":
        incidents.sort((a, b) => a.category.localeCompare(b.category));
        break;
      case "category_desc":
        incidents.sort((a, b) => b.category.localeCompare(a.category));
        break;
      default:
        break;
    }

    // Update total pages after processing incidents
    setTotalPages(Math.ceil(incidents.length / itemsPerPage));

    return incidents;
  }, [allIncidents, searchQuery, sortOption, itemsPerPage]);

  // Paginated Incidents
  const paginatedIncidents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedIncidents.slice(startIndex, startIndex + itemsPerPage);
  }, [processedIncidents, currentPage, itemsPerPage]);

  // No Incidents Message
  const noIncidentsMessage = () => {
    if (filterStatus !== "All" && filterCategory !== "All") {
      return "Brak zgłoszeń dla wybranej kategorii i statusu.";
    } else if (filterStatus !== "All") {
      return "Brak zgłoszeń o wybranym statusie.";
    } else if (filterCategory !== "All") {
      return "Brak zgłoszeń dla wybranej kategorii.";
    } else if (searchQuery.trim() !== "") {
      return "Brak zgłoszeń pasujących do wyszukiwania.";
    } else {
      return "Brak dostępnych zgłoszeń.";
    }
  };

  // Update Incident Status
  const handleStatusChange = useCallback(async (incidentId, newStatus) => {
    try {
      await updateIncidentStatusAPI(incidentId, newStatus);
      const detailedIncident = await fetchIncidentDetailsAPI(incidentId);

      setAllIncidents((prev) =>
        prev.map((i) => (i._id === incidentId ? detailedIncident : i))
      );
      setSuccess("Status zgłoszenia został zaktualizowany.");
      setError(""); // Clear any previous errors
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.msg) {
        setError(err.response.data.msg);
      } else {
        setError("Błąd podczas aktualizacji statusu.");
      }
    }
  }, []);

  // Delete Modal Handlers
  const openModal = useCallback((incidentId) => {
    setIncidentToDelete(incidentId);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setIncidentToDelete(null);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (incidentToDelete) {
      try {
        await deleteIncidentAPI(incidentToDelete);
        setAllIncidents((prev) =>
          prev.filter((i) => i._id !== incidentToDelete)
        );
        setSuccess("Zgłoszenie zostało pomyślnie usunięte.");
      } catch (err) {
        console.error(err);
        setError("Błąd podczas usuwania zgłoszenia.");
      } finally {
        closeModal();
      }
    }
  }, [incidentToDelete, closeModal]);

  return {
    // Data
    allIncidents,
    categories,

    // Loading
    loadingIncidents,
    loadingCategories,

    // Feedback
    error,
    success,

    // Filters, Sorting, Pagination
    filterStatus,
    setFilterStatus,
    filterCategory,
    setFilterCategory,
    currentPage,
    setCurrentPage,
    totalPages,
    sortOption,
    setSortOption,
    searchQuery,
    setSearchQuery,
    itemsPerPage,
    setItemsPerPage,
    itemsPerPageOptions,
    SORT_OPTIONS,

    // Processed Data
    processedIncidents,
    paginatedIncidents,

    // Messages
    noIncidentsMessage,

    // Status Colors
    STATUS_COLORS,

    // Handlers
    handleStatusChange,

    // Delete Modal
    modalOpen,
    openModal,
    closeModal,
    confirmDelete,
  };
};

export default useIncidentManagement;
