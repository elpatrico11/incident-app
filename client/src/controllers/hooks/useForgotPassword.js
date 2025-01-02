import { useState } from "react";
import { forgotPassword } from "../../api/services/authService";
import {
  EMAIL_REQUIRED,
  INVALID_EMAIL,
} from "../../constants/validationConstants";
import { validateEmail as validateEmailUtil } from "../../utils/validationUtils";

const useForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [serverError, setServerError] = useState("");

  const validateEmail = () => {
    if (!email) {
      setEmailError(true);
      setEmailErrorMessage(EMAIL_REQUIRED);
      return false;
    }
    if (!validateEmailUtil(email)) {
      setEmailError(true);
      setEmailErrorMessage(INVALID_EMAIL);
      return false;
    }
    setEmailError(false);
    setEmailErrorMessage("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setServerError("");

    if (!validateEmail()) {
      return;
    }

    try {
      const data = await forgotPassword(email);
      setSuccessMessage(data.msg);
    } catch (error) {
      setServerError(
        error.response?.data?.msg ||
          "An error occurred while processing your request."
      );
    }
  };

  const resetState = () => {
    setEmail("");
    setEmailError(false);
    setEmailErrorMessage("");
    setSuccessMessage("");
    setServerError("");
  };

  return {
    email,
    setEmail,
    emailError,
    emailErrorMessage,
    successMessage,
    serverError,
    handleSubmit,
    resetState,
  };
};

export default useForgotPassword;
