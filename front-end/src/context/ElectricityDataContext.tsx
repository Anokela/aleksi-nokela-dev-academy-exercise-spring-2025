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
    data: ElectricityData[];
    error: string | null;
    page: number;
    loading: boolean;
    allDataLoaded: boolean;
    validOnly: boolean;
    itemsLoaded: number;
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
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(false);
    const [allDataLoaded, setAllDataLoaded] = useState<boolean>(false);
    const [validOnly, setValidOnly] = useState<boolean>(false);
    const [itemsLoaded, setItemsLoaded] = useState<number>(25);
    const [pageInitiated, setPageInitiated] = useState(false);
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

    }, [validOnly]); // Kun filtteri muuttuu, haetaan data uudestaan

    async function fetchInitialData() {
        setLoading(true);
        try {
            const fetchData = await fetchElectricityData(1, limit, validOnly);
            setData(fetchData);
            setPage(2); // Seuraava haku alkaa sivulta 2
            setItemsLoaded(limit); // Ensimmäinen haku = 25 riviä
            setAllDataLoaded(false); // Resetoi "kaikki ladattu" tilan
            setPageInitiated(true);
        } catch (err) {
            setError("Failed to load electricity data.");
        } finally {
            setLoading(false);
        }
    }

    async function reloadFilteredData() {
        setLoading(true);
        try {
            const fetchData = await fetchElectricityData(1, itemsLoaded, validOnly);
            setData(fetchData);
            setPage(Math.ceil(itemsLoaded / limit) + 1); // Lasketaan seuraava sivu
        } catch (err) {
            setError("Failed to load electricity data.");
        } finally {
            setLoading(false);
        }
    }

    // Lataa seuraavan erän (lisätään perään)
    async function loadMoreData() {
        setLoading(true);
        try {
            const fetchData = await fetchElectricityData(page, limit, validOnly);
            setData((prev) => [...prev, ...fetchData]); // Lisätään uudet rivit perään
            setPage((prev) => prev + 1); // Siirrytään seuraavalle sivulle
            setItemsLoaded((prev) => prev + fetchData.length);
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
            const fetchData = await fetchElectricityData(1, 0, validOnly); // 0 hakee kaikki rivit
            console.log('Vastaanotettu data', fetchData);  // Tarkistetaan, että saamme dataa
            setData(fetchData); // Korvataan data, koska halutaan näyttää kaikki kerralla
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
            value={{ data, error, page, loading, allDataLoaded, validOnly, itemsLoaded, toggleFilter, loadMoreData, loadAllData, fetchInitialData }}
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