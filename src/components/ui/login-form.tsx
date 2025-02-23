"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useAuth from "@/hooks/useAuth";
import AlertDialog from "./alert-dialog";


export default function LoginForm({ switchToRegister }: { switchToRegister: () => void }) {
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showErrorDialog, setShowErrorDialog] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);
    if (!success) setShowErrorDialog(true); // Se falhar, exibe o alerta
  };

  return (
    <>
      <form className="space-y-4" onSubmit={handleSubmit}>
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

        <Button type="submit" disabled={loading} className="w-full bg-blue-700 text-white p-2 rounded-md hover:bg-blue-800">
          {loading ? "Entrando..." : "Entrar"}
        </Button>

        <Button
          variant="outline"
          className="w-full border border-blue-700 text-blue-700 hover:bg-blue-100"
          onClick={switchToRegister}
        >
          Inscrever-se
        </Button>
      </form>

      {/* AlertDialog do ShadCN UI para mensagens de erro */}
      <AlertDialog
        isOpen={showErrorDialog}
        message={error ?? "Erro ao fazer login. Verifique suas credenciais."}
        onClose={() => setShowErrorDialog(false)}
      />
    </>
  );
}
