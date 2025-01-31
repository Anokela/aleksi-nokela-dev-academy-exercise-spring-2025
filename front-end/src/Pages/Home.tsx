import React, { useEffect, useState } from "react";
import { fetchElectricityData } from '../api/getElectricityDataApi'
import { Link } from 'react-router-dom';

interface ElectricityData {
    date: string;
    total_consumption: string | null;
    total_production: string | null;
    avg_price: string | null;
    longest_negative_streak: number;
}

const Home: React.FC = () => {
    const [data, setData] = useState<ElectricityData[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(false);
    const [allDataLoaded, setAllDataLoaded] = useState(false);
    const limit: number = 25; // Ensimmäinen erä
    const NO_DATA_MESSAGE: string = "No data available";

    // Haetaan ensimmäinen erä dataa (ei lisätä perään, vaan korvataan)
    useEffect(() => {
        async function fetchInitialData() {
            setLoading(true);
            try {
                const fetchData = await fetchElectricityData(1, limit); // Sivutuksen aloitus
                setData(fetchData);
                setPage(2); // Seuraava kutsu alkaa sivulta 2
            } catch (err) {
                setError("Failed to load electricity data.");
            } finally {
                setLoading(false);
            }
        }
        fetchInitialData();
    }, []);

    // Lataa seuraavan erän (lisätään perään)
    async function loadMoreData() {
        setLoading(true);
        try {
            const fetchData = await fetchElectricityData(page, limit);
            setData((prev) => [...prev, ...fetchData]); // Lisätään uudet rivit perään
            setPage((prev) => prev + 1); // Siirrytään seuraavalle sivulle
        } catch (err) {
            setError("Failed to load electricity data.");
        } finally {
            setLoading(false);
        }
    }

    async function loadAllData() {
        if (allDataLoaded) return; // Estetään toistuvat pyynnöt, jos kaikki data on jo ladattu

        console.log('Ladataan kaikki data');  // Debugging
        setLoading(true);
        try {
            const fetchData = await fetchElectricityData(1, 0); // 0 hakee kaikki rivit
            console.log('Vastaanotettu data', fetchData);  // Tarkistetaan, että saamme dataa
            setData(fetchData); // Korvataan data, koska halutaan näyttää kaikki kerralla
            setAllDataLoaded(true); // Merkitään, että kaikki data on ladattu
            setPage(1); // Nollataan sivutus, ettei Load More riko logiikkaa
        } catch (err) {
            console.error('Virhe ladattaessa dataa', err);  // Debugging virhe
            setError("Failed to load all electricity data.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <h1>Electricity Statistics</h1>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <table border={1}>
                <thead>
                    <tr>
                        <th></th>
                        <th>Date</th>
                        <th>Total Consumption (kWh)</th>
                        <th>Total Production (MWh)</th>
                        <th>Average Price (€)</th>
                        <th>Longest Negative Price Streak (h)</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((day, index) => (
                        <tr key={index}>
                            <td>{index + 1}</td>
                            <td>
                                <Link to={`/detail/${day.date}`}>{day.date}</Link>
                            </td>
                            <td>{day.total_consumption ? day.total_consumption : NO_DATA_MESSAGE}</td>
                            <td>{day.total_production ? day.total_production : NO_DATA_MESSAGE}</td>
                            <td>{day.avg_price ? day.avg_price : NO_DATA_MESSAGE}</td>
                            <td>{day.longest_negative_streak ? day.longest_negative_streak : NO_DATA_MESSAGE}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <button onClick={loadMoreData} disabled={loading}>
                {loading ? "Loading..." : "Load More"}
            </button>
            <button onClick={loadAllData} disabled={loading}>
                {loading ? "Loading..." : "Show all"}
            </button>
        </div>
    );
};

export default Home;
