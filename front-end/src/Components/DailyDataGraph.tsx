import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Määritellään tuntikohtaisen datan tyyppi
interface HourlyData {
  time: string;      // Tunti
  consumption: string;  // Kulutus (string, mutta muutetaan numeroksi kaaviossa)
  production: string;   // Tuotanto (string, mutta muutetaan numeroksi kaaviossa)
  price: string;        // Hinta (string, mutta muutetaan numeroksi kaaviossa)
}

// Tyypitään propit, joita `DailyDataGraph`-komponentti odottaa
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
  // Alustetaan valittu data
  const [selectedData, setSelectedData] = useState<string>('consumption');  // Oletuksena kulutus

  // Muodostetaan kaavion data, jossa muunnamme string-tyyppiset arvot luvuiksi
  const chartData = data.hourly_data.map((item: HourlyData) => ({
    time: item.time,
    consumption: parseFloat(item.consumption),  // Muutetaan kulutus numeeriseksi
    production: parseFloat(item.production),    // Muutetaan tuotanto numeeriseksi
    price: parseFloat(item.price),              // Muutetaan hinta numeeriseksi
  }));

  return (
    <div style={{ height: '400px', marginBottom: '100px' }}>
      <h2>Hourly Electricity Data</h2>

      {/* Radiobuttonit tietojen valintaan */}
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
          Production (kWh)
        </label>
        <label style={{ marginLeft: '15px' }}>
          <input 
            type="radio" 
            name="data-selection" 
            value="price" 
            checked={selectedData === 'price'} 
            onChange={() => setSelectedData('price')} 
          />
          Price (€)
        </label>
      </div>

      {/* Responsive Container */}
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Legend />

          {/* Näytetään valitun datan mukaan oikea kaavio */}
          {selectedData === 'consumption' && (
            <Line type="monotone" dataKey="consumption" stroke="#8884d8" name="Consumption (kWh)" />
          )}
          {selectedData === 'production' && (
            <Line type="monotone" dataKey="production" stroke="#82ca9d" name="Production (kWh)" />
          )}
          {selectedData === 'price' && (
            <Line type="monotone" dataKey="price" stroke="#ff7300" name="Price (€)" />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DailyDataGraph;
