import axios from 'axios';
import { getJSON, removeItem, storageKeys } from '../storage/storage';

/**
 * Cliente HTTP genérico compartilhado.
 *
 * Não conhece detalhes de nenhum módulo: apenas injeta o token de
 * autenticação (via abstração de storage) e trata expiração de sessão.
 */

// URL da API
const API_URL = 'https://energy-app-backend-nqub.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000, // Aumentar timeout para 30s (API pode ser lenta)
});

// Interceptor para adicionar token automaticamente
api.interceptors.request.use(
  async (config) => {
    try {
      // Rotas que NÃO precisam de token (autenticação)
      const url = config.url || '';
      const method = config.method?.toLowerCase() || '';

      // Verifica se é rota de login ou registro (POST /users sem parâmetros)
      const isLoginRoute = url === '/users/login' || url.includes('/users/login');
      const isRegisterRoute = method === 'post' && url === '/users' && !url.includes('/users/');

      const isAuthRoute = isLoginRoute || isRegisterRoute;

      if (!isAuthRoute) {
        const user = await getJSON<{ token?: string }>(storageKeys.currentUser);
        if (user?.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        } else {
          console.warn('⚠️ Nenhum usuário encontrado no storage');
        }
      }
    } catch (error) {
      console.warn('Error getting token from storage:', error);
    }

    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    console.error('❌ API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      data: error.response?.data,
    });

    if (error.response?.status === 401) {
      // Token inválido ou expirado - limpar dados de autenticação
      await removeItem(storageKeys.currentUser);
    }
    return Promise.reject(error);
  }
);

export default api;