const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
console.log("Backend API URL:", API_BASE_URL);
export async function fetchElectricityData(page: number, limit: number,validOnly: boolean) {
  const response = await fetch(`${API_BASE_URL}/getElectricityData/stats?page=${page}&limit=${limit}&validOnly=${validOnly}`);
  if (!response.ok) {
    throw new Error("Failed to fetch electricity data");
  }
  return response.json();
}

export const fetchSingleDayData = async (date: string) => {
  const response = await fetch(`http://localhost:5000/api/getElectricityData/stats/${date}`);
  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }
  return response.json();
};