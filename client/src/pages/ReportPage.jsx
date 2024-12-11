// src/pages/ReportPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
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

// Kategorie zgłoszeń
const categories = [
  { value: 'Vandalism', label: 'Wandalizm' },
  { value: 'Accident', label: 'Wypadek' },
  { value: 'Safety Hazard', label: 'Zagrożenie Bezpieczeństwa' },
  { value: 'Other', label: 'Inne' },
];

// Komponent do wyboru lokalizacji na mapie
const LocationSelector = ({ setLocation }) => {
  useMapEvents({
    click(e) {
      setLocation(e.latlng);
    },
  });

  return null;
};

const ReportPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore(); // Pobieranie informacji o użytkowniku z Zustand
  const [formData, setFormData] = useState({
    category: '',
    description: '',
    location: null, // { lat: ..., lng: ... }
    images: [],
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Obsługa zmiany wartości w formularzu
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Obsługa zmiany obrazów
  const handleImageChange = (e) => {
    const files = e.target.files;
    setFormData({ ...formData, images: files });
  };

  // Obsługa wysyłania formularza
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const { category, description, location, images } = formData;

    if (!category || !description || !location) {
      setError('Proszę wypełnić wszystkie wymagane pola.');
      return;
    }

    const data = new FormData();
    data.append('category', category);
    data.append('description', description);
    data.append('location[type]', 'Point');
    data.append('location[coordinates][0]', location.lng);
    data.append('location[coordinates][1]', location.lat);
    for (let i = 0; i < images.length; i++) {
      data.append('images', images[i]);
    }

    // Jeśli użytkownik jest zalogowany, dodaj jego ID do danych
    if (user && user._id) {
      data.append('user', user._id);
    }

    try {
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
      // Opcjonalnie przekieruj użytkownika do szczegółów zgłoszenia
      navigate(`/incidents/${response.data._id}`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || 'Błąd podczas tworzenia zgłoszenia.');
    }
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
              <MapContainer center={[50.0647, 19.9450]} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationSelector setLocation={(latlng) => setFormData({ ...formData, location: latlng })} />
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
    </Container>
  );
};

export default ReportPage;
