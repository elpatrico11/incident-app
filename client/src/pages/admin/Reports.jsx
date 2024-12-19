
import React, { useEffect, useState } from 'react';
import { Typography, CircularProgress, Alert, Grid, Button } from '@mui/material';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import api from '../../utils/api';
import ReportsByCategoryBarChart from './ReportsByCategoryBarChart';
import StatusCountChart from './StatusCountChart';
import IncidentsPerDayChart from './IncidentsPerDayChart'; 
import { saveAs } from 'file-saver';

const Reports = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await api.get('/admin/reports');
        if (!response || !response.data) {
          throw new Error('No data received from server');
        }

        setReportData(response.data);
      } catch (err) {
        console.error(err);
        setError('Błąd podczas pobierania raportów.');
      }

      setLoading(false);
    };

    fetchReports();
  }, []);

  const handleDownload = async () => {
    try {
      const response = await api.get('/admin/reports/download', {
        responseType: 'blob', // Important for binary data
      });

      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, 'raporty.csv');
    } catch (err) {
      console.error(err);
      setError('Błąd podczas pobierania raportu CSV.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-4 mt-10">
        <Alert severity="error">{error}</Alert>
      </div>
    );
  }

  const {
    totalIncidents,
    averageResolutionTime,
    reportsByCategory,
    statusCount,
    averagePerDay,
    totalIncidentsPerDay,
  } = reportData || {};

  // Prepare data for the category chart
  const categoryData = [{
    period: 'Wszystkie zgłoszenia',
    ...reportsByCategory?.reduce((acc, curr) => {
      acc[curr.category] = curr.count;
      return acc;
    }, {})
  }];

  const categories = reportsByCategory?.map(item => item.category) || [];

  return (
    <div className="p-4 bg-gray-900 min-h-screen text-white">
      <Typography variant="h4" gutterBottom className="text-center mb-4 text-white">
        Raporty Administracyjne
      </Typography>

      <Grid container spacing={4}>
        {/* Total Incidents */}
        <Grid item xs={12} lg={4}>
          <div className="p-4 bg-gray-800 shadow rounded-lg h-full flex flex-col items-center">
            <Typography variant="h6" className="text-gray-300 mb-2">Całkowita Liczba Zgłoszeń</Typography>
            <Typography variant="h2" className="text-blue-400">
              {totalIncidents || 0}
            </Typography>
          </div>
        </Grid>

        {/* Average Resolution Time */}
        <Grid item xs={12} lg={4}>
          <div className="p-4 bg-gray-800 shadow rounded-lg h-full flex flex-col items-center">
            <Typography variant="h6" className="text-gray-300 mb-2">Średni Czas Rozwiązania</Typography>
            <div className="w-40 h-40 mb-4">
              <CircularProgressbar
                value={parseFloat(averageResolutionTime || 0)}
                text={`${averageResolutionTime || 0}h`}
                styles={buildStyles({
                  textColor: '#a0aec0',
                  pathColor: '#f6ad55',
                  trailColor: '#4a5568',
                })}
              />
            </div>
            <Typography variant="body1" className="text-gray-300 text-center">
              Średni czas potrzebny na rozwiązanie zgłoszenia.
            </Typography>
          </div>
        </Grid>

        {/* Average Incidents Per Day */}
        <Grid item xs={12} lg={4}>
          <div className="p-4 bg-gray-800 shadow rounded-lg h-full flex flex-col items-center">
            <Typography variant="h6" className="text-gray-300 mb-2">Średnia Zgłoszeń na Dzień</Typography>
            <Typography variant="h2" className="text-green-400">
              {averagePerDay || 0}
            </Typography>
          </div>
        </Grid>

        {/* Reports by Category */}
        <Grid item xs={12}>
          <div className="p-4 bg-gray-800 shadow rounded-lg h-full">
            <ReportsByCategoryBarChart data={categoryData} categories={categories} />
          </div>
        </Grid>

        {/* Incidents Per Day Chart */}
        <Grid item xs={12}>
          <div className="p-4 bg-gray-800 shadow rounded-lg h-full">
            <IncidentsPerDayChart data={totalIncidentsPerDay} />
          </div>
        </Grid>

        {/* Status Count Chart */}
        <Grid item xs={12}>
          <div className="p-4 bg-gray-800 shadow rounded-lg h-full">
            <StatusCountChart statusCount={statusCount || []} />
          </div>
        </Grid>

        {/* Download CSV Button */}
         <Grid item xs={12} className="flex justify-end">
        <Button variant="contained" color="primary" onClick={handleDownload}>
          Pobierz Raport CSV
        </Button>
      </Grid>
      </Grid>
    </div>
  );
};

export default Reports;
