import axios from 'axios';
import { Platform } from 'react-native';

const API_URL = Platform.OS === 'android' 
  ? 'http://10.0.2.2:3000/api'
  : 'http://https://energy-app-backend-nqub.onrender.com/';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 5000,
});

api.interceptors.request.use(
  (config) => {
    // You can add auth token here if needed
    // const token = await AsyncStorage.getItem('userToken');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// API methods for energy data
export const EnergyApi = {
  // Get energy consumption data
  getEnergyConsumption: async (params: { startDate?: string; endDate?: string } = {}) => {
    try {
      const response = await api.get('/energy/consumption', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching energy consumption:', error);
      throw error;
    }
  },

  // Get current energy usage
  getCurrentUsage: async () => {
    try {
      const response = await api.get('/energy/current-usage');
      return response.data;
    } catch (error) {
      console.error('Error fetching current energy usage:', error);
      throw error;
    }
  },

  // Get energy statistics
  getEnergyStats: async (period: 'day' | 'week' | 'month' = 'day') => {
    try {
      const response = await api.get(`/energy/stats?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching energy stats:', error);
      throw error;
    }
  },

  // Submit meter reading
  submitMeterReading: async (readingData: { value: number; timestamp: string; unit?: string }) => {
    try {
      const response = await api.post('/energy/meter-readings', readingData);
      return response.data;
    } catch (error) {
      console.error('Error submitting meter reading:', error);
      throw error;
    }
  },
};

export default api;
