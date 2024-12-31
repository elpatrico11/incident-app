import api from "../api";

/**
 * Fetch the current user's profile.
 * @returns {Promise<Object>} - User data.
 */
export const fetchUserProfile = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

/**
 * Update the current user's profile.
 * @param {Object} profileData - Updated profile data.
 * @returns {Promise<Object>} - Updated user data.
 */
export const updateUserProfile = async (profileData) => {
  const response = await api.put("/auth/me", profileData);
  return response.data;
};

/**
 * Change the current user's password.
 * @param {Object} passwordData - Password change data.
 * @returns {Promise<Object>} - Response data.
 */
export const changeUserPassword = async (passwordData) => {
  const response = await api.post("/auth/change-password", passwordData);
  return response.data;
};
