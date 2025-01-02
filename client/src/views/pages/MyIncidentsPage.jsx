import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useMyIncidents } from '../../controllers/hooks/useMyIncidents';
import IncidentCard from '../components/common/IncidentCard';
import { DeleteConfirmationDialog } from '../components/features/incidentManagement/DeleteConfirmationDialog';

import { STATUS_COLORS } from '../../constants/incidentConstants';

const MyIncidentsPage = () => {
  const navigate = useNavigate();
  const {
    incidents,
    loading,
    error,
    deleteDialogOpen,
    setDeleteDialogOpen,
    setIncidentToDelete,
    handleDelete,
  } = useMyIncidents();

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
              <IncidentCard
                incident={incident}
                statusColors={STATUS_COLORS}
                // DELETE callback
                onDelete={() => {
                  setIncidentToDelete(incident);
                  setDeleteDialogOpen(true);
                }}
                // EDIT callback
                onEdit={() => {
                  // navigate to the edit page for this incident
                  navigate(`/incidents/${incident._id}/edit`);
                }}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
      />
    </Container>
  );
};

export default MyIncidentsPage;
