import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../models/stores/useAuthStore";
import {
  EMAIL_REQUIRED,
  INVALID_EMAIL,
  PASSWORD_REQUIRED,
  PASSWORD_MIN_LENGTH,
  NO_RESPONSE_ERROR,
  UNEXPECTED_ERROR,
} from "../../constants/validationConstants";
import { validateEmail } from "../../utils/validationUtils";

/**
 * Custom hook to handle login functionality.
 * @returns {Object} - State and handlers related to login.
 */
const useLogin = () => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [formError, setFormError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  /**
   * Validates the input fields.
   * @returns {boolean} - Whether the inputs are valid.
   */
  const validateInputs = () => {
    let isValid = true;

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

    return isValid;
  };

  /**
   * Handles form submission for login.
   * @param {Event} event - The form submission event.
   */
  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    if (!validateInputs()) {
      return;
    }

    try {
      await login(email, password, rememberMe);
      navigate("/"); // Redirect to homepage or dashboard after successful login
    } catch (error) {
      if (error.response) {
        setFormError(error.response.data.msg || "Error during login.");
      } else if (error.request) {
        // Request was made but no response received
        setFormError(NO_RESPONSE_ERROR);
      } else {
        setFormError(UNEXPECTED_ERROR);
      }
    }
  };

  return {
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
  };
};

export default useLogin;
