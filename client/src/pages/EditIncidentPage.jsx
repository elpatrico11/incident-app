// src/pages/EditIncidentPage.jsx

import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Checkbox,
  ListItemText,
  IconButton,
  Snackbar,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, GeoJSON, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import api from '../utils/api';
import useAuthStore from '../store/useAuthStore';
import { Delete as DeleteIcon } from '@mui/icons-material';
import * as turf from '@turf/turf';

// Custom Leaflet marker icon setup
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Days of the week options
const dniTygodniaOptions = [
  "Poniedziałek",
  "Wtorek",
  "Środa",
  "Czwartek",
  "Piątek",
  "Sobota",
  "Niedziela",
];

// Time of day options
const poraDniaOptions = [
  "Rano",
  "Popołudnie",
  "Wieczór",
  "Noc",
];

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
        setBoundaryError(''); // Clear any previous error
      } else {
        setBoundaryError('Proszę wybrać lokalizację wewnątrz Bielska-Białej.');
      }
    },
  });
  return null;
};

const EditIncidentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Form state
  const [formData, setFormData] = useState({
    category: '',
    description: '',
    latitude: '',
    longitude: '',
    image: null,
    dataZdarzenia: '',    // New field
    dniTygodnia: [],      // New field (array for multiple selections)
    poraDnia: '',         // New field
  });

  // Additional state variables
  const [existingImage, setExistingImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null); // Image preview state
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false); // **Added State**

  // Boundary State
  const [boundary, setBoundary] = useState(null);
  const [boundaryLoading, setBoundaryLoading] = useState(true);
  const [boundaryError, setBoundaryError] = useState('');

  // Snackbar State for Boundary Errors
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        setCategories(response.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setCategoriesError('Błąd podczas pobierania kategorii.');
      }
      setCategoriesLoading(false);
    };

    fetchCategories();
  }, []);

  // Fetch incident data for editing
  useEffect(() => {
    const fetchIncident = async () => {
      try {
        const response = await api.get(`/incidents/${id}`);
        const {
          category,
          description,
          location,
          images,
          user: incidentUser,
          dataZdarzenia,   // New field
          dniTygodnia,     // New field
          poraDnia,        // New field
        } = response.data;

        // Check user permissions
        if (incidentUser && incidentUser._id !== user._id && user.role !== 'admin') {
          setError('Nie masz uprawnień do edycji tego zgłoszenia.');
          return;
        }

        setFormData({
          category,
          description,
          latitude: location.coordinates[1],
          longitude: location.coordinates[0],
          image: null,
          dataZdarzenia: dataZdarzenia ? dataZdarzenia.split('T')[0] : '', // Format to YYYY-MM-DD
          dniTygodnia: dniTygodnia || [],
          poraDnia: poraDnia || '',
        });
        setExistingImage(images[0] || null);
      } catch (err) {
        console.error(err);
        setError('Błąd podczas pobierania zgłoszenia.');
      }
    };

    if (user) {
      fetchIncident();
    }
  }, [id, user]);

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
        setBoundaryError('Błąd podczas ładowania granicy miasta.');
        setSnackbarOpen(true);
      } finally {
        setBoundaryLoading(false);
      }
    };
    fetchBoundary();
  }, []);

  // Handle Snackbar open based on boundaryError
  useEffect(() => {
    if (boundaryError) {
      setSnackbarOpen(true);
    }
  }, [boundaryError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDniTygodniaChange = (event) => {
    const {
      target: { value },
    } = event;
    setFormData({
      ...formData,
      dniTygodnia: typeof value === 'string' ? value.split(',') : value,
    });
  };

  const handlePoraDniaChange = (event) => {
    const { value } = event.target;
    setFormData({ ...formData, poraDnia: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFormData({ ...formData, image: file });

    // Generate image preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
      setFormData({ ...formData, image: null });
      setExistingImage(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); // **Start Submission**
    setError('');
    setSuccess('');

    const { category, description, latitude, longitude, image, dataZdarzenia, dniTygodnia, poraDnia } = formData;

    // Validate mandatory fields
    if (!category || !description || !latitude || !longitude) {
      setError('Proszę wypełnić wszystkie wymagane pola.');
      setIsSubmitting(false); // **Stop Submission**
      return;
    }

    // Additional Validation: Ensure location is within boundary
    if (boundary) {
      const point = turf.point([parseFloat(longitude), parseFloat(latitude)]);
      const polygon = turf.polygon(boundary.features[0].geometry.coordinates);
      const isInside = turf.booleanPointInPolygon(point, polygon);
      if (!isInside) {
        setError('Wybrana lokalizacja znajduje się poza granicą Bielska-Białej.');
        setIsSubmitting(false);
        return;
      }
    }

    const dataToSend = new FormData();
    dataToSend.append('category', category);
    dataToSend.append('description', description);

    // Construct GeoJSON location object
    const locationObj = {
      type: 'Point',
      coordinates: [parseFloat(longitude), parseFloat(latitude)], // [lng, lat]
    };
    dataToSend.append('location', JSON.stringify(locationObj)); // Append as JSON string

    // Conditionally append optional fields
    if (dataZdarzenia) {
      dataToSend.append('dataZdarzenia', dataZdarzenia);
    }
    if (dniTygodnia.length > 0) {
      // Append each day separately if backend expects an array
      dniTygodnia.forEach(day => dataToSend.append('dniTygodnia', day));
    }
    if (poraDnia) {
      dataToSend.append('poraDnia', poraDnia);
    }

    if (image) {
      dataToSend.append('image', image); // Ensure field name matches backend
    }

    try {
      const response = await api.put(`/incidents/${id}`, dataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccess('Incydent został zaktualizowany pomyślnie.');
      navigate(`/incidents/${response.data._id}`);
    } catch (err) {
      console.error(err);
      const serverMsg = err.response?.data?.msg;
      setError(serverMsg || 'Błąd podczas aktualizacji zgłoszenia.');
    } finally {
      setIsSubmitting(false); // **Stop Submission**
    }
  };

  const handleSnackbarClose = () => setSnackbarOpen(false);

  // Conditional Rendering for Loading and Errors
  if (categoriesLoading || boundaryLoading) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (categoriesError) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{categoriesError}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Edytuj Zgłoszenie
      </Typography>
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box
        component="form"
        onSubmit={handleSubmit}
        encType="multipart/form-data"
        sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
      >
        <Grid container spacing={2}>
          {/* Category */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel id="category-label">Kategoria</InputLabel>
              <Select
                labelId="category-label"
                name="category"
                value={formData.category}
                label="Kategoria"
                onChange={handleChange}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Description */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Opis"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              multiline
              rows={4}
              fullWidth
            />
          </Grid>

          {/* Data Zdarzenia (Optional) */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Data Zdarzenia (Opcjonalnie)"
              name="dataZdarzenia"
              type="date"
              InputLabelProps={{
                shrink: true,
              }}
              value={formData.dataZdarzenia}
              onChange={handleChange}
              fullWidth
              helperText="Opcjonalnie"
            />
          </Grid>

          {/* Dni Tygodnia (Optional) */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="dniTygodnia-label">Dni Tygodnia (Opcjonalnie)</InputLabel>
              <Select
                labelId="dniTygodnia-label"
                id="dniTygodnia"
                multiple
                name="dniTygodnia"
                value={formData.dniTygodnia}
                onChange={handleDniTygodniaChange}
                renderValue={(selected) => selected.join(', ')}
              >
                {dniTygodniaOptions.map((day) => (
                  <MenuItem key={day} value={day}>
                    <Checkbox checked={formData.dniTygodnia.indexOf(day) > -1} />
                    <ListItemText primary={day} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Pora Dnia (Optional) */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="poraDnia-label">Pora Dnia (Opcjonalnie)</InputLabel>
              <Select
                labelId="poraDnia-label"
                id="poraDnia"
                name="poraDnia"
                value={formData.poraDnia}
                onChange={handlePoraDniaChange}
                label="Pora Dnia (Opcjonalnie)"
              >
                {poraDniaOptions.map((pora) => (
                  <MenuItem key={pora} value={pora}>
                    {pora}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Location */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Lokalizacja (kliknij na mapie, aby wybrać)
            </Typography>
            <Box sx={{ height: '400px', width: '100%' }}>
              <MapContainer
                center={[
                  formData.latitude ? parseFloat(formData.latitude) : 49.8225, // Bielsko-Biała latitude
                  formData.longitude ? parseFloat(formData.longitude) : 19.0442, // Bielsko-Biała longitude
                ]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationSelector
                  setLocation={(latlng) =>
                    setFormData({
                      ...formData,
                      latitude: latlng.lat.toString(),
                      longitude: latlng.lng.toString(),
                    })
                  }
                  boundary={boundary}
                  setBoundaryError={(msg) => {
                    setBoundaryError(msg);
                  }}
                />
                {formData.latitude && formData.longitude && (
                  <Marker position={[parseFloat(formData.latitude), parseFloat(formData.longitude)]} />
                )}
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
              </MapContainer>
            </Box>
            {formData.latitude && formData.longitude && (
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Wybrana lokalizacja: {parseFloat(formData.latitude).toFixed(6)}, {parseFloat(formData.longitude).toFixed(6)}
              </Typography>
            )}
          </Grid>

          {/* Image Section */}
          <Grid item xs={12}>
            {imagePreview ? (
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Podgląd Obrazu:
                </Typography>
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    height: '200px',
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    mb: 2,
                  }}
                >
                  <img
                    src={imagePreview}
                    alt="Podgląd"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <IconButton
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    }}
                    onClick={handleRemoveImage}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
                <Button variant="contained" component="label">
                  Zmień Obraz
                  <input
                    type="file"
                    name="image"
                    hidden
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </Button>
              </Box>
            ) : existingImage ? (
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Obecny Obraz:
                </Typography>
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    height: '200px',
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    mb: 2,
                  }}
                >
                  <img
                    src={existingImage}
                    alt="Incydent"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <IconButton
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    }}
                    onClick={handleRemoveImage}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
                <Button variant="contained" component="label">
                  Zmień Obraz
                  <input
                    type="file"
                    name="image"
                    hidden
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </Button>
              </Box>
            ) : (
              <Button variant="contained" component="label">
                Dodaj Obraz
                <input
                  type="file"
                  name="image"
                  hidden
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </Button>
            )}
          </Grid>
        </Grid>

        {/* Submit Button */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress size={24} /> : 'Zaktualizuj Zgłoszenie'}
          </Button>
        </Box>
      </Box>

      {/* Snackbar for Boundary Errors */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity="error" sx={{ width: '100%' }}>
          {boundaryError}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default EditIncidentPage;
