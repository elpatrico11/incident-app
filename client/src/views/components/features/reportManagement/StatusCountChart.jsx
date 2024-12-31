import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { CHART_COLORS } from '../../../../constants/reportConstants';

const StatusCountChart = ({ statusCount }) => {
  return (
    <div className="p-4 bg-gray-800 shadow rounded-lg h-full flex flex-col">
      <Typography variant="h6" className="mb-4 text-gray-300 text-center">
        Liczba Zgłoszeń według Statusu
      </Typography>
      {statusCount && statusCount.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={statusCount}
              dataKey="count"
              nameKey="status"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {statusCount.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: '#2d3748', border: 'none', color: '#a0aec0' }}
              labelStyle={{ color: '#a0aec0' }}
              formatter={(value, name) => [`Liczba: ${value}`, name]}
            />
            <Legend
              wrapperStyle={{ color: '#a0aec0' }}
            />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <Typography className="text-gray-300 text-center">Brak danych do wyświetlenia.</Typography>
      )}
    </div>
  );
};

StatusCountChart.propTypes = {
  statusCount: PropTypes.array.isRequired,
};

export default StatusCountChart;
