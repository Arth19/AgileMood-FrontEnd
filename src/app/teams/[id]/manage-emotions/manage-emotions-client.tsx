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
          setSelectedEmotions(teamEmotions.map(emotion => emotion.id));
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

    setSaving(true);
    try {
      const success = await updateTeamEmotions(selectedEmotions);
      if (success) {
        toast.success("Emoções do time atualizadas com sucesso!");
        router.push(`/teams/${teamId}`);
      }
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

              <div className="mb-4">
                <h2 className="text-xl font-semibold mb-4">Emoções Disponíveis</h2>
                <p className="text-sm text-gray-600 mb-4">
                  {selectedEmotions.length}/6 emoções selecionadas
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {allEmotions.map(emotion => (
                    <div 
                      key={emotion.id}
                      onClick={() => handleToggleEmotion(emotion.id)}
                      className={`
                        flex items-center p-4 rounded-lg cursor-pointer border transition-all
                        ${selectedEmotions.includes(emotion.id) 
                          ? `border-2 border-blue-500 bg-blue-50` 
                          : `border-gray-200 hover:border-gray-300`}
                      `}
                      style={{
                        borderColor: selectedEmotions.includes(emotion.id) ? emotion.color : undefined,
                        backgroundColor: selectedEmotions.includes(emotion.id) ? `${emotion.color}15` : undefined
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
                      {selectedEmotions.includes(emotion.id) && (
                        <Check className="h-5 w-5" style={{ color: emotion.color }} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end mt-8">
                <Button 
                  variant="outline" 
                  className="mr-4"
                  onClick={() => router.push(`/teams/${teamId}`)}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSaveTeamEmotions}
                  disabled={saving || selectedEmotions.length !== 6}
                >
                  {saving ? (
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
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 