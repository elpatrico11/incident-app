import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
// import useAuthStore from "../../store/useAuthStore";
import api from "../../utils/api";

const IncidentManagement = () => {
  const [allIncidents, setAllIncidents] = useState([]); // Wszystkie incydenty
  const [categories, setCategories] = useState([]);
  const [loadingIncidents, setLoadingIncidents] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Stany dla filtrów, sortowania i paginacji
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortOption, setSortOption] = useState("date_desc");
  const [searchQuery, setSearchQuery] = useState("");

  // Stany dla modala usuwania
  const [modalOpen, setModalOpen] = useState(false);
  const [incidentToDelete, setIncidentToDelete] = useState(null);

  // Paginacja
  const itemsPerPageOptions = [5, 10, 20, 50];
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Sortowanie
  const sortOptions = [
    { value: "date_desc", label: "Data (najnowsze)" },
    { value: "date_asc", label: "Data (najstarsze)" },
    { value: "category_asc", label: "Kategoria (A-Z)" },
    { value: "category_desc", label: "Kategoria (Z-A)" },
  ];

  // Fetch Categories
  const fetchCategories = useCallback(async () => {
    setLoadingCategories(true);
    try {
      const response = await api.get("/categories");
      setCategories(response.data || []);
    } catch (err) {
      setError("Błąd podczas pobierania kategorii.");
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Fetch Incidents
  const fetchIncidents = useCallback(async () => {
    setLoadingIncidents(true);
    setError("");
    setSuccess("");

    try {
      let endpoint = `/incidents?page=1&limit=1000&sort=${sortOption}`; // Pobierz dużo incydentów, aby umożliwić filtrowanie po stronie klienta

      const params = [];
      if (filterStatus !== "All") params.push(`status=${filterStatus}`);
      if (filterCategory !== "All") params.push(`category=${filterCategory}`);

      if (params.length) {
        endpoint += `&${params.join("&")}`;
      }

      const response = await api.get(endpoint);
      console.log("API Response:", response.data); // Debugowanie

      setAllIncidents(response.data.incidents || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      setError("Błąd podczas pobierania zgłoszeń.");
      setAllIncidents([]);
      setTotalPages(1);
    } finally {
      setLoadingIncidents(false);
    }
  }, [filterStatus, filterCategory, sortOption]);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // Filtracja i wyszukiwanie po stronie klienta
  const processedIncidents = useMemo(() => {
    let incidents = allIncidents;

    // Wyszukiwanie
    if (searchQuery.trim() !== "") {
      const searchLower = searchQuery.toLowerCase();
      incidents = incidents.filter(incident => {
        return (
          (incident.category && incident.category.toLowerCase().includes(searchLower)) ||
          (incident.description && incident.description.toLowerCase().includes(searchLower))
        );
      });
    }

    // Sortowanie
    if (sortOption === "date_desc") {
      incidents = incidents.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortOption === "date_asc") {
      incidents = incidents.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortOption === "category_asc") {
      incidents = incidents.sort((a, b) => a.category.localeCompare(b.category));
    } else if (sortOption === "category_desc") {
      incidents = incidents.sort((a, b) => b.category.localeCompare(a.category));
    }

    setTotalPages(Math.ceil(incidents.length / itemsPerPage));

    return incidents;
  }, [allIncidents, searchQuery, sortOption, itemsPerPage]);

  const paginatedIncidents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedIncidents.slice(startIndex, startIndex + itemsPerPage);
  }, [processedIncidents, currentPage, itemsPerPage]);

  const handleStatusChange = async (incidentId, newStatus) => {
    try {
      const response = await api.put(`/admin/incidents/${incidentId}/status`, {
        status: newStatus,
      });
      console.log("Status Update Response:", response.data); // Debugowanie

      // Sprawdź, czy response.data zawiera incydent
      const updatedIncident = response.data; // Dostosuj w zależności od API

      setAllIncidents((prev) =>
        prev.map((i) => (i._id === incidentId ? updatedIncident : i))
      );
      setSuccess("Status zgłoszenia został zaktualizowany.");
    } catch (err) {
      console.error(err);
      setError("Błąd podczas aktualizacji statusu.");
    }
  };

  const openModal = (incidentId) => {
    setIncidentToDelete(incidentId);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setIncidentToDelete(null);
  };

  const confirmDelete = async () => {
    if (incidentToDelete) {
      try {
        await api.delete(`/admin/incidents/${incidentToDelete}`);
        setAllIncidents((prev) => prev.filter((i) => i._id !== incidentToDelete));
        setSuccess("Zgłoszenie zostało pomyślnie usunięte.");
      } catch (err) {
        console.error(err);
        setError("Błąd podczas usuwania zgłoszenia.");
      } finally {
        closeModal();
      }
    }
  };

  if (loadingIncidents || loadingCategories) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <div className="loading loading-spinner text-primary"></div>
      </div>
    );
  }

  // Funkcja określająca odpowiedni komunikat przy braku zgłoszeń
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

  return (
    <div className="p-4 lg:px-8 bg-gray-900 min-h-screen mb-12">
      <h2 className="text-3xl font-bold mb-6 text-center text-white">
        Zarządzanie Zgłoszeniami
      </h2>
      {error && <div className="alert alert-error mb-4">{error}</div>}
      {success && <div className="alert alert-success mb-4">{success}</div>}

      <h3 className="text-xl font-semibold mb-4 text-white text-center">
        Filtrowanie i Sortowanie zgłoszeń
      </h3>

      <div className="flex flex-wrap justify-center gap-4 mb-8">
        {/* Filtrowanie statusu */}
        <select
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
          className="select select-bordered w-48 bg-gray-800 text-white"
        >
          <option value="All">Wszystkie Statusy</option>
          <option value="Pending">Oczekujące</option>
          <option value="In Progress">W trakcie</option>
          <option value="Resolved">Rozwiązane</option>
        </select>

        {/* Filtrowanie kategorii */}
        <select
          value={filterCategory}
          onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }}
          className="select select-bordered w-48 bg-gray-800 text-white"
        >
          <option value="All">Wszystkie Kategorie</option>
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>

        {/* Sortowanie */}
        <select
          value={sortOption}
          onChange={(e) => { setSortOption(e.target.value); setCurrentPage(1); }}
          className="select select-bordered w-48 bg-gray-800 text-white"
        >
          {sortOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Wyszukiwanie */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Szukaj zgłoszeń..."
          className="input input-bordered w-48 bg-gray-800 text-white"
        />

        {/* Opcja liczby incydentów na stronę */}
        <select
          value={itemsPerPage}
          onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
          className="select select-bordered w-48 bg-gray-800 text-white"
        >
          {itemsPerPageOptions.map(option => (
            <option key={option} value={option}>
              {option} na stronę
            </option>
          ))}
        </select>
      </div>

      {paginatedIncidents.length === 0 ? (
        <div className="text-center text-white text-lg">
          {noIncidentsMessage()}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedIncidents.map((incident) => (
              <div
                key={incident._id}
                className="card bg-gray-800 text-gray-100 shadow-md rounded-lg border border-gray-700 transform transition-transform duration-300 hover:scale-105 hover:border-primary"
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
                  <p className="text-xs text-gray-400 mb-2">
                    Dodane: {new Date(incident.createdAt).toLocaleDateString('pl-PL', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
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
                      onClick={() => openModal(incident._id)}
                      className="btn btn-error btn-outline btn-sm w-full"
                    >
                      Usuń
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Paginacja */}
          <div className="flex justify-center items-center mt-8 space-x-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`btn btn-secondary ${currentPage === 1 ? "btn-disabled" : ""}`}
            >
              Poprzednia
            </button>
            <span className="text-white">
              Strona {currentPage} z {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`btn btn-secondary ${currentPage === totalPages ? "btn-disabled" : ""}`}
            >
              Następna
            </button>
          </div>
        </>
      )}

      {/* Modal Potwierdzenia Usunięcia */}
      {modalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Potwierdzenie Usunięcia</h3>
            <p className="py-4">Czy jesteś pewien, że chcesz usunąć to zgłoszenie?</p>
            <div className="modal-action">
              <button onClick={closeModal} className="btn">
                Anuluj
              </button>
              <button onClick={confirmDelete} className="btn btn-error">
                Usuń
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncidentManagement;
