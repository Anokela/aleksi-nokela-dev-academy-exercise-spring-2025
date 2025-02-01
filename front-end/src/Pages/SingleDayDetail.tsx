import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchSingleDayData } from '../api/getElectricityDataApi';

interface DayData {
    date: string;
    total_consumption: string | null;
    total_production: string | null;
    avg_price: string | null;
    peak_consumption_hour: string;
    cheapest_hours: string[];
}

const SingleDayDetail: React.FC = () => {
    const { date } = useParams<{ date: string }>(); // Hae päivämäärä URL-parametrista
    const [dayData, setDayData] = useState<DayData | null>(null);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate(); // käytetään useNavigate hookkia

    useEffect(() => {
        async function getData() {
            try {
                if (date) {
                    const fetchData = await fetchSingleDayData(date);
                    setDayData(fetchData);
                }
            } catch (err) {
                setError("Failed to load electricity data for the selected day.");
            }
        }

        getData();
    }, [date]);

    console.log('Data', dayData);

    if (error) {
        return (
            <div>
                <p style={{ color: "red" }}>{error}</p>
                <button onClick={() => navigate('/')}>Back to Home</button>
            </div>
        );
    } else {
        return (
            <div>
                <h1>Electricity Statistics for {date}</h1>
                {dayData ? (
                    <div>
                        <p>Total Consumption (kWh): {dayData.total_consumption ?? 'No data available'}</p>
                        <p>Total Production (MWh): {dayData.total_production ?? 'No data available'}</p>
                        <p>Average Price (€): {dayData.avg_price ?? 'No data available'}</p>
                        <p>Peak Consumption Hour: {dayData.peak_consumption_hour ?? 'No data available'}</p>
                        <p>Cheapest Hours: {dayData.cheapest_hours.join(", ") ?? 'No data available'}</p>
                    </div>
                ) : (
                    <p>Loading...</p>
                )}
                {/* Lisää paluupainike */}
                <button onClick={() => navigate('/')}>Back to Home</button>
            </div>
        );
    }


};

export default SingleDayDetail;