import React, { useEffect } from "react";
import { useElectricityData } from "../context/ElectricityDataContext";
import { Link } from "react-router-dom";
import DataGraph from "../Components/DataGraph";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TableSortLabel,
    TextField,
    Button,
    FormControlLabel,
    Checkbox,
    Select,
    MenuItem,
    Typography,
    CircularProgress,
    Tooltip
} from "@mui/material";
import "./Home.css";
import { useNavigate } from "react-router-dom";

const Home: React.FC = () => {
    const {
        error,
        loading,
        allDataLoaded,
        validOnly,
        searchFilteredData,
        searchTerm,
        sortColumn,
        sortDirection,
        year,
        limit,
        clearFilters,
        clearSearchInput,
        setYear,
        sortData,
        setSearchTerm,
        toggleFilter,
        fetchInitialData,
        loadMoreData,
        loadAllData,
    } = useElectricityData();

    const NO_DATA_MESSAGE = "No data available";
    const navigate = useNavigate();

    // function to navigaet to singledaydetailpage when user clicks the data row
    const handleRowClick = (date: string) => {
        saveScrollPosition();
        navigate(`/detail/${date}`);
    };
    // Save scroll position when navigating off
    const saveScrollPosition = () => {
        sessionStorage.setItem("scrollPosition", String(window.scrollY));
    };

    // Scroll to previous position, kwhen user navigates to Home
    useEffect(() => {
        const savedPosition = sessionStorage.getItem("scrollPosition");
        if (savedPosition) {
            window.scrollTo(0, Number(savedPosition));
        }
    }, []);
    console.log(searchFilteredData);
    return (
        <div className="page-container">
            <h1>Electricity Statistics</h1>

            {error ? (
                <p style={{ color: "red" }}>{error}</p>
            ) : (
                <>
                    <DataGraph />
                    <div className="header">
                        <div className="filters">
                            <FormControlLabel
                                control={<Checkbox checked={validOnly} onChange={toggleFilter} />}
                                label="Show only rows with complete data"
                                sx={{ marginRight: 2 }}
                                id="onlyValidDataFilter"
                            />
                            <Select
                                value={year ?? ""}
                                onChange={(e) => setYear(e.target.value ? Number(e.target.value) : null)}
                                displayEmpty
                                sx={{ marginRight: 2 }}
                            >
                                <MenuItem value="">All years</MenuItem>
                                <MenuItem value="2020">2020</MenuItem>
                                <MenuItem value="2021">2021</MenuItem>
                                <MenuItem value="2022">2022</MenuItem>
                                <MenuItem value="2023">2023</MenuItem>
                                <MenuItem value="2024">2024</MenuItem>
                            </Select>
                            <Typography>Search data by year</Typography>
                            <Button variant="outlined" onClick={clearFilters}>
                                Clear filters
                            </Button>
                        </div>
                        <TextField
                            label="Search from shown data"
                            variant="outlined"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            sx={{ marginTop: 2, width: 300 }}
                            id="searchDataInput"
                        />
                        <Button id="clearSearchInputButton" variant="contained" onClick={clearSearchInput} sx={{ marginTop: 2 }}>
                            Clear search input
                        </Button>
                    </div>
                    {loading ? (
                        <div className="loading-container">
                            <CircularProgress />
                        </div>
                    ) : (
                        <TableContainer component={Paper} sx={{ marginTop: 3 }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>#</TableCell>
                                        <TableCell>
                                            <TableSortLabel
                                                active={sortColumn === "date"}
                                                direction={sortColumn === "date" ? sortDirection : "asc"}
                                                onClick={() => sortData("date")}
                                            >
                                                Date
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell>
                                            <TableSortLabel
                                                active={sortColumn === "total_consumption"}
                                                direction={sortColumn === "total_consumption" ? sortDirection : "asc"}
                                                onClick={() => sortData("total_consumption")}
                                            >
                                                Total Consumption (kWh)
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell>
                                            <TableSortLabel
                                                active={sortColumn === "total_production"}
                                                direction={sortColumn === "total_production" ? sortDirection : "asc"}
                                                onClick={() => sortData("total_production")}
                                            >
                                                Total Production (MWh)
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell>
                                            <TableSortLabel
                                                active={sortColumn === "avg_price"}
                                                direction={sortColumn === "avg_price" ? sortDirection : "asc"}
                                                onClick={() => sortData("avg_price")}
                                            >
                                                Average Price (Cent(€))
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell>
                                            <TableSortLabel
                                                active={sortColumn === "longest_negative_streak"}
                                                direction={sortColumn === "longest_negative_streak" ? sortDirection : "asc"}
                                                onClick={() => sortData("longest_negative_streak")}
                                            >
                                                Longest Negative Price Streak (h)
                                            </TableSortLabel>
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {searchFilteredData.map((day, index) => (
                                        <TableRow
                                            key={index}
                                            hover
                                            onClick={() => handleRowClick(day.date)}
                                            style={{ cursor: "pointer" }}
                                        >
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>
                                                <Tooltip title="View daily statistics">
                                                    <Link
                                                        id={`date-link-${day.date}`}
                                                        to={`/detail/${day.date}`}
                                                        onClick={(e) => {
                                                            saveScrollPosition();
                                                            e.stopPropagation(); // prevent whole row clicking event
                                                        }}
                                                        style={{ textDecoration: "none", fontWeight: "bold" }}
                                                    >
                                                        {day.date}
                                                    </Link>
                                                </Tooltip>
                                            </TableCell>
                                            <TableCell>
                                                {day.total_consumption !== null
                                                    ? Number(day.total_consumption).toFixed(2)
                                                    : NO_DATA_MESSAGE}
                                            </TableCell>
                                            <TableCell>
                                                {day.total_production != null
                                                    ? Number(day.total_production).toFixed(2)
                                                    : NO_DATA_MESSAGE}
                                            </TableCell>
                                            <TableCell>
                                                {day.avg_price != null
                                                    ? Number(day.avg_price).toFixed(2)
                                                    : NO_DATA_MESSAGE}
                                            </TableCell>
                                            <TableCell>{day.longest_negative_streak ?? NO_DATA_MESSAGE}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}

                    <div className="fixed-buttons">
                        {!allDataLoaded ? (
                            <>
                                <Button id="loadMoreButton" variant="contained" onClick={loadMoreData} disabled={loading} sx={{ marginRight: 2 }}>
                                    {loading ? "Loading..." : `Load ${limit} more rows`}
                                </Button>
                                <Button id="loadAllButton" variant="contained" onClick={loadAllData} disabled={loading}>
                                    {loading ? "Loading..." : "Load all rows"}
                                </Button>
                            </>
                        ) : (
                            <Button id='loadInitialDataButton' color="inherit" variant="contained" onClick={fetchInitialData} disabled={loading}>
                                {loading ? "Loading..." : `Show first ${limit} rows`}
                            </Button>
                        )}
                    </div>
                </>
            )}
        </div>
    );

};

export default Home;
