// client/src/controllers/hooks/useRegister.js
import { useState } from "react";
import { registerUser } from "../../api/services/authService";
import {
  EMAIL_REQUIRED,
  INVALID_EMAIL,
  PASSWORD_REQUIRED,
  PASSWORD_MIN_LENGTH,
  FIRST_NAME_REQUIRED,
  LAST_NAME_REQUIRED,
  CAPTCHA_REQUIRED,
  TERMS_REQUIRED,
  NO_RESPONSE_ERROR,
  UNEXPECTED_ERROR,
} from "../../constants/validationConstants";
import { validateEmail, validatePassword } from "../../utils/validationUtils";

const useRegister = () => {
  // Form Fields
  const [firstName, setFirstName] = useState("");
  const [firstNameError, setFirstNameError] = useState("");
  const [lastName, setLastName] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState("");

  // reCAPTCHA
  const [captchaValue, setCaptchaValue] = useState(null);

  // Form Feedback
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  // Loading State
  const [loading, setLoading] = useState(false);

  const validateInputs = () => {
    let isValid = true;

    // Validate First Name
    if (!firstName.trim()) {
      setFirstNameError(FIRST_NAME_REQUIRED);
      isValid = false;
    } else {
      setFirstNameError("");
    }

    // Validate Last Name
    if (!lastName.trim()) {
      setLastNameError(LAST_NAME_REQUIRED);
      isValid = false;
    } else {
      setLastNameError("");
    }

    // Validate Email
    if (!email) {
      setEmailError(EMAIL_REQUIRED);
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError(INVALID_EMAIL);
      isValid = false;
    } else {
      setEmailError("");
    }

    // Validate Password – zmieniona walidacja:
    if (!password) {
      setPasswordError(PASSWORD_REQUIRED);
      isValid = false;
    } else if (!validatePassword(password)) {
      setPasswordError(PASSWORD_MIN_LENGTH);
      isValid = false;
    } else {
      setPasswordError("");
    }

    // Validate Terms
    if (!termsAccepted) {
      setTermsError(TERMS_REQUIRED);
      isValid = false;
    } else {
      setTermsError("");
    }

    // Validate reCAPTCHA
    if (!captchaValue) {
      setFormError(CAPTCHA_REQUIRED);
      isValid = false;
    } else {
      setFormError("");
    }

    return isValid;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!validateInputs()) {
      return;
    }

    setLoading(true);

    try {
      await registerUser(firstName, lastName, email, password, captchaValue);
      setFormSuccess(
        "Rejestracja zakończona pomyślnie, wejdź na swój adres email żeby potwierdzić konto."
      );
      // Reset form fields
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setCaptchaValue(null);
      setTermsAccepted(false);
    } catch (error) {
      if (error.response && error.response.data && error.response.data.errors) {
        const backendErrors = error.response.data.errors;
        backendErrors.forEach((err) => {
          if (err.param === "email") setEmailError(err.msg);
          if (err.param === "password") setPasswordError(err.msg);
          if (err.param === "firstName") setFirstNameError(err.msg);
          if (err.param === "lastName") setLastNameError(err.msg);
          if (err.param === "captcha") setFormError(err.msg);
          if (err.param === "terms") setTermsError(err.msg);
        });
      } else if (error.response?.data?.msg) {
        setFormError(error.response.data.msg);
      } else if (error.request && !error.response) {
        setFormError(NO_RESPONSE_ERROR);
      } else {
        setFormError(UNEXPECTED_ERROR);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCaptchaChange = (value) => {
    setCaptchaValue(value);
    if (value) {
      setFormError("");
    }
  };

  const handleTermsChange = (event) => {
    setTermsAccepted(event.target.checked);
    if (event.target.checked) {
      setTermsError("");
    }
  };

  return {
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
  };
};

export default useRegister;
