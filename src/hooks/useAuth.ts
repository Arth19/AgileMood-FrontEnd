/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function useAuth() {
  const router = useRouter();
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
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });

      if (!response.ok) {
        setError("Email ou senha incorretos. Tente novamente.");
        return false;
      }

      const data = await response.json();
      localStorage.setItem("token", data.access_token);
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
      role: role.toLowerCase() === "gerente" ? "manager" : "employee",
    };

    try {
      const response = await fetch(`${API_URL}/user/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        setError("Erro ao cadastrar. Tente novamente.");
        return false;
      }

      setSuccessMessage("Usuário cadastrado com sucesso!");
      return true;
    } catch (err: any) {
      setError(err.message || "Erro inesperado no cadastro.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { login, register, loading, error, successMessage };
}
