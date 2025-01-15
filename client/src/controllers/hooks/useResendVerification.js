import { useState } from "react";
import { resendVerification } from "../../api/services/authService";
import {
  EMAIL_REQUIRED,
  INVALID_EMAIL,
} from "../../constants/validationConstants";
import { validateEmail as validateEmailUtil } from "../../utils/validationUtils";

const useResendVerification = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  //Validates the email input.

  const validateEmail = () => {
    if (!email) {
      setError(EMAIL_REQUIRED);
      return false;
    }
    if (!validateEmailUtil(email)) {
      setError(INVALID_EMAIL);
      return false;
    }
    setError("");
    return true;
  };

  //Handles form submission for resending verification email.

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateEmail()) {
      return;
    }

    try {
      const data = await resendVerification(email);
      setSuccess(data.msg);
    } catch (err) {
      setError(
        err.response?.data?.msg || "Error resending verification email."
      );
    }
  };

  //Resets the state to initial values.

  const resetState = () => {
    setEmail("");
    setError("");
    setSuccess("");
  };

  return {
    email,
    setEmail,
    error,
    success,
    handleSubmit,
    resetState,
  };
};

export default useResendVerification;
