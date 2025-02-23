import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Typography,
  List,
  CircularProgress,
  Alert,
  Pagination,
} from '@mui/material';
import useAuthStore from '../../../models/stores/useAuthStore';
import NotificationItem from './NotificationItem';

const Notifications = () => {
  const {
    user,
    notifications,
    notificationsLoading,
    fetchNotifications,
    markNotificationAsRead,
    markNotificationAsUnread
  } = useAuthStore();

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; 

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user, fetchNotifications]);


  const handleToggleRead = async (id, currentIsRead) => {
    if (currentIsRead) {
      await markNotificationAsUnread(id);
    } else {
      await markNotificationAsRead(id);
    }
  };

// Handles pagination page change.

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  // Memoize current notifications to optimize performance
  const currentNotifications = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return notifications.slice(start, start + itemsPerPage);
  }, [notifications, currentPage, itemsPerPage]);

  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.ceil(notifications.length / itemsPerPage);
  }, [notifications.length, itemsPerPage]);

  if (notificationsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: 3,
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 3,
        maxWidth: 600,
        margin: 'auto',
      }}
    >
      <Typography variant="h5" gutterBottom>
        Powiadomienia
      </Typography>
      {notifications.length === 0 ? (
        <Alert severity="info">Nie masz żadnych powiadomień.</Alert>
      ) : (
        <>
          <List>
            {currentNotifications.map((notification) => (
              <NotificationItem
                key={notification._id}
                id={notification._id}
                message={notification.message}
                createdAt={notification.createdAt}
                isRead={notification.isRead}
                onToggleRead={handleToggleRead}
              />
            ))}
          </List>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        </>
      )}
    </Box>
  );
};

export default Notifications;
