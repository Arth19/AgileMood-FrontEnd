"use client";

import { useEffect, useState } from "react";
import { TeamResponse, TeamMember, TeamEmotion, EmotionReport } from "@/lib/types/index";
import { notFound } from "next/navigation";
import { Loader2, UserPlus, Settings, Check, BarChart2, Trash2, MessageSquare } from "lucide-react";
import ProtectedRoute from "@/components/ui/protected-route";
import Sidebar from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast, Toaster } from "sonner";
import { useEmotionRecordContext } from "@/contexts/emotion-record-context";
import { useRouter } from "next/navigation";

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
  const [addingMember, setAddingMember] = useState(false);
  const [selectedEmotions, setSelectedEmotions] = useState<number[]>([]);
  const [updatingTeamEmotions, setUpdatingTeamEmotions] = useState(false);
  const [showDeleteMemberModal, setShowDeleteMemberModal] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);
  const [deletingMember, setDeletingMember] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [currentReport, setCurrentReport] = useState<EmotionReport | null>(null);
  const [sendingFeedback, setSendingFeedback] = useState(false);
  const [isAnonymousFeedback, setIsAnonymousFeedback] = useState(false);

  const { allEmotions, fetchAllEmotions, updateTeamEmotions } = useEmotionRecordContext();
  const router = useRouter();

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
      
      // Log para depuração
      console.log("Dados do time recebidos:", {
        teamName: data.team_data.name,
        userRole: data.user_role,
        membersCount: data.members.length,
        members: data.members.map((m: TeamMember) => ({ name: m.name, role: m.role }))
      });
      
      setTeamData(data);
      setLoading(false);
    } catch (err) {
      if (err instanceof Error) {
        setError(err);
      } else {
        setError(new Error('Erro desconhecido ao buscar dados do time'));
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamData();
  }, [teamId]);

  useEffect(() => {
    if (showManageEmotionsModal) {
      fetchAllEmotions();
      // Inicializa as emoções selecionadas com as emoções atuais do time
      if (teamData?.emotions) {
        setSelectedEmotions(teamData.emotions.map(emotion => emotion.id));
      }
    }
  }, [showManageEmotionsModal]);

  const handleAddMember = async () => {
    try {
      setAddingMember(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const token = localStorage.getItem('token');
      const email = newMemberEmail;
      
      const response = await fetch(`${apiUrl}/teams/${teamId}?user_email=${email}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
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

  const handleToggleEmotion = (emotionId: number) => {
    setSelectedEmotions(prev => {
      // Se já está selecionado, remove
      if (prev.includes(emotionId)) {
        return prev.filter(id => id !== emotionId);
      }
      // Se não está selecionado e já tem 6 emoções, não adiciona
      if (prev.length >= 6) {
        toast.error("Você só pode selecionar 6 emoções para o time.");
        return prev;
      }
      // Adiciona a emoção
      return [...prev, emotionId];
    });
  };

  const handleSaveTeamEmotions = async () => {
    if (selectedEmotions.length !== 6) {
      toast.error("Você precisa selecionar exatamente 6 emoções para o time.");
      return;
    }

    setUpdatingTeamEmotions(true);
    try {
      const success = await updateTeamEmotions(selectedEmotions);
      if (success) {
        // Atualiza os dados do time
        await fetchTeamData();
        setShowManageEmotionsModal(false);
      }
    } finally {
      setUpdatingTeamEmotions(false);
    }
  };

  const handleDeleteMember = async () => {
    if (!memberToDelete) return;
    
    try {
      setDeletingMember(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const token = localStorage.getItem('token');
      
      // Log para depuração
      console.log(`Tentando remover membro: ${memberToDelete.name}, Email: ${memberToDelete.email}`);
      
      // Usando o email como parâmetro de consulta
      const response = await fetch(`${apiUrl}/teams/${teamId}/member?user_email=${memberToDelete.email}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // throw new Error(`Falha ao remover membro: ${response.status} - ${response.statusText}`);
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

      toast.success('Membro removido com sucesso!');
      setShowDeleteMemberModal(false);
      setMemberToDelete(null);
    } catch (error) {
      console.error("Erro ao remover membro:", error);
      toast.error('Erro ao remover membro do time');
    } finally {
      setDeletingMember(false);
    }
  };

  const getIntensityLabel = (intensity: number) => {
    switch (intensity) {
      case 1: return { label: 'Muito Baixa', color: 'bg-blue-100 text-blue-800' };
      case 2: return { label: 'Baixa', color: 'bg-green-100 text-green-800' };
      case 3: return { label: 'Média', color: 'bg-yellow-100 text-yellow-800' };
      case 4: return { label: 'Alta', color: 'bg-orange-100 text-orange-800' };
      case 5: return { label: 'Muito Alta', color: 'bg-red-100 text-red-800' };
      default: return { label: 'Média', color: 'bg-yellow-100 text-yellow-800' };
    }
  };

  const handleSendFeedback = async () => {
    if (!currentReport || !feedbackText.trim()) return;
    
    try {
      setSendingFeedback(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error('URL da API não configurada');
      }
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Usuário não autenticado');
      }
      
      // Log para depuração - verificar a estrutura do objeto currentReport
      console.log("Dados do registro de emoção:", currentReport);
      console.log("ID do registro de emoção:", currentReport.id);
      console.log("Tipo do ID:", typeof currentReport.id);
      
      // Verificar se o ID existe
      if (currentReport.id === undefined || currentReport.id === null) {
        throw new Error('ID do registro de emoção não encontrado');
      }
      
      // Garantir que o ID seja um número
      const recordId = parseInt(String(currentReport.id), 10);
      if (isNaN(recordId)) {
        throw new Error('ID do registro de emoção inválido');
      }
      
      // Criar o corpo da requisição exatamente conforme esperado pela API
      const requestBody = {
        message: feedbackText.trim(),
        emotion_record_id: recordId,
        is_anonymous: isAnonymousFeedback
      };
      
      // Log do corpo da requisição
      console.log("Corpo da requisição:", JSON.stringify(requestBody));
      
      const response = await fetch(`${apiUrl}/feedback/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      // Log da resposta
      console.log("Status da resposta:", response.status);
      const responseText = await response.text();
      console.log("Resposta completa:", responseText);
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch (e) {
          errorData = { detail: responseText || 'Erro desconhecido' };
        }
        console.error("Erro detalhado da API:", errorData);
        
        // Verificar se o erro é de permissão
        if (response.status === 403) {
          throw new Error('Apenas gerentes podem enviar feedback');
        }
        
        throw new Error(
          Array.isArray(errorData.detail) 
            ? errorData.detail.map((err: { loc: string[]; msg: string }) => `${err.loc.join('.')}: ${err.msg}`).join(', ') 
            : errorData.detail || 'Falha ao enviar feedback'
        );
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.warn("Resposta não é um JSON válido:", responseText);
        data = { message: "Feedback enviado com sucesso" };
      }
      
      console.log("Feedback enviado com sucesso:", data);
      
      toast.success("Feedback enviado com sucesso!");
      setShowFeedbackModal(false);
      setFeedbackText('');
      setIsAnonymousFeedback(false);
      
      // Atualizar os dados do time para mostrar o feedback
      fetchTeamData();
    } catch (error) {
      console.error("Erro ao enviar feedback:", error);
      toast.error(`Erro ao enviar feedback: ${error instanceof Error ? error.message : 'Tente novamente'}`);
    } finally {
      setSendingFeedback(false);
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
                  <Button 
                    variant="default" 
                    className="flex items-center gap-2"
                    onClick={() => router.push(`/teams/${teamId}/dashboard`)}
                  >
                    <BarChart2 className="h-5 w-5" />
                    Dashboard
                  </Button>
                </div>
              </div>
              
              {/* Seção de Membros */}
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Membros do Time</h2>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="text-left p-3 border-b">Avatar</th>
                        <th className="text-left p-3 border-b">Nome</th>
                        <th className="text-left p-3 border-b">Email</th>
                        <th className="text-left p-3 border-b">Função</th>
                        <th className="text-left p-3 border-b">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teamData.members.map((member: TeamMember) => {
                        // Log para depuração
                        // Consideramos que o usuário é gerente se user_role for 'manager' ou se não estiver definido
                        const isUserManager = teamData.user_role === 'manager' || teamData.user_role === undefined;
                        const canDelete = isUserManager && member.role !== 'manager';
                        console.log(`Membro: ${member.name}, Role: ${member.role}, User Role: ${teamData.user_role}, É Gerente: ${isUserManager}, Pode Deletar: ${canDelete}`);
                        
                        return (
                        <tr key={member.email} className="hover:bg-gray-50">
                          <td className="p-3 border-b">
                            {member.avatar ? (
                              <img
                                src={member.avatar}
                                alt={member.name}
                                className="w-10 h-10 rounded-full"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                {member.name?.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </td>
                          <td className="p-3 border-b font-medium">{member.name}</td>
                          <td className="p-3 border-b text-gray-600">{member.email}</td>
                          <td className="p-3 border-b">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              member.role === 'manager' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {member.role === 'manager' ? 'Gerente' : 'Funcionário'}
                            </span>
                          </td>
                          <td className="p-3 border-b">
                            <Button
                              variant="destructive"
                              size="sm"
                              className="flex items-center gap-1"
                              onClick={() => {
                                setMemberToDelete(member);
                                setShowDeleteMemberModal(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span>Remover</span>
                            </Button>
                          </td>
                        </tr>
                      )})}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Seção de Registros de Emoções */}
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Registros de Emoções</h2>
                {teamData.emotions_reports.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">Nenhum registro de emoção encontrado para este time.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="text-left p-3 border-b">Emoção</th>
                          <th className="text-left p-3 border-b">Intensidade</th>
                          <th className="text-left p-3 border-b">Usuário</th>
                          <th className="text-left p-3 border-b">Observações</th>
                          <th className="text-left p-3 border-b">Data</th>
                          <th className="text-left p-3 border-b">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {teamData.emotions_reports.map((report) => {
                          const intensity = getIntensityLabel(report.intensity);
                          // Encontrar a emoção correspondente
                          const emotion = teamData.emotions.find(e => e.id === report.emotion_id);
                          // Encontrar o usuário correspondente (se não for anônimo)
                          console.log(report)
                          
                          return (
                            <tr key={report.id} className="hover:bg-gray-50">
                              <td className="p-3 border-b">
                                <div className="flex items-center gap-2">
                                  {emotion ? (
                                    <>
                                      <span className="text-xl">{emotion.emoji}</span>
                                      <span>{emotion.name}</span>
                                    </>
                                  ) : (
                                    <span className="text-gray-500">Emoção não encontrada</span>
                                  )}
                                </div>
                              </td>
                              <td className="p-3 border-b">
                                <span className={`px-2 py-1 rounded-full text-xs ${intensity.color}`}>
                                  {intensity.label}
                                </span>
                              </td>
                              <td className="p-3 border-b">
                                {report.user_name === null ? (
                                  <span className="text-gray-500">Anônimo</span>
                                ) : (
                                  <span>{report.user_name!.charAt(0).toUpperCase() + report.user_name?.slice(1)}</span>
                                )}

                              </td>
                              <td className="p-3 border-b">
                                {report.notes || <span className="text-gray-400">Sem observações</span>}
                              </td>
                              <td className="p-3 border-b">
                                {report.created_at ? (
                                  <span>{new Date(report.created_at).toLocaleString('pt-BR')}</span>
                                ) : (
                                  <span className="text-gray-400">Data não disponível</span>
                                )}
                              </td>
                              <td className="p-3 border-b">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="flex items-center gap-1 text-xs"
                                    onClick={() => {
                                      console.log("Relatório selecionado para feedback:", report);
                                      setCurrentReport(report);
                                      setFeedbackText("");
                                      setIsAnonymousFeedback(false);
                                      setShowFeedbackModal(true);
                                    }}
                                  >
                                    <MessageSquare className="h-3 w-3" />
                                    Enviar Feedback
                                  </Button>
                                
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              
              {/* Seção de Emoções do Time */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-semibold">Emoções do Time</h2>
                  {teamData.user_role === 'manager' && (
                    <Button 
                      onClick={() => router.push(`/teams/${teamId}/manage-emotions`)}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Settings className="h-4 w-4" />
                      Gerenciar Emoções
                    </Button>
                  )}
                </div>
                
                {teamData.emotions.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">Nenhuma emoção configurada para este time.</p>
                    {teamData.user_role === 'manager' && (
                      <Button 
                        onClick={() => router.push(`/teams/${teamId}/manage-emotions`)}
                        variant="outline" 
                        className="mt-4"
                      >
                        Configurar Emoções do Time
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                    {teamData.emotions.map((emotion: TeamEmotion) => (
                      <div 
                        key={emotion.id}
                        className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center"
                        style={{ borderColor: emotion.color }}
                      >
                        <span className="text-4xl mb-2">{emotion.emoji}</span>
                        <span className="font-medium text-center">{emotion.name}</span>
                      </div>
                    ))}
                  </div>
                )}
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
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Gerenciar Emoções do Time</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600">
              Selecione exatamente 6 emoções para o seu time. Estas emoções serão usadas pelos membros do time para registrar seus sentimentos.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto p-2">
              {allEmotions.map(emotion => (
                <div 
                  key={emotion.id}
                  onClick={() => handleToggleEmotion(emotion.id)}
                  className={`
                    flex items-center p-3 rounded-lg cursor-pointer border transition-all
                    ${selectedEmotions.includes(emotion.id) 
                      ? `border-2 border-blue-500 bg-blue-50` 
                      : `border-gray-200 hover:border-gray-300`}
                  `}
                >
                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-2xl">{emotion.emoji}</span>
                    <span className="font-medium">{emotion.name}</span>
                  </div>
                  {selectedEmotions.includes(emotion.id) && (
                    <Check className="h-5 w-5 text-blue-500" />
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-600">
                {selectedEmotions.length}/6 emoções selecionadas
              </div>
              <Button 
                onClick={handleSaveTeamEmotions}
                disabled={updatingTeamEmotions || selectedEmotions.length !== 6}
              >
                {updatingTeamEmotions ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar Emoções do Time'
                )}
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowManageEmotionsModal(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmar Exclusão de Membro */}
      <Dialog open={showDeleteMemberModal} onOpenChange={setShowDeleteMemberModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600">
              Tem certeza que deseja remover <span className="font-semibold">{memberToDelete?.name}</span> do time?
            </p>
            <p className="text-sm text-red-500 mt-2">
              Esta ação não pode ser desfeita.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteMemberModal(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteMember}
              disabled={deletingMember}
            >
              {deletingMember ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removendo...
                </>
              ) : (
                'Remover Membro'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Feedback */}
      <Dialog open={showFeedbackModal} onOpenChange={setShowFeedbackModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enviar Feedback</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {currentReport && (
              <div className="bg-gray-50 p-3 rounded-md mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">
                    {teamData?.emotions.find(e => e.id === currentReport.emotion_id)?.emoji}
                  </span>
                  <span className="font-medium">
                    {teamData?.emotions.find(e => e.id === currentReport.emotion_id)?.name}
                  </span>
                  <span className={`ml-auto px-2 py-1 rounded-full text-xs ${getIntensityLabel(currentReport.intensity).color}`}>
                    {getIntensityLabel(currentReport.intensity).label}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {currentReport.notes || "Sem observações"}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {currentReport.created_at ? new Date(currentReport.created_at).toLocaleString('pt-BR') : "Data não disponível"}
                </p>
              </div>
            )}
            
            <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r-md mb-4">
              <p className="text-sm text-blue-800">
                Como gerente do time, seu feedback é importante para ajudar os membros a entenderem suas emoções e melhorar o ambiente de trabalho.
              </p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="feedback" className="text-sm font-medium">
                Seu feedback:
              </label>
              <textarea
                id="feedback"
                className="w-full min-h-[100px] p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Digite seu feedback para este registro de emoção..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowFeedbackModal(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSendFeedback}
              disabled={!feedbackText.trim() || sendingFeedback}
            >
              {sendingFeedback ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar Feedback"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  );
}