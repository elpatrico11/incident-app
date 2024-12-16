import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
//import useAuthStore from "../../store/useAuthStore";
import api from "../../utils/api";
import { Alert } from "daisyui";

const IncidentManagement = () => {
  const [incidents, setIncidents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingIncidents, setLoadingIncidents] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState("");

  // Removed `currentUser` since it's not used
  // const currentUser = useAuthStore((state) => state.user);

  const [filterStatus, setFilterStatus] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/categories");
        setCategories(response.data);
      } catch (err) {
        setError("Błąd podczas pobierania kategorii.");
      } finally {
        setLoadingCategories(false);
      }
    };

    const fetchIncidents = async () => {
      try {
        let endpoint = "/admin/incidents";
        const params = [];
        if (filterStatus !== "All") params.push(`status=${filterStatus}`);
        if (filterCategory !== "All") params.push(`category=${filterCategory}`);
        if (params.length) endpoint += `?${params.join("&")}`;
        const response = await api.get(endpoint);
        setIncidents(response.data);
      } catch (err) {
        setError("Błąd podczas pobierania zgłoszeń.");
      } finally {
        setLoadingIncidents(false);
      }
    };

    fetchCategories();
    fetchIncidents();
  }, [filterStatus, filterCategory]); 

  const handleStatusChange = async (incidentId, newStatus) => {
    try {
      const response = await api.put(`/admin/incidents/${incidentId}/status`, {
        status: newStatus,
      });
      setIncidents((prev) =>
        prev.map((i) => (i._id === incidentId ? response.data : i))
      );
    } catch (err) {
      setError("Błąd podczas aktualizacji statusu.");
    }
  };

  const handleDeleteIncident = async (incidentId) => {
    if (!window.confirm("Czy jesteś pewien?")) return;
    try {
      await api.delete(`/admin/incidents/${incidentId}`);
      setIncidents((prev) => prev.filter((i) => i._id !== incidentId));
    } catch (err) {
      setError("Błąd podczas usuwania zgłoszenia.");
    }
  };

  if (loadingIncidents || loadingCategories) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <div className="loading loading-spinner text-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:px-8 bg-gray-900 min-h-screen mb-12">
      <h2 className="text-3xl font-bold mb-6 text-center text-white">
        Zarządzanie Zgłoszeniami
      </h2>
      {error && <Alert className="mb-4 alert-error">{error}</Alert>}

      <h3 className="text-xl font-semibold mb-4 text-white text-center">
        Filtrowanie zgłoszeń
      </h3>

      <div className="flex flex-wrap justify-center gap-4 mb-8">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="select select-bordered w-48 bg-gray-800 text-white"
        >
          <option value="All">Wszystkie Statusy</option>
          <option value="Pending">Oczekujące</option>
          <option value="In Progress">W trakcie</option>
          <option value="Resolved">Rozwiązane</option>
        </select>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="select select-bordered w-48 bg-gray-800 text-white"
        >
          <option value="All">Wszystkie Kategorie</option>
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {incidents.map((incident) => (
          <div
            key={incident._id}
            className="card bg-gray-800 text-gray-100 shadow-md rounded-lg border border-gray-700 transform transition duration-300 hover:scale-105 hover:border-primary"
          >
            {incident.images?.length > 0 ? (
              <img
                src={incident.images[0]}
                alt={incident.category}
                className="h-48 w-full object-cover rounded-t-lg"
              />
            ) : (
              <div className="h-48 bg-gray-700 flex items-center justify-center rounded-t-lg">
                <span className="text-5xl">?</span>
              </div>
            )}
            <div className="flex-grow p-4 flex flex-col justify-between">
              <h3 className="text-lg font-bold mb-1">
                {incident.category || "Brak Kategorii"}
              </h3>
              <p className="text-sm mb-2">
                {incident.description
                  ? `${incident.description.substring(0, 100)}...`
                  : "Brak dostępnego opisu."}
              </p>
              <div className="mt-4 space-y-2">
                <Link to={`/incidents/${incident._id}`} className="w-full">
                  <button className="btn btn-primary btn-sm w-full">Szczegóły</button>
                </Link>
                <select
                  value={incident.status || "Pending"}
                  onChange={(e) => handleStatusChange(incident._id, e.target.value)}
                  className="select select-bordered select-sm w-full bg-gray-800 text-white"
                >
                  <option value="Pending">Oczekujące</option>
                  <option value="In Progress">W trakcie</option>
                  <option value="Resolved">Rozwiązane</option>
                </select>
                <button
                  onClick={() => handleDeleteIncident(incident._id)}
                  className="btn btn-error btn-outline btn-sm w-full"
                >
                  Usuń
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IncidentManagement;
