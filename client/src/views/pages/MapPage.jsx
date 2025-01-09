// file: MapPage.jsx

import React, { useEffect } from 'react';
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
  Drawer,
  Grid,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Fab,            // <-- IMPORTANT: import Fab
} from '@mui/material';

import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
// Add this for the + icon:
import AddIcon from '@mui/icons-material/Add';  

import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';

import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';

import { setupLeafletMarkerIcons } from '../../utils/mapUtils';
import { useMapPage } from '../../controllers/hooks/useMapPage';
import MarkerClusterGroup from '../components/common/MarkerClusterGroup';

// Import our custom control
import MyLocationControl from '../components/common/MyLocationControl';

const MapPage = () => {
  const navigate = useNavigate();
  const {
    // from your hook
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
    handleMapCreated,
    searchQuery,
    handleSearchChange,
    handleSearch,
    searchDialogOpen,
    searchDialogMessage,
    handleCloseDialog,

    // the geolocation function in your hook
    handleUserLocation,
  } = useMapPage();

  useEffect(() => {
    setupLeafletMarkerIcons();
  }, []);

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

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <Container sx={{ mt: 4, position: 'relative' }}>
      <Typography variant="h4" gutterBottom>
        Mapa Incydentów
      </Typography>

      {/* Filter + Search bar */}
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
          <TextField
            label="Wyszukaj adres"
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="np. Michałowicza"
            sx={{ width: 220 }}
          />
          <IconButton
            color="primary"
            sx={{ ml: 1 }}
            onClick={handleSearch}
          >
            <SearchIcon />
          </IconButton>
        </Box>

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
            {categories.map((cat) => (
              <MenuItem key={cat.value} value={cat.value}>
                {cat.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Map */}
      <Box sx={{ height: 600, width: '100%', mb: 2 }}>
        <MapContainer
          center={[49.8224, 19.0444]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          whenReady={(map) => handleMapCreated(map.target)}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* "Locate me" control in top-left corner */}
          <MyLocationControl onLocate={handleUserLocation} />

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
          <MarkerClusterGroup incidents={filteredIncidents} />
        </MapContainer>
      </Box>

      {/* "Add new incident" FAB in bottom-left corner */}
     {!drawerOpen && (
  <Fab
    color="primary"
    aria-label="add"
    onClick={() => setDrawerOpen(true)}
    sx={{
      position: 'absolute',
      bottom: 16,
      left: 16,
      zIndex: 9999,
    }}
  >
    <AddIcon />
  </Fab>
)}

      {/* Category selection drawer */}
      <Drawer
        anchor="bottom"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        disableEnforceFocus
      >
        <Box sx={{ p: 2 }}>
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
            {categories.map((c) => (
              <Grid item xs={6} sm={4} md={3} key={c.value}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    p: 1,
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
                  onClick={() => navigate(`/report?category=${c.value}`)}
                >
                  <img
                    src={c.image}
                    alt={c.label}
                    style={{
                      width: 40,
                      height: 40,
                      objectFit: 'contain',
                      marginBottom: 8,
                    }}
                  />
                  <Typography
                    className="category-label"
                    variant="body2"
                    align="center"
                    sx={{
                      fontSize: 12,
                      color: '#000',
                      transition: 'color 0.4s',
                    }}
                  >
                    {c.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Drawer>

      <Dialog
        open={searchDialogOpen}
        onClose={handleCloseDialog}
        disableEnforceFocus
      >
        <DialogTitle>Wyniki wyszukiwania</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {searchDialogMessage}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MapPage;
