import api from "../api";

/**
 * Fetch all reports.
 */
export const fetchReports = async () => {
  const response = await api.get("/admin/reports");
  return response.data;
};

/**
 * Download reports as CSV.
 */
export const downloadReportsCSV = async () => {
  const response = await api.get("/admin/download", {
    responseType: "blob", // Important for binary data
  });
  return response.data;
};
