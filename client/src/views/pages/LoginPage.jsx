import React from 'react';
import {
  Box,
  Button,
  Checkbox,
  CssBaseline,
  FormControl,
  FormControlLabel,
  FormLabel,
  Link,
  TextField,
  Typography,
  Stack,
  Alert,
  Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import MuiCard from '@mui/material/Card';
import { Link as RouterLink } from 'react-router-dom';

import ForgotPassword from '../components/common/ForgotPassword';
import AppTheme from '../../assets/shared-theme/AppTheme';
import useLogin from '../../controllers/hooks/useLogin';

// Styled Components
const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  [theme.breakpoints.up('sm')]: {
    maxWidth: '450px',
  },
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  ...theme.applyStyles('dark', {
    boxShadow:
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}));

const SignInContainer = styled(Stack)(({ theme }) => ({
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  minHeight: 0, 
  flex: '1 1 auto', 
  justifyContent: 'center', 
  alignItems: 'center', 
  '&::before': {
    content: '""',
    display: 'block',
    position: 'absolute',
    zIndex: -1,
    inset: 0,
    backgroundImage:
      'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
    backgroundRepeat: 'no-repeat',
    ...theme.applyStyles('dark', {
      backgroundImage:
        'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
    }),
  },
}));

export default function LoginPage(props) {
  const {
    email,
    setEmail,
    emailError,
    password,
    setPassword,
    passwordError,
    formError,
    rememberMe,
    setRememberMe,
    handleSubmit,
  } = useLogin();

  const [openForgotPassword, setOpenForgotPassword] = React.useState(false);

  const handleOpenForgotPassword = () => {
    setOpenForgotPassword(true);
  };

  const handleCloseForgotPassword = () => {
    setOpenForgotPassword(false);
  };

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <SignInContainer direction="column" justifyContent="center">

        {/* Login Card */}
        <Card variant="outlined">


          {/* Page Title */}
          <Typography
            component="h1"
            variant="h4"
            sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
          >
            Zaloguj się
          </Typography>

          {/* Form Error Alert */}
          {formError && <Alert severity="error">{formError}</Alert>}

          {/* Login Form */}
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              gap: 2,
            }}
          >
            {/* Email Field */}
            <FormControl>
              <FormLabel htmlFor="email">Email</FormLabel>
              <TextField
                error={Boolean(emailError)}
                helperText={emailError}
                id="email"
                type="email"
                name="email"
                placeholder="nazwa@email.com"
                autoComplete="email"
                required
                fullWidth
                variant="outlined"
                color={emailError ? 'error' : 'primary'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </FormControl>

            {/* Password Field */}
            <FormControl>
              <FormLabel htmlFor="password">Hasło</FormLabel>
              <TextField
                error={Boolean(passwordError)}
                helperText={passwordError}
                name="password"
                placeholder="••••••••"
                type="password"
                id="password"
                autoComplete="current-password"
                required
                fullWidth
                variant="outlined"
                color={passwordError ? 'error' : 'primary'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </FormControl>

            {/* Remember Me Checkbox */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  color="primary"
                />
              }
              label="Pamiętaj mnie"
            />

            {/* Forgot Password Dialog */}
            <ForgotPassword open={openForgotPassword} handleClose={handleCloseForgotPassword} />

            {/* Submit Button */}
            <Button type="submit" fullWidth variant="contained">
              Zaloguj się
            </Button>

            {/* Forgot Password Link */}
            <Link
              component="button"
              type="button"
              onClick={handleOpenForgotPassword}
              variant="body2"
              sx={{ alignSelf: 'center' }}
            >
              Przypomnij hasło
            </Link>
          </Box>

          {/* Divider */}
          <Divider></Divider>

 
          <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                textAlign: 'center',
                alignItems: 'center', 
                justifyContent: 'center', 
              }}
            >
              <Typography>Nie masz konta?</Typography>
              <Link
                component={RouterLink}
                to="/register"
                variant="body2"
                sx={{ display: 'block' }}
              >
                Zarejestruj się
              </Link>
              <Typography>lub</Typography>
              <Link
                component={RouterLink}
                to="/resend-verification"
                variant="body2"
                sx={{ display: 'block' }}
              >
                Wyślij ponownie link weryfikacyjny
              </Link>
            </Box>
        </Card>
      </SignInContainer>
    </AppTheme>
  );
}
