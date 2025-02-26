"use client";

import { useEffect, useState } from "react";
import { TeamResponse, TeamMember, TeamEmotion } from "@/lib/types/index";
import { notFound } from "next/navigation";
import { Loader2, UserPlus, Settings, Plus, Trash2 } from "lucide-react";
import ProtectedRoute from "@/components/ui/protected-route";
import Sidebar from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast, Toaster } from "sonner";

interface TeamPageClientProps {
  teamId: number;
}

export default function TeamPageClient({ teamId }: TeamPageClientProps) {
  const [teamData, setTeamData] = useState<TeamResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showManageEmotionsModal, setShowManageEmotionsModal] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newEmotion, setNewEmotion] = useState({ name: "", emoji: "" });
  const [addingMember, setAddingMember] = useState(false);
  const [savingEmotion, setSavingEmotion] = useState(false);

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) {
          throw new Error('URL da API não configurada');
        }

        const token = localStorage.getItem('token');
        const response = await fetch(`${apiUrl}/teams/${teamId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`Falha ao buscar time: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        setTeamData(data);
      } catch (error) {
        console.error('Erro ao buscar dados do time:', error);
        setError(error instanceof Error ? error : new Error('Erro desconhecido'));
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, [teamId]);

  const handleAddMember = async () => {
    try {
      setAddingMember(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const token = localStorage.getItem('token');
      const email = newMemberEmail;
      
      const response = await fetch(`${apiUrl}/teams/${teamId}/${3}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ email: email }),
      });

      if (!response.ok) {
        throw new Error('Falha ao adicionar membro');
      }

      // Atualiza os dados do time
      const updatedTeamResponse = await fetch(`${apiUrl}/teams/${teamId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const updatedTeamData = await updatedTeamResponse.json();
      setTeamData(updatedTeamData);

      toast.success('Membro adicionado com sucesso!');
      setShowAddMemberModal(false);
      setNewMemberEmail('');
    } catch (error) {
      toast.error('Erro ao adicionar membro ao time');
      console.error(error);
    } finally {
      setAddingMember(false);
    }
  };

  const handleAddEmotion = async () => {
    try {
      setSavingEmotion(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${apiUrl}/teams/${teamId}/emotions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newEmotion),
      });

      if (!response.ok) {
        throw new Error('Falha ao adicionar emoção');
      }

      // Atualiza os dados do time
      const updatedTeamResponse = await fetch(`${apiUrl}/teams/${teamId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const updatedTeamData = await updatedTeamResponse.json();
      setTeamData(updatedTeamData);

      toast.success('Emoção adicionada com sucesso!');
      setShowManageEmotionsModal(false);
      setNewEmotion({ name: '', emoji: '' });
    } catch (error) {
      toast.error('Erro ao adicionar emoção');
      console.error(error);
    } finally {
      setSavingEmotion(false);
    }
  };

  const handleDeleteEmotion = async (emotionId: number) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${apiUrl}/teams/${teamId}/emotions/${emotionId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Falha ao remover emoção');
      }

      // Atualiza os dados do time
      const updatedTeamResponse = await fetch(`${apiUrl}/teams/${teamId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const updatedTeamData = await updatedTeamResponse.json();
      setTeamData(updatedTeamData);

      toast.success('Emoção removida com sucesso!');
    } catch (error) {
      toast.error('Erro ao remover emoção');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando dados do time...</p>
        </div>
      </div>
    );
  }

  if (error || !teamData) {
    notFound();
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 overflow-y-auto bg-gray-100">
          <Toaster richColors position="bottom-right" />
          <div className="container mx-auto py-6">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">{teamData.team_data.name}</h1>
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2"
                    onClick={() => setShowAddMemberModal(true)}
                  >
                    <UserPlus className="h-5 w-5" />
                    Adicionar Membro
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2"
                    onClick={() => setShowManageEmotionsModal(true)}
                  >
                    <Settings className="h-5 w-5" />
                    Gerenciar Emoções
                  </Button>
                </div>
              </div>
              
              {/* Seção de Membros */}
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Membros do Time</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {teamData.members.map((member: TeamMember) => (
                    <div key={member.email} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-3">
                        {member.avatar && (
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="w-10 h-10 rounded-full"
                          />
                        )}
                        <div>
                          <p className="font-semibold">{member.name}</p>
                          <p className="text-sm text-gray-600">{member.role}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Seção de Emoções */}
              <div>
                <h2 className="text-2xl font-semibold mb-4">Emoções do Time</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {teamData.emotions.map((emotion: TeamEmotion) => (
                    <div
                      key={emotion.id}
                      className="flex items-center justify-between gap-2 p-3 rounded-lg"
                      style={{ backgroundColor: `${emotion.color}20` }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{emotion.emoji}</span>
                        <span className="font-medium">{emotion.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-red-100 hover:text-red-600"
                        onClick={() => handleDeleteEmotion(emotion.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Adicionar Membro */}
      <Dialog open={showAddMemberModal} onOpenChange={setShowAddMemberModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Novo Membro</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email do novo membro
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Digite o email do novo membro"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddMemberModal(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleAddMember}
              disabled={addingMember || !newMemberEmail}
            >
              {addingMember ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adicionando...
                </>
              ) : (
                'Adicionar Membro'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Gerenciar Emoções */}
      <Dialog open={showManageEmotionsModal} onOpenChange={setShowManageEmotionsModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gerenciar Emoções do Time</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="emotionName" className="text-sm font-medium">
                  Nome da emoção
                </label>
                <Input
                  id="emotionName"
                  placeholder="Ex: Feliz"
                  value={newEmotion.name}
                  onChange={(e) => setNewEmotion({ ...newEmotion, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="emotionEmoji" className="text-sm font-medium">
                  Emoji
                </label>
                <Input
                  id="emotionEmoji"
                  placeholder="Ex: 😊"
                  value={newEmotion.emoji}
                  onChange={(e) => setNewEmotion({ ...newEmotion, emoji: e.target.value })}
                />
              </div>
              <Button 
                className="w-full"
                onClick={handleAddEmotion}
                disabled={savingEmotion || !newEmotion.name || !newEmotion.emoji}
              >
                {savingEmotion ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adicionando...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Nova Emoção
                  </>
                )}
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowManageEmotionsModal(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  );
} 