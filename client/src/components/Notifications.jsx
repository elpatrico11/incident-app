import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  CircularProgress,
  Alert,
  Divider,
  Pagination,
} from '@mui/material';
import useAuthStore from '../models/stores/useAuthStore';

const Notifications = () => {
  const {
    user,
    notifications,
    notificationsLoading,
    fetchNotifications,
    markNotificationAsRead,
  } = useAuthStore();

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Customize the number of notifications per page

  useEffect(() => {
    if (user) {
      fetchNotifications().then((data) => {
        console.log('Notifications fetched:', data);
      });
    }
  }, [user, fetchNotifications]);

  const handleToggleRead = (id, isRead) => {
    if (!isRead) {
      markNotificationAsRead(id);
      console.log(`Marked notification ${id} as read.`);
    }
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  if (notificationsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentNotifications = notifications.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 3 }}>
      <Typography variant="h5" gutterBottom>
        Powiadomienia
      </Typography>
      {notifications.length === 0 ? (
        <Alert severity="info">Nie masz żadnych powiadomień.</Alert>
      ) : (
        <>
          <List>
            {currentNotifications.map((notification) => (
              <React.Fragment key={notification._id}>
                <ListItem alignItems="flex-start">
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={notification.isRead}
                      tabIndex={-1}
                      disableRipple
                      onChange={() => handleToggleRead(notification._id, notification.isRead)}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={notification.message}
                    secondary={new Date(notification.createdAt).toLocaleString('pl-PL')}
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
              </React.Fragment>
            ))}
          </List>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mt: 3,
            }}
          >
            <Pagination
              count={Math.ceil(notifications.length / itemsPerPage)}
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
