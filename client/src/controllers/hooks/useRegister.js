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
  NO_RESPONSE_ERROR,
  UNEXPECTED_ERROR,
} from "../../constants/validationConstants";
import { validateEmail } from "../../utils/validationUtils";

/**
 * Custom hook to handle user registration.
 * @returns {Object} - State and handlers related to registration.
 */
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

  // reCAPTCHA
  const [captchaValue, setCaptchaValue] = useState(null);

  // Form Feedback
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  // Loading State
  const [loading, setLoading] = useState(false);

  /**
   * Validates the input fields.
   * @returns {boolean} - Whether the inputs are valid.
   */
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

    // Validate Password
    if (!password) {
      setPasswordError(PASSWORD_REQUIRED);
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError(PASSWORD_MIN_LENGTH);
      isValid = false;
    } else {
      setPasswordError("");
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

  /**
   * Handles form submission for registration.
   * @param {Event} event - The form submission event.
   */
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
    } catch (error) {
      // Handle error response from backend
      if (error.response && error.response.data && error.response.data.errors) {
        // Handle validation errors
        const backendErrors = error.response.data.errors;
        backendErrors.forEach((err) => {
          if (err.param === "email") {
            setEmailError(err.msg);
          }
          if (err.param === "password") {
            setPasswordError(err.msg);
          }
          if (err.param === "firstName") {
            setFirstNameError(err.msg);
          }
          if (err.param === "lastName") {
            setLastNameError(err.msg);
          }
          if (err.param === "captcha") {
            setFormError(err.msg);
          }
        });
      } else if (
        error.response &&
        error.response.data &&
        error.response.data.msg
      ) {
        // Handle general form errors
        setFormError(error.response.data.msg);
      } else if (error.request && !error.response) {
        // Handle no response received
        setFormError(NO_RESPONSE_ERROR);
      } else {
        setFormError(UNEXPECTED_ERROR);
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles reCAPTCHA change.
   * @param {string|null} value - The reCAPTCHA token.
   */
  const handleCaptchaChange = (value) => {
    setCaptchaValue(value);
    if (value) {
      setFormError("");
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
    formError,
    formSuccess,
    loading,
    handleCaptchaChange,
    handleSubmit,
  };
};

export default useRegister;
