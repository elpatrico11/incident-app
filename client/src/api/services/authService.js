import api from "../api";

export const forgotPassword = async (email) => {
  const response = await api.post("/auth/forgot-password", { email });
  return response.data;
};

export const resendVerification = async (email) => {
  const response = await api.post("/auth/resend-verification", { email });
  return response.data;
};
