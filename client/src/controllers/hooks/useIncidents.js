import { useState, useEffect, useMemo, useCallback } from "react";
import {
  fetchIncidents,
  fetchCategories,
} from "../../api/services/incidentService";

//Helper function to capitalize the first letter of a string

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

const useIncidents = () => {
  // State for incidents and categories
  const [incidents, setIncidents] = useState([]);
  const [categories, setCategories] = useState([]);

  // Loading and error states
  const [loadingIncidents, setLoadingIncidents] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState("");

  // Filter, sort, search, and pagination states
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");
  const [sortOption, setSortOption] = useState("date_desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPageOptions = [5, 10, 20, 50];
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Fetch Categories
  useEffect(() => {
    const loadCategories = async () => {
      setLoadingCategories(true);
      try {
        const data = await fetchCategories();
        setCategories(data || []);
      } catch (err) {
        console.error(err);
        setError("Błąd podczas pobierania kategorii.");
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  // Fetch Incidents whenever filters, sortOption change
  const loadIncidents = useCallback(async () => {
    setLoadingIncidents(true);
    setError("");

    try {
      const params = {
        page: 1,
        limit: 1000,
        sort: sortOption,
      };

      if (filterStatus !== "All") {
        const normalizedStatus = capitalize(filterStatus);
        params.status = normalizedStatus;
      }
      if (filterCategory !== "All") params.category = filterCategory;

      const data = await fetchIncidents(params);

      setIncidents(data.incidents || []);
    } catch (err) {
      console.error(err);
      setError("Błąd podczas pobierania zgłoszeń.");
    } finally {
      setLoadingIncidents(false);
    }
  }, [filterStatus, filterCategory, sortOption]);

  useEffect(() => {
    loadIncidents();
  }, [loadIncidents]);

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  // Processed Incidents after Filtering and Searching
  const processedIncidents = useMemo(() => {
    let filtered = [...incidents];

    // Search
    if (searchQuery.trim() !== "") {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (incident) =>
          (incident.category &&
            incident.category.toLowerCase().includes(searchLower)) ||
          (incident.description &&
            incident.description.toLowerCase().includes(searchLower))
      );
    }

    // Sorting
    switch (sortOption) {
      case "date_desc":
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "date_asc":
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "category_asc":
        filtered.sort((a, b) => a.category.localeCompare(b.category));
        break;
      case "category_desc":
        filtered.sort((a, b) => b.category.localeCompare(a.category));
        break;
      default:
        break;
    }

    return filtered;
  }, [incidents, searchQuery, sortOption]);

  // Pagination
  const paginatedIncidents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedIncidents.slice(startIndex, startIndex + itemsPerPage);
  }, [processedIncidents, currentPage, itemsPerPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(processedIncidents.length / itemsPerPage);
  }, [processedIncidents.length, itemsPerPage]);

  // Status Colors Mapping
  const statusColors = useMemo(
    () => ({
      Nowe: "bg-blue-500",
      Weryfikacja: "bg-yellow-500",
      Potwierdzone: "bg-green-500",
      Wstrzymane: "bg-red-500",
      Eskalowane: "bg-purple-500",
      Rozwiązane: "bg-teal-500",
      Nierozwiązane: "bg-orange-500",
      Zamknięte: "bg-gray-500",
      Odrzucone: "bg-gray-700",
      default: "bg-gray-500",
    }),
    []
  );

  // Message when no incidents
  const noIncidentsMessage = useMemo(() => {
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
  }, [filterStatus, filterCategory, searchQuery]);

  return {
    // Data
    incidents: paginatedIncidents,
    categories,
    totalPages,

    // Loading and Error
    loadingIncidents,
    loadingCategories,
    error,

    // Filters, Sort, Search, Pagination
    filterStatus,
    setFilterStatus,
    filterCategory,
    setFilterCategory,
    sortOption,
    setSortOption,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    itemsPerPageOptions,

    // Other
    statusColors,
    noIncidentsMessage,
  };
};

export default useIncidents;
