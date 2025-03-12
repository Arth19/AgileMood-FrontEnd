"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEmotionRecordContext } from "@/contexts/emotion-record-context";
import { useAuthContext } from "@/contexts/auth-context";
import { PieChart, Users } from "lucide-react";

// Interface para os dados do time
interface TeamData {
  name: string;
  manager?: {
    name: string;
    email: string;
    avatar?: string;
  };
  members: number;
  emotions_reports?: EmotionReport[];
  emotions?: TeamEmotion[];
}

// Interface para o membro do time
interface TeamMember {
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

// Interface para relatórios de emoções
interface EmotionReport {
  id: number;
  user_id: number;
  emotion_id: number;
  team_id: number;
  notes: string;
  is_anonymous: boolean;
  created_at: string;
}

// Interface para emoções do time
interface TeamEmotion {
  id: number;
  name: string;
  emoji: string;
  color: string;
  is_negative: boolean;
}

export default function EmployeeHome() {
  const router = useRouter();
  const { user } = useAuthContext();
  const {
    emotionRecords,
    loading,
    getEmotionDetails,
    fetchEmotionRecordsForLoggedUser,
  } = useEmotionRecordContext();

  // Estado para armazenar informações do time
  const [teamData, setTeamData] = useState<TeamData | null>(null);
  const [loadingTeam, setLoadingTeam] = useState(true);
  const [teamMood, setTeamMood] = useState<{positive: number, negative: number, total: number}>({
    positive: 0,
    negative: 0,
    total: 0
  });

  // ✅ Store fetched emotion details in state
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [emotionDetailsMap, setEmotionDetailsMap] = useState<Record<number, any>>({});

  // 🚀 Fetch emotion records when the component mounts
  useEffect(() => {
    fetchEmotionRecordsForLoggedUser();
  }, [fetchEmotionRecordsForLoggedUser]);

  // Buscar informações do time
  useEffect(() => {
    const fetchTeamData = async () => {
      if (!user?.team_id) {
        setLoadingTeam(false);
        return;
      }

      try {
        setLoadingTeam(true);
        const API_URL = process.env.NEXT_PUBLIC_API_URL;
        const token = localStorage.getItem('token');
        
        const response = await fetch(`${API_URL}/teams/${user.team_id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Falha ao buscar informações do time');
        }

        const data = await response.json();
        
        // Encontrar o gerente na lista de membros
        const manager = data.members.find((member: TeamMember) => member.role === 'manager');
        
        setTeamData({
          name: data.team_data.name,
          manager: manager ? {
            name: manager.name,
            email: manager.email,
            avatar: manager.avatar
          } : undefined,
          members: data.members.length,
          emotions_reports: data.emotions_reports,
          emotions: data.emotions
        });

        // Calcular estatísticas de humor do time
        if (data.emotions_reports && data.emotions) {
          const lastWeekDate = new Date();
          lastWeekDate.setDate(lastWeekDate.getDate() - 7);
          
          // Filtrar relatórios da última semana
          const recentReports = data.emotions_reports.filter((report: EmotionReport) => 
            new Date(report.created_at) >= lastWeekDate
          );
          
          // Mapear emoções por ID para fácil acesso
          const emotionsMap: Record<number, TeamEmotion> = {};
          data.emotions.forEach((emotion: TeamEmotion) => {
            emotionsMap[emotion.id] = emotion;
          });
          
          // Contar emoções positivas e negativas
          let positiveCount = 0;
          let negativeCount = 0;
          
          recentReports.forEach((report: EmotionReport) => {
            const emotion = emotionsMap[report.emotion_id];
            if (emotion) {
              if (emotion.is_negative) {
                negativeCount++;
              } else {
                positiveCount++;
              }
            }
          });
          
          setTeamMood({
            positive: positiveCount,
            negative: negativeCount,
            total: recentReports.length
          });
        }
      } catch (error) {
        console.error('Erro ao buscar informações do time:', error);
      } finally {
        setLoadingTeam(false);
      }
    };

    fetchTeamData();
  }, [user?.team_id]);

  // ✅ Fetch emotion details before rendering
  useEffect(() => {
    const fetchEmotionDetails = async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const newEmotionDetails: Record<number, any> = {};

      for (const entry of emotionRecords) {
        if (!emotionDetailsMap[entry.emotion_id]) {
          const emotion = await getEmotionDetails(entry.emotion_id);
          if (emotion) {
            newEmotionDetails[entry.emotion_id] = emotion;
          }
        }
      }

      setEmotionDetailsMap((prev) => ({ ...prev, ...newEmotionDetails }));
    };

    if (emotionRecords.length > 0) {
      fetchEmotionDetails();
    }
  }, [emotionRecords, getEmotionDetails]);

  const handleAddEntry = () => {
    router.push("/register-mood");
  };

  // Função para determinar o clima do time com base nas estatísticas
  const getTeamMoodStatus = () => {
    if (teamMood.total === 0) return "Sem dados suficientes";
    
    const positivePercentage = (teamMood.positive / teamMood.total) * 100;
    
    if (positivePercentage >= 75) return "Excelente";
    if (positivePercentage >= 60) return "Bom";
    if (positivePercentage >= 40) return "Neutro";
    if (positivePercentage >= 25) return "Preocupante";
    return "Crítico";
  };

  // Função para determinar a cor do status do clima do time
  const getMoodStatusColor = () => {
    const status = getTeamMoodStatus();
    
    switch (status) {
      case "Excelente": return "text-green-600";
      case "Bom": return "text-emerald-500";
      case "Neutro": return "text-blue-500";
      case "Preocupante": return "text-amber-500";
      case "Crítico": return "text-red-600";
      default: return "text-gray-500";
    }
  };

  return (
    <>
      {/* Card de informações do time */}
      <Card className="p-6 shadow-lg mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Informações do Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingTeam ? (
            <p className="text-gray-500">Carregando informações do time...</p>
          ) : teamData ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{teamData.name}</h3>
                <p className="text-gray-600">Total de membros: {teamData.members}</p>
              </div>
              
              {/* Estatísticas do clima do time */}
              {teamMood.total > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <PieChart className="h-4 w-4" />
                    Clima do Time (últimos 7 dias):
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-gray-50 p-3 rounded-lg text-center">
                      <p className="text-sm text-gray-500">Status</p>
                      <p className={`text-lg font-semibold ${getMoodStatusColor()}`}>
                        {getTeamMoodStatus()}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg text-center">
                      <p className="text-sm text-gray-500">Emoções Positivas</p>
                      <p className="text-lg font-semibold text-green-600">
                        {teamMood.positive} 
                        <span className="text-sm font-normal text-gray-500 ml-1">
                          ({teamMood.total > 0 ? Math.round((teamMood.positive / teamMood.total) * 100) : 0}%)
                        </span>
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg text-center">
                      <p className="text-sm text-gray-500">Emoções Negativas</p>
                      <p className="text-lg font-semibold text-red-600">
                        {teamMood.negative}
                        <span className="text-sm font-normal text-gray-500 ml-1">
                          ({teamMood.total > 0 ? Math.round((teamMood.negative / teamMood.total) * 100) : 0}%)
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {teamData.manager && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Gerente do Time:</h4>
                  <div className="flex items-center gap-3">
                    {teamData.manager.avatar ? (
                      <img 
                        src={teamData.manager.avatar} 
                        alt={teamData.manager.name}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                        {teamData.manager.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{teamData.manager.name}</p>
                      <p className="text-sm text-gray-600">{teamData.manager.email}</p>
                    </div>
                  </div>
                </div>
              )}
              
            </div>
          ) : (
            <p className="text-gray-500">Você não está associado a nenhum time.</p>
          )}
        </CardContent>
      </Card>

      <Card className="p-6 shadow-lg">
        <CardHeader>
          <CardTitle>Registrar Emoção</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Registre como você está se sentindo para acompanhar seu bem-estar ao longo do tempo.
          </p>
          <Button onClick={handleAddEntry} className="bg-blue-600 hover:bg-blue-700">
            Registrar Agora
          </Button>
        </CardContent>
      </Card>

      <div className="mt-8">
        <Card className="p-6 shadow-lg">
          <CardHeader>
            <CardTitle>Histórico de Registros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border border-gray-300 px-4 py-2">Data</th>
                    <th className="border border-gray-300 px-4 py-2">Emoção</th>
                    <th className="border border-gray-300 px-4 py-2">Comentário</th>
                    <th className="border border-gray-300 px-4 py-2">Autor</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="text-center py-4 text-gray-500">
                        Carregando histórico...
                      </td>
                    </tr>
                  ) : emotionRecords.length > 0 ? (
                    emotionRecords.map((entry, index) => {
                      const emotion = emotionDetailsMap[entry.emotion_id];

                      return (
                        <tr key={index} className="text-center">
                          <td className="border border-gray-300 px-4 py-2">
                            {new Date(entry.created_at).toLocaleDateString("pt-BR")}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            <span
                              className={`px-2 py-1 rounded text-white`}
                              style={{ backgroundColor: emotion?.color || "#D1D5DB" }}
                            >
                              {emotion?.emoji} {emotion?.name || "Desconhecido"}
                            </span>
                          </td>
                          <td className="border border-gray-300 px-4 py-2">{entry.notes}</td>
                          <td className="border border-gray-300 px-4 py-2 font-semibold">
                            {entry.is_anonymous ? "Anônimo" : "Você"}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center py-4 text-gray-500">
                        Nenhum registro encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
