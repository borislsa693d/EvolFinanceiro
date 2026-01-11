import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authAPI } from '../lib/api';

interface User {
  id: string;
  email: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  telegram?: string;
  created_at: string;
  updated_at?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, full_name?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se usuário está autenticado ao carregar
    checkAuth();
  }, []);

  const checkAuth = async () => {
    // Limpar dados antigos do localStorage (exceto auth_token)
    const authToken = localStorage.getItem('auth_token');
    localStorage.clear();
    if (authToken) {
      localStorage.setItem('auth_token', authToken);
    }

    const token = localStorage.getItem('auth_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const userData = await authAPI.getMe();
      setUser(userData);
    } catch (error) {
      // Token inválido ou expirado
      console.error('Auth error:', error);
      localStorage.removeItem('auth_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, full_name?: string) => {
    const userData = await authAPI.register(email, password, full_name);
    // Após registrar, fazer login automático
    await signIn(email, password);
  };

  const signIn = async (email: string, password: string) => {
    await authAPI.login(email, password);
    // Buscar dados do usuário
    const userData = await authAPI.getMe();
    setUser(userData);
  };

  const signOut = async () => {
    authAPI.logout();
    setUser(null);
  };

  const updateUser = async () => {
    // Atualizar dados do usuário do servidor
    try {
      const userData = await authAPI.getMe();
      setUser(userData);
    } catch (error) {
      console.error('Erro ao atualizar dados do usuário:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
