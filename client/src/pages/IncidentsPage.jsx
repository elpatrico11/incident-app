import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Link } from 'react-router-dom';

import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';

const IncidentsPage = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const response = await api.get('/incidents');
        setIncidents(response.data.incidents);
      } catch (err) {
        console.error(err);
        setError('Błąd podczas pobierania zgłoszeń.');
      }
      setLoading(false);
    };

    fetchIncidents();
  }, []);

  if (loading) {
    return (
      <Container sx={{ mt: 4 }}>
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
        Wszystkie Incydenty
      </Typography>
      <Grid container spacing={4}>
        {incidents.map((incident) => (
          <Grid item key={incident._id} xs={12} sm={6} md={4}>
            <Card>
              {incident.images && incident.images.length > 0 && (
                <CardMedia
                  component="img"
                  height="140"
                  image={incident.images[0]}
                  alt="Incident Image"
                />
              )}
              <CardContent>
                <Typography variant="h6" component="div">
                  <Link to={`/incidents/${incident._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    {incident.category}
                </Link>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {incident.description.length > 100
                    ? `${incident.description.substring(0, 100)}...`
                    : incident.description}
                </Typography>
                <Chip
                  label={incident.status}
                  color={
                    incident.status === 'Resolved'
                      ? 'success'
                      : incident.status === 'In Progress'
                      ? 'warning'
                      : 'default'
                  }
                  sx={{ mt: 2 }}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default IncidentsPage;
