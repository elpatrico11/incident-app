// src/pages/IncidentDetailPage.jsx

import { Link as RouterLink } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/api';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Grid,
  Link,
  Alert,
  Button,
  TextField,
  Chip,
} from '@mui/material'; // Usunięto Divider
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from 'react-leaflet';
import * as turf from '@turf/turf';
import useAuthStore from '../store/useAuthStore';

const IncidentDetailPage = () => {
  const { id } = useParams();
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuthStore();
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [commentError, setCommentError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // Defined

  // Boundary State
  const [boundary, setBoundary] = useState(null);
  const [boundaryLoading, setBoundaryLoading] = useState(true);
  // Removed boundaryError as it's unused
  // Removed isInsideBoundary to fix ESLint warning

  // Fetch Incident Data
  useEffect(() => {
    const fetchIncident = async () => {
      try {
        const response = await api.get(`/incidents/${id}`);
        setIncident(response.data);
      } catch (err) {
        console.error(err);
        setError('Błąd podczas pobierania zgłoszenia.');
      }
      setLoading(false);
    };

    fetchIncident();
  }, [id]);

  // Fetch Comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await api.get(`/incidents/${id}/comments`);
        setComments(response.data);
      } catch (err) {
        console.error(err);
        setError('Błąd podczas pobierania komentarzy.');
      }
    };

    fetchComments();
  }, [id]);

  // Fetch Boundary GeoJSON
  useEffect(() => {
    const boundaryGeoJSONUrl = '/assets/geo/bielsko-biala-boundary.geojson';

    const fetchBoundary = async () => {
      try {
        const response = await fetch(boundaryGeoJSONUrl);
        if (!response.ok) throw new Error('Failed to load boundary data');
        const data = await response.json();
        setBoundary(data);
      } catch (err) {
        console.error('Error loading boundary GeoJSON:', err);
        // Optionally, you can set an error state here if you want to inform the user
      } finally {
        setBoundaryLoading(false);
      }
    };
    fetchBoundary();
  }, []);

  // Determine if Incident is Within Boundary
  useEffect(() => {
    if (boundary && incident && incident.location && incident.location.coordinates) {
      const [lng, lat] = incident.location.coordinates;
      const point = turf.point([lng, lat]);
      const polygon = turf.polygon(boundary.features[0].geometry.coordinates);

      // This calculation is no longer used, so we don't store it
      turf.booleanPointInPolygon(point, polygon);
    }
  }, [boundary, incident]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setCommentError('Komentarz nie może być pusty.');
      return;
    }

    setIsSubmitting(true); // Start submitting
    try {
      const response = await api.post(`/incidents/${id}/comments`, { text: comment });
      setComments(response.data);
      setComment('');
      setCommentError('');
    } catch (err) {
      console.error(err);
      setCommentError(err.response?.data?.msg || 'Błąd podczas dodawania komentarza');
    } finally {
      setIsSubmitting(false); // End submitting
    }
  };

  if (loading || boundaryLoading) {
    return (
      <Container className="mt-4 text-center">
        <div className="flex justify-center items-center h-64">
          <CircularProgress />
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!incident) {
    return (
      <Container className="mt-4">
        <Alert severity="warning">Nie znaleziono zgłoszenia.</Alert>
      </Container>
    );
  }

  // Destructure the incident data for easier access
  const {
    category,
    description,
    status,
    images,
    location,
    dataZdarzenia, // New field
    dniTygodnia,   // New field
    poraDnia,      // New field
    statusLogs,    // New field: status logs
  } = incident;

  // Definicja kolorów dla różnych statusów
  const statusColors = {
    Nowe: 'text-blue-500',
    Weryfikacja: 'text-yellow-500',
    Potwierdzone: 'text-green-500',
    Wstrzymane: 'text-gray-500',
    Eskalowane: 'text-orange-500',
    Rozwiązane: 'text-teal-500',
    Nierozwiązane: 'text-red-500',
    Zamknięte: 'text-purple-500',
    Odrzucone: 'text-pink-500',
    default: 'text-gray-500',
  };

  return (
    <Container className="mt-4">
      {/* Incident Title and Description */}
      <Typography variant="h4" gutterBottom className="text-white">
        {category}
      </Typography>
      <Typography variant="body1" gutterBottom className="text-gray-300">
        {description}
      </Typography>

      {/* New Fields: Data Zdarzenia, Dni Tygodnia, Pora Dnia */}
      <Box className="mt-2">
        <Grid container spacing={2}>
          {/* Data Zdarzenia (Date of Incident) */}
          {dataZdarzenia && (
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle2" className="text-gray-400">
                Data Zdarzenia:
              </Typography>
              <Typography variant="body2" className="text-gray-300">
                {new Date(dataZdarzenia).toLocaleDateString('pl-PL')}
              </Typography>
            </Grid>
          )}

          {/* Dni Tygodnia (Days of the Week) */}
          {dniTygodnia && dniTygodnia.length > 0 && (
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle2" className="text-gray-400">
                Dni Tygodnia:
              </Typography>
              <Box className="flex flex-wrap gap-2 mt-1">
                {dniTygodnia.map((day, index) => (
                  <Chip key={index} label={day} className="bg-gray-700 text-white" />
                ))}
              </Box>
            </Grid>
          )}

          {/* Pora Dnia (Time of Day) */}
          {poraDnia && (
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle2" className="text-gray-400">
                Pora Dnia:
              </Typography>
              <Typography variant="body2" className="text-gray-300">
                {poraDnia}
              </Typography>
            </Grid>
          )}
        </Grid>
      </Box>

      {/* Incident Status */}
      <Typography variant="caption" display="block" gutterBottom className="mt-2 text-gray-400">
        Status: <span className={statusColors[status] || statusColors.default}>{status}</span>
      </Typography>

      {/* Incident Images */}
      {images && images.length > 0 && (
        <Grid container spacing={2} className="mt-2">
          {images.map((src, index) => (
            <Grid item key={index} xs={12} sm={6} md={4}>
              <img
                src={src}
                alt={`Incydent ${index + 1}`}
                className="w-full h-auto rounded-lg"
                loading="lazy"
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Incident Location Map */}
      <Box className="mt-4">
        <Typography variant="h6" gutterBottom className="text-white">
          Lokalizacja
        </Typography>
        <Box className="h-96 w-full">
          <MapContainer
            center={[
              location.coordinates[1],
              location.coordinates[0],
            ]}
            zoom={13}
            className="h-full w-full rounded-lg"
          >
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {/* Boundary GeoJSON Layer */}
            {boundary && (
              <GeoJSON
                data={boundary}
                className="stroke-blue-500 fill-blue-500/10"
              />
            )}
            {/* Marker for Incident Location */}
            <Marker
              position={[
                location.coordinates[1],
                location.coordinates[0],
              ]}
            >
              <Popup>
                <Typography variant="h6" className="text-black">
                  {category}
                </Typography>
                <Typography variant="body2" className="text-black">
                  {description}
                </Typography>
                <Typography variant="caption" className="text-black">
                  Status: {status}
                </Typography>
              </Popup>
            </Marker>
          </MapContainer>
        </Box>
      </Box>

      {/* Status Logs Section */}
      <Box className="mt-4">
        <Typography variant="h6" gutterBottom className="text-white">
          Historia Zmian Statusów
        </Typography>
        {statusLogs && statusLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-800 rounded-lg">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-gray-300">Zmieniono przez</th>
                  <th className="px-4 py-2 text-left text-gray-300">Z Statusu</th>
                  <th className="px-4 py-2 text-left text-gray-300">Na Status</th>
                  <th className="px-4 py-2 text-left text-gray-300">Kiedy</th>
                </tr>
              </thead>
              <tbody>
                {statusLogs.map((log, index) => (
                  <tr
                    key={index}
                    className={`hover:bg-gray-700 ${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-700'}`}
                  >
                    <td className="border px-4 py-2 text-gray-300">
                      {log.changedBy ? `${log.changedBy.firstName} ${log.changedBy.lastName}` : 'System'}
                    </td>
                    <td className="border px-4 py-2 text-gray-300">
                      {log.previousStatus}
                    </td>
                    <td className={`border px-4 py-2 ${statusColors[log.newStatus] || statusColors.default}`}>
                      {log.newStatus}
                    </td>
                    <td className="border px-4 py-2 text-gray-300">
                      {new Date(log.changedAt).toLocaleString('pl-PL', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Typography variant="body2" className="mt-1 text-gray-300">
            Brak zmian statusów.
          </Typography>
        )}
      </Box>

      {/* Comments Section */}
      <Box className="mt-4">
        <Typography variant="h6" className="text-white">
          Komentarze
        </Typography>
        <div className="space-y-4">
          {comments.map((comment, index) => (
            <div key={index} className="flex items-start bg-gray-800 rounded-lg p-4">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {comment.user && comment.user.avatarUrl ? (
                  <img
                    src={comment.user.avatarUrl}
                    alt={`${comment.user.firstName} ${comment.user.lastName}`}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-semibold">
                    {comment.user
                      ? `${comment.user.firstName.charAt(0)}${comment.user.lastName.charAt(0)}`
                      : 'A'}
                  </div>
                )}
              </div>
              {/* Komentarz */}
              <div className="ml-4">
                <Typography variant="body2" className="text-gray-300">
                  <strong>
                    {comment.user
                      ? `${comment.user.firstName} ${comment.user.lastName}`
                      : 'Anonimowy'}
                  </strong>
                </Typography>
                <Typography variant="body2" className="text-gray-200 mt-1">
                  {comment.text}
                </Typography>
                <Typography variant="caption" className="text-gray-400 mt-1">
                  {new Date(comment.createdAt).toLocaleString('pl-PL', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </Typography>
              </div>
            </div>
          ))}
        </div>
        {user ? (
          <Box component="form" onSubmit={handleCommentSubmit} className="mt-4">
            <TextField
              fullWidth
              label="Dodaj komentarz"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              error={!!commentError}
              helperText={commentError}
              multiline
              rows={3}
              className="bg-gray-700 text-white"
              InputLabelProps={{
                className: 'text-gray-300',
              }}
              InputProps={{
                className: 'text-gray-200',
              }}
              disabled={isSubmitting} // Disabled when submitting
            />
            <Button
              type="submit"
              variant="contained"
              className="mt-2 bg-blue-600 hover:bg-blue-700"
              disabled={isSubmitting} // Disabled when submitting
            >
              {isSubmitting ? <CircularProgress size={24} /> : 'Dodaj'}
            </Button>
          </Box>
        ) : (
          <Typography variant="body2" className="mt-4 text-gray-300">
            <Link component={RouterLink} to="/login" className="text-blue-400 hover:underline">
              Zaloguj się
            </Link>{' '}
            aby dodać komentarz.
          </Typography>
        )}
      </Box>
    </Container>
  );
};

export default IncidentDetailPage;
