import api from "../api";
import { BOUNDARY_GEOJSON_URL } from "../../constants/incidentConstants";

//Fetch all categories.

export const fetchCategories = async () => {
  const response = await api.get("/categories");
  return response.data;
};

//Fetch all incidents

export async function fetchAllIncidents() {
  const response = await api.get("/incidents");
  return response.data.incidents;
}

//Fetch incidents with filters and sorting

export const fetchIncidents = async (params) => {
  const query = new URLSearchParams(params).toString();
  const response = await api.get(`/incidents?${query}`);
  return response.data;
};

//Update the status of an incident

export const updateIncidentStatus = async (incidentId, newStatus) => {
  const response = await api.put(`/admin/incidents/${incidentId}/status`, {
    status: newStatus,
  });
  return response.data;
};

//Delete an incident.

export const deleteIncident = async (incidentId) => {
  const response = await api.delete(`/admin/incidents/${incidentId}`);
  return response.data;
};

// Delete incident by user
export const userDeleteIncident = async (incidentId) => {
  const response = await api.delete(`/incidents/${incidentId}`);
  return response.data;
};

//Fetch detailed information about a single incident

export const fetchIncidentDetails = async (incidentId) => {
  const response = await api.get(`/incidents/${incidentId}`);
  return response.data;
};

//Fetch incident details by ID.

export const fetchIncidentById = (id) => {
  return api.get(`/incidents/${id}`);
};

//Fetch comments for a specific incident.

export const fetchCommentsByIncidentId = (id) => {
  return api.get(`/incidents/${id}/comments`);
};

//Submit a new comment for an incident.

export const submitComment = async (incidentId, commentData) => {
  try {
    const response = await api.post(
      `/incidents/${incidentId}/comments`,
      commentData
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

//Gets user incidents

export const getMyIncidents = async () => {
  const response = await api.get("/incidents/my");
  return response.data;
};

//Update an existing incident

export async function updateIncident(incidentId, data) {
  const response = await api.put(`/incidents/${incidentId}`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

//Fetch boundary GeoJSON

export async function fetchBoundaryGeoJSON() {
  const response = await fetch(BOUNDARY_GEOJSON_URL);
  if (!response.ok) {
    throw new Error("Failed to load boundary data");
  }
  return response.json();
}
