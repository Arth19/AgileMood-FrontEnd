/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/ui/sidebar";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useAuthContext } from "@/contexts/auth-context";
import ProtectedRoute from "@/components/ui/protected-route";

const getInitialsAvatar = (name: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=128`;

const generateAvatars = () => {
  return Array.from({ length: 6 }).map(
    (_, index) => `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(`User${Math.random() * 10000}`)}`
  );
};

export default function ProfilePage() {
  const { user,refreshUser } = useAuthContext();
  const [avatar, setAvatar] = useState<string>(user?.avatar || "");
  const [originalAvatar, setOriginalAvatar] = useState<string>(user?.avatar || ""); // Para comparar alterações
  const [teamName, setTeamName] = useState<string>("Carregando...");
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [avatarOptions, setAvatarOptions] = useState(generateAvatars());
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false); // 🎯 Estado para exibir o Dialog

console.log('USER IN PROFILE: ', user)
console.log('ORIGINAL AVATAR: ', originalAvatar)

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // 🔗 Busca o nome do time com o team_id
  useEffect(() => {
    const fetchTeamName = async () => {
      if (user?.team_id) {
        try {
          const response = await fetch(`${API_URL}/teams/${user.team_id}`, {
            mode: "cors",
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });
          if (response.ok) {
            const data = await response.json();
            setTeamName(data.team_data.name);
          } else {
            setTeamName("Erro ao carregar o time.");
          }
        } catch (error) {
          console.error("Erro ao buscar o nome do time:", error);
          setTeamName("Erro ao carregar o time.");
        }
      } else {
        setTeamName("Nenhum time atribuído.");
      }
    };

    fetchTeamName();
  }, [user?.team_id, API_URL]);

  // ✅ Atualização do avatar via PUT
  const handleSaveAvatar = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`${API_URL}/user/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ avatar }),
      });
  
      if (response.ok) {
        await refreshUser(); // 🎯 Atualiza o estado global do usuário
        setOriginalAvatar(avatar);
        setShowSuccessDialog(true);
      } else {
        alert("Erro ao atualizar o avatar. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao salvar o avatar:", error);
      alert("Erro ao salvar o avatar.");
    } finally {
      setIsSaving(false);
    }
  };
  const handleSelectAvatar = (avatar: string) => {
    setAvatar(avatar);
    setIsEditingAvatar(false);
  };

  const handleRemoveAvatar = () => {
    setAvatar("");
    setIsEditingAvatar(false);
  };

  const fetchNewAvatars = () => {
    setAvatarOptions(generateAvatars());
  };

  return (
    <ProtectedRoute>
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
              src={avatar || getInitialsAvatar(user?.name || "")}
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

          {/* Dados do Usuário */}
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-600">Nome</label>
                <input value={user?.name || ""} className="border p-2 w-full bg-gray-200 rounded" readOnly />
              </div>
              <div>
                <label className="block text-gray-600">Time</label>
                <input value={teamName} className="border p-2 w-full bg-gray-200 rounded" readOnly />
              </div>
            </div>
            <div>
              <label className="block text-gray-600">E-mail</label>
              <input value={user?.email} className="border p-2 w-full bg-gray-200 rounded" readOnly />
            </div>
            <div>
              <label className="block text-gray-600">Cargo</label>
              <input
                value={user?.role === "manager" ? "Gerente" : "Colaborador"}
                className="border p-2 w-full bg-gray-200 rounded"
                readOnly
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleSaveAvatar}
              className={`bg-green-600 hover:bg-green-700 ${avatar === originalAvatar ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={avatar === originalAvatar || isSaving}
            >
              {isSaving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>
          {/* 🎉 Dialog de sucesso ao salvar */}
          <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>✅ Avatar Atualizado com Sucesso!</DialogTitle>
            </DialogHeader>
            <p className="text-gray-600 text-center">
              Seu avatar foi salvo com sucesso. Ele já está visível no seu perfil.
            </p>
            <DialogFooter>
              <Button
                onClick={() => setShowSuccessDialog(false)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                OK
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal para Seleção de Avatar */}
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
    </ProtectedRoute>
  );
}
