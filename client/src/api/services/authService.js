import api from "../api";

export const forgotPassword = async (email) => {
  const response = await api.post("/auth/forgot-password", { email });
  return response.data;
};

export const resendVerification = async (email) => {
  const response = await api.post("/auth/resend-verification", { email });
  return response.data;
};

export const verifyEmail = async (token, email) => {
  const response = await api.get("/auth/verify-email", {
    params: { token, email },
  });
  return response.data;
};

export const registerUser = async (
  firstName,
  lastName,
  email,
  password,
  captchaValue
) => {
  const response = await api.post("/auth/register", {
    firstName,
    lastName,
    email,
    password,
    captcha: captchaValue,
  });
  return response.data;
};
