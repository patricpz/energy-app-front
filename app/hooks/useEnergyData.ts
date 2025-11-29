import { useState, useEffect, useCallback } from 'react';
import { EnergyApi } from '../services/api';

type EnergyData = {
  currentUsage: number;
  dailyConsumption: number;
  monthlyConsumption: number;
  cost: number;
  lastUpdated: string;
};

type UseEnergyDataReturn = {
  data: EnergyData | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

export function useEnergyData(): UseEnergyDataReturn {
  const [data, setData] = useState<EnergyData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch current usage
      const [currentUsage, stats] = await Promise.all([
        EnergyApi.getCurrentUsage(),
        EnergyApi.getEnergyStats('day')
      ]);

      setData({
        currentUsage: currentUsage.value,
        dailyConsumption: stats.dailyConsumption,
        monthlyConsumption: stats.monthlyConsumption,
        cost: stats.cost,
        lastUpdated: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Error fetching energy data:', err);
      setError('Failed to load energy data. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refresh: fetchData,
  };
}
