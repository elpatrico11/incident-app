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
  FormControlLabel,
  Checkbox,
  Link,
  FormHelperText,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import MuiCard from '@mui/material/Card';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import CssBaseline from '@mui/material/CssBaseline';

import AppTheme from '../../assets/shared-theme/AppTheme';
import useRegister from '../../controllers/hooks/useRegister';

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
    termsAccepted,
    termsError,
    formError,
    formSuccess,
    loading,
    handleCaptchaChange,
    handleTermsChange,
    handleSubmit,
  } = useRegister();

  const navigate = useNavigate();

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <SignUpContainer direction="column" justifyContent="center">
        <Card variant="outlined">
          <Typography
            component="h1"
            variant="h4"
            sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
          >
            Zarejestruj się
          </Typography>

          {formError && <Alert severity="error">{formError}</Alert>}

          {formSuccess && (
            <Alert severity="success">
              {formSuccess}
              <Box mt={2}>
                <Button variant="contained" onClick={() => navigate('/login')}>
                  Przejdź do logowania
                </Button>
              </Box>
            </Alert>
          )}

          {!formSuccess && (
            <>
              <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
              >
                <FormControl>
                  <FormLabel htmlFor="firstName">Imię</FormLabel>
                  <TextField
                    autoComplete="given-name"
                    name="firstName"
                    required
                    fullWidth
                    id="firstName"
                    placeholder="Jan"
                    error={Boolean(firstNameError)}
                    helperText={firstNameError}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel htmlFor="lastName">Nazwisko</FormLabel>
                  <TextField
                    autoComplete="family-name"
                    name="lastName"
                    required
                    fullWidth
                    id="lastName"
                    placeholder="Kowalski"
                    error={Boolean(lastNameError)}
                    helperText={lastNameError}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel htmlFor="email">Email</FormLabel>
                  <TextField
                    required
                    fullWidth
                    id="email"
                    placeholder="nazwa@email.com"
                    name="email"
                    autoComplete="email"
                    error={Boolean(emailError)}
                    helperText={emailError}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel htmlFor="password">Hasło</FormLabel>
                  <TextField
                    required
                    fullWidth
                    name="password"
                    placeholder="••••••••"
                    type="password"
                    id="password"
                    autoComplete="new-password"
                    error={Boolean(passwordError)}
                    helperText={passwordError}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </FormControl>

                <ReCAPTCHA
                  sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
                  onChange={handleCaptchaChange}
                />

                <FormControl error={Boolean(termsError)}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={termsAccepted}
                        onChange={handleTermsChange}
                        color="primary"
                        required
                      />
                    }
                    label={
                      <Typography variant="body2" color="text.secondary">
                        Zapoznałem się z{' '}
                        <Link
                          href="/regulamin"
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            textDecoration: 'none',
                            '&:hover': {
                              textDecoration: 'underline',
                            },
                          }}
                        >
                          regulaminem
                        </Link>
                        {' '}i{' '}
                        <Link
                          href="/polityka-prywatnosci"
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            textDecoration: 'none',
                            '&:hover': {
                              textDecoration: 'underline',
                            },
                          }}
                        >
                          polityką prywatności
                        </Link>
                      </Typography>
                    }
                    sx={{
                      alignItems: 'flex-start',
                      '.MuiCheckbox-root': {
                        pt: 0,
                      },
                    }}
                  />
                  {termsError && <FormHelperText>{termsError}</FormHelperText>}
                </FormControl>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                >
                  {loading ? 'Rejestrowanie...' : 'Rejestracja'}
                </Button>
              </Box>

              <Divider>
                <Typography sx={{ color: 'text.secondary' }}>or</Typography>
              </Divider>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                <Typography variant="body2" align="center">
                  Masz już konto?{' '}
                  <Button
                    variant="text"
                    onClick={() => navigate('/login')}
                    sx={{ textTransform: 'none', padding: 0 }}
                  >
                    Zaloguj się
                  </Button>
                </Typography>
              </Box>
            </>
          )}
        </Card>
      </SignUpContainer>
    </AppTheme>
  );
}
