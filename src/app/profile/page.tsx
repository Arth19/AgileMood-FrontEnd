"use client";

import { useState } from "react";
import Sidebar from "@/components/ui/sidebar"; // Importando a Sidebar
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";

// Mock do usuário
const mockUser = {
  firstName: "Estom",
  lastName: "Junior",
  email: "estomj@ciandt.com",
  avatar: "", // Começa vazio, então usa as iniciais do nome
};

// Gera a URL das iniciais do usuário (fallback)
const getInitialsAvatar = (name: string, surname: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name + " " + surname)}&background=random&size=128`;

// Função para gerar avatares DiceBear aleatórios
const generateAvatars = () => {
  return Array.from({ length: 6 }).map(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_, index) => `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(`User${Math.random() * 10000}`)}`
  );
};

export default function ProfilePage() {
  const [user, setUser] = useState(mockUser);
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [avatarOptions, setAvatarOptions] = useState(generateAvatars());

  // Define o avatar escolhido
  const handleSelectAvatar = (avatar: string) => {
    setUser((prev) => ({ ...prev, avatar }));
    setIsEditingAvatar(false);
  };

  // Reseta para as iniciais do nome
  const handleRemoveAvatar = () => {
    setUser((prev) => ({ ...prev, avatar: "" }));
    setIsEditingAvatar(false);
  };

  // Gera novos avatares aleatórios ao clicar no botão
  const fetchNewAvatars = () => {
    setAvatarOptions(generateAvatars());
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar fixa */}
      <Sidebar />

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-100 p-6">
        <div className="w-full max-w-2xl p-6 shadow-lg bg-white rounded-lg">
          <h2 className="text-2xl font-bold">Configurações Pessoais</h2>

          {/* Avatar */}
          <div className="flex items-center space-x-6 mt-6">
            <Image
              src={user.avatar || getInitialsAvatar(user.firstName, user.lastName)}
              alt="Avatar"
              width={80}
              height={80}
              className="rounded-full border"
              unoptimized
            />
            <Button onClick={() => setIsEditingAvatar(true)} className="bg-blue-600 hover:bg-blue-700">
              Editar Avatar
            </Button>
          </div>

          {/* Campos de Nome */}
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-600">Nome</label>
                <input value={user.firstName} className="border p-2 w-full rounded" readOnly />
              </div>
              <div>
                <label className="block text-gray-600">Sobrenome</label>
                <input value={user.lastName} className="border p-2 w-full rounded" readOnly />
              </div>
            </div>
            <div>
              <label className="block text-gray-600">E-mail</label>
              <input value={user.email} className="border p-2 w-full bg-gray-200 rounded" readOnly />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button className="bg-green-600 hover:bg-green-700">Salvar</Button>
          </div>
        </div>

        {/* Modal para Selecionar Avatar */}
        {isEditingAvatar && (
          <Dialog open={isEditingAvatar} onOpenChange={setIsEditingAvatar}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Escolha um avatar</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-3 gap-4">
                {avatarOptions.map((avatar, index) => (
                  <button key={index} onClick={() => handleSelectAvatar(avatar)}>
                    <Image src={avatar} alt={`Avatar ${index}`} width={80} height={80} className="rounded-full border" unoptimized />
                  </button>
                ))}
              </div>
              <div className="flex justify-center mt-4 space-x-4">
                <Button onClick={fetchNewAvatars} className="bg-blue-500 hover:bg-blue-700">
                  Carregar Novos Avatares 🔄
                </Button>
                <Button onClick={handleRemoveAvatar} className="bg-red-600 hover:bg-red-700">
                  Não usar avatar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
