import api from "../api";

/**
 * Fetch all categories.
 */
export const fetchCategories = async () => {
  const response = await api.get("/categories");
  return response.data;
};

/**
 * Fetch incidents with filters and sorting.
 * @param {Object} params - Query parameters.
 */
export const fetchIncidents = async (params) => {
  const query = new URLSearchParams(params).toString();
  const response = await api.get(`/incidents?${query}`);
  return response.data;
};

/**
 * Update the status of an incident.
 * @param {string} incidentId - The ID of the incident.
 * @param {string} newStatus - The new status to set.
 */
export const updateIncidentStatus = async (incidentId, newStatus) => {
  const response = await api.put(`/admin/incidents/${incidentId}/status`, {
    status: newStatus,
  });
  return response.data;
};

/**
 * Delete an incident.
 * @param {string} incidentId - The ID of the incident to delete.
 */
export const deleteIncident = async (incidentId) => {
  const response = await api.delete(`/admin/incidents/${incidentId}`);
  return response.data;
};

/**
 * Fetch detailed information about a single incident.
 * @param {string} incidentId - The ID of the incident.
 */
export const fetchIncidentDetails = async (incidentId) => {
  const response = await api.get(`/incidents/${incidentId}`);
  return response.data;
};
