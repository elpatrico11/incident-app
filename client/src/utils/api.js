import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // Adres backendu
  timeout: 10000,
});

// Dodawanie tokenu JWT z localStorage do Authorization każdego żądania
// jeśli token istnieje

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authService = {
  register: async (firstName, lastName, email, password, captchaToken) => {
    try {
      const response = await api.post("/auth/register", {
        firstName,
        lastName,
        email,
        password,
        captcha: captchaToken, // Make sure to send the token with this exact name
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default api;
