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

  // Updated register function with captcha
  register: async (firstName, lastName, email, password, captcha) => {
    try {
      if (!captcha) {
        throw new Error("reCAPTCHA verification is required");
      }

      const response = await api.post("/auth/register", {
        firstName,
        lastName,
        email,
        password,
        captcha, // Add captcha token to the request
      });

      // If registration is successful but requires email verification,
      // don't set the user or token yet
      if (response.data.msg?.includes("verification")) {
        set({ error: null });
        return response.data; // Return the response for handling in the component
      }

      // If registration includes immediate login (depends on your backend)
      const { token, user } = response.data;
      if (token) {
        sessionStorage.setItem("token", token); // Store in session storage by default for new registrations
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        set({ user, error: null });
        console.log("User registered and logged in:", user); // Debugging
      }

      return response.data;
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage =
        error.response?.data?.msg ||
        error.response?.data?.errors?.[0]?.msg ||
        error.message ||
        "Error during registration";
      set({ error: errorMessage });
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
