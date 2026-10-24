import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Abstração centralizada sobre o AsyncStorage.
 *
 * Nenhum módulo deve chamar AsyncStorage diretamente: use este módulo.
 * Isso permite trocar o backend de persistência sem alterar os módulos.
 */

export const storageKeys = {
  currentUser: '@energyapp:currentUser',
} as const;

export type StorageKey = (typeof storageKeys)[keyof typeof storageKeys];

export async function getItem(key: string): Promise<string | null> {
  return AsyncStorage.getItem(key);
}

export async function setItem(key: string, value: string): Promise<void> {
  await AsyncStorage.setItem(key, value);
}

export async function removeItem(key: string): Promise<void> {
  await AsyncStorage.removeItem(key);
}

export async function getJSON<T>(key: string): Promise<T | null> {
  const raw = await getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function setJSON<T>(key: string, value: T): Promise<void> {
  await setItem(key, JSON.stringify(value));
}

export async function clear(): Promise<void> {
  await AsyncStorage.clear();
}