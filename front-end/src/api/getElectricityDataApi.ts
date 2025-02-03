const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
console.log("Backend API URL:", API_BASE_URL);
// Fetch data for daily electricity data
export async function fetchElectricityData(
  page: number,
  limit: number,
  validOnly: boolean,
  year: number | null
) {
  let url = `${API_BASE_URL}/getElectricityData/stats?page=${page}&limit=${limit}&validOnly=${validOnly}`;

  if (year) {
    url += `&year=${year}`;
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch electricity data");
  }
  return response.json();
}
// fetch data for single date
export const fetchSingleDayData = async (date: string) => {
  const response = await fetch(`http://localhost:5000/api/getElectricityData/stats/${date}`);
  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }
  return response.json();
};