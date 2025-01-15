import api from "../api";

//Get categories (previously fetched via ../utils/categories)

export async function getCategories() {
  const response = await fetch("/assets/categories.json");
  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }
  return response.json();
}

//Get boundary GeoJSON data

export async function getBoundary(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to load boundary data");
  }
  return response.json();
}

//Create a new incident/report on the server

export async function createIncident(formData) {
  const response = await api.post("/incidents", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 30000,
  });
  return response.data;
}
