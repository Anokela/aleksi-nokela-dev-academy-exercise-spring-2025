import React, { useEffect } from "react";
import { useElectricityData } from "../context/ElectricityDataContext";
import { Link } from "react-router-dom";
import DataGraph from '../Components/DataGraph'; // Oletetaan, että graafi on täällä

const Home: React.FC = () => {
    const { error, loading, allDataLoaded, validOnly, searchFilteredData, searchTerm, sortColumn, sortDirection, sortData, setSearchTerm, toggleFilter, fetchInitialData, loadMoreData, loadAllData } = useElectricityData();
    const NO_DATA_MESSAGE = "No data available";

    // Tallennetaan scrollin sijainti ennen siirtymistä pois
    const saveScrollPosition = () => {
        sessionStorage.setItem("scrollPosition", String(window.scrollY));
    };

    // Palautetaan scrollin sijainti, kun käyttäjä palaa Home-sivulle
    useEffect(() => {
        const savedPosition = sessionStorage.getItem("scrollPosition");
        if (savedPosition) {
            window.scrollTo(0, Number(savedPosition));
        }
    }, []);


    return (
        <div>
            <h1>Electricity Statistics</h1>
            <DataGraph />
            {error && <p style={{ color: "red" }}>{error}</p>}
            <input
                type="text"
                value={searchTerm}
                placeholder="Search..."
                onChange={(e) => setSearchTerm(e.target.value)} // Päivittää hakusanan
            />
            <label>
                <input type="checkbox" checked={validOnly} onChange={toggleFilter} />
                Show only complete data
            </label>
            <table border={1}>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>
                            <button onClick={() => sortData("date")}>
                                Date {sortColumn === "date" && (sortDirection === "asc" ? "↑" : "↓")}
                            </button>
                        </th>
                        <th>
                            <button onClick={() => sortData("total_consumption")}>
                                Total Consumption (kWh)
                                {sortColumn === "total_consumption" && (sortDirection === "asc" ? "↑" : "↓")}
                            </button>
                        </th>
                        <th>
                            <button onClick={() => sortData("total_production")}>
                                Total Production (MWh)
                                {sortColumn === "total_production" && (sortDirection === "asc" ? "↑" : "↓")}
                            </button>
                        </th>
                        <th>
                            <button onClick={() => sortData("avg_price")}>
                                Average Price (€)
                                {sortColumn === "avg_price" && (sortDirection === "asc" ? "↑" : "↓")}
                            </button>
                        </th>
                        <th>
                            <button onClick={() => sortData("longest_negative_streak")}>
                                Longest Negative Price Streak (h)
                                {sortColumn === "longest_negative_streak" && (sortDirection === "asc" ? "↑" : "↓")}
                            </button>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {searchFilteredData.map((day, index) => (
                        <tr key={index}>
                            <td>{index + 1}</td>
                            <td><Link to={`/detail/${day.date}`} onClick={saveScrollPosition}>{day.date}</Link></td>
                            <td>{day.total_consumption ?? NO_DATA_MESSAGE}</td>
                            <td>{day.total_production ?? NO_DATA_MESSAGE}</td>
                            <td>{day.avg_price ?? NO_DATA_MESSAGE}</td>
                            <td>{day.longest_negative_streak ?? NO_DATA_MESSAGE}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {!allDataLoaded ? (
                <div>
                    <button onClick={loadMoreData} disabled={loading}>
                        {loading ? "Loading..." : "Load More"}
                    </button>
                    <button onClick={loadAllData} disabled={loading}>
                        {loading ? "Loading..." : "Show all"}
                    </button>
                </div>
            ) : (
                <div>
                    <button onClick={fetchInitialData} disabled={loading}>
                        {loading ? "Loading..." : "Show initial data"}
                    </button>
                </div>
            )}
        </div>
    );
};

export default Home;
