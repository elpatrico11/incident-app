import React from 'react';
import { Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const ReportCard = ({ title, value, description, circular = false, percentage = 0, color = '#4a5568' }) => {
  return (
    <div className="p-4 bg-gray-800 shadow rounded-lg h-full flex flex-col items-center">
      <Typography variant="h6" className="text-gray-300 mb-2 text-center">
        {title}
      </Typography>
      {circular ? (
        <div className="w-40 h-40 mb-4">
          <CircularProgressbar
            value={percentage > 100 ? 100 : percentage}
            text={`${value}`}
            styles={buildStyles({
              textColor: '#a0aec0',
              pathColor: color,
              trailColor: '#4a5568',
            })}
          />
        </div>
      ) : (
        <Typography variant="h2" className={`mb-4 ${color === '#38b2ac' ? 'text-green-400' : color === '#63b3ed' ? 'text-blue-400' : 'text-red-400'}`}>
          {value || 0}
        </Typography>
      )}
      {!circular && (
        <Typography variant="body1" className="text-gray-300 text-center">
          {description}
        </Typography>
      )}
    </div>
  );
};

ReportCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]).isRequired,
  description: PropTypes.string,
  circular: PropTypes.bool,
  percentage: PropTypes.number,
  color: PropTypes.string,
};

ReportCard.defaultProps = {
  description: '',
  circular: false,
  percentage: 0,
  color: '#4a5568',
};

export default ReportCard;
