import { useState, useEffect, useRef } from "react";
import {
  fetchAllIncidents,
  fetchBoundaryGeoJSON,
} from "../../api/services/incidentService";
import { fetchCategories } from "../../utils/categories";

export function useMapPage() {
  // Incidents state
  const [incidents, setIncidents] = useState([]);
  const [filteredIncidents, setFilteredIncidents] = useState([]);
  const [incidentsLoading, setIncidentsLoading] = useState(true);
  const [incidentsError, setIncidentsError] = useState("");

  // Categories state
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Boundary state
  const [boundary, setBoundary] = useState(null);

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Map ref
  const mapInstance = useRef(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [searchDialogMessage, setSearchDialogMessage] = useState("");

  // Load incidents
  useEffect(() => {
    const loadIncidents = async () => {
      try {
        const data = await fetchAllIncidents();
        setIncidents(data);
        setFilteredIncidents(data);
      } catch (err) {
        console.error("Error loading incidents:", err);
        setIncidentsError("Błąd podczas pobierania zgłoszeń.");
      } finally {
        setIncidentsLoading(false);
      }
    };
    loadIncidents();
  }, []);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const fetchedCategories = await fetchCategories();
        setCategories(fetchedCategories);
      } catch (err) {
        console.error("Error loading categories:", err);
        setCategoriesError("Błąd podczas pobierania kategorii.");
      } finally {
        setCategoriesLoading(false);
      }
    };
    loadCategories();
  }, []);

  // Load boundary
  useEffect(() => {
    const loadBoundary = async () => {
      try {
        const data = await fetchBoundaryGeoJSON();
        setBoundary(data);
      } catch (error) {
        console.error("Error loading boundary GeoJSON:", error);
      }
    };
    loadBoundary();
  }, []);

  const handleFilterChange = (value) => {
    setCategoryFilter(value);
    if (value === "All") {
      setFilteredIncidents(incidents);
    } else {
      const filtered = incidents.filter((inc) => inc.category === value);
      setFilteredIncidents(filtered);
    }
  };

  const handleMapCreated = (map) => {
    mapInstance.current = map;
  };

  const handleSearchChange = (value) => {
    setSearchQuery(value);
  };

  const handleSearch = async () => {
    setSearchDialogOpen(false);
    setSearchDialogMessage("");

    let query = searchQuery.trim();
    if (!query) return;

    if (!query.toLowerCase().includes("bielsko-biała")) {
      query = `${query}, Bielsko-Biała`;
    }

    try {
      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&bounded=1&limit=1&viewbox=19.0,49.90,19.30,49.70&q=${encodeURIComponent(
        query
      )}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Błąd podczas wyszukiwania adresu.");
      }

      const data = await response.json();

      if (!data.length) {
        setSearchDialogMessage("Brak wyników dla podanego adresu");
        setSearchDialogOpen(true);
        return;
      }

      const best = data[0];
      const lat = parseFloat(best.lat);
      const lon = parseFloat(best.lon);

      if (mapInstance.current) {
        mapInstance.current.setView([lat, lon], 16, {
          animate: true,
          duration: 1,
        });
      } else {
        console.error("Map instance not available");
        setSearchDialogMessage("Problem z mapą - proszę odświeżyć stronę");
        setSearchDialogOpen(true);
      }
    } catch (err) {
      console.error("Search error:", err);
      setSearchDialogMessage("Wystąpił błąd podczas wyszukiwania");
      setSearchDialogOpen(true);
    }
  };

  const handleCloseDialog = () => {
    setSearchDialogOpen(false);
    setSearchDialogMessage("");
  };

  return {
    // Incidents
    incidentsError,
    incidentsLoading,
    filteredIncidents,

    // Categories
    categoriesError,
    categoriesLoading,
    categories,
    categoryFilter,
    handleFilterChange,

    // Boundary
    boundary,

    // Drawer
    drawerOpen,
    setDrawerOpen,

    // Map
    mapInstance,
    handleMapCreated,

    // Searching
    searchQuery,
    handleSearchChange,
    handleSearch,

    // Dialog
    searchDialogOpen,
    searchDialogMessage,
    handleCloseDialog,
  };
}
