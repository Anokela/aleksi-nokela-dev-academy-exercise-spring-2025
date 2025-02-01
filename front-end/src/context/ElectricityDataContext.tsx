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
    setYear: (year: number | null) => void;
    sortData: (column: keyof ElectricityData) => void;
    setSearchTerm: (term: string) => void;
    toggleFilter: () => void;
    loadMoreData: () => Promise<void>;
    loadAllData: () => Promise<void>;
    fetchInitialData: () => Promise<void>;
}

// Context
const ElectricityDataContext = createContext<ElectricityDataContextType | undefined>(undefined);

// Provider-komponentti
export const ElectricityDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [data, setData] = useState<ElectricityData[]>([]);
    const [searchFilteredData, setSearchFilteredData] = useState<ElectricityData[]>([]); // Filtteröity data
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(false);
    const [allDataLoaded, setAllDataLoaded] = useState<boolean>(false);
    const [validOnly, setValidOnly] = useState<boolean>(true); // set to fetch only rows with valid data by default
    const [itemsLoaded, setItemsLoaded] = useState<number>(25);
    const [year, setYear] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');  // Hakusanatila
    const [pageInitiated, setPageInitiated] = useState(false);
    const [sortColumn, setSortColumn] = useState<string | null>(null);  // Sarake, jota lajitellaan
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");  // Lajittelusuunta
    const limit: number = 25;

    // Lataa data alussa tai filtterin vaihtuessa
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

    }, [validOnly,year]); // Kun filtteri muuttuu, haetaan data uudestaan

    // Hakee ja suodattaa dataa hakusanan mukaan
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
            setSearchFilteredData(data);  // Jos ei hakusanaa, palautetaan kaikki data
        }
    }, [searchTerm, data]);

    async function fetchInitialData() {
        setLoading(true);
        try {
            const fetchData = await fetchElectricityData(1, limit, validOnly, year);
            setData(fetchData);
            setSearchFilteredData(fetchData);
            setPage(2); // Seuraava haku alkaa sivulta 2
            setItemsLoaded(limit); // Ensimmäinen haku = 25 riviä
            setAllDataLoaded(false); // Resetoi "kaikki ladattu" tilan
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
            // Haetaan kenttäarvot
            const aValue = a[column] ?? "";
            const bValue = b[column] ?? "";

            // Tarkistetaan, ovatko arvot numeerisia
            const isNumeric = (value: any) => !isNaN(value) && value !== null && value !== "";

            // Jos arvot ovat numeerisia, muunnetaan ne numeroiksi
            const aNumeric = isNumeric(aValue) ? Number(aValue) : aValue;
            const bNumeric = isNumeric(bValue) ? Number(bValue) : bValue;

            // Vertailu
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
            setPage(Math.ceil(itemsLoaded / limit) + 1); // Lasketaan seuraava sivu
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
            setData((prev) => [...prev, ...fetchData]); // Lisätään uudet rivit perään
            setSearchFilteredData((prev) => [...prev, ...fetchData]);
            setPage((prev) => prev + 1); // Siirrytään seuraavalle sivulle
            setItemsLoaded((prev) => prev + fetchData.length);
            if (fetchData.length < limit) {
                setAllDataLoaded(true); // Merkitään, että kaikki data on ladattu
                return;
            }
        } catch (err) {
            setError("Failed to load electricity data.");
        } finally {
            setLoading(false);
        }
    }

    async function loadAllData() {
        // if (allDataLoaded) return; // Estetään toistuvat pyynnöt, jos kaikki data on jo ladattu
        console.log('Ladataan kaikki data');  // Debugging
        setLoading(true);
        try {
            const fetchData = await fetchElectricityData(1, 0, validOnly, year); // 0 hakee kaikki rivit
            console.log('Vastaanotettu data', fetchData);  // Tarkistetaan, että saamme dataa
            setData(fetchData); // Korvataan data, koska halutaan näyttää kaikki kerralla
            setSearchFilteredData(fetchData);
            setAllDataLoaded(true); // Merkitään, että kaikki data on ladattu
            setItemsLoaded(fetchData.length);
            setPage(1); // Nollataan sivutus, ettei Load More riko logiikkaa
        } catch (err) {
            console.error('Virhe ladattaessa dataa', err);  // Debugging virhe
            setError("Failed to load all electricity data.");
        } finally {
            setLoading(false);
        }
    }

    function toggleFilter() {
        setValidOnly(!validOnly);
        setData([]);
        setPage(1);
    }

    return (
        <ElectricityDataContext.Provider
            value={{ error, page, loading, allDataLoaded, validOnly, itemsLoaded, searchTerm, searchFilteredData, sortColumn, sortDirection, year, setYear, sortData, setSearchTerm, toggleFilter, loadMoreData, loadAllData, fetchInitialData, }}
        >
            {children}
        </ElectricityDataContext.Provider>
    );
};

// Custom hook
export const useElectricityData = () => {
    const context = useContext(ElectricityDataContext);
    if (!context) throw new Error("useElectricityData must be used within ElectricityDataProvider");
    return context;
};