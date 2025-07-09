"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import ProtectedRoute from "@/components/ui/protected-route";
import Sidebar from "@/components/ui/sidebar";
import { useEmotionRecordContext } from "@/contexts/emotion-record-context";
import { useAuthContext } from "@/contexts/auth-context";
import AddCustomEmotion from "./components/add-custom-emotion";
import SelectedEmotionsSummary from "./components/selected-emotions-summary";

interface ManageEmotionsClientProps {
  teamId: number;
}

export default function ManageEmotionsClient({ teamId }: ManageEmotionsClientProps) {
  const router = useRouter();
  const { user } = useAuthContext();
  const { allEmotions, teamEmotions, fetchAllEmotions, fetchTeamEmotions, updateTeamEmotions } = useEmotionRecordContext();
  
  const [selectedEmotions, setSelectedEmotions] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchAllEmotions(), fetchTeamEmotions()]);
        
        // Inicializa as emoções selecionadas com as emoções atuais do time
        if (teamEmotions.length > 0) {
          console.log("Emoções do time carregadas:", teamEmotions);
          const teamEmotionIds = teamEmotions.map(emotion => {
            console.log(`Emoção do time: ID=${emotion.id}, Nome=${emotion.name}, Tipo ID=${typeof emotion.id}`);
            return emotion.id;
          });
          console.log("IDs das emoções do time:", teamEmotionIds);
          setSelectedEmotions(teamEmotionIds);
        } else {
          console.log("Nenhuma emoção do time encontrada");
          setSelectedEmotions([]);
        }
      } catch (error) {
        console.error("Erro ao carregar emoções:", error);
        toast.error("Erro ao carregar emoções. Tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === "manager") {
      loadData();
    } else {
      // Redireciona se não for gerente
      router.push(`/teams/${teamId}`);
      toast.error("Apenas gerentes podem acessar esta página.");
    }
  }, [teamId, user]);

  const handleToggleEmotion = (emotionId: number) => {
    console.log(`Toggle emoção ID: ${emotionId}, Tipo: ${typeof emotionId}`);
    
    // Verificar se o ID é válido
    if (typeof emotionId !== 'number' || isNaN(emotionId)) {
      console.error(`ID de emoção inválido: ${emotionId}`);
      toast.error("Erro ao selecionar emoção: ID inválido");
      return;
    }
    
    setSelectedEmotions(prev => {
      // Verificar se o array anterior é válido
      if (!Array.isArray(prev)) {
        console.error("selectedEmotions não é um array:", prev);
        return [emotionId];
      }
      
      // Se já está selecionado, remove
      if (prev.includes(emotionId)) {
        console.log(`Removendo emoção ID: ${emotionId}`);
        return prev.filter(id => id !== emotionId);
      }
      
      // Se não está selecionado e já tem 6 emoções, não adiciona
      if (prev.length >= 6) {
        console.log("Limite de 6 emoções atingido");
        toast.error("Você só pode selecionar 6 emoções para o time.");
        return prev;
      }
      
      // Adiciona a emoção
      console.log(`Adicionando emoção ID: ${emotionId}`);
      return [...prev, emotionId];
    });
  };

  const handleSaveTeamEmotions = async () => {
    console.log("Emoções selecionadas:", selectedEmotions);
    console.log("Quantidade de emoções selecionadas:", selectedEmotions.length);
    
    // Verificar se o array de emoções selecionadas é válido
    if (!Array.isArray(selectedEmotions)) {
      toast.error("Erro interno: formato inválido de emoções selecionadas.");
      return;
    }
    
    // Verificar se há exatamente 6 emoções selecionadas
    if (selectedEmotions.length !== 6) {
      toast.error("Você precisa selecionar exatamente 6 emoções para o time.");
      return;
    }
    
    // Verificar se todas as emoções selecionadas existem no array allEmotions
    const selectedEmotionsDetails = selectedEmotions.map(id => 
      allEmotions.find(emotion => emotion.id === id)
    ).filter(Boolean);
    
    console.log("Detalhes das emoções selecionadas:", selectedEmotionsDetails);
    
    if (selectedEmotionsDetails.length !== 6) {
      toast.error("Algumas emoções selecionadas não foram encontradas. Tente novamente.");
      return;
    }

    // Verificar se as emoções selecionadas são as mesmas já atribuídas ao time
    const currentTeamEmotionIds = teamEmotions.map((e) => e.id).sort();
    const newEmotionIds = [...selectedEmotions].sort();
    const unchanged =
      currentTeamEmotionIds.length === newEmotionIds.length &&
      currentTeamEmotionIds.every((id, index) => id === newEmotionIds[index]);

    if (unchanged) {
      toast.success("As emoções do time já estão atualizadas.");
      router.push(`/teams/${teamId}`);
      return;
    }

    setSaving(true);
    try {
      // Exibir mensagem informativa
      toast.info("Enviando emoções para o servidor e atualizando o time...");
      
      // Criar uma cópia do array para evitar problemas de referência
      const emotionIdsToSend = [...selectedEmotions];
      console.log("Enviando IDs de emoções:", emotionIdsToSend);
      
      const success = await updateTeamEmotions(emotionIdsToSend);
      console.log("Resultado do updateTeamEmotions:", success);
      
      if (success) {
        // A mensagem de sucesso já é exibida na função updateTeamEmotions
        // Aguardar um pouco antes de redirecionar para que o usuário veja as mensagens
        setTimeout(() => {
          router.push(`/teams/${teamId}`);
        }, 2000);
      }
    } catch (error) {
      console.error("Erro ao salvar emoções:", error);
      toast.error("Ocorreu um erro inesperado ao salvar as emoções do time.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex-1 p-8 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="mt-4 text-lg">Carregando emoções...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 p-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center mb-8">
              <Button 
                variant="ghost" 
                className="mr-4"
                onClick={() => router.push(`/teams/${teamId}`)}
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Voltar
              </Button>
              <h1 className="text-3xl font-bold">Gerenciar Emoções do Time</h1>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Instruções</h2>
                <p className="text-gray-600">
                  Selecione exatamente 6 emoções para o seu time. Estas emoções serão usadas pelos membros do time para registrar seus sentimentos.
                </p>
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-700">
                  <p className="font-medium">Dica:</p>
                  <p className="text-sm">Recomendamos selecionar um conjunto equilibrado de emoções positivas e negativas para capturar toda a gama de sentimentos da equipe.</p>
                </div>
              </div>

              {Array.isArray(selectedEmotions) && selectedEmotions.length > 0 && (
                <SelectedEmotionsSummary 
                  selectedEmotions={selectedEmotions} 
                  allEmotions={allEmotions} 
                />
              )}

              <div className="mb-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Emoções Disponíveis</h2>
                  <AddCustomEmotion onEmotionAdded={() => fetchAllEmotions()} />
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  {selectedEmotions.length}/6 emoções selecionadas
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {allEmotions.map(emotion => {
                    // Verificar se o ID da emoção é válido
                    const emotionId = emotion.id;
                    const isSelected = Array.isArray(selectedEmotions) && selectedEmotions.includes(emotionId);
                    
                    return (
                      <div 
                        key={emotionId}
                        onClick={() => handleToggleEmotion(emotionId)}
                        className={`
                          flex items-center p-4 rounded-lg cursor-pointer border transition-all
                          ${isSelected 
                            ? `border-2 border-blue-500 bg-blue-50` 
                            : `border-gray-200 hover:border-gray-300`}
                        `}
                        style={{
                          borderColor: isSelected ? emotion.color : undefined,
                          backgroundColor: isSelected ? `${emotion.color}15` : undefined
                        }}
                      >
                        <div className="flex-1 flex items-center gap-3">
                          <span className="text-3xl">{emotion.emoji}</span>
                          <div>
                            <p className="font-medium">{emotion.name}</p>
                            <p className="text-xs text-gray-500">
                              {emotion.is_negative ? "Emoção Negativa" : "Emoção Positiva"}
                            </p>
                          </div>
                        </div>
                        {isSelected && (
                          <Check className="h-5 w-5" style={{ color: emotion.color }} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end mt-8">
                <Button 
                  variant="outline" 
                  className="mr-4"
                  onClick={() => router.push(`/teams/${teamId}`)}
                  disabled={saving}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSaveTeamEmotions}
                  disabled={saving || !Array.isArray(selectedEmotions) || selectedEmotions.length !== 6}
                  className="relative"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      Salvar Emoções do Time
                      {Array.isArray(selectedEmotions) && (
                        <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {selectedEmotions.length}/6
                        </span>
                      )}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 