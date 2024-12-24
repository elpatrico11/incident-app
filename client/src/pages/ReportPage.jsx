
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';
import { fetchCategories } from '../utils/categories';
import useAuthStore from '../store/useAuthStore';
import imageCompression from 'browser-image-compression';
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
  IconButton,
  FormControl,
  InputLabel,
  Select,
  Checkbox,
  ListItemText,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, GeoJSON, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import * as turf from '@turf/turf';
import ReCAPTCHA from 'react-google-recaptcha';

// Custom marker icon setup
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Image compression options
const compressionOptions = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  fileType: 'image/png', // Explicitly set the output format
  initialQuality: 0.8
};

// Boundary GeoJSON import
const boundaryGeoJSONUrl = '/assets/geo/bielsko-biala-boundary.geojson';

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
  const location = useLocation();
  const { user } = useAuthStore();

  // Form state
  const [formData, setFormData] = useState({
    category: '',
    description: '',
    location: null,
    image: null, // Changed from images: []
    dataZdarzenia: '',    // New field
    dniTygodnia: [],      // New field (array for multiple selections)
    poraDnia: '',         // New field
  });

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [boundaryError, setBoundaryError] = useState('');

  // Data loading state
  const [boundary, setBoundary] = useState(null);
  const [boundaryLoading, setBoundaryLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState('');

  // reCAPTCHA state
  const [captchaValue, setCaptchaValue] = useState(null);
  const [captchaError, setCaptchaError] = useState('');
  const captchaRef = useRef(null);

  // Image preview state
  const [preview, setPreview] = useState(null); // Changed from previews: []

  // Fetch categories on mount
  useEffect(() => {
    const getCategories = async () => {
      try {
        const fetchedCategories = await fetchCategories();
        setCategories(fetchedCategories);
      } catch (err) {
        setCategoriesError('Błąd podczas pobierania kategorii.');
        console.error('Error fetching categories:', err);
      } finally {
        setCategoriesLoading(false);
      }
    };
    getCategories();
  }, []);

  // Fetch boundary GeoJSON on mount
  useEffect(() => {
    const fetchBoundary = async () => {
      try {
        const response = await fetch(boundaryGeoJSONUrl);
        if (!response.ok) throw new Error('Failed to load boundary data');
        const data = await response.json();
        setBoundary(data);
      } catch (err) {
        console.error('Error loading boundary GeoJSON:', err);
        setBoundaryError('Nie udało się załadować granicy miasta.');
      } finally {
        setBoundaryLoading(false);
      }
    };
    fetchBoundary();
  }, []);

  // Set initial category from URL params
  useEffect(() => {
    if (categories.length > 0) {
      const params = new URLSearchParams(location.search);
      const selectedCategory = params.get('category');
      if (selectedCategory && categories.some(cat => cat.value === selectedCategory)) {
        setFormData(prev => ({ ...prev, category: selectedCategory }));
      }
    }
  }, [location.search, categories]);

  // Clean up image preview on unmount
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview.url);
    };
  }, [preview]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDniTygodniaChange = (event) => {
    const {
      target: { value },
    } = event;
    setFormData(prev => ({
      ...prev,
      dniTygodnia: typeof value === 'string' ? value.split(',') : value,
    }));
  };

  const handlePoraDniaChange = (event) => {
    const { value } = event.target;
    setFormData(prev => ({ ...prev, poraDnia: value }));
  };

  const compressImage = async (file) => {
    try {
      const compressedFile = await imageCompression(file, compressionOptions);
      return compressedFile;
    } catch (error) {
      console.error('Error compressing image:', error);
      return file;
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    console.log('Selected file:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    setIsSubmitting(true);
    try {
      const compressedFile = await compressImage(file);
      console.log('Compressed file:', {
        name: compressedFile.name,
        type: compressedFile.type,
        size: compressedFile.size
      });

      // Extract the file extension from the MIME type
      const extension = compressedFile.type.split('/')[1]; // e.g., 'png'

      // Generate a new filename with the correct extension
      const newFileName = `${Date.now()}.${extension}`;

      // Create a new File object with the updated filename
      const renamedFile = new File([compressedFile], newFileName, { type: compressedFile.type });

      const newPreview = {
        url: URL.createObjectURL(renamedFile),
        name: renamedFile.name
      };

      // Revoke previous preview if it exists to free up memory
      if (preview) {
        URL.revokeObjectURL(preview.url);
      }

      setPreview(newPreview);
      setFormData(prev => ({
        ...prev,
        image: renamedFile
      }));
    } catch (err) {
      console.error('Error processing image:', err);
      setError('Błąd podczas przetwarzania zdjęcia. Szczegóły: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveImage = () => {
    if (preview) {
      URL.revokeObjectURL(preview.url);
      setPreview(null);
      setFormData(prev => ({
        ...prev,
        image: null
      }));
    }
  };

  const handleCaptchaChange = (value) => {
    setCaptchaValue(value);
    if (value) setCaptchaError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    setCaptchaError('');

    // Validation
    if (
      !formData.category ||
      !formData.description ||
      !formData.location
    ) {
      setError('Proszę wypełnić wszystkie wymagane pola.');
      setIsSubmitting(false);
      return;
    }

    if (!user && !captchaValue) {
      setCaptchaError('Proszę przejść weryfikację reCAPTCHA.');
      setIsSubmitting(false);
      return;
    }

    const data = new FormData();
    data.append('category', formData.category);
    data.append('description', formData.description);
    data.append('location', JSON.stringify({
      type: 'Point',
      coordinates: [formData.location.lng, formData.location.lat],
    }));

    // Conditionally append optional fields
    if (formData.dataZdarzenia) {
      data.append('dataZdarzenia', formData.dataZdarzenia);
    }
    if (formData.dniTygodnia.length > 0) {
      // Append each day separately if backend expects an array
      formData.dniTygodnia.forEach(day => data.append('dniTygodnia', day));
    }
    if (formData.poraDnia) {
      data.append('poraDnia', formData.poraDnia);
    }

    if (formData.image) {
      data.append('image', formData.image); // Changed from 'images' to 'image'
    }

    if (!user && captchaValue) {
      data.append('captcha', captchaValue);
    }

    try {
      const response = await api.post('/incidents', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000
      });

      setSuccess('Zgłoszenie zostało pomyślnie utworzone.');
      navigate(`/incidents/${response.data._id}`);
    } catch (err) {
      console.error('Error response:', err);
      const errorMessage = err.response?.data?.msg || err.response?.data?.detail || 'Błąd podczas tworzenia zgłoszenia.';
      setError(errorMessage);

      if (!user && captchaRef.current) {
        captchaRef.current.reset();
        setCaptchaValue(null);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSnackbarClose = () => setSnackbarOpen(false);

  if (categoriesLoading || boundaryLoading) {
    return (
      <Container component="main" maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (categoriesError) {
    return (
      <Container component="main" maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{categoriesError}</Alert>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography component="h1" variant="h5" gutterBottom>
        Zgłoś Incydent
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Box component="form" noValidate onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          {/* Existing Fields */}

          <Grid item xs={12}>
            <TextField
              select
              name="category"
              label="Kategoria"
              value={formData.category}
              onChange={handleChange}
              fullWidth
              required
              disabled={isSubmitting}
            >
              <MenuItem value="">Wybierz kategorię</MenuItem>
              {categories.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

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
              disabled={isSubmitting}
            />
          </Grid>

          {/* New Field: Data Zdarzenia */}
          <Grid item xs={12} sm={6}>
            <TextField
              name="dataZdarzenia"
              label="Data Zdarzenia"
              type="date"
              InputLabelProps={{
                shrink: true,
              }}
              value={formData.dataZdarzenia}
              onChange={handleChange}
              fullWidth
              // Removed required
              disabled={isSubmitting}
              helperText="Opcjonalnie"
            />
          </Grid>

          {/* New Field: Dni Tygodnia */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth disabled={isSubmitting}>
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

          {/* New Field: Pora Dnia */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth disabled={isSubmitting}>
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

          {/* Existing Fields Continued */}

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Lokalizacja (kliknij na mapie, aby wybrać)
            </Typography>
            <Box sx={{ height: '400px', width: '100%', mb: 2 }}>
              <MapContainer
                center={[49.8224, 19.0444]}
                zoom={12}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {boundary && (
                  <GeoJSON
                    data={boundary}
                    style={{
                      color: '#2196f3',
                      weight: 2,
                      fillOpacity: 0.1,
                    }}
                  />
                )}
                <LocationSelector
                  setLocation={(latlng) => {
                    setFormData(prev => ({ ...prev, location: latlng }));
                    setBoundaryError('');
                  }}
                  boundary={boundary}
                  setBoundaryError={(msg) => {
                    setBoundaryError(msg);
                    setSnackbarOpen(true);
                  }}
                />
                {formData.location && (
                  <Marker position={formData.location} />
                )}
              </MapContainer>
            </Box>
            {formData.location && (
              <Typography variant="body2" color="textSecondary">
                Wybrana lokalizacja: {formData.location.lat.toFixed(6)}, {formData.location.lng.toFixed(6)}
              </Typography>
            )}
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="contained"
              component="label"
              disabled={isSubmitting || formData.image !== null}
            >
              {formData.image ? 'Zmień Zdjęcie' : 'Dodaj Zdjęcie'}
              <input
                type="file"
                hidden
                accept="image/jpeg,image/png,image/gif"            
                onChange={handleImageChange}
                disabled={isSubmitting}
              />
            </Button>
            
            {preview && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                <Box
                  key={preview.name}
                  sx={{
                    position: 'relative',
                    width: 100,
                    height: 100,
                  }}
                >
                  <img
                    src={preview.url}
                    alt={`Uploaded`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '4px',
                    }}
                  />
                  <IconButton
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      },
                    }}
                    onClick={handleRemoveImage}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            )}
          </Grid>

          {!user && (
            <Grid item xs={12}>
              <ReCAPTCHA
                sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
                onChange={handleCaptchaChange}
                ref={captchaRef}
              />
              {captchaError && <Alert severity="error" sx={{ mt: 1 }}>{captchaError}</Alert>}
            </Grid>
          )}

          <Grid item xs={12}>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isSubmitting}
              sx={{ mt: 2 }}
            >
              {isSubmitting ? (
                <CircularProgress size={24} />
              ) : 'Zgłoś'}
            </Button>
          </Grid>
        </Grid>
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
