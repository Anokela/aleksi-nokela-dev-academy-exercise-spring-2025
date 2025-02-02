import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Hourly data types
interface HourlyData {
  time: string;
  consumption: string;  // string, changed to number in graph
  production: string;   // string, changed to number in graph
  price: string;        // string, changed to number in graph
}

// Types for DailyDataGraphProps
interface DailyDataGraphProps {
  data: {
    date: string;
    total_consumption: string | null;
    total_production: string | null;
    avg_price: string | null;
    peak_consumption_hour: string;
    cheapest_hours: string[];
    hourly_data: HourlyData[];
  };
}

const DailyDataGraph: React.FC<DailyDataGraphProps> = ({ data }) => {
  // Initialize selected data
  const [selectedData, setSelectedData] = useState<string>('consumption');

  // Initialize data for graph, string data changed to nummber in graph
  const chartData = data.hourly_data.map((item: HourlyData) => ({
    time: item.time,
    consumption: parseFloat(item.consumption),  // Muutetaan kulutus numeeriseksi
    production: parseFloat(item.production),    // Muutetaan tuotanto numeeriseksi
    price: parseFloat(item.price),              // Muutetaan hinta numeeriseksi
  }));

  // Function to shorten long figures (k = thousand, M = million)
  const formatLargeNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  return (
    <div style={{ height: '400px', marginBottom: '100px' }}>
      <h2>Hourly Electricity Data</h2>
      <div style={{ marginBottom: '20px' }}>
        <label>
          <input
            type="radio"
            name="data-selection"
            value="consumption"
            checked={selectedData === 'consumption'}
            onChange={() => setSelectedData('consumption')}
          />
          Consumption (kWh)
        </label>
        <label style={{ marginLeft: '15px' }}>
          <input
            type="radio"
            name="data-selection"
            value="production"
            checked={selectedData === 'production'}
            onChange={() => setSelectedData('production')}
          />
          Production (MWh)
        </label>
        <label style={{ marginLeft: '15px' }}>
          <input
            type="radio"
            name="data-selection"
            value="price"
            checked={selectedData === 'price'}
            onChange={() => setSelectedData('price')}
          />
          Price (Cent(€))
        </label>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis tickFormatter={formatLargeNumber} />
          <Tooltip />
          <Legend />
          {selectedData === 'consumption' && (
            <Line type="monotone" dataKey="consumption" stroke="#8884d8" name="Consumption (kWh)" />
          )}
          {selectedData === 'production' && (
            <Line type="monotone" dataKey="production" stroke="#82ca9d" name="Production (MWh)" />
          )}
          {selectedData === 'price' && (
            <Line type="monotone" dataKey="price" stroke="#ff7300" name="Price (Cent (€))" />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DailyDataGraph;
