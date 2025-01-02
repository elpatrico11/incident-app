import { useEffect, useState } from "react";
import {
  fetchAllIncidents,
  fetchBoundaryGeoJSON,
} from "../../api/services/incidentService";
import { fetchCategories } from "../../utils/categories";

export function useMapPage() {
  // Incidents
  const [incidents, setIncidents] = useState([]);
  const [filteredIncidents, setFilteredIncidents] = useState([]);
  const [incidentsLoading, setIncidentsLoading] = useState(true);
  const [incidentsError, setIncidentsError] = useState("");

  // Categories
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Boundary
  const [boundary, setBoundary] = useState(null);

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);

  // 1) Fetch Incidents
  useEffect(() => {
    const loadIncidents = async () => {
      try {
        const data = await fetchAllIncidents();
        setIncidents(data);
        setFilteredIncidents(data);
      } catch (err) {
        console.error(err);
        setIncidentsError("Błąd podczas pobierania zgłoszeń.");
      } finally {
        setIncidentsLoading(false);
      }
    };
    loadIncidents();
  }, []);

  // 2) Fetch Categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const fetchedCategories = await fetchCategories();
        setCategories(fetchedCategories);
      } catch (err) {
        console.error(err);
        setCategoriesError("Błąd podczas pobierania kategorii.");
      } finally {
        setCategoriesLoading(false);
      }
    };
    loadCategories();
  }, []);

  // 3) Fetch Boundary
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

  // 4) Filter logic
  const handleFilterChange = (value) => {
    setCategoryFilter(value);
    if (value === "All") {
      setFilteredIncidents(incidents);
    } else {
      const filtered = incidents.filter((inc) => inc.category === value);
      setFilteredIncidents(filtered);
    }
  };

  return {
    incidents,
    filteredIncidents,
    incidentsLoading,
    incidentsError,
    categories,
    categoriesLoading,
    categoriesError,
    categoryFilter,
    handleFilterChange,

    boundary,
    drawerOpen,
    setDrawerOpen,
  };
}
