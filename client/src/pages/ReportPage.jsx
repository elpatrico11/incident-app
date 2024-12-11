import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import {
  Container,
  Typography,
  TextField,
  Button,
  MenuItem,
  Grid,
  Box,
  Alert,
} from '@mui/material';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Custom marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const categories = [
  { value: 'Vandalism', label: 'Wandalizm' },
  { value: 'Accident', label: 'Wypadek' },
  { value: 'Safety Hazard', label: 'Zagrożenie Bezpieczeństwa' },
  { value: 'Other', label: 'Inne' },
];

const ReportPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    category: '',
    description: '',
    location: null,
    images: [],
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const files = e.target.files;
    const urls = [];
    for (let i = 0; i < files.length; i++) {
      urls.push(URL.createObjectURL(files[i]));
    }
    setFormData({ ...formData, images: urls });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.category || !formData.description || !formData.location) {
      setError('Proszę wypełnić wszystkie wymagane pola.');
      return;
    }

    const incidentData = {
      category: formData.category,
      description: formData.description,
      location: {
        type: 'Point',
        coordinates: [formData.location.lng, formData.location.lat],
      },
      images: formData.images,
    };

    try {
      await api.post('/incidents', incidentData);
      setSuccess('Zgłoszenie zostało pomyślnie utworzone.');
      setFormData({
        category: '',
        description: '',
        location: null,
        images: [],
      });
      // Opcjonalnie przekieruj użytkownika
      // navigate('/incidents');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || 'Błąd podczas tworzenia zgłoszenia.');
    }
  };

  const LocationSelector = () => {
    useMapEvents({
      click(e) {
        setFormData({ ...formData, location: e.latlng });
      },
    });

    return formData.location ? (
      <Marker position={formData.location} />
    ) : null;
  };

  return (
    <Container component="main" maxWidth="md" sx={{ mt: 4 }}>
      <Typography component="h1" variant="h5" gutterBottom>
        Zgłoś Incydent
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      <Box component="form" noValidate onSubmit={handleSubmit}>
        <Grid container spacing={2}>
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
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Lokalizacja (kliknij na mapie, aby wybrać)
            </Typography>
            <Box sx={{ height: '300px', width: '100%' }}>
              <MapContainer center={[50.0647, 19.9450]} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationSelector />
              </MapContainer>
            </Box>
            {formData.location && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Wybrana lokalizacja: {formData.location.lat.toFixed(4)}, {formData.location.lng.toFixed(4)}
              </Typography>
            )}
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" component="label">
              Dodaj Obrazki
              <input
                type="file"
                hidden
                multiple
                accept="image/*"
                onChange={handleImageChange}
              />
            </Button>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', mt: 2 }}>
              {formData.images.map((src, index) => (
                <img
                  key={index}
                  src={src}
                  alt={`Uploaded ${index}`}
                  style={{
                    width: '100px',
                    height: '100px',
                    objectFit: 'cover',
                    marginRight: '10px',
                    marginBottom: '10px',
                  }}
                  loading="lazy" // Dodanie lazy loading
                />
              ))}
            </Box>
          </Grid>
        </Grid>
        <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
          Zgłoś Incydent
        </Button>
      </Box>
    </Container>
  );
};

export default ReportPage;
