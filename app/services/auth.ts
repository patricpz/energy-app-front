import AsyncStorage from '@react-native-async-storage/async-storage';

// Keys used in AsyncStorage
const USERS_KEY = '@energyapp:users';
const AUTH_KEY = '@energyapp:currentUser';

export interface User {
  id: string;
  name?: string;
  email: string;
  password?: string; // stored only in local dev mode — do NOT do this in production
  token?: string;
}

const generateId = () => Math.random().toString(36).slice(2, 9);

const generateToken = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

async function readUsers(): Promise<User[]> {
  try {
    const raw = await AsyncStorage.getItem(USERS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as User[];
  } catch (err) {
    console.warn('auth:readUsers error', err);
    return [];
  }
}

async function writeUsers(users: User[]) {
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export async function register(user: { name?: string; email: string; password: string }): Promise<User> {
  const users = await readUsers();

  const exists = users.find((u) => u.email.toLowerCase() === user.email.toLowerCase());
  if (exists) throw new Error('User already exists');

  const newUser: User = {
    id: generateId(),
    name: user.name,
    email: user.email.toLowerCase(),
    password: user.password,
    token: generateToken(),
  };

  users.push(newUser);
  await writeUsers(users);

  // Save as current
  await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(newUser));

  return newUser;
}

export async function login(email: string, password: string): Promise<User> {
  const users = await readUsers();
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (!user) throw new Error('User not found');
  if (user.password !== password) throw new Error('Invalid credentials');

  // refresh token and store
  const updated = { ...user, token: generateToken() };
  const updatedUsers = users.map((u) => (u.id === user.id ? updated : u));
  await writeUsers(updatedUsers);

  await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(updated));

  return updated;
}

export async function logout(): Promise<void> {
  await AsyncStorage.removeItem(AUTH_KEY);
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const raw = await AsyncStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch (err) {
    console.warn('auth:getCurrentUser', err);
    return null;
  }
}

export async function clearAllAuthData(): Promise<void> {
  await AsyncStorage.removeItem(AUTH_KEY);
  await AsyncStorage.removeItem(USERS_KEY);
}

export default {
  register,
  login,
  logout,
  getCurrentUser,
  clearAllAuthData,
};
