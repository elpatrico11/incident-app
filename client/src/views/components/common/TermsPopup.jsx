import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box
} from '@mui/material';

const TermsPopup = ({ open, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Regulamin korzystania z aplikacji</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ maxHeight: '60vh', overflowY: 'auto', pr: 2 }}>
          <Typography variant="body2" component="div" gutterBottom>
            <strong>Regulamin</strong>
          </Typography>
          <Typography variant="body2" component="div" paragraph>
            Korzystanie ze zbiorów i danych naszej aplikacji oznacza akceptację zasad niniejszego Regulaminu. Użytkownik korzystający z aplikacji jest zobowiązany do zapoznania się z treścią Regulaminu przed rozpoczęciem korzystania.
          </Typography>
          <Typography variant="body2" component="div" paragraph>
            <strong>§1</strong> – Korzystanie z danych aplikacji oznacza akceptację postanowień niniejszego Regulaminu.
          </Typography>
          <Typography variant="body2" component="div" paragraph>
            <strong>§2</strong> – Administrator nie ponosi odpowiedzialności za niewłaściwe wykorzystanie danych przez użytkowników.
          </Typography>
          <Typography variant="body2" component="div" paragraph>
            <strong>§3</strong> – Aplikacja ma charakter poglądowy. Wszelkie dane prezentowane w serwisie powinny być traktowane jako informacyjne i nie mogą stanowić podstawy do podejmowania działań prawnych.
          </Typography>
           <Typography variant="body2" component="div" paragraph>
            <strong>§4</strong> – Użytkownik niezalogowany może zgłosić maksymalnie 1 zgłoszenie w ciągu dnia.
          </Typography>
           <Typography variant="body2" component="div" paragraph>
            <strong>§5</strong> – Administrator nie ponosi odpowiedzialności za brak dostępu do „IncidentApp” z przyczyn od niego niezależnych.
          </Typography>
           <Typography variant="body2" component="div" paragraph>
            <strong>§6</strong> – Niniejszy Regulamin może być w każdym czasie i w dowolnym zakresie zmieniany. Zmiany obowiązują od momentu opublikowania ich na stronie internetowej.
          </Typography>
          

        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" color="primary">
          Zamknij
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TermsPopup;
