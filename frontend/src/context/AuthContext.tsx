import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiCall } from '../lib/api';

interface User {
  id: string;
  nik: string;
  username: string;
  email: string;
  name: string;
  role: string;
  plant?: string;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthContext: Initializing, fetching /api/auth/me');
    apiCall('/api/auth/me')
      .then(data => {
        if (data.user) {
          console.log('AuthContext: User found:', data.user.username);
          setUser(data.user);
        }
      })
      .catch((err) => {
        console.log('AuthContext: Not logged in or error:', err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
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
