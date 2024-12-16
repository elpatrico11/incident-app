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
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import api from '../utils/api';
import useAuthStore from '../store/useAuthStore';

// Custom Leaflet marker icon setup
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Komponent do wyboru lokalizacji na mapie
const LocationSelector = ({ setLocation }) => {
  useMapEvents({
    click(e) {
      setLocation(e.latlng);
    },
  });
  return null;
};

const EditIncidentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [formData, setFormData] = useState({
    category: '',
    description: '',
    latitude: '',
    longitude: '',
    status: 'Pending',
    image: null,
  });
  const [existingImage, setExistingImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null); // Stan dla podglądu obrazu
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState('');

  // Pobranie kategorii z backendu
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

  // Pobranie incydentu do edycji
  useEffect(() => {
    const fetchIncident = async () => {
      try {
        const response = await api.get(`/incidents/${id}`);
        const {
          category,
          description,
          location,
          status,
          images,
          user: incidentUser,
        } = response.data;

        if (incidentUser && incidentUser._id !== user._id && user.role !== 'admin') {
          setError('Nie masz uprawnień do edycji tego zgłoszenia.');
          return;
        }

        setFormData({
          category,
          description,
          latitude: location.coordinates[1],
          longitude: location.coordinates[0],
          status,
          image: null,
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

  const handleChange = (e) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      const file = files[0];
      setFormData({ ...formData, [name]: file });

      // Generowanie podglądu wybranego obrazu
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const { category, description, latitude, longitude, status, image } = formData;

    if (!category || !description || !latitude || !longitude || !status) {
      setError('Wszystkie pola są wymagane.');
      return;
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      setError('Nieprawidłowe wartości szerokości lub długości geograficznej.');
      return;
    }

    const data = new FormData();
    data.append('category', category);
    data.append('description', description);
    data.append('status', status);

    // Konstrukcja obiektu lokalizacji w formacie GeoJSON
    const location = {
      type: 'Point',
      coordinates: [lng, lat], // [lng, lat]
    };
    data.append('location', JSON.stringify(location)); // Dodanie jako string JSON

    if (image) {
      data.append('image', image); // Upewnij się, że nazwa pola zgadza się z backendem
    }

    try {
      const response = await api.put(`/incidents/${id}`, data, {
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
    }
  };

  if (categoriesLoading || (formData.category === '' && !categoriesError)) {
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

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Edytuj Zgłoszenie
      </Typography>
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      <Box
        component="form"
        onSubmit={handleSubmit}
        encType="multipart/form-data"
        sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
      >
        <FormControl fullWidth required>
          <InputLabel id="category-label">Kategoria</InputLabel>
          <Select
            labelId="category-label"
            name="category"
            value={formData.category}
            label="Kategoria"
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          >
            {categories.map((cat) => (
              <MenuItem key={cat.value} value={cat.value}>
                {cat.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Opis"
          name="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
          multiline
          rows={4}
        />

        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Lokalizacja (kliknij na mapie, aby wybrać)
          </Typography>
          <Box sx={{ height: '300px', width: '100%' }}>
            <MapContainer
              center={[
                formData.latitude ? parseFloat(formData.latitude) : 50.0647,
                formData.longitude ? parseFloat(formData.longitude) : 19.9450,
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
              />
              {formData.latitude && formData.longitude && (
                <Marker position={[parseFloat(formData.latitude), parseFloat(formData.longitude)]} />
              )}
            </MapContainer>
          </Box>
        </Grid>

        {/* Sekcja Podglądu Obrazu */}
        {imagePreview ? (
          <Box>
            <Typography variant="subtitle1">Podgląd Obrazu:</Typography>
            <img
              src={imagePreview}
              alt="Podgląd"
              style={{ width: '100%', height: '150px', objectFit: 'cover' }}
            />
            <Button variant="contained" component="label" sx={{ mt: 2 }}>
              Zmień Obraz
              <input
                type="file"
                name="image"
                hidden
                accept="image/*"
                onChange={handleChange}
              />
            </Button>
          </Box>
        ) : existingImage ? (
          <Box>
            <Typography variant="subtitle1">Obecny Obraz:</Typography>
            <img
              src={existingImage}
              alt="Incydent"
              style={{ width: '100%', height: '150px', objectFit: 'cover' }}
            />
            <Button variant="contained" component="label" sx={{ mt: 2 }}>
              Zmień Obraz
              <input
                type="file"
                name="image"
                hidden
                accept="image/*"
                onChange={handleChange}
              />
            </Button>
          </Box>
        ) : (
          <Button variant="contained" component="label" sx={{ mt: 2 }}>
            Dodaj Obraz
            <input
              type="file"
              name="image"
              hidden
              accept="image/*"
              onChange={handleChange}
            />
          </Button>
        )}

        <Button type="submit" variant="contained" color="primary">
          Zaktualizuj Zgłoszenie
        </Button>
      </Box>
    </Container>
  );
};

export default EditIncidentPage;
