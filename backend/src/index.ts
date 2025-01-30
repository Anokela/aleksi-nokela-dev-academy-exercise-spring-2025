import express from "express";
import cors from "cors";
import getElectricityData from "./routes/getElectricityData";
import "./config";  // Varmistetaan, että ympäristömuuttujat on ladattu

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API-routes
app.use("/api/getElectricityData", getElectricityData);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
