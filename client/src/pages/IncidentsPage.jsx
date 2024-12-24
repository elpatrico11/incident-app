
import React, { useEffect, useState, useMemo } from 'react';
import api from '../utils/api';
import { Link } from 'react-router-dom';

const IncidentsPage = () => {
  const [incidents, setIncidents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingIncidents, setLoadingIncidents] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState('');

  // Stany dla filtrów, sortowania, wyszukiwania i paginacji
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortOption, setSortOption] = useState('date_desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPageOptions = [5, 10, 20, 50];
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Fetch Categories for Filter Dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const response = await api.get('/categories');
        setCategories(response.data || []);
      } catch (err) {
        console.error(err);
        setError('Błąd podczas pobierania kategorii.');
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch Incidents
  useEffect(() => {
    const fetchIncidents = async () => {
      setLoadingIncidents(true);
      setError('');

      try {
        let endpoint = `/incidents?page=1&limit=1000&sort=${sortOption}`;

        const params = [];
        if (filterStatus !== 'All') params.push(`status=${filterStatus}`);
        if (filterCategory !== 'All') params.push(`category=${filterCategory}`);

        if (params.length) {
          endpoint += `&${params.join('&')}`;
        }

        const response = await api.get(endpoint);
        setIncidents(response.data.incidents || []);
      } catch (err) {
        console.error(err);
        setError('Błąd podczas pobierania zgłoszeń.');
      } finally {
        setLoadingIncidents(false);
      }
    };

    fetchIncidents();
  }, [filterStatus, filterCategory, sortOption]);

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // Processed Incidents after Filtering and Searching
  const processedIncidents = useMemo(() => {
    let filtered = [...incidents];

    // Wyszukiwanie
    if (searchQuery.trim() !== '') {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (incident) =>
          (incident.category &&
            incident.category.toLowerCase().includes(searchLower)) ||
          (incident.description &&
            incident.description.toLowerCase().includes(searchLower))
      );
    }

    // Sortowanie
    if (sortOption === 'date_desc') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortOption === 'date_asc') {
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortOption === 'category_asc') {
      filtered.sort((a, b) => a.category.localeCompare(b.category));
    } else if (sortOption === 'category_desc') {
      filtered.sort((a, b) => b.category.localeCompare(a.category));
    }

    return filtered;
  }, [incidents, searchQuery, sortOption]);

  // Paginacja
  const paginatedIncidents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedIncidents.slice(startIndex, startIndex + itemsPerPage);
  }, [processedIncidents, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(processedIncidents.length / itemsPerPage);

  // Definicja kolorów dla różnych kategorii statusów
  const statusColors = {
    wstępne: 'bg-blue-500',
    aktywne: 'bg-yellow-500',
    końcowe: 'bg-green-500',
    default: 'bg-gray-500',
  };

  // Funkcja określająca odpowiedni komunikat przy braku zgłoszeń
  const noIncidentsMessage = () => {
    if (filterStatus !== 'All' && filterCategory !== 'All') {
      return 'Brak zgłoszeń dla wybranej kategorii i statusu.';
    } else if (filterStatus !== 'All') {
      return 'Brak zgłoszeń o wybranym statusie.';
    } else if (filterCategory !== 'All') {
      return 'Brak zgłoszeń dla wybranej kategorii.';
    } else if (searchQuery.trim() !== '') {
      return 'Brak zgłoszeń pasujących do wyszukiwania.';
    } else {
      return 'Brak dostępnych zgłoszeń.';
    }
  };

  if (loadingIncidents || loadingCategories) {
    return (
      <div className="container mx-auto mt-8 px-4 p-4 lg:px-8 bg-gray-900 min-h-screen mb-12 flex justify-center items-center">
        {/* Custom Loader */}
        <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto mt-8 px-4 p-4 lg:px-8 bg-gray-900 min-h-screen mb-12">
        <div className="alert alert-error mb-4">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto mt-24 px-4 p-4 lg:px-8 bg-gray-900 min-h-screen mb-24">
      <h2 className="text-4xl mb-6 text-center text-white mt-8">
        Wszystkie Incydenty
      </h2>

      {/* Filter, Sort, and Search Controls */}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
        {/* Filter by Status */}
        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setCurrentPage(1);
          }}
          className="select select-bordered w-32 bg-gray-800 text-white"
        >
          <option value="All">Wszystkie</option>
          <option value="nowe">Nowe</option>
          <option value="weryfikacja">Weryfikacja</option>
          <option value="potwierdzone">Potwierdzone</option>
          <option value="wstrzymane">Wstrzymane</option>
          <option value="eskalowane">Eskalowane</option>
          <option value="rozwiązane">Rozwiązane</option>
          <option value="nierozwiązane">Nierozwiązane</option>
          <option value="zamknięte">Zamknięte</option>
          <option value="odrzucone">Odrzucone</option>
        </select>

        {/* Filter by Category */}
        <select
          value={filterCategory}
          onChange={(e) => {
            setFilterCategory(e.target.value);
            setCurrentPage(1);
          }}
          className="select select-bordered w-40 bg-gray-800 text-white"
        >
          <option value="All">Wszystkie Kategorie</option>
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>

        {/* Sort Options */}
        <select
          value={sortOption}
          onChange={(e) => {
            setSortOption(e.target.value);
            setCurrentPage(1);
          }}
          className="select select-bordered w-40 bg-gray-800 text-white"
        >
          <option value="date_desc">Data (najnowsze)</option>
          <option value="date_asc">Data (najstarsze)</option>
          <option value="category_asc">Kategoria (A-Z)</option>
          <option value="category_desc">Kategoria (Z-A)</option>
        </select>

        {/* Search Bar */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Szukaj..."
          className="input input-bordered w-48 bg-gray-800 text-white"
        />

        {/* Items Per Page Selection */}
        <select
          value={itemsPerPage}
          onChange={(e) => {
            setItemsPerPage(Number(e.target.value));
            setCurrentPage(1);
          }}
          className="select select-bordered w-32 bg-gray-800 text-white"
        >
          {itemsPerPageOptions.map((option) => (
            <option key={option} value={option}>
              {option} na stronę
            </option>
          ))}
        </select>
      </div>

      {/* Incident Cards */}
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
                className="card bg-gray-800 text-gray-100 shadow-md rounded-lg border border-gray-700 flex flex-col"
              >
                {incident.images && incident.images.length > 0 ? (
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
                  <div>
                    <h3 className="text-lg font-bold mb-2">
                      <Link
                        to={`/incidents/${incident._id}`}
                        className="text-white hover:underline"
                      >
                        {incident.category || 'Brak Kategorii'}
                      </Link>
                    </h3>
                    <p className="text-sm mb-4">
                      {incident.description.length > 100
                        ? `${incident.description.substring(0, 100)}...`
                        : incident.description}
                    </p>
                  </div>
                  <div className="mt-auto">
                    <div className="flex items-center mb-2">
                      {/* Pobierz kategorię statusu */}
                      <span
                        className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                          statusColors[incident.statusCategory] || statusColors.default
                        }`}
                      >
                        {incident.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mb-4">
                      Dodane:{' '}
                      {new Date(incident.createdAt).toLocaleDateString('pl-PL', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <Link to={`/incidents/${incident._id}`}>
                      <button className="btn btn-primary w-full">Szczegóły</button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-center items-center mt-8 space-x-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`btn btn-secondary ${
                currentPage === 1 ? 'btn-disabled' : ''
              }`}
            >
              Poprzednia
            </button>
            <span className="text-white">
              Strona {currentPage} z {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className={`btn btn-secondary ${
                currentPage === totalPages ? 'btn-disabled' : ''
              }`}
            >
              Następna
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default IncidentsPage;
