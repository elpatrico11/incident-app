import { useState, useEffect, useCallback } from "react";
import { fetchUserById, updateUserById } from "../../api/services/userService";
import { USER_ROLES, VALIDATION_MESSAGES } from "../../constants/userConstants";
import useAuthStore from "../../models/stores/useAuthStore";

const useEditUser = (userId) => {
  // State Management
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: USER_ROLES.USER,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const currentUser = useAuthStore((state) => state.user);

  // Fetch User Data
  const fetchUser = useCallback(async () => {
    try {
      const data = await fetchUserById(userId);
      setUserData({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        email: data.email || "",
        role: data.role || USER_ROLES.USER,
      });
    } catch (err) {
      console.error(err);
      setError("Błąd podczas pobierania danych użytkownika.");
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Handle Input Changes
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  }, []);

  // Validate Form Data
  const validate = useCallback(() => {
    if (!userData.firstName || !userData.lastName || !userData.email) {
      setError(VALIDATION_MESSAGES.REQUIRED);
      return false;
    }
    // Email regex for validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      setError(VALIDATION_MESSAGES.INVALID_EMAIL);
      return false;
    }
    return true;
  }, [userData.firstName, userData.lastName, userData.email]);

  // Handle Form Submission
  const handleSubmit = useCallback(
    async (e, navigate) => {
      e.preventDefault();
      setError("");
      setSuccess("");

      if (!validate()) return;

      try {
        await updateUserById(userId, userData);
        setSuccess("Dane użytkownika zostały zaktualizowane.");
        // Redirect after a delay
        setTimeout(() => navigate("/admin/users"), 2000);
      } catch (err) {
        console.error(err);
        setError("Błąd podczas aktualizacji danych użytkownika.");
      }
    },
    [userId, userData, validate]
  );

  return {
    userData,
    loading,
    error,
    success,

    handleChange,
    handleSubmit,

    currentUser,
  };
};

export default useEditUser;
