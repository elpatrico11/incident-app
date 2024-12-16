// src/store/useAuthStore.js
import { create } from "zustand";
import api from "../utils/api";

const useAuthStore = create((set, get) => ({
  user: null,
  loading: true,
  error: null,

  // Inicjalizacja użytkownika po załadowaniu aplikacji
  initializeUser: async () => {
    const token = localStorage.getItem("token");
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      try {
        const response = await api.get("/auth/me");
        console.log("User fetched:", response.data); // Debugging
        set({ user: response.data, loading: false });
      } catch (error) {
        console.error("Błąd podczas pobierania użytkownika:", error);
        localStorage.removeItem("token");
        delete api.defaults.headers.common["Authorization"];
        set({ user: null, loading: false });
      }
    } else {
      set({ loading: false });
    }
  },

  // Logowanie
  login: async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      set({ user, error: null });
      console.log("User logged in:", user); // Debugging
    } catch (error) {
      console.error("Błąd podczas logowania:", error);
      set({ error: error.response?.data?.msg || "Błąd podczas logowania" });
      throw error;
    }
  },

  // Rejestracja
  register: async (firstName, lastName, email, password, role) => {
    try {
      const response = await api.post("/auth/register", {
        firstName,
        lastName,
        email,
        password,
        role, // Opcjonalnie: rola użytkownika
      });
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      set({ user, error: null });
      console.log("User registered:", user); // Debugging
    } catch (error) {
      console.error("Błąd podczas rejestracji:", error);
      set({ error: error.response?.data?.msg || "Błąd podczas rejestracji" });
      throw error;
    }
  },

  // Aktualizacja danych użytkownika
  setUser: (userData) => {
    console.log("Setting user:", userData); // Debugging
    set({ user: userData });
  },

  // Wylogowanie
  logout: () => {
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
    set({ user: null, error: null });
  },
}));

export default useAuthStore;
