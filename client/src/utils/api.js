import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // Adres backendu
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

export default api;
