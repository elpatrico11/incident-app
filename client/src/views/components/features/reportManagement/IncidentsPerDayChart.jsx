import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const IncidentsPerDayChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="text-white">Brak danych do wyświetlenia</div>;
  }

  const chartData = {
    labels: data.map(item => item.date),
    datasets: [
      {
        label: 'Liczba Zgłoszeń na Dzień',
        data: data.map(item => item.count),
        borderColor: '#63b3ed', // Blue
        backgroundColor: '#63b3ed',
        fill: false,
        tension: 0.1,
      },
    ],
  };

  const options = {
    plugins: {
      legend: { 
        display: true, 
        position: 'top',
        labels: {
          color: '#ffffff'
        }
      },
      title: {
        display: true,
        text: 'Zgłoszenia na Dzień',
        color: '#ffffff',
        font: { size: 16 },
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
          text: 'Data',
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
  };

  return (
    <div style={{ height: '400px' }}>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default IncidentsPerDayChart;
