import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useElectricityData } from '../context/ElectricityDataContext';
import { Card, CardContent, Typography, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio } from '@mui/material';

const DataGraph: React.FC = () => {
  const { searchFilteredData } = useElectricityData();
  const [selectedData, setSelectedData] = useState<string>('total_consumption');

  if (!searchFilteredData || searchFilteredData.length === 0) {
    return <Typography fontSize={30} style={{ padding: '30px' }}>No data available for visualization.</Typography>;
  }

  // Creqate data for graph
  const chartData = searchFilteredData.map((item) => ({
    date: item.date,
    total_consumption: parseFloat(item.total_consumption ?? '0'),
    total_production: parseFloat(item.total_production ?? '0'),
    avg_price: parseFloat(item.avg_price ?? '0'),
    longest_negative_streak: item.longest_negative_streak ?? '0',
  }));

  // Function to shorten long figures (k = thousand, M = million)
  function formatLargeNumber(num: number) {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  const renderLine = () => {
    switch (selectedData) {
      case 'total_consumption':
        return <Line type="monotone" dataKey="total_consumption" stroke="#8884d8" name='Total consumption (kWh)' />;
      case 'total_production':
        return <Line type="monotone" dataKey="total_production" stroke="#82ca9d" name='Total production (MWh)' />;
      case 'avg_price':
        return <Line type="monotone" dataKey="avg_price" stroke="#ff7300" name='Average price (Cent (€))' />;
      case 'longest_negative_streak':
        return <Line type="monotone" dataKey="longest_negative_streak" stroke="#d12f2f" name='Longest streak of hours when negative price' />;
      default:
        return null;
    }
  };

  return (
    <Card sx={{ marginBottom: 4, padding: 2 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Electricity Consumption Over Time
        </Typography>

        <FormControl component="fieldset" sx={{ marginBottom: 2 }}>
          <FormLabel component="legend">Select Data Type</FormLabel>
          <RadioGroup row value={selectedData} onChange={(e) => setSelectedData(e.target.value)}>
            <FormControlLabel value="total_consumption" control={<Radio />} label="Total Consumption" />
            <FormControlLabel value="total_production" control={<Radio />} label="Total Production" />
            <FormControlLabel value="avg_price" control={<Radio />} label="Average Price" />
            <FormControlLabel value="longest_negative_streak" control={<Radio />} label="Longest Negative Streak" />
          </RadioGroup>
        </FormControl>

        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis tickFormatter={formatLargeNumber} 
             domain={[0, selectedData === "longest_negative_streak" ? 24 : "auto"]} />
            <Tooltip />
            <Legend />
            {renderLine()}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default DataGraph;
