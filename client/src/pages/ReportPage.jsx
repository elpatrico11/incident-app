// client/src/pages/ReportPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';
import { fetchCategories } from '../utils/categories';
import useAuthStore from '../store/useAuthStore';
import {
  Container,
  Typography,
  TextField,
  Button,
  MenuItem,
  Grid,
  Box,
  Alert,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import { MapContainer, TileLayer, Marker, GeoJSON, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import * as turf from '@turf/turf';

// Custom marker icon setup
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Boundary GeoJSON import (adjust the path if necessary)
const boundaryGeoJSONUrl = '/assets/geo/bielsko-biala-boundary.geojson';

// LocationSelector component with boundary checking
const LocationSelector = ({ setLocation, boundary, setBoundaryError }) => {
  useMapEvents({
    click(e) {
      if (!boundary) return;

      const { lat, lng } = e.latlng;
      const point = turf.point([lng, lat]);
      const polygon = turf.polygon(boundary.features[0].geometry.coordinates);

      const isInside = turf.booleanPointInPolygon(point, polygon);

      if (isInside) {
        setLocation(e.latlng);
        setBoundaryError('');
      } else {
        setBoundaryError('Proszę wybrać lokalizację wewnątrz Bielska-Białej.');
      }
    },
  });

  return null;
};

const ReportPage = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Hook to access the current location
  const { user } = useAuthStore(); // Zustand store

  // Form state
  const [formData, setFormData] = useState({
    category: '',
    description: '',
    location: null, // { lat: ..., lng: ... }
    images: [],
  });

  // Boundary state
  const [boundary, setBoundary] = useState(null);
  const [boundaryLoading, setBoundaryLoading] = useState(true);
  const [boundaryError, setBoundaryError] = useState('');

  // Categories state
  const [categories, setCategories] = useState([]); // State to hold fetched categories
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState('');

  // Submission and form state
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Fetch categories on component mount
  useEffect(() => {
    const getCategories = async () => {
      try {
        const fetchedCategories = await fetchCategories();
        setCategories(fetchedCategories);
      } catch (err) {
        setCategoriesError('Błąd podczas pobierania kategorii.');
      }
      setCategoriesLoading(false);
    };
    getCategories();
  }, []);

  // Fetch boundary GeoJSON on component mount
  useEffect(() => {
    const fetchBoundary = async () => {
      try {
        const response = await fetch(boundaryGeoJSONUrl);
        if (!response.ok) {
          throw new Error('Nie udało się załadować danych granicy.');
        }
        const data = await response.json();
        setBoundary(data);
      } catch (err) {
        console.error('Error loading boundary GeoJSON:', err);
        setBoundaryError('Nie udało się załadować granicy miasta.');
      }
      setBoundaryLoading(false);
    };

    fetchBoundary();
  }, []);

  // Extract the category from the query parameters after categories are fetched
  useEffect(() => {
    if (categories.length === 0) return; // Wait until categories are fetched
    const params = new URLSearchParams(location.search);
    const selectedCategory = params.get('category');

    // Verify that the selectedCategory exists in categories array
    if (selectedCategory && categories.some(cat => cat.value === selectedCategory)) {
      setFormData((prev) => ({ ...prev, category: selectedCategory }));
    }
  }, [location.search, categories]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value || '' }); // Ensure value is never undefined
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const files = e.target.files;
    setFormData({ ...formData, images: files });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const { category, description, location, images } = formData;

    // Basic validation
    if (!category || !description || !location) {
      setError('Proszę wypełnić wszystkie wymagane pola.');
      return;
    }

    // Additional validation: Ensure location is within boundary
    if (boundary) {
      const point = turf.point([location.lng, location.lat]);
      const polygon = turf.polygon(boundary.features[0].geometry.coordinates);
      const isInside = turf.booleanPointInPolygon(point, polygon);
      if (!isInside) {
        setError('Wybrana lokalizacja znajduje się poza obszarem Bielska-Białej.');
        return;
      }
    }

    const data = new FormData();
    data.append('category', category);
    data.append('description', description);

    // Send location as a JSON string
    data.append('location', JSON.stringify({
      type: 'Point',
      coordinates: [location.lng, location.lat],
    }));

    for (let i = 0; i < images.length; i++) {
      data.append('images', images[i]);
    }

    // If the user is logged in, add their ID to the data
    if (user && user._id) {
      data.append('user', user._id);
    }

    try {
      console.log('Submitting FormData:');
      for (let pair of data.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
      }

      const response = await api.post('/incidents', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccess('Zgłoszenie zostało pomyślnie utworzone.');
      setFormData({
        category: '',
        description: '',
        location: null,
        images: [],
      });
      // Optionally navigate to the incident details
      navigate(`/incidents/${response.data._id}`);
    } catch (err) {
      console.error('Error response:', err.response);
      setError(err.response?.data?.msg || 'Błąd podczas tworzenia zgłoszenia.');
    }
  };

  // Handle Snackbar close
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Show loading spinner if categories or boundary are being fetched
  if (categoriesLoading || boundaryLoading) {
    return (
      <Container component="main" maxWidth="md" sx={{ mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  // Show error if fetching categories failed
  if (categoriesError) {
    return (
      <Container component="main" maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{categoriesError}</Alert>
      </Container>
    );
  }

  // Show error if fetching boundary failed
  if (!boundary && boundaryError) {
    return (
      <Container component="main" maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{boundaryError}</Alert>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="md" sx={{ mt: 4 }}>
      <Typography component="h1" variant="h5" gutterBottom>
        Zgłoś Incydent
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      <Box component="form" noValidate onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          {/* Kategoria */}
          <Grid item xs={12} sm={6}>
            <TextField
              select
              name="category"
              label="Kategoria"
              value={formData.category}
              onChange={handleChange}
              fullWidth
              required
            >
              <MenuItem value="">Wybierz kategorię</MenuItem>
              {categories.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          {/* Opis */}
          <Grid item xs={12}>
            <TextField
              name="description"
              label="Opis"
              multiline
              rows={4}
              value={formData.description}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          {/* Mapa do wyboru lokalizacji */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Lokalizacja (kliknij na mapie, aby wybrać)
            </Typography>
            <Box sx={{ height: '300px', width: '100%' }}>
              <MapContainer
                center={[49.8224, 19.0444]} // Bielsko-Biała coordinates
                zoom={10}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {/* Display Boundary */}
                {boundary && (
                  <GeoJSON
                    data={boundary}
                    style={{
                      color: 'blue',
                      weight: 2,
                      fillOpacity: 0.1,
                    }}
                  />
                )}
                {/* Location Selector with Boundary Checking */}
                <LocationSelector
                  setLocation={(latlng) => {
                    setFormData((prev) => ({ ...prev, location: latlng }));
                    setBoundaryError('');
                  }}
                  boundary={boundary}
                  setBoundaryError={(msg) => {
                    setBoundaryError(msg);
                    setSnackbarOpen(true);
                  }}
                />
                {/* Display Marker if Location is Selected */}
                {formData.location && (
                  <Marker position={formData.location} />
                )}
              </MapContainer>
            </Box>
            {formData.location && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Wybrana lokalizacja: {formData.location.lat.toFixed(4)}, {formData.location.lng.toFixed(4)}
              </Typography>
            )}
          </Grid>
          {/* Dodawanie obrazów */}
          <Grid item xs={12}>
            <Button variant="contained" component="label">
              Dodaj Obrazy
              <input
                type="file"
                hidden
                multiple
                accept="image/*"
                onChange={handleImageChange}
              />
            </Button>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', mt: 2 }}>
              {Array.from(formData.images).map((file, index) => (
                <img
                  key={index}
                  src={URL.createObjectURL(file)}
                  alt={`Uploaded ${index}`}
                  style={{
                    width: '100px',
                    height: '100px',
                    objectFit: 'cover',
                    marginRight: '10px',
                    marginBottom: '10px',
                  }}
                  loading="lazy"
                />
              ))}
            </Box>
          </Grid>
        </Grid>
        {/* Przycisk do zgłaszania incydentu */}
        <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
          Zgłoś Incydent
        </Button>
      </Box>
      {/* Snackbar for Boundary Errors */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        message={boundaryError}
      />
    </Container>
  );
};

export default ReportPage;
