import api from "../api";

//Fetch all users

export const fetchUsers = async () => {
  const response = await api.get("/admin/users");
  return response.data;
};

//Fetch a single user by ID

export const fetchUserById = async (userId) => {
  const response = await api.get(`/admin/users/${userId}`);
  return response.data;
};

//Update a user's details by ID

export const updateUserById = async (userId, userData) => {
  const response = await api.put(`/admin/users/${userId}`, userData);
  return response.data;
};

//Update a user's role

export const updateUserRole = async (userId, newRole) => {
  const response = await api.put(`/admin/users/${userId}`, { role: newRole });
  return response.data;
};

//Delete a user

export const deleteUser = async (userId) => {
  const response = await api.delete(`/admin/users/${userId}`);
  return response.data;
};
