import React, { useEffect, useState } from "react";
import { fetchElectricityStats } from "../api/electricityApi";

interface ElectricityStats {
    date: string;
    total_consumption: string | null;
    total_production: string | null;
    avg_price: string | null;
    longest_negative_streak: number;
}

const Home: React.FC = () => {
    const [stats, setStats] = useState<ElectricityStats[]>([]);
    const [error, setError] = useState<string | null>(null);
    const NO_DATA_MESSAGE: string = "No data available";

    useEffect(() => {
        async function getData() {
            try {
                const data = await fetchElectricityStats();
                setStats(data);
            } catch (err) {
                setError("Failed to load electricity data.");
            }
        }
        getData();
    }, []);
    
    console.log(stats)
    return (
        <div>
            <h1>Electricity Statistics</h1>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <table border={1}>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Total Consumption (kWh)</th>
                        <th>Total Production (MWh/h)</th>
                        <th>Average Price (€)</th>
                        <th>Longest Negative Price Streak (h)</th>
                    </tr>
                </thead>
                <tbody>
                    {stats.map((day, index) => (
                        <tr key={index}>
                            <td>{day.date}</td>
                            <td>{day.total_consumption ? day.total_consumption : NO_DATA_MESSAGE}</td>
                            <td>{day.total_production ? day.total_production : NO_DATA_MESSAGE}</td>
                            <td>{day.avg_price ? day.avg_price : NO_DATA_MESSAGE}</td>
                            <td>{day.longest_negative_streak ? day.longest_negative_streak : NO_DATA_MESSAGE}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Home;
