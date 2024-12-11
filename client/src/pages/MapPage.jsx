// src/pages/MapPage.jsx
import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import {
  Container,
  Typography,
  CircularProgress,
  Alert,
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';

// Custom marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const categories = [
  'Vandalism',
  'Accident',
  'Safety Hazard',
  'Other',
];

const MapPage = () => {
  const [incidents, setIncidents] = useState([]);
  const [filteredIncidents, setFilteredIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const response = await api.get('/incidents');
        setIncidents(response.data);
        setFilteredIncidents(response.data);
      } catch (err) {
        console.error(err);
        setError('Błąd podczas pobierania zgłoszeń.');
      }
      setLoading(false);
    };

    fetchIncidents();
  }, []);

  const handleFilterChange = (e) => {
    const selectedCategory = e.target.value;
    setCategoryFilter(selectedCategory);
    if (selectedCategory === 'All') {
      setFilteredIncidents(incidents);
    } else {
      const filtered = incidents.filter(
        (incident) => incident.category === selectedCategory
      );
      setFilteredIncidents(filtered);
    }
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4 }}>
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

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Mapa Incydentów
      </Typography>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="category-filter-label">Filtruj według kategorii</InputLabel>
          <Select
            labelId="category-filter-label"
            id="category-filter"
            value={categoryFilter}
            label="Filtruj według kategorii"
            onChange={handleFilterChange}
          >
            <MenuItem value="All">Wszystkie</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="contained" onClick={() => navigate('/report')}>
          Zgłoś nowy incydent
        </Button>
      </Box>
      <Box sx={{ height: '600px', width: '100%', mb: 2 }}>
        <MapContainer center={[50.0647, 19.9450]} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {filteredIncidents.map((incident) => (
            <Marker
              key={incident._id}
              position={[incident.location.coordinates[1], incident.location.coordinates[0]]}
            >
              <Popup>
                <Typography variant="h6">{incident.category}</Typography>
                <Typography variant="body2">{incident.description}</Typography>
                <Typography variant="caption">Status: {incident.status}</Typography>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </Box>
    </Container>
  );
};

export default MapPage;
