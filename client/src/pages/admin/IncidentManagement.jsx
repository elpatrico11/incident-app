
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";

const IncidentManagement = () => {
  const [allIncidents, setAllIncidents] = useState([]); // Wszystkie incydenty
  const [categories, setCategories] = useState([]);
  const [loadingIncidents, setLoadingIncidents] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // States for filters, sorting, and pagination
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortOption, setSortOption] = useState("date_desc");
  const [searchQuery, setSearchQuery] = useState("");

  // States for delete modal
  const [modalOpen, setModalOpen] = useState(false);
  const [incidentToDelete, setIncidentToDelete] = useState(null);

  // Pagination
  const itemsPerPageOptions = [5, 10, 20, 50];
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Sorting
  const sortOptions = [
    { value: "date_desc", label: "Data (najnowsze)" },
    { value: "date_asc", label: "Data (najstarsze)" },
    { value: "category_asc", label: "Kategoria (A-Z)" },
    { value: "category_desc", label: "Kategoria (Z-A)" },
  ];

  // Define colors for different status categories
  const statusColors = {
    nowe: 'bg-blue-500',
    weryfikacja: 'bg-yellow-500',
    potwierdzone: 'bg-green-500',
    wstrzymane: 'bg-gray-500',
    eskalowane: 'bg-orange-500',
    rozwiązane: 'bg-teal-500',
    nierozwiązane: 'bg-red-500',
    zamknięte: 'bg-purple-500',
    odrzucone: 'bg-pink-500',
    default: 'bg-gray-500',
  };

  const getStatusColor = (status) => {
    return statusColors[status.toLowerCase()] || statusColors.default;
  };

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
      let endpoint = `/incidents?page=1&limit=1000&sort=${sortOption}`; // Fetch a lot of incidents to allow client-side filtering

      const params = [];
      if (filterStatus !== "All") params.push(`status=${filterStatus}`);
      if (filterCategory !== "All") params.push(`category=${filterCategory}`);

      if (params.length) {
        endpoint += `&${params.join("&")}`;
      }

      const response = await api.get(endpoint);

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

  // Filtering and searching on the client side
  const processedIncidents = useMemo(() => {
    let incidents = [...allIncidents];

    // Searching
    if (searchQuery.trim() !== "") {
      const searchLower = searchQuery.toLowerCase();
      incidents = incidents.filter(incident => {
        return (
          (incident.category && incident.category.toLowerCase().includes(searchLower)) ||
          (incident.description && incident.description.toLowerCase().includes(searchLower))
        );
      });
    }

    // Sorting
    if (sortOption === "date_desc") {
      incidents.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortOption === "date_asc") {
      incidents.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortOption === "category_asc") {
      incidents.sort((a, b) => a.category.localeCompare(b.category));
    } else if (sortOption === "category_desc") {
      incidents.sort((a, b) => b.category.localeCompare(a.category));
    }

    // Update total pages after processing incidents
    setTotalPages(Math.ceil(incidents.length / itemsPerPage));

    return incidents;
  }, [allIncidents, searchQuery, sortOption, itemsPerPage]);

  // Pagination
  const paginatedIncidents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedIncidents.slice(startIndex, startIndex + itemsPerPage);
  }, [processedIncidents, currentPage, itemsPerPage]);

  // Function to display appropriate message when no incidents are found
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

  // Function to update incident status
  const handleStatusChange = async (incidentId, newStatus) => {
  try {
    console.log("Updating status to:", newStatus); // Debugging line
    await api.put(`/incidents/${incidentId}/status`, {
      status: newStatus,
    });

    const detailedIncident = await api.get(`/incidents/${incidentId}`);

    setAllIncidents((prev) =>
      prev.map((i) => (i._id === incidentId ? detailedIncident.data : i))
    );
    setSuccess("Status zgłoszenia został zaktualizowany.");
    setError(""); // Clear any previous errors
  } catch (err) {
    console.error(err);
    // Display detailed error message if available
    if (err.response && err.response.data && err.response.data.msg) {
      setError(err.response.data.msg);
    } else {
      setError("Błąd podczas aktualizacji statusu.");
    }
  }
};

  // Functions to handle delete modal
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
        {/* Status Filtering */}
        <select
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
          className="select select-bordered w-48 bg-gray-800 text-white"
        >
          <option value="All">Wszystkie Statusy</option>
          <option value="Nowe">Nowe</option>
          <option value="Weryfikacja">Weryfikacja</option>
          <option value="Potwierdzone">Potwierdzone</option>
          <option value="Wstrzymane">Wstrzymane</option>
          <option value="Eskalowane">Eskalowane</option>
          <option value="Rozwiązane">Rozwiązane</option>
          <option value="Nierozwiązane">Nierozwiązane</option>
          <option value="Zamknięte">Zamknięte</option>
          <option value="Odrzucone">Odrzucone</option>
        </select>

        {/* Category Filtering */}
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

        {/* Sorting */}
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

        {/* Searching */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          placeholder="Szukaj zgłoszeń..."
          className="input input-bordered w-48 bg-gray-800 text-white"
        />

        {/* Items per page */}
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
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-bold">
                      {incident.category || "Brak Kategorii"}
                    </h3>
                    {/* Status Badge */}
                    <span
                      className={`px-2 py-1 text-xs font-semibold text-white rounded ${getStatusColor(incident.status)}`}
                    >
                      {incident.status}
                    </span>
                  </div>
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
                    {/* Update Status */}
                    <select
                      value={incident.status || "Nowe"} // Ensure default is capitalized
                      onChange={(e) => handleStatusChange(incident._id, e.target.value)}
                      className="select select-bordered select-sm w-full bg-gray-800 text-white"
                    >
                      <option value="Nowe">Nowe</option>
                      <option value="Weryfikacja">Weryfikacja</option>
                      <option value="Potwierdzone">Potwierdzone</option>
                      <option value="Wstrzymane">Wstrzymane</option>
                      <option value="Eskalowane">Eskalowane</option>
                      <option value="Rozwiązane">Rozwiązane</option>
                      <option value="Nierozwiązane">Nierozwiązane</option>
                      <option value="Zamknięte">Zamknięte</option>
                      <option value="Odrzucone">Odrzucone</option>
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

          {/* Pagination */}
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

      {/* Delete Confirmation Modal */}
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
