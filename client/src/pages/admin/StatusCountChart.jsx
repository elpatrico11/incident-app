// src/components/Reports/StatusCountChart.js

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Typography } from '@mui/material';

// Define a color palette (reuse COLORS from Reports.js or define new)
const COLORS = ['#68d391', '#63b3ed', '#f6ad55', '#ed64a6', '#fc8181'];

const StatusCountChart = ({ statusCount }) => {
  return (
    <div className="p-4 bg-gray-800 shadow rounded-lg h-full flex flex-col">
      <Typography variant="h6" className="mb-4 text-gray-300 text-center">
        Liczba Zgłoszeń według Statusu
      </Typography>
      {statusCount && statusCount.length > 0 ? (
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={statusCount}
              dataKey="count"
              nameKey="status"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {statusCount.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: '#2d3748', border: 'none', color: '#a0aec0' }}
              labelStyle={{ color: '#a0aec0' }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <Typography className="text-gray-300 text-center">Brak danych do wyświetlenia.</Typography>
      )}
    </div>
  );
};

export default StatusCountChart;
