import { useState, useEffect, useCallback } from "react";
import {
  getMyIncidents,
  userDeleteIncident,
} from "../../api/services/incidentService";
import useAuthStore from "../../models/stores/useAuthStore";

export const useMyIncidents = () => {
  const { user } = useAuthStore();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [incidentToDelete, setIncidentToDelete] = useState(null);

  const fetchIncidents = useCallback(async () => {
    if (!user) {
      setLoading(false);
      setError("Nie jesteś zalogowany.");
      return;
    }

    try {
      const data = await getMyIncidents();
      setIncidents(data);
    } catch (err) {
      console.error("Error fetching incidents:", err);
      setError("Błąd podczas pobierania Twoich zgłoszeń.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  const handleDelete = async () => {
    try {
      await userDeleteIncident(incidentToDelete._id);
      setIncidents(incidents.filter((inc) => inc._id !== incidentToDelete._id));
      setDeleteDialogOpen(false);
      setIncidentToDelete(null);
    } catch (err) {
      console.error("Error deleting incident:", err);
      setError("Błąd podczas usuwania zgłoszenia.");
      setDeleteDialogOpen(false);
      setIncidentToDelete(null);
    }
  };

  return {
    incidents,
    loading,
    error,
    deleteDialogOpen,
    incidentToDelete,
    setDeleteDialogOpen,
    setIncidentToDelete,
    handleDelete,
  };
};
