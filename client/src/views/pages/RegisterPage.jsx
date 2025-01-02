// src/views/components/SignUp.jsx

import React from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  TextField,
  Typography,
  Stack,
  Alert,
  Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import MuiCard from '@mui/material/Card';
import {  useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha'; // Import ReCAPTCHA
import CssBaseline from '@mui/material/CssBaseline'; // Correctly import CssBaseline

import { GoogleIcon, SitemarkIcon } from '../../assets/CustomIcons';
import AppTheme from '../../assets/shared-theme/AppTheme';
import ColorModeSelect from '../../assets/shared-theme/ColorModeSelect';
import useRegister from '../../controllers/hooks/useRegister'; // Correctly import the hook

// Styled Components
const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  [theme.breakpoints.up('sm')]: {
    width: '450px',
  },
  ...theme.applyStyles('dark', {
    boxShadow:
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}));

const SignUpContainer = styled(Stack)(({ theme }) => ({
  height: 'calc((1 - var(--template-frame-height, 0)) * 100dvh)',
  minHeight: '100%',
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
  position: 'relative',
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

export default function SignUp(props) {
  const {
    firstName,
    setFirstName,
    firstNameError,
    lastName,
    setLastName,
    lastNameError,
    email,
    setEmail,
    emailError,
    password,
    setPassword,
    passwordError,
    formError,
    formSuccess,
    loading,
    handleCaptchaChange,
    handleSubmit,
  } = useRegister(); // Use the correctly named hook

  const navigate = useNavigate();

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme /> {/* Correctly use CssBaseline */}
      <ColorModeSelect sx={{ position: 'fixed', top: '1rem', right: '1rem' }} />
      <SignUpContainer direction="column" justifyContent="space-between">
        <Card variant="outlined">
          {/* App Logo */}
          <SitemarkIcon />

          {/* Page Title */}
          <Typography
            component="h1"
            variant="h4"
            sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
          >
            Sign up
          </Typography>

          {/* Form Error Alert */}
          {formError && <Alert severity="error">{formError}</Alert>}

          {/* Form Success Alert */}
          {formSuccess && (
            <Alert severity="success">
              {formSuccess}
              <Box mt={2}>
                <Button
                  variant="contained"
                  onClick={() => navigate('/login')}
                >
                  Przejdź do logowania
                </Button>
              </Box>
            </Alert>
          )}

          {/* Registration Form */}
          {!formSuccess && ( // Only show form if registration is not successful
            <>
              <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
              >
                {/* First Name Field */}
                <FormControl>
                  <FormLabel htmlFor="firstName">First Name</FormLabel>
                  <TextField
                    autoComplete="given-name"
                    name="firstName"
                    required
                    fullWidth
                    id="firstName"
                    placeholder="Jon"
                    error={Boolean(firstNameError)}
                    helperText={firstNameError}
                    color={firstNameError ? 'error' : 'primary'}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </FormControl>

                {/* Last Name Field */}
                <FormControl>
                  <FormLabel htmlFor="lastName">Last Name</FormLabel>
                  <TextField
                    autoComplete="family-name"
                    name="lastName"
                    required
                    fullWidth
                    id="lastName"
                    placeholder="Snow"
                    error={Boolean(lastNameError)}
                    helperText={lastNameError}
                    color={lastNameError ? 'error' : 'primary'}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </FormControl>

                {/* Email Field */}
                <FormControl>
                  <FormLabel htmlFor="email">Email</FormLabel>
                  <TextField
                    required
                    fullWidth
                    id="email"
                    placeholder="your@email.com"
                    name="email"
                    autoComplete="email"
                    variant="outlined"
                    error={Boolean(emailError)}
                    helperText={emailError}
                    color={emailError ? 'error' : 'primary'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </FormControl>

                {/* Password Field */}
                <FormControl>
                  <FormLabel htmlFor="password">Password</FormLabel>
                  <TextField
                    required
                    fullWidth
                    name="password"
                    placeholder="••••••"
                    type="password"
                    id="password"
                    autoComplete="new-password"
                    variant="outlined"
                    error={Boolean(passwordError)}
                    helperText={passwordError}
                    color={passwordError ? 'error' : 'primary'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </FormControl>

                {/* reCAPTCHA */}
                <ReCAPTCHA
                  sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY} // Ensure this environment variable is set
                  onChange={handleCaptchaChange}
                />

                {/* Submit Button */}
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                >
                  {loading ? 'Signing up...' : 'Sign up'}
                </Button>
              </Box>

              {/* Divider */}
              <Divider>
                <Typography sx={{ color: 'text.secondary' }}>or</Typography>
              </Divider>

              {/* Alternative Sign-Up Methods */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => alert('Sign up with Google')}
                  startIcon={<GoogleIcon />}
                >
                  Sign up with Google
                </Button>
                {/* Removed "Already have an account? Sign in" */}
              </Box>
            </>
          )}
        </Card>
      </SignUpContainer>
    </AppTheme>
  );
}
