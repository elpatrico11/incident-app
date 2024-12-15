import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingIncidents, setLoadingIncidents] = useState(true);
  const [error, setError] = useState('');
  const [statusUpdate, setStatusUpdate] = useState({});

  useEffect(() => {
    fetchUsers();
    fetchIncidents();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (err) {
      console.error(err);
      setError('Błąd podczas pobierania użytkowników.');
    }
    setLoadingUsers(false);
  };

  const fetchIncidents = async () => {
    try {
      const response = await api.get('/admin/incidents');
      setIncidents(response.data);
    } catch (err) {
      console.error(err);
      setError('Błąd podczas pobierania zgłoszeń.');
    }
    setLoadingIncidents(false);
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const response = await api.put(`/admin/users/${userId}`, { role: newRole });
      setUsers(users.map(user => user._id === userId ? response.data : user));
    } catch (err) {
      console.error(err);
      setError('Błąd podczas aktualizacji roli użytkownika.');
    }
  };

  const handleStatusChange = async (incidentId, newStatus) => {
    try {
      const response = await api.put(`/admin/incidents/${incidentId}/status`, { status: newStatus });
      setIncidents(incidents.map(incident => incident._id === incidentId ? response.data : incident));
    } catch (err) {
      console.error(err);
      setError('Błąd podczas aktualizacji statusu zgłoszenia.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Czy na pewno chcesz usunąć tego użytkownika?")) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(users.filter(user => user._id !== userId));
    } catch (err) {
      console.error(err);
      setError('Błąd podczas usuwania użytkownika.');
    }
  };

  const handleDeleteIncident = async (incidentId) => {
    if (!window.confirm("Czy na pewno chcesz usunąć to zgłoszenie?")) return;
    try {
      await api.delete(`/admin/incidents/${incidentId}`);
      setIncidents(incidents.filter(incident => incident._id !== incidentId));
    } catch (err) {
      console.error(err);
      setError('Błąd podczas usuwania zgłoszenia.');
    }
  };

  if (loadingUsers || loadingIncidents) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Panel Administratora
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      {/* Zarządzanie Użytkownikami */}
      <Typography variant="h5" gutterBottom>
        Zarządzanie Użytkownikami
      </Typography>
      {users.length === 0 ? (
        <Typography variant="body1">Brak użytkowników.</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ mb: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Imię</TableCell>
                <TableCell>Nazwisko</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Rola</TableCell>
                <TableCell>Akcje</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map(user => (
                <TableRow key={user._id}>
                  <TableCell>{user.firstName}</TableCell>
                  <TableCell>{user.lastName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <FormControl variant="standard" sx={{ minWidth: 120 }}>
                      <Select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      >
                        <MenuItem value="user">Użytkownik</MenuItem>
                        <MenuItem value="admin">Administrator</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleDeleteUser(user._id)}
                    >
                      Usuń
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Zarządzanie Zgłoszeniami */}
      <Typography variant="h5" gutterBottom>
        Zarządzanie Zgłoszeniami
      </Typography>
      {incidents.length === 0 ? (
        <Typography variant="body1">Brak zgłoszeń.</Typography>
      ) : (
        <Grid container spacing={4}>
          {incidents.map(incident => (
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
                  <Typography variant="caption" display="block" gutterBottom>
                    Zgłoszony przez: {incident.user.firstName} {incident.user.lastName}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" component={Link} to={`/incidents/${incident._id}`}>
                    Szczegóły
                  </Button>
                  <FormControl variant="standard" sx={{ minWidth: 120, mt: 1 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={incident.status}
                      onChange={(e) => handleStatusChange(incident._id, e.target.value)}
                      label="Status"
                    >
                      <MenuItem value="Pending">Oczekujące</MenuItem>
                      <MenuItem value="In Progress">W Trakcie</MenuItem>
                      <MenuItem value="Resolved">Zamknięte</MenuItem>
                    </Select>
                  </FormControl>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleDeleteIncident(incident._id)}
                    sx={{ mt: 1 }}
                  >
                    Usuń
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default AdminPage;
