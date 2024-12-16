// src/pages/admin/Reports.jsx
import React, { useEffect, useState } from 'react';
import { Typography, CircularProgress, Alert, Grid, Paper } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../../utils/api';
import useAuthStore from '../../store/useAuthStore';

const Reports = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const currentUser = useAuthStore(state => state.user);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await api.get('/admin/reports'); // Zakładamy, że taka trasa istnieje
      setReportData(response.data);
    } catch (err) {
      console.error(err);
      setError('Błąd podczas pobierania raportów.');
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center mt-10">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!reportData) {
    return <Typography variant="body1">Brak danych do wyświetlenia.</Typography>;
  }

  return (
    <div>
      <Typography variant="h5" gutterBottom className="text-white">
        Raporty
      </Typography>
      <Grid container spacing={4}>
        {/* Przykładowy wykres - Liczba zgłoszeń w zależności od statusu */}
        <Grid item xs={12} md={6}>
          <Paper className="p-4 bg-gray-700">
            <Typography variant="h6" gutterBottom className="text-white">
              Liczba Zgłoszeń według Statusu
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportData.statusCount}>
                <XAxis dataKey="status" stroke="#ffffff" />
                <YAxis stroke="#ffffff" />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#4ade80" name="Liczba Zgłoszeń" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Raport: Liczba zgłoszeń według kategorii */}
        <Grid item xs={12} md={6}>
          <Paper className="p-4 bg-gray-700">
            <Typography variant="h6" gutterBottom className="text-white">
              Liczba Zgłoszeń według Kategorii
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportData.categoryCount}>
                <XAxis dataKey="category" stroke="#ffffff" />
                <YAxis stroke="#ffffff" />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#f472b6" name="Liczba Zgłoszeń" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default Reports;
