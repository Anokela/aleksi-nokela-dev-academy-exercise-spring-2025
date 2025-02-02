import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchSingleDayData } from '../api/getElectricityDataApi';
import DailyDataGraph from "../Components/DailyDataGraph";
import { Container, Paper, Typography, Button, CircularProgress, Alert, Stack } from "@mui/material";

// Define types for hourlyData
interface HourlyData {
  time: string;
  consumption: string;
  production: string;
  price: string;
}

// Define types for dayData
export interface DayData {
  date: string;
  total_consumption: string | null;
  total_production: string | null;
  avg_price: string | null;
  peak_consumption_hour: string;
  cheapest_hours: string[];
  hourly_data: HourlyData[];
}

const SingleDayDetail: React.FC = () => {
  const { date } = useParams<{ date: string }>();
  const [dayData, setDayData] = useState<DayData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const NO_DATA_MESSAGE = 'No data available';
  console.log(dayData)
  useEffect(() => {
    async function getData() {
      try {
        if (date) {
          const fetchData = await fetchSingleDayData(date);
          setDayData(fetchData);
        }
      } catch (err) {
        setError("Failed to load electricity data for the selected day.");
      }
    }

    getData();
  }, [date]);

  if (error) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/')}
          sx={{ mt: 2 }}
        >
          Back to Home
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Typography variant="h4" gutterBottom>
        Electricity Statistics for {date}
      </Typography>

      {dayData ? (
        <Paper
          elevation={4}
          sx={{
            p: 4,
            borderRadius: 3,
            width: "100%",
            maxWidth: "800px",
            mx: "auto",
            bgcolor: "#f5f5f5",
            boxShadow: "0px 4px 10px rgba(0,0,0,0.1)"
          }}
        >
          <DailyDataGraph data={dayData} />
          <Stack spacing={2} mt={3}>
            <Typography variant="h6">
              <strong>Total Consumption (kWh):</strong> {dayData.total_consumption != null
                ? Number(dayData.total_consumption).toFixed(2)
                : NO_DATA_MESSAGE}
            </Typography>
            <Typography variant="h6">
              <strong>Total Production (MWh):</strong> {dayData.total_production != null
                ? Number(dayData.total_production).toFixed(2)
                : NO_DATA_MESSAGE}
            </Typography>
            <Typography variant="h6">
              <strong>Average Price (Cent (€)):</strong> {dayData.avg_price != null
                ? Number(dayData.avg_price).toFixed(2)
                : NO_DATA_MESSAGE}
            </Typography>
            <Typography variant="h6">
              <strong>Peak Consumption Hour:</strong> {dayData.peak_consumption_hour ?? NO_DATA_MESSAGE}
            </Typography>
            <Typography variant="h6">
              <strong>Cheapest Hours:</strong> {dayData?.cheapest_hours?.length > 0 ? dayData?.cheapest_hours?.join(", ") : NO_DATA_MESSAGE}
            </Typography>
          </Stack>
        </Paper>
      ) : (
        <CircularProgress sx={{ display: "block", mx: "auto", mt: 3 }} />
      )}

      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate('/')}
        sx={{ mt: 4 }}
      >
        Back to Home
      </Button>
    </Container>
  );
};

export default SingleDayDetail;
