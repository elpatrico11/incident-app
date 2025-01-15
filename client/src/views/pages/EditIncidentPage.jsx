import React, { useEffect } from 'react';
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
  InputAdornment
} from '@mui/material';

import { MapContainer, TileLayer, Marker, GeoJSON, useMapEvents } from 'react-leaflet';
import { Delete as DeleteIcon, Search as SearchIcon } from '@mui/icons-material';

import { useParams } from 'react-router-dom';
import { useEditIncidentForm } from '../../controllers/hooks/useEditIncidentForm';
import { setupLeafletMarkerIcons } from '../../utils/mapUtils';
import 'leaflet/dist/leaflet.css';

// Reusable component: whenever user clicks map => call onMapClick(latlng)
const LocationSelector = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
};

const EditIncidentPage = () => {
  const { id } = useParams();
  const {
    formData,
    existingImage,
    imagePreview,
    categories,
    categoriesLoading,
    categoriesError,
    boundary,
    boundaryLoading,
    boundaryError,
    snackbarOpen,
    error,
    success,
    isSubmitting,
    DNI_TYGODNIA_OPTIONS,
    PORA_DNIA_OPTIONS,
    handleFormChange,
    handleDniTygodniaChange,
    handlePoraDniaChange,
    handleImageChange,
    handleRemoveImage,
    handleMapClick,
    handleSearchAddress, 
    handleSubmit,
    handleSnackbarClose,
  } = useEditIncidentForm(id);

  // For Leaflet icons
  useEffect(() => {
    setupLeafletMarkerIcons();
  }, []);

  // Prevent the Enter key from submitting the form 
  // when user is typing in “Lokalizacja”.
  const handleAddressKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();  
      handleSearchAddress(); 
    }
  };

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
                onChange={handleFormChange}
              >
                {categories.map(cat => (
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
              onChange={handleFormChange}
              required
              multiline
              rows={4}
              fullWidth
            />
          </Grid>

          {/* Data Zdarzenia */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Data Zdarzenia (Opcjonalnie)"
              name="dataZdarzenia"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={formData.dataZdarzenia}
              onChange={handleFormChange}
              fullWidth
              helperText="Opcjonalnie"
            />
          </Grid>

          {/* Dni Tygodnia */}
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
                {DNI_TYGODNIA_OPTIONS.map((day) => (
                  <MenuItem key={day} value={day}>
                    <Checkbox checked={formData.dniTygodnia.includes(day)} />
                    <ListItemText primary={day} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Pora Dnia */}
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
                {PORA_DNIA_OPTIONS.map((pora) => (
                  <MenuItem key={pora} value={pora}>
                    {pora}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Map Section */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Mapa (kliknij, aby wybrać lokalizację)
            </Typography>
            <Box sx={{ height: 400, width: '100%' }}>
              <MapContainer
                center={[
                  formData.latitude ? parseFloat(formData.latitude) : 49.8225,
                  formData.longitude ? parseFloat(formData.longitude) : 19.0442,
                ]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
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
                <LocationSelector onMapClick={handleMapClick} />
                {formData.latitude && formData.longitude && (
                  <Marker
                    position={[
                      parseFloat(formData.latitude),
                      parseFloat(formData.longitude)
                    ]}
                  />
                )}
              </MapContainer>
            </Box>
          </Grid>

          {/* Lokalizacja (under the map) + Magnifier => forward geocode */}
          <Grid item xs={12}>
            <TextField
              label="Lokalizacja"
              name="address"
              value={formData.address}
              onChange={handleFormChange}
              onKeyDown={handleAddressKeyDown}  
              fullWidth
              placeholder="np. Działkowców 15, Bielsko-Biała"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleSearchAddress}
                      disabled={isSubmitting}
                      edge="end"
                    >
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
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
                    height: 200,
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
                    height: 200,
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

      {/* Snackbar for boundary errors */}
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
