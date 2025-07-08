/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/ui/sidebar";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useAuthContext } from "@/contexts/auth-context";
import ProtectedRoute from "@/components/ui/protected-route";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Camera, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";

const getInitialsAvatar = (name: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=128`;

const generateAvatars = () => {
  return Array.from({ length: 6 }).map(
    (_, index) => `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(`User${Math.random() * 10000}`)}`
  );
};

export default function ProfilePage() {
  const { user, refreshUser } = useAuthContext();
  const [avatar, setAvatar] = useState<string>(user?.avatar || "");
  const [originalAvatar, setOriginalAvatar] = useState<string>(user?.avatar || "");
  const [teamName, setTeamName] = useState<string>("Carregando...");
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [avatarOptions, setAvatarOptions] = useState(generateAvatars());
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const fallbackUrl =
  process.env.NODE_ENV === 'production'
    ? 'https://agilemood-backend-production.up.railway.app'
    : 'http://localhost:8000';

  const API_URL = process.env.NEXT_PUBLIC_API_URL || fallbackUrl;

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
        await refreshUser();
        setOriginalAvatar(avatar);
        toast.success("Avatar atualizado com sucesso!");
      } else {
        toast.error("Erro ao atualizar o avatar. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao salvar o avatar:", error);
      toast.error("Erro ao salvar o avatar.");
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
        <Sidebar />
        <div className="flex-1 overflow-y-auto bg-gray-50 p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Configurações do Perfil</h1>
                {avatar !== originalAvatar && (
                  <Button
                    onClick={handleSaveAvatar}
                    disabled={isSaving}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      "Salvar Alterações"
                    )}
                  </Button>
                )}
              </div>

              <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="profile">Perfil</TabsTrigger>
                  <TabsTrigger value="avatar">Avatar</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Informações Pessoais</CardTitle>
                      <CardDescription>
                        Suas informações básicas de perfil.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Nome</label>
                          <div className="mt-1 p-3 bg-gray-100 rounded-md">
                            {user?.name}
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Email</label>
                          <div className="mt-1 p-3 bg-gray-100 rounded-md">
                            {user?.email}
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Time</label>
                          <div className="mt-1 p-3 bg-gray-100 rounded-md">
                            {teamName}
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Cargo</label>
                          <div className="mt-1 flex items-center space-x-2">
                            <div className="p-3 bg-gray-100 rounded-md flex-1">
                              {user?.role === "manager" ? "Gerente" : "Colaborador"}
                            </div>
                            <Badge variant="outline" className={user?.role === "manager" ? "bg-blue-100" : "bg-green-100"}>
                              {user?.role === "manager" ? "👑 Manager" : "👤 Member"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="avatar" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Personalização do Avatar</CardTitle>
                      <CardDescription>
                        Escolha ou gere um novo avatar para seu perfil.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col items-center space-y-6">
                        <div className="relative group">
                          <Image
                            src={avatar || getInitialsAvatar(user?.name || "")}
                            alt="Avatar"
                            width={128}
                            height={128}
                            className="rounded-full border-4 border-white shadow-lg transition-transform group-hover:scale-105"
                            unoptimized
                          />
                          <button
                            onClick={() => setIsEditingAvatar(true)}
                            className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full text-white shadow-lg hover:bg-blue-700 transition-colors"
                          >
                            <Camera size={20} />
                          </button>
                        </div>

                        <div className="flex space-x-4">
                          <Button
                            variant="outline"
                            onClick={fetchNewAvatars}
                            className="flex items-center space-x-2"
                          >
                            <RefreshCw size={16} />
                            <span>Gerar Novos</span>
                          </Button>
                          <Button
                            variant="outline"
                            onClick={handleRemoveAvatar}
                            className="flex items-center space-x-2 text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                            <span>Remover</span>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </motion.div>

          <Dialog open={isEditingAvatar} onOpenChange={setIsEditingAvatar}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Escolha seu novo avatar</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-3 gap-4 py-4">
                {avatarOptions.map((avatarOption, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSelectAvatar(avatarOption)}
                    className={`relative rounded-lg p-2 transition-all ${
                      avatar === avatarOption
                        ? "ring-2 ring-blue-600 bg-blue-50"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <Image
                      src={avatarOption}
                      alt={`Avatar option ${index + 1}`}
                      width={80}
                      height={80}
                      className="rounded-lg"
                      unoptimized
                    />
                  </motion.button>
                ))}
              </div>
              <DialogFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setIsEditingAvatar(false)}>
                  Cancelar
                </Button>
                <Button onClick={fetchNewAvatars} className="bg-blue-600 hover:bg-blue-700">
                  Gerar Novos Avatares
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </ProtectedRoute>
  );
}
