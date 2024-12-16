// client/src/pages/MapPage.jsx

import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { fetchCategories } from '../utils/categories';
import {
  Container,
  Typography,
  CircularProgress,
  Alert,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Fab,
  Drawer,
  Grid,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
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

const MapPage = () => {
  const [incidents, setIncidents] = useState([]);
  const [filteredIncidents, setFilteredIncidents] = useState([]);
  const [incidentsLoading, setIncidentsLoading] = useState(true);
  const [incidentsError, setIncidentsError] = useState('');
  
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState('');
  
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  // Fetch incidents on mount
  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const response = await api.get('/incidents');
        setIncidents(response.data.incidents);
        setFilteredIncidents(response.data.incidents);
      } catch (err) {
        console.error(err);
        setIncidentsError('Błąd podczas pobierania zgłoszeń.');
      }
      setIncidentsLoading(false);
    };

    fetchIncidents();
  }, []);

  // Fetch categories on mount
  useEffect(() => {
    const getCategories = async () => {
      try {
        const fetchedCategories = await fetchCategories();
        setCategories(fetchedCategories);
      } catch (err) {
        console.error(err);
        setCategoriesError('Błąd podczas pobierania kategorii.');
      }
      setCategoriesLoading(false);
    };

    getCategories();
  }, []);

  // Handle category filter change
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

  // Handle category selection from drawer
  const handleCategorySelect = (category) => {
    console.log(`Selected category: ${category}`);
    setDrawerOpen(false);
    // Navigate to ReportPage with the selected category as a query parameter
    navigate(`/report?category=${encodeURIComponent(category)}`);
  };

  // Show loading spinner if data is being fetched
  if (incidentsLoading || categoriesLoading) {
    return (
      <Container sx={{ mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  // Show error if fetching incidents failed
  if (incidentsError) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{incidentsError}</Alert>
      </Container>
    );
  }

  // Show error if fetching categories failed
  if (categoriesError) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{categoriesError}</Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4, position: 'relative' }}>
      <Typography variant="h4" gutterBottom>
        Mapa Incydentów
      </Typography>
      <Box
        sx={{
          mb: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
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
              <MenuItem key={category.value} value={category.value}>
                {category.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Box sx={{ height: '600px', width: '100%', mb: 2 }}>
        <MapContainer
          center={[50.0647, 19.945]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {filteredIncidents.map((incident) => (
            <Marker
              key={incident._id}
              position={[
                incident.location.coordinates[1],
                incident.location.coordinates[0],
              ]}
            >
              <Popup>
                <Typography variant="h6">{incident.category}</Typography>
                <Typography variant="body2">{incident.description}</Typography>
                <Typography variant="caption">
                  Status: {incident.status}
                </Typography>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </Box>
      <Fab
        color="primary"
        aria-label="add"
        onClick={() => setDrawerOpen(true)}
        sx={{
          position: 'absolute',
          bottom: 16,
          left: 16,
        }}
      >
        <AddIcon />
      </Fab>
      <Drawer
        anchor="bottom"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ padding: 2 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Typography variant="h6">Wybierz kategorię zgłoszenia</Typography>
            <IconButton onClick={() => setDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Grid container spacing={2}>
            {categories.map((category) => (
              <Grid item xs={6} sm={4} md={3} key={category.value}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    padding: '10px',
                    cursor: 'pointer',
                    transition: 'background-color 0.4s, transform 0.5s, color 0.4s',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      borderColor: '#0000b4',
                      backgroundColor: '#0000b4',
                      '& .category-label': {
                        color: '#fff', // Turn text white on hover
                      },
                    },
                  }}
                  onClick={() => handleCategorySelect(category.value)}
                >
                  <img
                    src={category.image}
                    alt={category.label}
                    style={{
                      width: '40px',
                      height: '40px',
                      objectFit: 'contain',
                      marginBottom: '8px',
                    }}
                  />
                  <Typography
                    className="category-label"
                    variant="body2"
                    align="center"
                    sx={{
                      fontSize: '12px',
                      color: '#000',
                      transition: 'color 0.4s',
                    }}
                  >
                    {category.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Drawer>
    </Container>
  );
};

export default MapPage;
