"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/contexts/auth-context";
import { FeedbackInbox } from "@/components/feedback/feedback-inbox";

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

// Interface para estatísticas de humor
interface TeamMood {
  positive: number;
  negative: number;
  total: number;
}

export default function EmployeeHome() {
  const router = useRouter();
  const { user } = useAuthContext();

  // Estado para armazenar informações do time
  const [teamData, setTeamData] = useState<TeamData | null>(null);
  const [loadingTeam, setLoadingTeam] = useState(true);
  const [teamMood, setTeamMood] = useState<TeamMood>({
    positive: 0,
    negative: 0,
    total: 0
  });

  // Buscar informações do time
  useEffect(() => {
    const fetchTeamData = async () => {
      if (!user?.team_id) {
        setLoadingTeam(false);
        return;
      }

      try {
        setLoadingTeam(true);
        const fallbackUrl =
          process.env.NODE_ENV === 'production'
            ? 'https://agilemood-backend-production.up.railway.app'
            : 'http://localhost:8000';

        const API_URL = process.env.NEXT_PUBLIC_API_URL || fallbackUrl;
        const token = localStorage.getItem('token');
        
        const response = await fetch(`${API_URL}/teams/${user.team_id}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Falha ao buscar informações do time');
        }

        const data = await response.json();
        
        // Usar o manager real retornado pela API, não procurar na lista de membros
        const actualManager = data.manager;
        
        setTeamData({
          name: data.team_data.name,
          manager: actualManager ? {
            name: actualManager.name,
            email: actualManager.email,
            avatar: actualManager.avatar
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

  const handleAddEntry = () => {
    router.push("/register-mood");
  };

  return (
    <div className="space-y-6">
      {/* Seção de Feedbacks */}
      <FeedbackInbox />
      
      <Card className="p-6 shadow-lg">
        <CardHeader>
          <CardTitle>Bem-vindo, {user?.name || 'Colaborador'} 👋</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-6">
            Aqui você pode registrar suas emoções e acompanhar o clima do seu time. Seus registros ajudam a melhorar o ambiente de trabalho! 💙
          </p>
          
          {loadingTeam ? (
            <p className="text-gray-500">Carregando informações do time...</p>
          ) : teamData ? (
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Seu Time: {teamData.name}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium">Membros</p>
                  <p className="text-2xl font-bold">{teamData.members}</p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-800 font-medium">Emoções Positivas (7 dias)</p>
                  <p className="text-2xl font-bold">{teamMood.positive}</p>
                </div>
                
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm text-red-800 font-medium">Emoções Negativas (7 dias)</p>
                  <p className="text-2xl font-bold">{teamMood.negative}</p>
                </div>
              </div>
              
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
    </div>
  );
}
