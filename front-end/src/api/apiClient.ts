const API_BASE_URL = "http://localhost:5000/api"; // Backendin osoite

export async function fetchExampleData(): Promise<{ message: string; data: number[] }> {
    const response = await fetch(`${API_BASE_URL}/data`);
    if (!response.ok) {
        throw new Error("Failed to fetch data from the backend");
    }
    return response.json();
}