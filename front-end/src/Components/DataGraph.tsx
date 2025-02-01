import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useElectricityData } from '../context/ElectricityDataContext'; // Jos käytät contextia datan hallintaan

const DataGraph: React.FC = () => {
  const { searchFilteredData } = useElectricityData(); // Haetaan suodatettu data kontekstista
  const [selectedData, setSelectedData] = useState<string>('total_consumption'); // Aluksi valitaan "total_consumption"const [selectedData, setSelectedData] = useState<string>('total_consumption'); // Aluksi valitaan "total_consumption"
  // Varmistetaan, että data on saatavilla ennen kuin kaavio luodaan
  if (!searchFilteredData || searchFilteredData.length === 0) {
    return <div>No data available for visualization.</div>;
  }

  console.log(searchFilteredData);

  // Muodostetaan kaavion data
  const chartData = searchFilteredData.map((item) => ({
    date: item.date,
    total_consumption: parseFloat(item.total_consumption ?? '0'),
    total_production: parseFloat(item.total_production ?? '0'),
    avg_price: parseFloat(item.avg_price ?? '0'),
    longest_negative_streak: item.longest_negative_streak ?? '0',
  }));

  const renderLine = () => {
    switch (selectedData) {
      case 'total_consumption':
        return <Line type="monotone" dataKey="total_consumption" stroke="#8884d8" />;
      case 'total_production':
        return <Line type="monotone" dataKey="total_production" stroke="#82ca9d" />;
      case 'avg_price':
        return <Line type="monotone" dataKey="avg_price" stroke="#ff7300" />;
      case 'longest_negative_streak':
        return <Line type="monotone" dataKey="longest_negative_streak" stroke="#d12f2f" />;
      default:
        return null;
    }
  };

  return (
    <div style={{ height: '400px', marginBottom: '100px' }}>
      <h2>Electricity Consumption Over Time</h2>

      {/* Radio buttons valinnan tekemiseen */}
      <div>
        <label>
          <input
            type="radio"
            value="total_consumption"
            checked={selectedData === 'total_consumption'}
            onChange={() => setSelectedData('total_consumption')}
          />
          Total Consumption
        </label>
        <label>
          <input
            type="radio"
            value="total_production"
            checked={selectedData === 'total_production'}
            onChange={() => setSelectedData('total_production')}
          />
          Total Production
        </label>
        <label>
          <input
            type="radio"
            value="avg_price"
            checked={selectedData === 'avg_price'}
            onChange={() => setSelectedData('avg_price')}
          />
          Average Price
        </label>
        <label>
          <input
            type="radio"
            value="longest_negative_streak"
            checked={selectedData === 'longest_negative_streak'}
            onChange={() => setSelectedData('longest_negative_streak')}
          />
          Longest Negative Streak
        </label>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          {renderLine()}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DataGraph;