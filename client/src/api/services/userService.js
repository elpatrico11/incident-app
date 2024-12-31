import api from "../api";

/**
 * Fetch all users.
 */
export const fetchUsers = async () => {
  const response = await api.get("/admin/users");
  return response.data;
};

/**
 * Fetch a single user by ID.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Object>} - User data.
 */
export const fetchUserById = async (userId) => {
  const response = await api.get(`/admin/users/${userId}`);
  return response.data;
};

/**
 * Update a user's details by ID.
 * @param {string} userId - The ID of the user.
 * @param {Object} userData - The updated user data.
 * @returns {Promise<Object>} - Updated user data.
 */
export const updateUserById = async (userId, userData) => {
  const response = await api.put(`/admin/users/${userId}`, userData);
  return response.data;
};

/**
 * Update a user's role.
 * @param {string} userId - The ID of the user.
 * @param {string} newRole - The new role to assign.
 */
export const updateUserRole = async (userId, newRole) => {
  const response = await api.put(`/admin/users/${userId}`, { role: newRole });
  return response.data;
};

/**
 * Delete a user.
 * @param {string} userId - The ID of the user to delete.
 */
export const deleteUser = async (userId) => {
  const response = await api.delete(`/admin/users/${userId}`);
  return response.data;
};
