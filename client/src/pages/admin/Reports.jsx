// src/components/Reports/Reports.js

import React, { useEffect, useState, useCallback } from 'react';
import { Typography, CircularProgress, Alert, Grid, ButtonGroup, Button } from '@mui/material';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import api from '../../utils/api';

// Import additional chart components
import StatusCountChart from './StatusCountChart';
import ReportsByCategoryBarChart from './ReportsByCategoryBarChart';

// Import Recharts components
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const Reports = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeHorizon, setTimeHorizon] = useState('monthly'); // 'daily', 'weekly', or 'monthly'

  // Memoize fetchReports to avoid redefining it on every render
  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get(`/admin/reports?timeHorizon=${timeHorizon}`);

      console.log('API response:', response);

      if (!response || !response.data) {
        throw new Error('No data received from server');
      }

      const data = response.data;

      const requiredFields = [
        'incidentTrends',
        'averageResolutionTime',
        'reportsByCategory',
        'statusCount',
        // 'topCategories', // If you have these charts, include them
        // 'priorityCount',
      ];

      requiredFields.forEach(field => {
        if (data[field] == null && data[field] !== 0) {
          throw new Error(`Missing ${field} in response`);
        }
      });

      setReportData(data);
    } catch (err) {
      console.error(err);
      if (err.message.startsWith('Missing')) {
        setError(err.message);
      } else {
        setError('Błąd podczas pobierania raportów.');
      }
    }

    setLoading(false);
  }, [timeHorizon]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Display loading spinner while fetching data
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <CircularProgress />
      </div>
    );
  }

  // Display error message if fetching fails
  if (error) {
    return (
      <div className="mx-4 mt-10">
        <Alert severity="error">{error}</Alert>
      </div>
    );
  }

  // Display message if no data is available
  if (!reportData) {
    return (
      <div className="mx-4 mt-10">
        <Typography variant="body1" className="text-white">Brak danych do wyświetlenia.</Typography>
      </div>
    );
  }

  const { incidentTrends, averageResolutionTime, reportsByCategory, statusCount } = reportData;
  const reportsByCategoryData = reportsByCategory.data;
  const reportsByCategoryCategories = reportsByCategory.categories;

  // Enhanced debugging logs to verify data structure
  console.log('Incident Trends:', JSON.stringify(incidentTrends, null, 2));
  console.log('Reports by Category:', JSON.stringify(reportsByCategory, null, 2));
  console.log('Status Count:', JSON.stringify(statusCount, null, 2));

  return (
    <div className="p-4 bg-gray-900 min-h-screen text-white">
      <Typography variant="h4" gutterBottom className="text-center mb-8 text-white">
        Raporty Administracyjne
      </Typography>
      <Grid container spacing={6}>
        {/* Incident Trends Line Chart */}
        <Grid item xs={12} lg={6}>
          <div className="p-4 bg-gray-800 shadow rounded-lg h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <Typography variant="h6" className="text-gray-300">Trend Zgłoszeń w Czasie</Typography>
              <ButtonGroup variant="contained" color="primary" size="small">
                <Button
                  onClick={() => setTimeHorizon('daily')}
                  variant={timeHorizon === 'daily' ? 'contained' : 'outlined'}
                >
                  Dziennie
                </Button>
                <Button
                  onClick={() => setTimeHorizon('weekly')}
                  variant={timeHorizon === 'weekly' ? 'contained' : 'outlined'}
                >
                  Tygodniowo
                </Button>
                <Button
                  onClick={() => setTimeHorizon('monthly')}
                  variant={timeHorizon === 'monthly' ? 'contained' : 'outlined'}
                >
                  Miesięcznie
                </Button>
              </ButtonGroup>
            </div>
            {incidentTrends && incidentTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={incidentTrends}>
                  <XAxis 
                    dataKey="period" 
                    stroke="#a0aec0" 
                    angle={-45} 
                    textAnchor="end" 
                    height={60}
                    interval={0}
                  />
                  <YAxis stroke="#a0aec0" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#2d3748', border: 'none', color: '#a0aec0' }}
                    labelStyle={{ color: '#a0aec0' }}
                    formatter={(value) => [`${value}`, 'Zgłoszeń']}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#63b3ed" name="Zgłoszenia" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Typography className="text-gray-300">Brak danych do wyświetlenia.</Typography>
            )}
          </div>
        </Grid>

        {/* Average Resolution Time Circular Progress */}
        <Grid item xs={12} lg={6}>
          <div className="p-4 bg-gray-800 shadow rounded-lg flex flex-col items-center justify-center h-full">
            <Typography variant="h6" className="mb-4 text-gray-300">Średni Czas Rozwiązania</Typography>
            <div className="w-40 h-40 mb-4">
              <CircularProgressbar
                value={parseFloat(averageResolutionTime)}
                text={`${averageResolutionTime}h`}
                styles={buildStyles({
                  textColor: '#a0aec0',
                  pathColor: '#f6ad55',
                  trailColor: '#4a5568',
                })}
              />
            </div>
            <Typography variant="body1" className="text-center">
              Średni czas potrzebny na rozwiązanie zgłoszenia.
            </Typography>
          </div>
        </Grid>

        {/* Raporty według kategorii (Stacked Bar Chart) */}
        <Grid item xs={12}>
          <ReportsByCategoryBarChart data={reportsByCategoryData} categories={reportsByCategoryCategories} />
        </Grid>

        {/* Liczba Statusów Pie Chart */}
        <Grid item xs={12} lg={6}>
          <StatusCountChart statusCount={statusCount} />
        </Grid>

        {/* Optionally, include TopCategoriesChart and PriorityCountChart */}
        {/* <Grid item xs={12} lg={6}>
          <TopCategoriesChart topCategories={topCategories} />
        </Grid>
        <Grid item xs={12} lg={6}>
          <PriorityCountChart priorityCount={priorityCount} />
        </Grid> */}
      </Grid>
    </div>
  );
};

export default Reports;
