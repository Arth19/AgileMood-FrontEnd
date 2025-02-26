/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/auth-context";

export default function useAuth() {
  const router = useRouter();
  const { refreshUser } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    const formData = new URLSearchParams();
    formData.append("grant_type", "password");
    formData.append("username", email);
    formData.append("password", password);

    try {
      const response = await fetch(`${API_URL}/user/login`, {
        method: "POST",
        mode: "cors", // 🌟 Importante
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });
  
      if (!response.ok) {
        setError("Email ou senha incorretos. Tente novamente.");
        return false;
      }

      const data = await response.json();
      localStorage.setItem("token", data.access_token);
      
      // Atualiza o contexto do usuário antes de redirecionar
      await refreshUser();
      router.push("/home");
      return true;
    } catch (err: any) {
      setError(err.message || "Erro inesperado no login.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    const userData = {
      name,
      email,
      password,
      disabled: false,
      avatar: '',
      role: role.toLowerCase() === "gerente" ? "manager" : "employee",
    };

    try {
      console.log('Dados sendo enviados:', userData);
      console.log('URL da API:', API_URL);
      
      const response = await fetch(`${API_URL}/user/`, {
        method: "POST",
        mode: "cors",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Resposta da API:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        
        setError(errorData?.detail || "Erro ao cadastrar. Verifique os dados e tente novamente.");
        return false;
      }

      // Após o registro bem-sucedido, fazer login automaticamente
      const loginSuccess = await login(email, password);
      if (!loginSuccess) {
        setError("Registro realizado, mas houve um erro ao fazer login automático.");
        return false;
      }

      setSuccessMessage("Usuário cadastrado e logado com sucesso!");
      return true;
    } catch (err: any) {
      console.error('Erro durante o registro:', err);
      setError(err.message || "Erro inesperado no cadastro.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { login, register, loading, error, successMessage };
}
