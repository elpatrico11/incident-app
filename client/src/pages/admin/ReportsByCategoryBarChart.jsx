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

// Register necessary components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Define colors for each category
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
];

const ReportsByCategoryBarChart = ({ data, categories }) => {
  if (!data || !categories) {
    return <div>No data available</div>;
  }

  const chartData = {
    labels: data.map((item) => item.period),
    datasets: categories.map((category, index) => ({
      label: category,
      data: data.map((item) => item[category] || 0),
      backgroundColor: COLORS[index % COLORS.length],
      borderColor: COLORS[index % COLORS.length],
      borderWidth: 1,
    })),
  };

  const options = {
    plugins: {
      legend: { display: true, position: 'top' },
      title: {
        display: true,
        text: 'Raporty według kategorii (Wykres Słupkowy)',
        color: '#ffffff',
        font: { size: 16 },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#ffffff' },
        title: {
          display: true,
          text: 'Okresy czasu', // X-axis title
          color: '#ffffff',
          font: { size: 14 },
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: '#ffffff',
          stepSize: 1, // Force full number increments
          precision: 0, // Remove decimals
        },
        title: {
          display: true,
          text: 'Liczba raportów', // Y-axis title
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
