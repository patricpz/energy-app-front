import { useAuthContext } from '../context/AuthContext';

/**
 * Hook de autenticação. Envolve o contexto para que os módulos
 * dependam desta API em vez de acessar o Context diretamente.
 */
export default function useAuth() {
  return useAuthContext();
}