const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
console.log("Backend API URL:", API_BASE_URL);
export async function fetchElectricityStats() {
  const response = await fetch(`${API_BASE_URL}/electricity/stats`);
  if (!response.ok) {
    throw new Error("Failed to fetch electricity stats");
  }
  return response.json();
}