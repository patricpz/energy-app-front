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
    console.log('Fetched energy years:', response.data);
    console.log('Energy years array length:', response.data?.length || 0);
    if (Array.isArray(response.data)) {
      response.data.forEach((item: any, index: number) => {
        console.log(`Energy year [${index}]:`, item);
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
    console.log('Fetched energy months:', response.data);
    console.log('Energy months array length:', response.data?.length || 0);
    
    let data = Array.isArray(response.data) ? response.data : [response.data];
    
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
        console.log(`Energy month [${index}]:`, item);
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
    console.log('Fetched energy days:', response.data);
    console.log('Energy days array length:', response.data?.length || 0);
    if (Array.isArray(response.data)) {
      response.data.forEach((item: any, index: number) => {
        console.log(`Energy day [${index}]:`, item);
      });
    }
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
 * Relatório de horas (consumo em tempo real)
 * GET api/users/:userId/energyYears/:yearId/energyMonths/:monthId/energyDays/:dayId/energyHours
 */
// export async function getEnergyHours(params?: {
//   year?: number;
//   month?: number;
//   day?: number;
//   yearId?: number;
//   monthId?: number;
//   dayId?: number;
//   date?: string;
//   startHour?: number;
//   endHour?: number;
// }): Promise<EnergyHourData[]> {
//   try {
//     const userId = await getUserId();
//     const now = new Date();
//     const year = params?.year || params?.yearId || now.getFullYear();
//     const month = params?.month || params?.monthId || (now.getMonth() + 1);
//     const day = params?.day || params?.dayId || now.getDate();
    
//     // Rota hierárquica: /users/:userId/energyYears/:yearId/energyMonths/:monthId/energyDays/:dayId/energyHours
//     const response = await api.get(`/users/${userId}/energyYears/${year}/energyMonths/${month}/energyDays/${day}/energyHours`, {
//       params: {
//         startHour: params?.startHour,
//         endHour: params?.endHour,
//       }
//     });
//     console.log('Fetched energy hours:', response.data);
//     console.log('Energy hours array length:', response.data?.length || 0);
//     if (Array.isArray(response.data)) {
//       response.data.forEach((item: any, index: number) => {
//         console.log(`Energy hour [${index}]:`, item);
//       });
//     }
//     return response.data;
//   } catch (error: any) {
//     console.error('Error fetching energy hours:', error);
//     if (error.response) {
//       throw new Error(error.response.data?.message || 'Erro ao buscar relatório de horas');
//     } else if (error.request) {
//       throw new Error('Erro de conexão. Verifique sua internet.');
//     } else {
//       throw new Error(error.message || 'Erro ao buscar relatório de horas');
//     }
//   }
// }

/**
 * Exportar todas as funções como um objeto
 */
export const EnergyReportApi = {
  getEnergyYears,
  getEnergyMonths,
  getEnergyDays,
  // getEnergyHours,
};

export default EnergyReportApi;

