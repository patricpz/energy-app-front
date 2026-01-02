import api from './api';
import { getCurrentUser } from './auth';


export interface EnergyYearData {
  year: number;
  totalConsumption: number;
  averageConsumption: number;
  cost?: number;
  [key: string]: any;
}

export interface EnergyMonthData {
  year: number;
  month: number;
  monthName?: string;
  totalConsumption: number;
  averageConsumption: number;
  cost?: number;
  [key: string]: any;
}

export interface EnergyDayData {
  year: number;
  month: number;
  day: number;
  date?: string;
  totalConsumption: number;
  averageConsumption: number;
  cost?: number;
  [key: string]: any;
}

export interface EnergyHourData {
  year: number;
  month: number;
  day: number;
  hour: number;
  dateTime?: string;
  consumption: number;
  cost?: number;
  [key: string]: any;
}

/**
 * Obtém o userId do usuário atual
 */
async function getUserId(): Promise<string> {
  const user = await getCurrentUser();
  if (!user || !user.id) {
    throw new Error('Usuário não autenticado');
  }
  return user.id;
}

/**
 * Relatório de anos
 * GET api/users/:userId/energyYears
 */
export async function getEnergyYears(params?: {
  startYear?: number;
  endYear?: number;
}): Promise<EnergyYearData[]> {
  try {
    const userId = await getUserId();
    const response = await api.get(`/users/${userId}/energyYears`, { params });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching energy years:', error);
    if (error.response) {
      throw new Error(error.response.data?.message || 'Erro ao buscar relatório de anos');
    } else if (error.request) {
      throw new Error('Erro de conexão. Verifique sua internet.');
    } else {
      throw new Error(error.message || 'Erro ao buscar relatório de anos');
    }
  }
}

/**
 * Relatório de meses
 * GET api/users/:userId/energyMonths
 */
export async function getEnergyMonths(params?: {
  year?: number;
  startMonth?: number;
  endMonth?: number;
}): Promise<EnergyMonthData[]> {
  try {
    const userId = await getUserId();
    const response = await api.get(`/users/${userId}/energyMonths`, { params });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching energy months:', error);
    if (error.response) {
      throw new Error(error.response.data?.message || 'Erro ao buscar relatório de meses');
    } else if (error.request) {
      throw new Error('Erro de conexão. Verifique sua internet.');
    } else {
      throw new Error(error.message || 'Erro ao buscar relatório de meses');
    }
  }
}

/**
 * Relatório de dias
 * GET api/users/:userId/energyDays
 */
export async function getEnergyDays(params?: {
  year?: number;
  month?: number;
  startDay?: number;
  endDay?: number;
  startDate?: string;
  endDate?: string;
}): Promise<EnergyDayData[]> {
  try {
    const userId = await getUserId();
    const response = await api.get(`/users/${userId}/energyDays`, { params });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching energy days:', error);
    if (error.response) {
      throw new Error(error.response.data?.message || 'Erro ao buscar relatório de dias');
    } else if (error.request) {
      throw new Error('Erro de conexão. Verifique sua internet.');
    } else {
      throw new Error(error.message || 'Erro ao buscar relatório de dias');
    }
  }
}

/**
 * Relatório de horas
 * GET api/users/:userId/energyHours
 */
export async function getEnergyHours(params?: {
  year?: number;
  month?: number;
  day?: number;
  date?: string;
  startHour?: number;
  endHour?: number;
}): Promise<EnergyHourData[]> {
  try {
    const userId = await getUserId();
    const response = await api.get(`/users/${userId}/energyHours`, { params });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching energy hours:', error);
    if (error.response) {
      throw new Error(error.response.data?.message || 'Erro ao buscar relatório de horas');
    } else if (error.request) {
      throw new Error('Erro de conexão. Verifique sua internet.');
    } else {
      throw new Error(error.message || 'Erro ao buscar relatório de horas');
    }
  }
}

/**
 * Exportar todas as funções como um objeto
 */
export const EnergyReportApi = {
  getEnergyYears,
  getEnergyMonths,
  getEnergyDays,
  getEnergyHours,
};

export default EnergyReportApi;

