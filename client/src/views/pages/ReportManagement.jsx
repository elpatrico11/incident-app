import React from 'react';
import { Typography, Grid, Alert } from '@mui/material';
import useReportManagement from '../../controllers/hooks/useReportManagement';
import ReportsByCategoryBarChart from '../components/features/reportManagement/ReportsByCategoryBarChart';
import StatusCountChart from '../components/features/reportManagement/StatusCountChart';
import IncidentsPerDayChart from '../components/features/reportManagement/IncidentsPerDayChart';
import ReportCard from '../components/features/reportManagement/ReportCard';
import DownloadButton from '../components/features/reportManagement/DownloadButton';

const ReportManagement = () => {
  const {
    // Data
    reportData,
    
    // Loading
    loading,
    
    // Feedback
    error,
    
    // Handlers
    handleDownload,

    

  } = useReportManagement();
  
  // Destructure report data
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
      <Typography variant="h4" gutterBottom className="text-center mb-4">
        Raporty Administracyjne
      </Typography>

      {/* Feedback Messages */}
      {error && <div className="mx-4 mb-4"><Alert severity="error">{error}</Alert></div>}
      
      {/* Loading Indicator */}
      {loading && (
        <div className="flex justify-center items-center h-screen">
          <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16"></div>
        </div>
      )}

      {/* Report Metrics */}
      {!loading && reportData && (
        <Grid container spacing={4} className="mb-6">
          {/* Total Incidents */}
          <Grid item xs={12} lg={4}>
            <ReportCard
              title="Całkowita Liczba Zgłoszeń"
              value={totalIncidents || 0}
              description="Całkowita liczba wszystkich zgłoszeń."
              circular={false}
              color="#63b3ed" // Blue
            />
          </Grid>

          {/* Average Resolution Time */}
          <Grid item xs={12} lg={4}>
            <ReportCard
              title="Średni Czas Rozwiązania"
              value={`${averageResolutionTime?.toFixed(2) || '0.00'}h`}
              description="Średni czas potrzebny na rozwiązanie zgłoszenia."
              circular={true}
              percentage={averageResolutionTime || 0}
              color="#f6ad55" // Orange
            />
          </Grid>

          {/* Average Incidents Per Day */}
          <Grid item xs={12} lg={4}>
            <ReportCard
              title="Średnia Zgłoszeń na Dzień"
              value={averagePerDay || 0}
              description="Średnia liczba zgłoszeń dziennie."
              circular={false}
              color="#68d391" // Green
            />
          </Grid>
        </Grid>
      )}

      {/* Charts */}
      {!loading && reportData && (
        <Grid container spacing={4}>
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
            <DownloadButton onClick={handleDownload} />
          </Grid>
        </Grid>
      )}
    </div>
  );
};

export default ReportManagement;
