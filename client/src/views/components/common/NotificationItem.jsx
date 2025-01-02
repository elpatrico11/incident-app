
import React from 'react';
import PropTypes from 'prop-types';
import {
  ListItem,
  ListItemText,
  Checkbox,
  Divider,
} from '@mui/material';

/**
 * Formats a date string into a localized string.
 * @param {string} dateString - The date string to format.
 * @returns {string} - The formatted date string.
 */
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('pl-PL');
};

/**
 * Component representing a single notification item.
 * @param {Object} props - The component props.
 * @param {string} props.id - The unique identifier of the notification.
 * @param {string} props.message - The notification message.
 * @param {string} props.createdAt - The creation date of the notification.
 * @param {boolean} props.isRead - The read status of the notification.
 * @param {Function} props.onToggleRead - Callback to toggle read status.
 * @returns {JSX.Element} - The rendered component.
 */
const NotificationItem = React.memo(({ id, message, createdAt, isRead, onToggleRead }) => {
  return (
    <React.Fragment>
      <ListItem
        alignItems="flex-start"
        secondaryAction={
          <Checkbox
            edge="end"
            checked={isRead}
            onChange={() => onToggleRead(id, isRead)}
            inputProps={{ 'aria-label': `Mark notification ${id} as read` }}
          />
        }
      >
        <ListItemText
          primary={message}
          secondary={formatDate(createdAt)}
          primaryTypographyProps={{
            fontWeight: isRead ? 'regular' : 'bold',
          }}
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
