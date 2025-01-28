import { useEffect, useState } from "react";
import { fetchExampleData } from "./api/apiClient";

function Home() {
    const [message, setMessage] = useState("");
    const [data, setData] = useState<number[]>([]);

    useEffect(() => {
        async function getData() {
            try {
                const response = await fetchExampleData();
                setMessage(response.message);
                setData(response.data);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        }
        getData();
    }, []);

    return (
        <div>
            <h1>{message}</h1>
            <ul>
                {data.map((item, index) => (
                    <li key={index}>{item}</li>
                ))}
            </ul>
        </div>
    );
}

export default Home;