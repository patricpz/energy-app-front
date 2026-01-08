import api from './api';
import { getCurrentUser } from './auth';

/**
 * Interface para criar/editar equipamento doméstico
 */
export interface DomesticEquipment {
  id?: string;
  name: string;
  consumeKwh: number;
  model: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Interface para resposta da API ao criar equipamento
 */
export interface CreateEquipmentResponse {
  equipment: DomesticEquipment;
  message?: string;
}

/**
 * Obtém o userId do usuário atual
 */
async function getUserId(): Promise<string> {
  try {
    const user = await getCurrentUser();
    
    console.log('🔍 getUserId - User from storage:', {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      hasToken: !!user?.token,
      fullUser: user ? { ...user, token: user.token ? '***' : undefined } : null,
    });
    
    if (!user) {
      console.error('❌ getUserId - Nenhum usuário encontrado no storage');
      throw new Error('Usuário não autenticado. Faça login novamente.');
    }
    
    if (!user.id) {
      console.error('❌ getUserId - Usuário encontrado mas sem ID:', user);
      throw new Error('Dados do usuário incompletos. Faça login novamente.');
    }
    
    console.log('✅ getUserId - ID encontrado:', user.id);
    return user.id;
  } catch (error: any) {
    console.error('❌ getUserId - Erro ao obter userId:', error);
    throw error;
  }
}

/**
 * Cadastrar equipamento doméstico
 * POST api/users/:userId/domesticEquipaments
 */
export async function createDevice(data: {
  name: string;
  consumeKwh: number;
  model: string;
}): Promise<CreateEquipmentResponse> {
  try {
    const userId = await getUserId();
    const response = await api.post<CreateEquipmentResponse>(
      `/users/${userId}/domesticEquipaments`,
      {
        name: data.name.trim(),
        consumeKwh: data.consumeKwh,
        model: data.model.trim(),
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error creating device:', error);
    if (error.response) {
      throw new Error(
        error.response.data?.message || 'Erro ao cadastrar equipamento'
      );
    } else if (error.request) {
      throw new Error('Erro de conexão. Verifique sua internet.');
    } else {
      throw new Error(error.message || 'Erro ao cadastrar equipamento');
    }
  }
}

/**
 * Listar equipamentos domésticos
 * GET api/users/:userId/domesticEquipaments
 */
export async function getDevices(): Promise<DomesticEquipment[]> {
  try {
    const userId = await getUserId();
    const response = await api.get<DomesticEquipment[]>(
      `/users/${userId}/domesticEquipaments`
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching devices:', error);
    if (error.response) {
      throw new Error(
        error.response.data?.message || 'Erro ao listar equipamentos'
      );
    } else if (error.request) {
      throw new Error('Erro de conexão. Verifique sua internet.');
    } else {
      throw new Error(error.message || 'Erro ao listar equipamentos');
    }
  }
}

/**
 * Detalhes de equipamento doméstico
 * GET api/users/:userId/domesticEquipaments/:id
 */
export async function getDeviceById(id: string): Promise<DomesticEquipment> {
  try {
    const userId = await getUserId();
    const response = await api.get<DomesticEquipment>(
      `/users/${userId}/domesticEquipaments/${id}`
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching device details:', error);
    if (error.response) {
      throw new Error(
        error.response.data?.message || 'Erro ao buscar detalhes do equipamento'
      );
    } else if (error.request) {
      throw new Error('Erro de conexão. Verifique sua internet.');
    } else {
      throw new Error(error.message || 'Erro ao buscar detalhes do equipamento');
    }
  }
}

/**
 * Editar equipamento doméstico
 * PUT api/users/:userId/domesticEquipaments/:id
 */
export async function updateDevice(
  id: string,
  data: {
    name: string;
    consumeKwh: number;
    model: string;
  }
): Promise<CreateEquipmentResponse> {
  try {
    const userId = await getUserId();
    const response = await api.put<CreateEquipmentResponse>(
      `/users/${userId}/domesticEquipaments/${id}`,
      {
        name: data.name.trim(),
        consumeKwh: data.consumeKwh,
        model: data.model.trim(),
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error updating device:', error);
    if (error.response) {
      throw new Error(
        error.response.data?.message || 'Erro ao editar equipamento'
      );
    } else if (error.request) {
      throw new Error('Erro de conexão. Verifique sua internet.');
    } else {
      throw new Error(error.message || 'Erro ao editar equipamento');
    }
  }
}

/**
 * Deletar equipamento doméstico
 * DELETE api/users/:userId/domesticEquipaments/:id
 */
export async function deleteDevice(id: string): Promise<void> {
  try {
    const userId = await getUserId();
    await api.delete(`/users/${userId}/domesticEquipaments/${id}`);
  } catch (error: any) {
    console.error('Error deleting device:', error);
    if (error.response) {
      throw new Error(
        error.response.data?.message || 'Erro ao deletar equipamento'
      );
    } else if (error.request) {
      throw new Error('Erro de conexão. Verifique sua internet.');
    } else {
      throw new Error(error.message || 'Erro ao deletar equipamento');
    }
  }
}

/**
 * Exportar todas as funções como um objeto
 */
export const DevicesApi = {
  createDevice,
  getDevices,
  getDeviceById,
  updateDevice,
  deleteDevice,
};

export default DevicesApi;