import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';

export const DeleteConfirmationDialog = ({
  open,
  onClose,
  onConfirm,
}) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>Usuń Zgłoszenie</DialogTitle>
    <DialogContent>
      <DialogContentText>
        Czy na pewno chcesz usunąć to zgłoszenie? Ta operacja jest nieodwracalna.
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Anuluj</Button>
      <Button onClick={onConfirm} color="error">
        Usuń
      </Button>
    </DialogActions>
  </Dialog>
);