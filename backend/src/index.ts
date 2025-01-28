import express from "express";
import cors from "cors";
import exampleRoute from "./routes/exampleRoute";

const app = express();
const port = 5000;

// Middleware
app.use(cors()); // Salli pyynnöt frontendiltä
app.use(express.json()); // JSON-datan käsittely

// Käytä reittiä
app.use("/api", exampleRoute);

// Käynnistä palvelin
app.listen(port, () => {
    console.log(`Backend running on http://localhost:${port}`);
});
