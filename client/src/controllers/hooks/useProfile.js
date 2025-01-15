import { useState, useEffect, useCallback } from "react";
import {
  fetchUserProfile,
  updateUserProfile,
  changeUserPassword,
} from "../../api/services/profileService";
import { VALIDATION_MESSAGES } from "../../constants/profileConstants";
import useAuthStore from "../../models/stores/useAuthStore";

const useProfile = () => {
  const { user, setUser } = useAuthStore();

  // Account Info States
  const [accountData, setAccountData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    role: user?.role || "user",
  });
  const [accountError, setAccountError] = useState("");
  const [accountSuccess, setAccountSuccess] = useState("");

  // Password Change States
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  // Loading States
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Fetch User Profile on Mount
  const fetchProfile = useCallback(async () => {
    setLoadingProfile(true);
    try {
      const data = await fetchUserProfile();
      setAccountData({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        email: data.email || "",
        role: data.role || "user",
      });
      setUser(data); // Update global user state
    } catch (err) {
      setAccountError(
        err.response?.data?.msg || "Błąd podczas pobierania danych profilu."
      );
    }
    setLoadingProfile(false);
  }, [setUser]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Handle Account Info Changes
  const handleAccountChange = (e) => {
    setAccountData({ ...accountData, [e.target.name]: e.target.value });
  };

  // Validate Account Data
  const validateAccountData = useCallback(() => {
    const { firstName, lastName, email } = accountData;
    if (!firstName || !lastName || !email) {
      setAccountError(VALIDATION_MESSAGES.REQUIRED);
      return false;
    }
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setAccountError(VALIDATION_MESSAGES.INVALID_EMAIL);
      return false;
    }
    return true;
  }, [accountData]);

  // Handle Account Info Submission
  const handleAccountSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setAccountError("");
      setAccountSuccess("");

      if (!validateAccountData()) return;

      setUpdatingProfile(true);
      try {
        const updatedData = await updateUserProfile(accountData);
        setUser(updatedData); // Update global user state
        setAccountSuccess("Profil został zaktualizowany pomyślnie.");
      } catch (err) {
        setAccountError(
          err.response?.data?.msg || "Błąd podczas aktualizacji profilu."
        );
      }
      setUpdatingProfile(false);
    },
    [accountData, setUser, validateAccountData]
  );

  // Handle Password Change Inputs
  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  // Validate Password Data
  const validatePasswordData = useCallback(() => {
    const { oldPassword, newPassword, confirmNewPassword } = passwordData;
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      setPasswordError(VALIDATION_MESSAGES.REQUIRED);
      return false;
    }
    if (newPassword.length < 6) {
      setPasswordError(VALIDATION_MESSAGES.PASSWORD_MIN_LENGTH);
      return false;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError(VALIDATION_MESSAGES.PASSWORD_MISMATCH);
      return false;
    }
    if (oldPassword === newPassword) {
      setPasswordError(VALIDATION_MESSAGES.PASSWORD_SAME_AS_OLD);
      return false;
    }
    return true;
  }, [passwordData]);

  // Handle Password Submission
  const handlePasswordSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setPasswordError("");
      setPasswordSuccess("");

      if (!validatePasswordData()) return;

      setChangingPassword(true);
      try {
        await changeUserPassword(passwordData);
        setPasswordSuccess("Hasło zostało zmienione pomyślnie.");
        setPasswordData({
          oldPassword: "",
          newPassword: "",
          confirmNewPassword: "",
        });
      } catch (err) {
        setPasswordError(
          err.response?.data?.msg || "Błąd podczas zmiany hasła."
        );
      }
      setChangingPassword(false);
    },
    [passwordData, validatePasswordData]
  );

  return {
    // Account Info
    accountData,
    accountError,
    accountSuccess,
    handleAccountChange,
    handleAccountSubmit,
    updatingProfile,

    // Password Change
    passwordData,
    passwordError,
    passwordSuccess,
    handlePasswordChange,
    handlePasswordSubmit,
    changingPassword,

    // Loading
    loadingProfile,
  };
};

export default useProfile;
