"use client"; // Necessário para usar useState no Next.js App Router
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { useRouter } from "next/navigation"


import logo from "../../public/logo.png";
import nameLogo from "../../public/nameLogo.png";


export default function LoginPage() {
const router = useRouter();
  const [isRegistering, setIsRegistering] = useState(false);
  const [role, setRole] = useState("Selecione seu cargo");

  const handleLogin = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Evita o reload da página
    router.push('/home');
  };

  return (
    <div className="flex h-screen">
      {/* Lado esquerdo - Formulário de Login */}
      <div className="w-1/2 flex flex-col justify-center items-center bg-white">
        <Image src={logo} alt="Logo" width={120} height={120} className="mb-6" />

        <div className="w-80">
          <form className="space-y-4">
            {/* Campo de Email */}
            <div>
              <Input type="email" placeholder="Email" className="w-full border border-gray-300 p-2 rounded-md" />
            </div>

            {/* Campo de Senha */}
            <div>
              <Input type="password" placeholder="Senha" className="w-full border border-gray-300 p-2 rounded-md" />
            </div>

            {/* Campos extras aparecem ao clicar em "Inscrever-se" */}
            {isRegistering && (
              <>
                {/* Nome do Usuário */}
                <div>
                  <Input type="text" placeholder="Como gostaria de ser chamado?" className="w-full border border-gray-300 p-2 rounded-md" />
                </div>

                {/* Dropdown para escolher entre Gerente ou Colaborador */}
                <div>
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
                </div>
              </>
            )}

            {/* Botões de Ação */}
            <div className="flex space-x-4">
              {/* Botão de Entrar */}
              {!isRegistering && (
                    <Button onClick={handleLogin} className="w-full bg-blue-700 text-white p-2 rounded-md hover:bg-blue-800">
                        Entrar
                    </Button>
              )}

              {/* Botão de Inscrever-se */}
              <Button
                variant="outline"
                className="w-full border border-blue-700 text-blue-700 hover:bg-blue-100"
                onClick={(e) => {
                  e.preventDefault(); // Evita o reload da página
                  setIsRegistering(!isRegistering); // Alterna entre login e cadastro
                }}
              >
                Inscrever-se
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Lado direito - Logo e Nome */}
      <div className="w-1/2 flex justify-center items-center bg-blue-700 text-white">
        <Image src={nameLogo} alt="Logo" width={280} height={120} className="mb-6" />
      </div>
    </div>
  );
}
