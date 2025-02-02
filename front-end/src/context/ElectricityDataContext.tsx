import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchElectricityData } from "../api/getElectricityDataApi";

// Tyyppimääritykset
interface ElectricityData {
    date: string;
    total_consumption: string | null;
    total_production: string | null;
    avg_price: string | null;
    longest_negative_streak: number;
}

interface ElectricityDataContextType {
    searchFilteredData: ElectricityData[];
    error: string | null;
    page: number;
    loading: boolean;
    allDataLoaded: boolean;
    validOnly: boolean;
    itemsLoaded: number;
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

// Context
const ElectricityDataContext = createContext<ElectricityDataContextType | undefined>(undefined);

// Provider-komponentti
export const ElectricityDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [data, setData] = useState<ElectricityData[]>([]);
    const [searchFilteredData, setSearchFilteredData] = useState<ElectricityData[]>([]); // Filtered data
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(false);
    const [allDataLoaded, setAllDataLoaded] = useState<boolean>(false);
    const [validOnly, setValidOnly] = useState<boolean>(true); // set to fetch only rows with valid data by default
    const [itemsLoaded, setItemsLoaded] = useState<number>(25);
    const [year, setYear] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [pageInitiated, setPageInitiated] = useState(false);
    const [sortColumn, setSortColumn] = useState<string | null>(null);  // Column to be sorted
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");  // Sortdirections
    const limit: number = 25;

    // Load data initially and when filter changes
    useEffect(() => {
        if (!pageInitiated) {
            fetchInitialData();
            return;
        }
        if (allDataLoaded) {
            loadAllData(); // If user has searched all data, search again when filter state changed
        } else {
            reloadFilteredData();
        }

    }, [validOnly, year]); // Load data again when/if filter changes

    // Search and filter data using search
    useEffect(() => {
        if (searchTerm) {
            const filtered = data.filter((item) =>
                item.date.includes(searchTerm) ||
                item.total_consumption?.includes(searchTerm) ||
                item.total_production?.includes(searchTerm) ||
                item.avg_price?.includes(searchTerm) ||
                item.longest_negative_streak.toString().includes(searchTerm)
            );
            setSearchFilteredData(filtered);
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

            // Coparison
            if (direction === "asc") {
                return aNumeric < bNumeric ? -1 : 1;
            } else {
                return aNumeric < bNumeric ? 1 : -1;
            }
        });

        setSearchFilteredData(sortedData);
    };

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

    // Lataa seuraavan erän (lisätään perään)
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

    function toggleFilter() {
        setValidOnly(!validOnly);
        setData([]);
        setPage(1);
    };

    function clearSearchInput() {
        setSearchTerm('');
    };

    function clearFilters() {
        setValidOnly(false);
        setYear(null);
    };

    return (
        <ElectricityDataContext.Provider
            value={{ error, page, loading, allDataLoaded, validOnly, itemsLoaded, searchTerm, searchFilteredData, sortColumn, sortDirection, year, limit, clearSearchInput, clearFilters, setYear, sortData, setSearchTerm, toggleFilter, loadMoreData, loadAllData, fetchInitialData, }}
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