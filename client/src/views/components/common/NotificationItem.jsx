import React from 'react';
import PropTypes from 'prop-types';
import {
  ListItem,
  ListItemText,
  Checkbox,
  Divider,
  Typography,
} from '@mui/material';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('pl-PL');
};

const NotificationItem = React.memo(({ id, message, createdAt, isRead, onToggleRead }) => {
  const handleToggle = (e) => {
    e.stopPropagation();
    onToggleRead(id, isRead);
  };

  return (
    <React.Fragment>
      <ListItem
        alignItems="flex-start"
        component="div"
        onClick={handleToggle}
        sx={{ cursor: 'pointer' }}
        secondaryAction={
         <Checkbox
            edge="end"
            checked={isRead}
            onChange={(e) => {
              e.stopPropagation();
              onToggleRead(id, isRead);
            }}
            onClick={(e) => e.stopPropagation()}
            inputProps={{ 'aria-label': `Mark notification ${id} as ${isRead ? 'unread' : 'read'}` }}
          />
        }
      >
        <ListItemText
          primary={
            <Typography
              variant="body1"
              sx={{
                fontWeight: isRead ? 'regular' : 'bold',
                color: isRead ? 'text.secondary' : 'text.primary',
                textDecoration: isRead ? 'line-through' : 'none',
              }}
            >
              {message}
            </Typography>
          }
          secondary={
            <Typography
              variant="body2"
              color={isRead ? 'text.secondary' : 'text.primary'}
            >
              {formatDate(createdAt)}
            </Typography>
          }
        />
      </ListItem>
      <Divider component="li" />
    </React.Fragment>
  );
});

NotificationItem.propTypes = {
  id: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  createdAt: PropTypes.string.isRequired,
  isRead: PropTypes.bool.isRequired,
  onToggleRead: PropTypes.func.isRequired,
};

export default NotificationItem;