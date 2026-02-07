import api from './api';
import { getCurrentUser } from './auth';


export interface EnergyYearData {
  year: number;
  consumeKwh: number;
  averageConsumption: number;
  cost?: number;
  [key: string]: any;
}

export interface EnergyMonthData {
  year: number;
  month: number;
  monthName?: string;
  consumeKwh: number;
  averageConsumption: number;
  cost?: number;
  [key: string]: any;
}

export interface EnergyDayData {
  year: number;
  month: number;
  day: number;
  date?: string;
  consumeKwh: number;
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
  consumeKwh: number;
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
    if (Array.isArray(response.data)) {
      response.data.forEach((item: any, index: number) => {
      });
    }
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
 * GET api/users/:userId/energyYears/:year/energyMonths
 * Retorna todos os meses do ano especificado
 */
export async function getEnergyMonths(params?: {
  year?: number;
  yearId?: number;
  startMonth?: number;
  endMonth?: number;
}): Promise<EnergyMonthData[]> {
  try {
    const userId = await getUserId();
    const year = params?.year || params?.yearId || new Date().getFullYear();
    
    // Rota hierárquica: /users/:userId/energyYears/:year/energyMonths
    const response = await api.get(`/users/${userId}/energyYears/${year}/energyMonths`);
    
    // A API retorna { data: { average, data: [...], total } }
    // Precisamos acessar response.data.data para obter o array de meses
    const responseData = response.data?.data || response.data;
    
    let data = Array.isArray(responseData) ? responseData : [responseData];
    
    // Filtrar por intervalo de meses se especificado
    if (params?.startMonth && params?.endMonth) {
      data = data.filter((item: EnergyMonthData) => 
        item.month >= params.startMonth! && item.month <= params.endMonth!
      );
    } else if (params?.startMonth) {
      data = data.filter((item: EnergyMonthData) => item.month === params.startMonth);
    }
    
    if (Array.isArray(data)) {
      data.forEach((item: any, index: number) => {
      });
    }
    
    return data;
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
 * GET api/users/:userId/energyYears/:yearId/energyMonths/:monthId/energyDays
 */
export async function getEnergyDays(params?: {
  year?: number;
  month?: number;
  yearId?: number;
  monthId?: number;
  startDay?: number;
  endDay?: number;
  startDate?: string;
  endDate?: string;
}): Promise<EnergyDayData[]> {
  try {
    const userId = await getUserId();
    const now = new Date();
    const year = params?.year || params?.yearId || now.getFullYear();
    const month = params?.month || params?.monthId || (now.getMonth() + 1);
    
    // Rota hierárquica: /users/:userId/energyYears/:yearId/energyMonths/:monthId/energyDays
    const response = await api.get(`/users/${userId}/energyYears/${year}/energyMonths/${month}/energyDays`, {
      params: {
        startDay: params?.startDay,
        endDay: params?.endDay,
        startDate: params?.startDate,
        endDate: params?.endDate,
      }
    });
    
    const responseData = response.data?.data || response.data;
    
    if (Array.isArray(responseData)) {
      responseData.forEach((item: any, index: number) => {
      });
    }
    
    return Array.isArray(responseData) ? responseData : (Array.isArray(response.data) ? response.data : []);
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


export const EnergyReportApi = {
  getEnergyYears,
  getEnergyMonths,
  getEnergyDays,
};

export default EnergyReportApi;

