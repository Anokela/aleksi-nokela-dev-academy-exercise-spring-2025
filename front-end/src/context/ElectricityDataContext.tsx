import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchElectricityData } from "../api/getElectricityDataApi";

// Types for data
interface ElectricityData {
    date: string;
    total_consumption: string | null;
    total_production: string | null;
    avg_price: string | null;
    longest_negative_streak: number;
}
// types for Context
interface ElectricityDataContextType {
    searchFilteredData: ElectricityData[];
    error: string | null;
    page: number;
    loading: boolean;
    allDataLoaded: boolean;
    validOnly: boolean;
    searchTerm: string;
    sortColumn: string | null;
    sortDirection: "asc" | "desc";
    year: number | null;
    limit: number;
    setYear: (year: number | null) => void;
    sortData: (column: keyof ElectricityData) => void;
    setSearchTerm: (term: string) => void;
    toggleFilter: () => void;
    loadMoreData: () => Promise<void>;
    loadAllData: () => Promise<void>;
    fetchInitialData: () => Promise<void>;
    clearSearchInput: () => void;
    clearFilters: () => void;
}

// Context to use in different pages
const ElectricityDataContext = createContext<ElectricityDataContextType | undefined>(undefined);

// Provider-component
export const ElectricityDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [data, setData] = useState<ElectricityData[]>([]); // raw data
    const [searchFilteredData, setSearchFilteredData] = useState<ElectricityData[]>([]); // Filtered data for rendering the ui
    const [error, setError] = useState<string | null>(null); // error message
    const [page, setPage] = useState<number>(1); // paging, default value 1
    const [loading, setLoading] = useState<boolean>(false);
    const [allDataLoaded, setAllDataLoaded] = useState<boolean>(false); // boolean to tell if user has loaded all data
    const [validOnly, setValidOnly] = useState<boolean>(true); // set to filtering only rows with valid data by default
    const [itemsLoaded, setItemsLoaded] = useState<number>(25); // variable needed to fetch same number of items when user changes differet filters
    const [year, setYear] = useState<number | null>(null); // for filtering data by specific year
    const [searchTerm, setSearchTerm] = useState<string>(''); // for searching from data
    const [pageInitiated, setPageInitiated] = useState(false); // to check if to search only the initial data
    const [sortColumn, setSortColumn] = useState<string | null>(null);  // Column to be sorted
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");  // Sort directions
    const limit: number = 25;

    // Load data initially and when filter changes
    useEffect(() => {
        if (!pageInitiated) {
            fetchInitialData(); // search only initial data
            return;
        }
        if (allDataLoaded) {
            loadAllData(); // If user has searched all data, search again when filter state changed
        } else {
            reloadFilteredData(); // fetch data when filters are changed and not all data is loaded all data
        }

    }, [validOnly, year]); // Load data again when/if filter changes

    // Search and filter loaded data using search by date 
    useEffect(() => {
        if (searchTerm) {
            const filtered = data.filter((item) =>
                item.date.includes(searchTerm) || 
                item.total_consumption?.includes(searchTerm) ||
                item.total_production?.includes(searchTerm) ||
                item.avg_price?.includes(searchTerm) ||
                item.longest_negative_streak.toString().includes(searchTerm)
            );
            setSearchFilteredData(filtered); // set filtered data to render
        } else {
            setSearchFilteredData(data);  // If no search word, return all data
        }
    }, [searchTerm, data]);

    async function fetchInitialData() {
        setLoading(true);
        try {
            const fetchData = await fetchElectricityData(1, limit, validOnly, year);
            setData(fetchData);
            setSearchFilteredData(fetchData);
            setPage(2); // Next  load starts from page 2
            setItemsLoaded(limit); // First load
            setAllDataLoaded(false); // Reset all data loaded state
            setPageInitiated(true);
        } catch (err) {
            setError("Failed to load electricity data.");
        } finally {
            setLoading(false);
        }
    };
    // function for sorting data columns
    function sortData(column: keyof ElectricityData) {
        const direction = sortColumn === column && sortDirection === "asc" ? "desc" : "asc";
        setSortColumn(column);
        setSortDirection(direction);

        const sortedData = [...searchFilteredData].sort((a, b) => {
            const aValue = a[column] ?? "";
            const bValue = b[column] ?? "";

            // Check if valueas are numeric
            const isNumeric = (value: any) => !isNaN(value) && value !== null && value !== "";

            // If numeric, change to type number
            const aNumeric = isNumeric(aValue) ? Number(aValue) : aValue;
            const bNumeric = isNumeric(bValue) ? Number(bValue) : bValue;

            // Comparison
            if (direction === "asc") {
                return aNumeric < bNumeric ? -1 : 1;
            } else {
                return aNumeric < bNumeric ? 1 : -1;
            }
        });

        setSearchFilteredData(sortedData);
    };
    // function to fetch data when filters are toggled/changed and not all data is loaded e.g. handle that same amount of rows are returned from db
    async function reloadFilteredData() {
        setLoading(true);
        try {
            const fetchData = await fetchElectricityData(1, itemsLoaded, validOnly, year);
            setData(fetchData);
            setSearchFilteredData(fetchData);
            setPage(Math.ceil(itemsLoaded / limit) + 1); // calculate next page
        } catch (err) {
            setError("Failed to load electricity data.");
        } finally {
            setLoading(false);
        }
    };

    // function to load next batch of data
    async function loadMoreData() {
        setLoading(true);
        try {
            const fetchData = await fetchElectricityData(page, limit, validOnly, year);
            setData((prev) => [...prev, ...fetchData]); //Add new rows
            setSearchFilteredData((prev) => [...prev, ...fetchData]);
            setPage((prev) => prev + 1); // Move to next page
            setItemsLoaded((prev) => prev + fetchData.length);
            if (fetchData.length < limit) {
                setAllDataLoaded(true); // If all available data is loaded
                return;
            }
        } catch (err) {
            setError("Failed to load electricity data.");
        } finally {
            setLoading(false);
        }
    }
    // function to load all data rows, filtered or not
    async function loadAllData() {
        setLoading(true);
        try {
            const fetchData = await fetchElectricityData(1, 0, validOnly, year); // 0 fetches all rows
            setData(fetchData); // set data with all data
            setSearchFilteredData(fetchData);
            setAllDataLoaded(true); // update state that all data is loaded
            setItemsLoaded(fetchData.length);
            setPage(1); // Reset paging
        } catch (err) {
            console.error('Virhe ladattaessa dataa', err);
            setError("Failed to load all electricity data.");
        } finally {
            setLoading(false);
        }
    }
    // function to toggle filter to fetch only valid data or not
    function toggleFilter() {
        setValidOnly(!validOnly);
        setData([]);
        setPage(1);
    };
    // Clear search input
    function clearSearchInput() {
        setSearchTerm('');
    };
    // clear all filters
    function clearFilters() {
        setValidOnly(false);
        setYear(null);
    };

    return (
        <ElectricityDataContext.Provider
            value={{ error, page, loading, allDataLoaded, validOnly, searchTerm, searchFilteredData, sortColumn, sortDirection, year, limit, clearSearchInput, clearFilters, setYear, sortData, setSearchTerm, toggleFilter, loadMoreData, loadAllData, fetchInitialData, }}
        >
            {children}
        </ElectricityDataContext.Provider>
    );
};

export const useElectricityData = () => {
    const context = useContext(ElectricityDataContext);
    if (!context) throw new Error("useElectricityData must be used within ElectricityDataProvider");
    return context;
};