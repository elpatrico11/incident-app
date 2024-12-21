import { create } from "zustand";
import api from "../utils/api";

const useAuthStore = create((set, get) => ({
  user: null,
  loading: true,
  error: null,

  // Initialize user by checking both localStorage and sessionStorage
  initializeUser: async () => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      try {
        const response = await api.get("/auth/me");
        set({ user: response.data, loading: false });
      } catch (error) {
        console.error("Error fetching user:", error);
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        delete api.defaults.headers.common["Authorization"];
        set({ user: null, loading: false });
      }
    } else {
      set({ loading: false });
    }
  },

  // Login with rememberMe option
  login: async (email, password, rememberMe) => {
    try {
      const response = await api.post("/auth/login", {
        email,
        password,
        rememberMe,
      });
      const { token, user } = response.data;

      // Store token based on rememberMe
      if (rememberMe) {
        localStorage.setItem("token", token);
      } else {
        sessionStorage.setItem("token", token);
      }

      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      set({ user, error: null });
      console.log("User logged in:", user); // Debugging
    } catch (error) {
      console.error("Login error:", error);
      set({ error: error.response?.data?.msg || "Error during login" });
      throw error;
    }
  },

  // Register with rememberMe option
  register: async (
    firstName,
    lastName,
    email,
    password,
    rememberMe = false
  ) => {
    try {
      const response = await api.post("/auth/register", {
        firstName,
        lastName,
        email,
        password,
        rememberMe, // Pass rememberMe to backend
      });
      const { token, user } = response.data;

      // Store token based on rememberMe
      if (rememberMe) {
        localStorage.setItem("token", token);
      } else {
        sessionStorage.setItem("token", token);
      }

      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      set({ user, error: null });
      console.log("User registered and logged in:", user); // Debugging
    } catch (error) {
      console.error("Registration error:", error);
      set({ error: error.response?.data?.msg || "Error during registration" });
      throw error;
    }
  },

  // Update user data
  setUser: (userData) => {
    console.log("Setting user:", userData); // Debugging
    set({ user: userData });
  },

  // Logout and clear both storages
  logout: () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
    set({ user: null, error: null });
  },
}));

export default useAuthStore;
