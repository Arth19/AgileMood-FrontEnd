"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import {jwtDecode} from "jwt-decode";

interface User {
  name: string;
  email: string;
  role: string;
  id: number;
}

interface DecodedToken {
  sub: string; // email no campo 'sub'
  exp: number;
}

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const fetchUserProfile = async (email: string) => {
    const token = localStorage.getItem("token");
    try {
        console.log(`Getting user ${email}`)
      const response = await fetch(`${API_URL}/user/${email}`, {
        method: "GET",
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

  const decodeAndSetUser = () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded: DecodedToken = jwtDecode(token);
        console.log(decoded)
        if (decoded.exp * 1000 < Date.now()) {
          logout(); // Token expirado
        } else {
          fetchUserProfile(decoded.sub); // 🎯 Busca os dados usando o email (sub)
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
    setUser(null);
    router.push("/login");
  };

  useEffect(() => {
    decodeAndSetUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
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
