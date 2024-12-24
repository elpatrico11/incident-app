
import { Link as RouterLink } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Grid,
  Link,
  Alert,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Button,
  TextField,
  Chip,
} from '@mui/material';
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
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!incident) {
    return (
      <Container sx={{ mt: 4 }}>
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
    dataZdarzenia,   // New field
    dniTygodnia,     // New field
    poraDnia,        // New field
  } = incident;

  return (
    <Container sx={{ mt: 4 }}>
      {/* Incident Title and Description */}
      <Typography variant="h4" gutterBottom>
        {category}
      </Typography>
      <Typography variant="body1" gutterBottom>
        {description}
      </Typography>

      {/* New Fields: Data Zdarzenia, Dni Tygodnia, Pora Dnia */}
      <Box sx={{ mt: 2 }}>
        <Grid container spacing={2}>
          {/* Data Zdarzenia (Date of Incident) */}
          {dataZdarzenia && (
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle2">Data Zdarzenia:</Typography>
              <Typography variant="body2">
                {new Date(dataZdarzenia).toLocaleDateString('pl-PL')}
              </Typography>
            </Grid>
          )}

          {/* Dni Tygodnia (Days of the Week) */}
          {dniTygodnia && dniTygodnia.length > 0 && (
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle2">Dni Tygodnia:</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {dniTygodnia.map((day, index) => (
                  <Chip key={index} label={day} />
                ))}
              </Box>
            </Grid>
          )}

          {/* Pora Dnia (Time of Day) */}
          {poraDnia && (
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle2">Pora Dnia:</Typography>
              <Typography variant="body2">{poraDnia}</Typography>
            </Grid>
          )}
        </Grid>
      </Box>

      {/* Incident Status */}
      <Typography variant="caption" display="block" gutterBottom sx={{ mt: 2 }}>
        Status: {status}
      </Typography>

      {/* Incident Images */}
      {images && images.length > 0 && (
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {images.map((src, index) => (
            <Grid item key={index} xs={12} sm={6} md={4}>
              <img
                src={src}
                alt={`Incydent ${index + 1}`}
                style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
                loading="lazy"
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Incident Location Map */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Lokalizacja
        </Typography>
        <Box sx={{ height: '400px', width: '100%' }}>
          <MapContainer
            center={[
              location.coordinates[1],
              location.coordinates[0],
            ]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {/* Boundary GeoJSON Layer */}
            {boundary && (
              <GeoJSON
                data={boundary}
                style={{
                  color: '#2196f3', // Consistent blue boundary
                  weight: 2,
                  fillOpacity: 0.1,
                }}
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
                <Typography variant="h6">{category}</Typography>
                <Typography variant="body2">{description}</Typography>
                <Typography variant="caption">Status: {status}</Typography>
              </Popup>
            </Marker>
          </MapContainer>
        </Box>
      </Box>

      {/* Comments Section */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6">Komentarze</Typography>
        <List>
          {comments.map((comment, index) => (
            <ListItem key={index} alignItems="flex-start">
              <ListItemAvatar>
                <Avatar>
                  {comment.user && comment.user.firstName
                    ? comment.user.firstName.charAt(0).toUpperCase()
                    : 'U'}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={`${comment.user ? `${comment.user.firstName} ${comment.user.lastName}` : 'Anonimowy'} `}
                secondary={comment.text}
              />
            </ListItem>
          ))}
        </List>
        {user ? (
          <Box component="form" onSubmit={handleCommentSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Dodaj komentarz"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              error={!!commentError}
              helperText={commentError}
              multiline
              rows={3}
              disabled={isSubmitting} // Disabled when submitting
            />
            <Button
              type="submit"
              variant="contained"
              sx={{ mt: 1 }}
              disabled={isSubmitting} // Disabled when submitting
            >
              {isSubmitting ? <CircularProgress size={24} /> : 'Dodaj'}
            </Button>
          </Box>
        ) : (
          <Typography variant="body2" sx={{ mt: 2 }}>
            <Link component={RouterLink} to="/login">
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
