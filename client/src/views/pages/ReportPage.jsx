import React, { useEffect } from 'react';
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
  InputAdornment,
} from '@mui/material';
import { Delete as DeleteIcon, Search as SearchIcon } from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, GeoJSON, useMapEvents } from 'react-leaflet';
import ReCAPTCHA from 'react-google-recaptcha';

import { useReportForm } from '../../controllers/hooks/useReportForm';
import { setupLeafletMarkerIcons } from '../../utils/mapUtils';
import 'leaflet/dist/leaflet.css';

const LocationSelector = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
};

const ReportPage = () => {
  useEffect(() => {
    setupLeafletMarkerIcons();
  }, []);

  const {
    formData,
    handleFormChange,
    handleAddressChange,
    handleDniTygodniaChange,
    handlePoraDniaChange,
    handleImageChange,
    handleRemoveImage,
    handleCaptchaChange,
    handleSubmit,
    handleSnackbarClose,
    handleMapClick,
    handleSearchAddress,
    boundary,
    boundaryError,
    boundaryLoading,
    categories,
    categoriesError,
    categoriesLoading,
    user,
    preview,
    isSubmitting,
    error,
    success,
    snackbarOpen,
    captchaRef,
    captchaError,
    DNI_TYGODNIA_OPTIONS,
    PORA_DNIA_OPTIONS,
  } = useReportForm();

  // Press Enter => trigger the search
  const handleAddressKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearchAddress();
    }
  };

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
          {/* Category */}
          <Grid item xs={12}>
            <TextField
              select
              name="category"
              label="Kategoria"
              value={formData.category}
              onChange={handleFormChange}
              fullWidth
              required
              disabled={isSubmitting}
            >
              <MenuItem value="">Wybierz kategorię</MenuItem>
              {categories.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Description */}
          <Grid item xs={12}>
            <TextField
              name="description"
              label="Opis"
              multiline
              rows={4}
              value={formData.description}
              onChange={handleFormChange}
              fullWidth
              required
              disabled={isSubmitting}
            />
          </Grid>

          {/* Data Zdarzenia */}
          <Grid item xs={12} sm={6}>
            <TextField
              name="dataZdarzenia"
              label="Data Zdarzenia (Opcjonalnie)"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={formData.dataZdarzenia}
              onChange={handleFormChange}
              fullWidth
              disabled={isSubmitting}
            />
          </Grid>

          {/* Dni Tygodnia */}
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
                {PORA_DNIA_OPTIONS.map((pora) => (
                  <MenuItem key={pora} value={pora}>
                    {pora}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Map */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Kliknij na mapie, aby wybrać lokalizację
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
                <LocationSelector onMapClick={handleMapClick} />
                {formData.location && (
                  <Marker position={[formData.location.lat, formData.location.lng]} />
                )}
              </MapContainer>
            </Box>
          </Grid>

          {/* Address (single line) + Magnifier Button */}
          <Grid item xs={12}>
            <TextField
              label="Lokalizacja"
              fullWidth
              disabled={isSubmitting}
              value={formData.address}
              onChange={handleAddressChange}
              onKeyDown={handleAddressKeyDown}
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

          {/* Image upload */}
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
                    alt={preview.name}
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

          {/* reCAPTCHA if not logged in */}
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

          {/* Submit */}
          <Grid item xs={12}>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isSubmitting}
              sx={{ mt: 2 }}
            >
              {isSubmitting ? <CircularProgress size={24} /> : 'Zgłoś'}
            </Button>
          </Grid>
        </Grid>
      </Box>

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
