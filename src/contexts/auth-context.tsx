// 🚀 Atualização do AuthContext com refreshUser
"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

interface User {
  name: string;
  email: string;
  role: string;
  id: number;
  team_id?: number;
  avatar?: string;
}

interface DecodedToken {
  sub: string;
  exp: number;
}

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  logout: () => void;
  refreshUser: () => Promise<void>; // 🎯 NOVO: Atualiza o estado global do usuário
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const fetchUserProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      logout();
      return;
    }
  
    try {
      const response = await fetch(`${API_URL}/user/logged`, {
        method: "GET",
        mode: "cors",
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        logout();
      }
    } catch (error) {
      console.error("Erro ao buscar informações do usuário:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  // 🚀 NOVA FUNÇÃO para forçar atualização do usuário no estado global
  const refreshUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      logout();
      return;
    }
  
    setLoading(true);
    await fetchUserProfile();
  };

  const decodeAndSetUser = () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded: DecodedToken = jwtDecode(token);
        if (decoded.exp * 1000 < Date.now()) {
          logout();
        } else {
          fetchUserProfile();
        }
      } catch (error) {
        console.error("Erro ao decodificar o token:", error);
        logout();
      }
    } else {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    document.cookie = "agile-mood-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    setUser(null);
    router.push("/login");
  };

  useEffect(() => {
    decodeAndSetUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext deve ser usado dentro do AuthProvider");
  }
  return context;
};
