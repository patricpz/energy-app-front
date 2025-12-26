import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

// Key used in AsyncStorage
const AUTH_KEY = '@energyapp:currentUser';

export interface User {
  id: string;
  name?: string;
  email: string;
  token?: string;
  address?: {
    state: string;
    city: string;
    zipCode: string;
    district: string;
    street: string;
    number: string;
    complement?: string;
  };
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface RegisterResponse {
  user: User;
  token: string;
}

/**
 * Faz login na API usando email e password
 * POST api/users/login
 */
export async function login(email: string, password: string): Promise<User> {
  try {
    const response = await api.post<LoginResponse>('/users/login', {
      email: email.trim().toLowerCase(),
      password,
    });

    const { user, token } = response.data;

    // Criar objeto de usuário com token
    const userWithToken: User = {
      ...user,
      token,
    };

    // Salvar no AsyncStorage
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(userWithToken));

    return userWithToken;
  } catch (error: any) {
    if (error.response) {
      // Erro da API
      const message = error.response.data?.message || error.response.data?.error || 'Erro ao fazer login';
      throw new Error(message);
    } else if (error.request) {
      // Erro de rede
      throw new Error('Erro de conexão. Verifique sua internet.');
    } else {
      // Outro erro
      throw new Error(error.message || 'Erro ao fazer login');
    }
  }
}

/**
 * Registra um novo usuário na API
 * POST api/users
 */
export async function register(userData: {
  name?: string;
  email: string;
  password: string;
  address?: {
    state: string;
    city: string;
    zipCode: string;
    district: string;
    street: string;
    number: string;
    complement?: string;
  };
}): Promise<User> {
  try {
    // Preparar payload base
    const payload: any = {
      name: userData.name?.trim() || '',
      email: userData.email.trim().toLowerCase(),
      password: userData.password,
    };

    // Adicionar endereço apenas se fornecido
    if (userData.address) {
      payload.address = userData.address;
    }

    // Log para debug
    const fullUrl = `${api.defaults.baseURL}/users`;
    console.log('📤 Register Request:', {
      fullUrl,
      baseURL: api.defaults.baseURL,
      endpoint: '/users',
      payload: { ...payload, password: '***' }, // Não logar senha
      headers: api.defaults.headers,
    });

    // Criar uma requisição sem o interceptor de token para registro
    const response = await api.post<RegisterResponse>('/users', payload);

    console.log('✅ Register Response:', {
      status: response.status,
      data: response.data,
    });

    // A API pode retornar de diferentes formas
    let userFromResponse: User;
    let token: string;

    if (response.data.user && response.data.token) {
      // Formato: { user: {...}, token: "..." }
      userFromResponse = response.data.user;
      token = response.data.token;
    } else if ((response.data as any).token) {
      // Formato: { ...userData, token: "..." }
      const responseData = response.data as any;
      const { token: responseToken, ...user } = responseData;
      userFromResponse = user as User;
      token = responseToken;
    } else {
      // Formato: apenas dados do usuário
      userFromResponse = response.data as any as User;
      token = (response.data as any).token || '';
    }

    // Criar objeto de usuário com token
    const userWithToken: User = {
      ...userFromResponse,
      token,
    };

    // Salvar no AsyncStorage
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(userWithToken));

    return userWithToken;
  } catch (error: any) {
    console.error('Register error:', error);
    
    if (error.response) {
      // Erro da API
      const data = error.response.data;
      let message = 'Erro ao criar conta';
      
      // Tentar extrair mensagem de erro de diferentes formatos
      if (data?.message) {
        message = data.message;
      } else if (data?.error) {
        message = data.error;
      } else if (typeof data === 'string') {
        message = data;
      } else if (Array.isArray(data?.errors)) {
        // Se for array de erros de validação
        message = data.errors.map((e: any) => e.message || e).join(', ');
      } else if (data?.errors && typeof data.errors === 'object') {
        // Se for objeto de erros
        const errorMessages = Object.values(data.errors).flat();
        message = errorMessages.join(', ');
      }
      
      // Incluir status code se disponível
      const status = error.response.status;
      if (status === 400) {
        message = message || 'Dados inválidos. Verifique os campos preenchidos.';
      } else if (status === 409) {
        message = message || 'Este email já está cadastrado.';
      } else if (status === 422) {
        message = message || 'Dados de validação inválidos.';
      }
      
      throw new Error(message);
    } else if (error.request) {
      // Erro de rede
      throw new Error('Erro de conexão. Verifique sua internet e tente novamente.');
    } else {
      // Outro erro
      throw new Error(error.message || 'Erro ao criar conta. Tente novamente.');
    }
  }
}

/**
 * Faz logout removendo o token do AsyncStorage
 */
export async function logout(): Promise<void> {
  await AsyncStorage.removeItem(AUTH_KEY);
}

/**
 * Obtém o usuário atual do AsyncStorage
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const raw = await AsyncStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const user = JSON.parse(raw) as User;
    
    // Verificar se o token existe
    if (!user.token) {
      await AsyncStorage.removeItem(AUTH_KEY);
      return null;
    }
    
    return user;
  } catch (err) {
    console.warn('auth:getCurrentUser error', err);
    await AsyncStorage.removeItem(AUTH_KEY);
    return null;
  }
}

/**
 * Limpa todos os dados de autenticação
 */
export async function clearAllAuthData(): Promise<void> {
  await AsyncStorage.removeItem(AUTH_KEY);
}

export default {
  register,
  login,
  logout,
  getCurrentUser,
  clearAllAuthData,
};
