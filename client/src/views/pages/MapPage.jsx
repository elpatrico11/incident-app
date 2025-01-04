import {React, useEffect} from 'react';
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
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';

import { useMapPage } from '../../controllers/hooks/useMapPage';
import 'leaflet/dist/leaflet.css';
import { setupLeafletMarkerIcons } from '../../utils/mapUtils';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import MarkerClusterGroup from '../components/common/MarkerClusterGroup';


const MapPage = () => {
  // Hook logic
  const {
    incidentsError,
    incidentsLoading,
    filteredIncidents,
    categoriesError,
    categoriesLoading,
    categories,
    categoryFilter,
    handleFilterChange,
    boundary,
    drawerOpen,
    setDrawerOpen,
  } = useMapPage();

   useEffect(() => {
    setupLeafletMarkerIcons();
  }, []);

  const navigate = useNavigate();

  // If still loading incidents or categories or boundary not loaded yet:
  if (incidentsLoading || categoriesLoading || !boundary) {
    return (
      <Container sx={{ mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (incidentsError) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{incidentsError}</Alert>
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
            onChange={(e) => handleFilterChange(e.target.value)}
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
          center={[49.8224, 19.0444]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          whenCreated={(map) => {
            // Fit bounds to boundary
            if (boundary) {
              const geoJsonLayer = L.geoJSON(boundary);
              map.fitBounds(geoJsonLayer.getBounds());
            }
          }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
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
          {/* Use the custom MarkerClusterGroup */}
          <MarkerClusterGroup incidents={filteredIncidents} />
        </MapContainer>
      </Box>

      {/* Floating Button */}
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

      {/* Bottom Drawer */}
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
                        color: '#fff',
                      },
                    },
                  }}
                  onClick={() => navigate(`/report?category=${category.value}`)}
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
