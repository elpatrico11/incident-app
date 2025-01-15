import api from "../api";

//Fetch the current user's profile

export const fetchUserProfile = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

//Update the current user's profile

export const updateUserProfile = async (profileData) => {
  const response = await api.put("/auth/me", profileData);
  return response.data;
};

//Change the current user's password

export const changeUserPassword = async (passwordData) => {
  const response = await api.post("/auth/change-password", passwordData);
  return response.data;
};
