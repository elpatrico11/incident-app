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
  const [timeHorizon, setTimeHorizon] = useState('monthly'); // 'daily' or 'monthly'

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get(`/admin/reports?timeHorizon=${timeHorizon}`);
      if (!response || !response.data) {
        throw new Error('No data received from server');
      }

      const data = response.data;
      setReportData(data);
    } catch (err) {
      console.error(err);
      setError('Błąd podczas pobierania raportów.');
    }

    setLoading(false);
  }, [timeHorizon]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

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

  const { incidentTrends, averageResolutionTime, reportsByCategory, statusCount } = reportData;

  return (
    <div className="p-4 bg-gray-900 min-h-screen text-white">
      <Typography variant="h4" gutterBottom className="text-center mb-4 text-white">
        Raporty Administracyjne
      </Typography>

      {/* Time Horizon Buttons */}
      <div className="flex justify-end mb-6">
        <ButtonGroup variant="contained" color="primary" size="small">
          <Button
            onClick={() => setTimeHorizon('daily')}
            variant={timeHorizon === 'daily' ? 'contained' : 'outlined'}
          >
            Dziennie
          </Button>
          <Button
            onClick={() => setTimeHorizon('monthly')}
            variant={timeHorizon === 'monthly' ? 'contained' : 'outlined'}
          >
            Miesięcznie
          </Button>
        </ButtonGroup>
      </div>

      <Grid container spacing={4}>
        {/* Incident Trends Line Chart */}
        <Grid item xs={12} lg={6}>
          <div className="p-4 bg-gray-800 shadow rounded-lg h-full">
            <Typography variant="h6" className="text-gray-300 mb-2">Trend Zgłoszeń w Czasie</Typography>
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

        {/* Average Resolution Time */}
        <Grid item xs={12} lg={6}>
          <div className="p-4 bg-gray-800 shadow rounded-lg h-full flex flex-col items-center">
            <Typography variant="h6" className="text-gray-300 mb-2">Średni Czas Rozwiązania</Typography>
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
            <Typography variant="body1" className="text-gray-300 text-center">
              Średni czas potrzebny na rozwiązanie zgłoszenia.
            </Typography>
          </div>
        </Grid>

        {/* Reports by Category */}
        <Grid item xs={12}>
          <div className="p-4 bg-gray-800 shadow rounded-lg h-full">
            <ReportsByCategoryBarChart 
              data={reportsByCategory.data} 
              categories={reportsByCategory.categories} 
            />
          </div>
        </Grid>

        {/* Status Count Chart */}
        <Grid item xs={12}>
          <div className="p-4 bg-gray-800 shadow rounded-lg h-full">
            <StatusCountChart statusCount={statusCount} />
          </div>
        </Grid>
      </Grid>
    </div>
  );
};

export default Reports;
