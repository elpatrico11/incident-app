// src/pages/IncidentDetailPage.jsx
import React, { useEffect, useState, useContext } from 'react';
import { TextField, Button, List, ListItem, ListItemAvatar, Avatar, ListItemText } from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Grid,
} from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Custom marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const IncidentDetailPage = () => {
  const { id } = useParams();
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useContext(AuthContext);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const fetchIncident = async () => {
      try {
        const response = await api.get(`/incidents/${id}`);
        setIncident(response.data);
      } catch (err) {
        console.error(err);
        setError('Błąd podczas pobierania zgłoszenia.');
      }
      setLoading(false);
    };

    fetchIncident();
  }, [id]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await api.get(`/incidents/${id}/comments`);
        setComments(response.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchComments();
  }, [id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      const response = await api.post(`/incidents/${id}/comments`, { text: comment });
      setComments(response.data);
      setComment('');
    } catch (err) {
      console.error(err);
      alert('Błąd podczas dodawania komentarza');
    }
  };

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
        {incident.category}
      </Typography>
      <Typography variant="body1" gutterBottom>
        {incident.description}
      </Typography>
      <Typography variant="caption" display="block" gutterBottom>
        Status: {incident.status}
      </Typography>
      {incident.images && incident.images.length > 0 && (
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {incident.images.map((src, index) => (
            <Grid item key={index} xs={12} sm={6} md={4}>
              <img
                src={src}
                alt={`Incident ${index}`}
                style={{ width: '100%', height: 'auto' }}
                loading="lazy"
              />
            </Grid>
          ))}
        </Grid>
      )}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Lokalizacja
        </Typography>
        <Box sx={{ height: '400px', width: '100%' }}>
          <MapContainer
            center={[
              incident.location.coordinates[1],
              incident.location.coordinates[0],
            ]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker
              position={[
                incident.location.coordinates[1],
                incident.location.coordinates[0],
              ]}
            >
              <Popup>
                <Typography variant="h6">{incident.category}</Typography>
                <Typography variant="body2">{incident.description}</Typography>
                <Typography variant="caption">Status: {incident.status}</Typography>
              </Popup>
            </Marker>
          </MapContainer>
        </Box>
      </Box>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6">Komentarze</Typography>
        <List>
          {comments.map((comment, index) => (
            <ListItem key={index}>
              <ListItemAvatar>
                <Avatar>
                  {comment.user && comment.user.firstName
                    ? comment.user.firstName.charAt(0)
                    : 'U'}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={`${comment.user.firstName} ${comment.user.lastName}`}
                secondary={comment.text}
              />
            </ListItem>
          ))}
        </List>
        {user && (
          <form onSubmit={handleCommentSubmit}>
            <TextField
              fullWidth
              label="Dodaj komentarz"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              sx={{ mt: 2 }}
            />
            <Button type="submit" variant="contained" sx={{ mt: 2 }}>
              Dodaj
            </Button>
          </form>
        )}
      </Box>
    </Container>
  );
};

export default IncidentDetailPage;
