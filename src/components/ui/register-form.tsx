"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import useAuth from "@/hooks/useAuth";


export default function RegisterForm({ switchToLogin }: { switchToLogin: () => void }) {
  const { register, loading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [role, setRole] = useState("Selecione seu cargo");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await register(userName, email, password, role);
    if (success) {
      // O login automático já foi feito no hook useAuth
      // Não é necessário fazer nada aqui, pois o usuário será redirecionado automaticamente
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <Input
        type="text"
        placeholder="Nome"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        className="w-full border border-gray-300 p-2 rounded-md"
        required
      />

      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full border border-gray-300 p-2 rounded-md"
        required
      />

      <Input
        type="password"
        placeholder="Senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full border border-gray-300 p-2 rounded-md"
        required
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full border border-gray-300 text-gray-700">
            {role}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => setRole("Gerente")}>Gerente</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setRole("Colaborador")}>Colaborador</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 text-white p-2 rounded-md hover:bg-green-700"
      >
        {loading ? "Registrando..." : "Concluir Cadastro"}
      </Button>

      <Button
        variant="outline"
        className="w-full border border-gray-700 text-gray-700 hover:bg-gray-100"
        onClick={switchToLogin}
      >
        Voltar para Login
      </Button>
    </form>
  );
}
