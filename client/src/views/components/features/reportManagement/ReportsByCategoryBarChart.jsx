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
import PropTypes from 'prop-types';
import { CHART_COLORS, DEFAULT_CHART_OPTIONS } from '../../../../constants/reportConstants';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

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
      label: 'Liczba Zgłoszeń',
      data: categories.map(category => categoryCounts[category]),
      backgroundColor: categories.map((_, index) => CHART_COLORS[index % CHART_COLORS.length]),
      borderColor: categories.map((_, index) => CHART_COLORS[index % CHART_COLORS.length]),
      borderWidth: 1,
    }],
  };

  const options = {
    ...DEFAULT_CHART_OPTIONS,
    plugins: {
      ...DEFAULT_CHART_OPTIONS.plugins,
      legend:{
        display: false,
      },
      title: {
        ...DEFAULT_CHART_OPTIONS.plugins.title,
        text: 'Zgłoszenia według Kategorii',
      },
      tooltip: {
        ...DEFAULT_CHART_OPTIONS.plugins.tooltip,
        callbacks: {
          label: function(context) {
            return `Liczba: ${context.parsed.y}`;
          }
        },
      },
    },
    scales: {
      ...DEFAULT_CHART_OPTIONS.scales,
      x: {
        ...DEFAULT_CHART_OPTIONS.scales.x,
        title: {
          ...DEFAULT_CHART_OPTIONS.scales.x.title,
          text: 'Kategorie',
        },
      },
      y: {
        ...DEFAULT_CHART_OPTIONS.scales.y,
        title: {
          ...DEFAULT_CHART_OPTIONS.scales.y.title,
          text: 'Liczba Zgłoszeń',
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

ReportsByCategoryBarChart.propTypes = {
  data: PropTypes.array.isRequired,
  categories: PropTypes.array.isRequired,
};

export default ReportsByCategoryBarChart;
