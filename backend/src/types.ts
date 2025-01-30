export interface ElectricityStatsResponse {
    date: string;
    total_consumption: number;
    total_production: number;
    avg_price: number;
    peak_consumption_hour: string | null;
    cheapest_hours: string[];
  }