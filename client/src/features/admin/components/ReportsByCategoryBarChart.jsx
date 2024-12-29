import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Define a palette of colors
const COLORS = [
  '#68d391', // Green
  '#63b3ed', // Blue
  '#f6ad55', // Orange
  '#ed64a6', // Pink
  '#fc8181', // Red
  '#9f7aea', // Purple
  '#38b2ac', // Teal
  '#f56565', // Light Red
  '#ed8936', // Dark Orange
  '#D69E2E', // Yellow
  '#A0AEC0', // Gray
  '#7F9CF5', // Indigo
];

const ReportsByCategoryBarChart = ({ data, categories }) => {
  if (!data || !categories || categories.length === 0) {
    return <div className="text-white">Brak danych do wyświetlenia</div>;
  }

  // Prepare data mapping
  const categoryCounts = {};
  data.forEach(item => {
    categories.forEach(category => {
      categoryCounts[category] = item[category] || 0;
    });
  });

  const chartData = {
    labels: categories,
    datasets: [{
      data: categories.map(category => categoryCounts[category]),
      backgroundColor: categories.map((_, index) => COLORS[index % COLORS.length]),
      borderColor: categories.map((_, index) => COLORS[index % COLORS.length]),
      borderWidth: 1,
    }],
  };

  const options = {
    plugins: {
      legend: { 
        display: false, // Hide legend since each bar has its own color
      },
      title: {
        display: true,
        text: 'Zgłoszenia według Kategorii',
        color: '#ffffff',
        font: { size: 16 },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Liczba: ${context.parsed.y}`;
          }
        },
        backgroundColor: '#2d3748',
        titleColor: '#a0aec0',
        bodyColor: '#a0aec0',
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: { 
          display: false,
          color: '#4a5568'
        },
        ticks: { color: '#ffffff' },
        title: {
          display: true,
          text: 'Kategorie',
          color: '#ffffff',
          font: { size: 14 },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#4a5568'
        },
        ticks: {
          color: '#ffffff',
          stepSize: 1,
          precision: 0,
        },
        title: {
          display: true,
          text: 'Liczba Zgłoszeń',
          color: '#ffffff',
          font: { size: 14 },
        },
      },
    },
    barPercentage: 0.6,
    categoryPercentage: 0.8,
  };

  return (
    <div style={{ height: '500px' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default ReportsByCategoryBarChart;
