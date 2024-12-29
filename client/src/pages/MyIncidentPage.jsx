// src/pages/MyIncidentsPage.js
import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { Link } from 'react-router-dom';
import api from '../api/api';
import useAuthStore from '../store/useAuthStore';

const MyIncidentsPage = () => {
  const { user } = useAuthStore();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [incidentToDelete, setIncidentToDelete] = useState(null);

  useEffect(() => {
    const fetchMyIncidents = async () => {
      try {
        const response = await api.get('/incidents/my'); // Użyj dedykowanego endpointu
        setIncidents(response.data);
      } catch (err) {
        console.error('Error fetching incidents:', err);
        setError('Błąd podczas pobierania Twoich zgłoszeń.');
      }
      setLoading(false);
    };

    if (user) {
      fetchMyIncidents();
    } else {
      setLoading(false);
      setError('Nie jesteś zalogowany.');
    }
  }, [user]);

  const handleDelete = async () => {
    try {
      console.log('Deleting incident:', incidentToDelete);
      await api.delete(`/incidents/${incidentToDelete._id}`);
      setIncidents(incidents.filter((inc) => inc._id !== incidentToDelete._id));
      setDeleteDialogOpen(false);
      setIncidentToDelete(null);
    } catch (err) {
      console.error('Error deleting incident:', err);
      setError('Błąd podczas usuwania zgłoszenia.');
      setDeleteDialogOpen(false);
      setIncidentToDelete(null);
    }
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
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
        Moje Zgłoszenia
      </Typography>
      {incidents.length === 0 ? (
        <Typography variant="body1">Nie masz żadnych zgłoszeń.</Typography>
      ) : (
        <Grid container spacing={4}>
          {incidents.map((incident) => (
            <Grid item key={incident._id} xs={12} sm={6} md={4}>
              <Card>
                {incident.images && incident.images.length > 0 && (
                  <img
                    src={incident.images[0]}
                    alt={incident.category}
                    style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                    loading="lazy"
                  />
                )}
                <CardContent>
                  <Typography variant="h5" component="div">
                    {incident.category}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {incident.description.substring(0, 100)}...
                  </Typography>
                  <Typography variant="caption" display="block" gutterBottom>
                    Status: {incident.status}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    component={Link}
                    to={`/incidents/${incident._id}/edit`}
                  >
                    Edytuj
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => {
                      setIncidentToDelete(incident);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    Usuń
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Usuń Zgłoszenie</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Czy na pewno chcesz usunąć to zgłoszenie? Ta operacja jest nieodwracalna.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Anuluj</Button>
          <Button onClick={handleDelete} color="error">
            Usuń
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MyIncidentsPage;
