import { useCallback, useEffect, useState } from 'react';
import { getEnergyMonths, getEnergyDays, EnergyMonthData, EnergyDayData } from '../services/energyReport';

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
      
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;
      const currentDay = now.getDate();
      
      // Buscar dados do mês atual
      const [monthsData, daysData] = await Promise.all([
        getEnergyMonths({
          year: currentYear,
          startMonth: currentMonth,
          endMonth: currentMonth,
        }),
        getEnergyDays({
          year: currentYear,
          month: currentMonth,
          startDay: currentDay,
          endDay: currentDay,
        }),
      ]);

      // Extrair dados do mês atual
      const monthData: EnergyMonthData | null = monthsData && monthsData.length > 0 ? monthsData[0] : null;
      
      // Extrair dados do dia atual
      const dayData: EnergyDayData | null = daysData && daysData.length > 0 ? daysData[0] : null;

      // Calcular valores
      const monthlyConsumption = monthData?.consumeKwh || monthData?.averageConsumption || 0;
      const dailyConsumption = dayData?.consumeKwh || dayData?.averageConsumption || 0;
      const cost = monthData?.cost || (monthData as any)?.account || 0;
      
      // currentUsage pode ser o consumo do dia atual ou um valor padrão
      const currentUsage = dailyConsumption || 0;

      setData({
        currentUsage,
        dailyConsumption,
        monthlyConsumption,
        cost,
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
