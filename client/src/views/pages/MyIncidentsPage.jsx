import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
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
      <Container className="mt-24 px-4 p-4 lg:px-8 bg-gray-900 min-h-screen mb-24 flex justify-center items-center">
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-24 px-4 p-4 lg:px-8 bg-gray-900 min-h-screen mb-24">
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-24 px-4 p-4 lg:px-8 bg-gray-900 min-h-screen mb-24">
      <Typography
        variant="h4"
        gutterBottom
        className="text-xl text-white text-center mt-8"
      >
        Moje Zgłoszenia
      </Typography>

      {incidents.length === 0 ? (
        <Typography variant="body1" className="text-white">
          Nie masz żadnych zgłoszeń.
        </Typography>
      ) : (
        <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {incidents.map((incident) => (
            <IncidentCard
              key={incident._id}
              incident={incident}
              statusColors={STATUS_COLORS}
              // Callback dla usuwania
              onDelete={() => {
                setIncidentToDelete(incident);
                setDeleteDialogOpen(true);
              }}
              // Callback dla edycji
              onEdit={() => {
                navigate(`/incidents/${incident._id}/edit`);
              }}
            />
          ))}
        </Box>
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
