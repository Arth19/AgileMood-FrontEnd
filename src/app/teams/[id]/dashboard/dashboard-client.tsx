"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, Download } from "lucide-react";
import ProtectedRoute from "@/components/ui/protected-route";
import Sidebar from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "sonner";
import { useRouter } from "next/navigation";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { Sprint, SprintSelector } from "@/components/ui/sprint-selector";
import { EmotionBarChart, EmotionPieChart, EmotionChartData } from "@/components/charts/emotion-charts";
import { FeedbackMessage } from "@/components/feedback/feedback-message";

// Interfaces para os tipos do time
interface TeamMember {
  id: number;
  name: string;
  email: string;
  team_id: number;
  role: string;
  avatar?: string;
}

interface TeamEmotion {
  id: number;
  name: string;
  emoji: string;
  color: string;
  team_id: number;
  is_negative: boolean;
}

interface EmotionReport {
  id: number;
  user_id: number | null;
  emotion_id: number;
  intensity: number;
  notes: string;
  is_anonymous: boolean;
  created_at: string;
  user_name?: string;
}

interface TeamResponse {
  team_data: {
    id: number;
    name: string;
    manager_id: number;
    created_at: string;
    updated_at: string;
  };
  members: TeamMember[];
  emotions_reports: EmotionReport[];
  emotions: TeamEmotion[];
  user_role?: string;
}

// Tipos para os dados dos relatórios
interface EmojiDistribution {
  emotion_name: string;
  frequency: number;
}

interface AverageIntensity {
  emotion_name: string;
  avg_intensity: number;
}

interface UserEmotionRecord {
  emotion_name: string;
  frequency: number;
  avg_intensity: number;
}

interface EmojiDistributionResponse {
  emoji_distribution: EmojiDistribution[];
  negative_emotion_ratio: number;
  alert: string;
}

interface AverageIntensityResponse {
  average_intensity: AverageIntensity[];
  negative_emotion_ratio: number;
  alert: string;
}

interface UserEmotionAnalysisResponse {
  user_name: string;
  all_user_emotion_records: UserEmotionRecord[];
}

interface AnonymousRecordsResponse {
  user_name: string;
  all_user_emotion_records: UserEmotionRecord[];
}

interface DashboardClientProps {
  teamId: number;
}

export default function DashboardClient({ teamId }: DashboardClientProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [emojiDistribution, setEmojiDistribution] = useState<EmojiDistributionResponse | null>(null);
  const [averageIntensity, setAverageIntensity] = useState<AverageIntensityResponse | null>(null);
  const [userEmotionAnalysis, setUserEmotionAnalysis] = useState<UserEmotionAnalysisResponse | null>(null);
  const [anonymousRecords, setAnonymousRecords] = useState<AnonymousRecordsResponse | null>(null);
  const [teamData, setTeamData] = useState<TeamResponse | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [filteredReports, setFilteredReports] = useState<EmotionReport[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);
  
  const router = useRouter();

  // Função para gerar sprints fictícias para demonstração
  const generateDemoSprints = useCallback(() => {
    const demoSprints: Sprint[] = [];
    const today = new Date();
    
    // Gerar 6 sprints anteriores de 2 semanas cada
    for (let i = 0; i < 6; i++) {
      const endDate = new Date(today);
      endDate.setDate(today.getDate() - (i * 14));
      
      const startDate = new Date(endDate);
      startDate.setDate(endDate.getDate() - 13);
      
      demoSprints.push({
        id: `sprint-${i+1}`,
        name: `Sprint ${i+1}`,
        startDate,
        endDate
      });
    }
    
    setSprints(demoSprints);
  }, []);

  // Efeito para gerar sprints de demonstração
  useEffect(() => {
    generateDemoSprints();
  }, [generateDemoSprints]);

  // Função para processar os dados do time e gerar estatísticas com base no período selecionado
  const processTeamData = useCallback((data: TeamResponse, range: DateRange | undefined = undefined) => {
    if (!data || !data.emotions_reports || !data.emotions) return;

    // Filtrar relatórios pelo período selecionado
    let filteredEmotionReports = [...data.emotions_reports];
    
    if (range?.from) {
      filteredEmotionReports = filteredEmotionReports.filter(report => 
        new Date(report.created_at) >= range.from!
      );
    }
    
    if (range?.to) {
      // Ajustar a data final para incluir todo o dia
      const adjustedEnd = new Date(range.to);
      adjustedEnd.setHours(23, 59, 59, 999);
      
      filteredEmotionReports = filteredEmotionReports.filter(report => 
        new Date(report.created_at) <= adjustedEnd
      );
    }
    
    setFilteredReports(filteredEmotionReports);

    // Processamento para distribuição de emojis
    const emotionCounts = new Map<number, number>();
    let negativeCount = 0;
    let totalCount = 0;

    filteredEmotionReports.forEach(report => {
      const emotionId = report.emotion_id;
      emotionCounts.set(emotionId, (emotionCounts.get(emotionId) || 0) + 1);
      
      const emotion = data.emotions.find(e => e.id === emotionId);
      if (emotion?.is_negative) {
        negativeCount++;
      }
      totalCount++;
    });

    const emojiDistributionData: EmojiDistribution[] = [];
    data.emotions.forEach(emotion => {
      const count = emotionCounts.get(emotion.id) || 0;
      if (count > 0) {
        emojiDistributionData.push({
          emotion_name: `${emotion.emoji} ${emotion.name}`,
          frequency: count
        });
      }
    });

    // Ordenar por frequência
    emojiDistributionData.sort((a, b) => b.frequency - a.frequency);

    const negativeRatio = totalCount > 0 ? negativeCount / totalCount : 0;
    let alert = "";
    if (negativeRatio > 0.5) {
      alert = "Atenção: Mais de 50% das emoções registradas são negativas. Pode ser necessário uma intervenção.";
    }

    setEmojiDistribution({
      emoji_distribution: emojiDistributionData,
      negative_emotion_ratio: negativeRatio,
      alert
    });

    // Processamento para intensidade média
    const emotionIntensities = new Map<number, number[]>();
    
    filteredEmotionReports.forEach(report => {
      const emotionId = report.emotion_id;
      const intensities = emotionIntensities.get(emotionId) || [];
      intensities.push(report.intensity);
      emotionIntensities.set(emotionId, intensities);
    });

    const averageIntensityData: AverageIntensity[] = [];
    data.emotions.forEach(emotion => {
      const intensities = emotionIntensities.get(emotion.id) || [];
      if (intensities.length > 0) {
        const avgIntensity = intensities.reduce((sum, val) => sum + val, 0) / intensities.length;
        averageIntensityData.push({
          emotion_name: `${emotion.emoji} ${emotion.name}`,
          avg_intensity: Number(avgIntensity.toFixed(1))
        });
      }
    });

    // Ordenar por intensidade média
    averageIntensityData.sort((a, b) => b.avg_intensity - a.avg_intensity);

    setAverageIntensity({
      average_intensity: averageIntensityData,
      negative_emotion_ratio: negativeRatio,
      alert
    });

    // Processamento para registros anônimos
    const anonymousReports = filteredEmotionReports.filter(report => report.is_anonymous);
    const anonymousEmotionCounts = new Map<number, number>();
    const anonymousEmotionIntensities = new Map<number, number[]>();

    anonymousReports.forEach(report => {
      const emotionId = report.emotion_id;
      anonymousEmotionCounts.set(emotionId, (anonymousEmotionCounts.get(emotionId) || 0) + 1);
      
      const intensities = anonymousEmotionIntensities.get(emotionId) || [];
      intensities.push(report.intensity);
      anonymousEmotionIntensities.set(emotionId, intensities);
    });

    const anonymousRecordsData: UserEmotionRecord[] = [];
    data.emotions.forEach(emotion => {
      const count = anonymousEmotionCounts.get(emotion.id) || 0;
      if (count > 0) {
        const intensities = anonymousEmotionIntensities.get(emotion.id) || [];
        const avgIntensity = intensities.reduce((sum, val) => sum + val, 0) / intensities.length;
        
        anonymousRecordsData.push({
          emotion_name: `${emotion.emoji} ${emotion.name}`,
          frequency: count,
          avg_intensity: Number(avgIntensity.toFixed(1))
        });
      }
    });

    // Ordenar por frequência
    anonymousRecordsData.sort((a, b) => b.frequency - a.frequency);

    setAnonymousRecords({
      user_name: "Anônimo",
      all_user_emotion_records: anonymousRecordsData
    });
  }, []);

  // Função para gerar um resumo do time baseado nos dados
  const generateTeamSummary = useCallback((data: TeamResponse) => {
    if (!data || !data.emotions_reports || !data.emotions) return "";
    
    const totalReports = data.emotions_reports.length;
    const anonymousReports = data.emotions_reports.filter(report => report.is_anonymous).length;
    const identifiedReports = totalReports - anonymousReports;
    
    // Calcular a emoção mais frequente
    const emotionCounts = new Map<number, number>();
    data.emotions_reports.forEach(report => {
      emotionCounts.set(report.emotion_id, (emotionCounts.get(report.emotion_id) || 0) + 1);
    });
    
    let mostFrequentEmotionId: number | null = null;
    let maxCount = 0;
    
    emotionCounts.forEach((count, emotionId) => {
      if (count > maxCount) {
        maxCount = count;
        mostFrequentEmotionId = emotionId;
      }
    });
    
    const mostFrequentEmotion = mostFrequentEmotionId 
      ? data.emotions.find(e => e.id === mostFrequentEmotionId)
      : null;
    
    // Calcular a intensidade média geral
    const totalIntensity = data.emotions_reports.reduce((sum, report) => sum + report.intensity, 0);
    const avgIntensity = totalReports > 0 ? (totalIntensity / totalReports).toFixed(1) : "0";
    
    // Calcular a proporção de emoções negativas
    const negativeReports = data.emotions_reports.filter(report => {
      const emotion = data.emotions.find(e => e.id === report.emotion_id);
      return emotion?.is_negative;
    }).length;
    
    const negativeRatio = totalReports > 0 ? (negativeReports / totalReports) * 100 : 0;
    
    // Gerar mensagem de resumo
    let summary = `O time "${data.team_data.name}" possui ${data.members.length} membros e um total de ${totalReports} registros de emoções`;
    
    if (totalReports > 0) {
      summary += `, sendo ${anonymousReports} anônimos (${Math.round((anonymousReports / totalReports) * 100)}%) e ${identifiedReports} identificados.`;
      
      if (mostFrequentEmotion) {
        summary += ` A emoção mais frequente é "${mostFrequentEmotion.name}" ${mostFrequentEmotion.emoji} com ${maxCount} registros.`;
      }
      
      summary += ` A intensidade média das emoções é ${avgIntensity}/5.`;
      
      if (negativeRatio > 50) {
        summary += ` ATENÇÃO: ${Math.round(negativeRatio)}% das emoções registradas são negativas, o que pode indicar problemas no time.`;
      } else if (negativeRatio > 30) {
        summary += ` ${Math.round(negativeRatio)}% das emoções registradas são negativas, fique atento.`;
      } else if (negativeRatio < 10) {
        summary += ` Apenas ${Math.round(negativeRatio)}% das emoções registradas são negativas, o que é um bom sinal.`;
      }
    } else {
      summary += `. Ainda não há registros de emoções para análise.`;
    }
    
    return summary;
  }, []);

  // Função para processar os registros de emoções e gerar a análise por usuário
  const generateUserEmotionAnalysis = useCallback((userId: number) => {
    if (!teamData) return null;
    
    const { emotions_reports, emotions, members } = teamData;
    const user = members.find(member => member.id === userId);
    
    if (!user) return null;
    
    // Filtra os registros pelo usuário (sem filtro de data)
    const filteredReports = emotions_reports
      .filter(report => report.user_id !== null && report.user_id === userId && !report.is_anonymous);
    
    // Inicializa os contadores e acumuladores para cada emoção
    const emotionData = new Map<number, { count: number, intensities: number[] }>();
    emotions.forEach(emotion => emotionData.set(emotion.id, { count: 0, intensities: [] }));
    
    // Processa os registros
    filteredReports.forEach(report => {
      const data = emotionData.get(report.emotion_id) || { count: 0, intensities: [] };
      data.count += 1;
      data.intensities.push(report.intensity);
      emotionData.set(report.emotion_id, data);
    });
    
    // Formata os dados para o formato esperado
    const records: UserEmotionRecord[] = emotions.map(emotion => {
      const data = emotionData.get(emotion.id) || { count: 0, intensities: [] };
      const avgIntensity = data.intensities.length > 0
        ? data.intensities.reduce((sum, val) => sum + val, 0) / data.intensities.length
        : 0;
      
      return {
        emotion_name: `${emotion.emoji} ${emotion.name}`,
        frequency: data.count,
        avg_intensity: Number(avgIntensity.toFixed(1))
      };
    }).filter(record => record.frequency > 0) // Remove emoções sem registros
      .sort((a, b) => b.frequency - a.frequency); // Ordena por frequência decrescente
    
    return {
      user_name: user.name,
      all_user_emotion_records: records
    };
  }, [teamData]);

  // Função para lidar com a mudança de sprint
  const handleSprintChange = useCallback((sprint: Sprint | null) => {
    setSelectedSprint(sprint);
    
    if (sprint) {
      setDateRange({
        from: sprint.startDate,
        to: sprint.endDate
      });
    } else {
      setDateRange(undefined);
    }
  }, []);

  // Buscar dados do time
  const fetchTeamData = useCallback(async () => {
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
      setMembers(data.members);
      
      // Processar os dados do time para gerar estatísticas
      processTeamData(data);
      
      if (data.members.length > 0) {
        setSelectedMemberId(data.members[0].id);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err);
      } else {
        setError(new Error('Erro desconhecido ao buscar dados do time'));
      }
    }
  }, [teamId, processTeamData]);

  // Buscar todos os dados
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      await fetchTeamData();
      setLoading(false);
    } catch (err) {
      setLoading(false);
      if (err instanceof Error) {
        setError(err);
      } else {
        setError(new Error('Erro desconhecido ao buscar dados'));
      }
    }
  }, [fetchTeamData]);

  // Efeito para buscar dados quando a página carrega
  useEffect(() => {
    fetchAllData();
  }, [teamId, fetchAllData]);

  // Efeito para processar dados quando o membro selecionado muda
  useEffect(() => {
    if (teamData && selectedMemberId && !loading) {
      const userEmotionAnalysisData = generateUserEmotionAnalysis(selectedMemberId);
      if (userEmotionAnalysisData) {
        setUserEmotionAnalysis(userEmotionAnalysisData);
      }
    }
  }, [selectedMemberId, teamData, generateUserEmotionAnalysis, loading]);

  // Efeito para reprocessar os dados quando as datas de filtro mudam
  useEffect(() => {
    if (teamData) {
      processTeamData(teamData, dateRange);
    }
  }, [dateRange, teamData, processTeamData]);

  // Função para exportar relatórios em CSV
  const exportReportsCSV = useCallback(() => {
    if (!teamData || !filteredReports.length) {
      toast.error("Não há dados para exportar");
      return;
    }

    // Criar cabeçalho do CSV
    let csvContent = "ID,Usuário,Emoção,Intensidade,Anônimo,Notas,Data de Criação\n";

    // Adicionar linhas de dados
    filteredReports.forEach(report => {
      const emotion = teamData.emotions.find(e => e.id === report.emotion_id);
      const userName = report.is_anonymous 
        ? 'Anônimo' 
        : report.user_name || teamData.members.find(m => m.id === report.user_id)?.name || 'Usuário';
      
      // Formatar data
      const createdAt = new Date(report.created_at).toLocaleString('pt-BR');
      
      // Escapar notas para evitar problemas com vírgulas no CSV
      const escapedNotes = report.notes ? `"${report.notes.replace(/"/g, '""')}"` : "";
      
      csvContent += `${report.id},${userName},${emotion?.name || ''},${report.intensity},${report.is_anonymous},${escapedNotes},${createdAt}\n`;
    });

    // Criar blob e link para download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // Definir nome do arquivo com período, se aplicável
    let fileName = `relatorio-emocoes-time-${teamId}`;
    if (selectedSprint) {
      fileName += `-sprint-${selectedSprint.name.replace(/\s+/g, '-')}`;
    } else if (dateRange?.from && dateRange?.to) {
      fileName += `-${format(dateRange.from, 'dd-MM-yyyy')}_a_${format(dateRange.to, 'dd-MM-yyyy')}`;
    }
    fileName += '.csv';
    
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Relatório exportado com sucesso!");
  }, [teamData, filteredReports, teamId, dateRange, selectedSprint]);

  // Função para converter dados de emoções para o formato dos gráficos
  const convertToChartData = useCallback((data: EmojiDistribution[] | AverageIntensity[]): EmotionChartData[] => {
    if (!teamData) return [];
    
    return data.map(item => {
      const emotionName = item.emotion_name.split(' ');
      // Extrair o nome sem o emoji
      const name = emotionName.slice(1).join(' ');
      
      // Encontrar a cor da emoção
      const emotion = teamData.emotions.find(e => e.name === name);
      
      return {
        name: item.emotion_name,
        value: 'frequency' in item ? item.frequency : item.avg_intensity,
        color: emotion?.color || '#' + Math.floor(Math.random()*16777215).toString(16)
      };
    });
  }, [teamData]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando dados do dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erro ao carregar dados: {error.message}</p>
          <Button onClick={() => router.push(`/teams/${teamId}`)}>
            Voltar para a página do time
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 overflow-y-auto bg-gray-100">
          <Toaster richColors position="bottom-right" />
          <div className="container mx-auto py-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold">Dashboard do Time</h1>
                <p className="text-gray-600">Análise de emoções e sentimentos do time</p>
              </div>
              <div className="flex items-center gap-4">
                <Button onClick={() => router.push(`/teams/${teamId}`)}>
                  Voltar para o Time
                </Button>
              </div>
            </div>

            {/* Filtro por período */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Filtrar por Período</CardTitle>
                <CardDescription>
                  Selecione um período ou sprint para filtrar os relatórios de emoções
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Selecionar Sprint</label>
                    <SprintSelector 
                      sprints={sprints}
                      selectedSprint={selectedSprint}
                      onSprintChange={handleSprintChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ou Selecionar Período Personalizado</label>
                    <DateRangePicker 
                      dateRange={dateRange} 
                      onDateRangeChange={(range) => {
                        setDateRange(range);
                        if (range) setSelectedSprint(null);
                      }}
                    />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    {(dateRange?.from || selectedSprint) && (
                      <div className="p-2 bg-blue-50 text-blue-700 rounded-md text-sm">
                        {filteredReports.length} registros encontrados no período selecionado
                        {selectedSprint && ` (Sprint ${selectedSprint.name})`}
                        {!selectedSprint && dateRange?.from && dateRange?.to && 
                          ` (${format(dateRange.from, 'dd/MM/yyyy', { locale: ptBR })} a ${format(dateRange.to, 'dd/MM/yyyy', { locale: ptBR })})`
                        }
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setDateRange(undefined);
                        setSelectedSprint(null);
                      }}
                    >
                      Limpar Filtros
                    </Button>
                    <Button 
                      onClick={exportReportsCSV}
                      className="flex items-center gap-2"
                      disabled={!filteredReports.length}
                    >
                      <Download className="h-4 w-4" />
                      Exportar CSV
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                <TabsTrigger value="emotions">Distribuição de Emoções</TabsTrigger>
                <TabsTrigger value="intensity">Intensidade Média</TabsTrigger>
                <TabsTrigger value="members">Análise por Membro</TabsTrigger>
              </TabsList>

              {/* Aba de Visão Geral */}
              <TabsContent value="overview" className="space-y-6">
                {/* Card de Informações do Time */}
                {teamData && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Informações do Time</CardTitle>
                      <CardDescription>
                        Dados gerais e estatísticas do time
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {/* Callout com resumo do time */}
                      <div className="mb-6 p-4 border-l-4 border-blue-500 bg-blue-50 rounded-r-md">
                        <p className="text-blue-800">{generateTeamSummary(teamData)}</p>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Nome do Time:</span>
                          <span>{teamData.team_data.name}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Total de Membros:</span>
                          <span>{teamData.members.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Total de Registros de Emoções:</span>
                          <span>{teamData.emotions_reports.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Registros Anônimos:</span>
                          <span>{teamData.emotions_reports.filter(report => report.is_anonymous).length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Registros Identificados:</span>
                          <span>{teamData.emotions_reports.filter(report => !report.is_anonymous).length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Data de Criação:</span>
                          <span>{new Date(teamData.team_data.created_at).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Card de Distribuição de Emoções */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Distribuição de Emoções</CardTitle>
                      <CardDescription>
                        Frequência de cada emoção registrada no período
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {emojiDistribution?.emoji_distribution.length === 0 ? (
                        <p className="text-center py-8 text-gray-500">
                          Nenhum registro de emoção encontrado para este período.
                        </p>
                      ) : (
                        <div className="space-y-6">
                          {/* Gráfico de barras */}
                          <div className="mb-8">
                            <EmotionBarChart 
                              data={emojiDistribution ? convertToChartData(emojiDistribution.emoji_distribution) : []}
                              title="Frequência de Emoções"
                              height={300}
                            />
                          </div>
                          
                          {/* Gráfico de pizza */}
                          <div className="mb-8">
                            <EmotionPieChart 
                              data={emojiDistribution ? convertToChartData(emojiDistribution.emoji_distribution) : []}
                              title="Distribuição Percentual de Emoções"
                              height={350}
                            />
                          </div>
                          
                          {/* Barras de progresso existentes */}
                          <div className="mt-8 pt-6 border-t">
                            <h3 className="font-medium mb-4">Detalhamento por Emoção</h3>
                            {emojiDistribution?.emoji_distribution.map((item) => (
                              <div key={item.emotion_name} className="space-y-2 mb-4">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">{item.emotion_name}</span>
                                  <span className="text-sm font-medium">{item.frequency} registros</span>
                                </div>
                                <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-blue-500 rounded-full"
                                    style={{
                                      width: `${Math.min(
                                        (item.frequency /
                                          Math.max(
                                            ...emojiDistribution.emoji_distribution.map(
                                              (i) => i.frequency
                                            )
                                          )) *
                                          100,
                                        100
                                      )}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Proporção de emoções negativas */}
                          <div className="mt-8 pt-6 border-t">
                            <h3 className="font-medium mb-2">Proporção de Emoções Negativas</h3>
                            <div className="flex items-center gap-4">
                              <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-red-500 rounded-full"
                                  style={{
                                    width: `${emojiDistribution?.negative_emotion_ratio ? emojiDistribution.negative_emotion_ratio * 100 : 0}%`,
                                  }}
                                />
                              </div>
                              <span className="text-sm font-medium">
                                {emojiDistribution?.negative_emotion_ratio ? (emojiDistribution.negative_emotion_ratio * 100).toFixed(1) : 0}%
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Card de Intensidade Média */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Intensidade Média</CardTitle>
                      <CardDescription>
                        Intensidade média de cada emoção registrada no período
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {averageIntensity?.average_intensity.length === 0 ? (
                        <p className="text-center py-8 text-gray-500">
                          Nenhum registro de emoção encontrado para este período.
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {averageIntensity?.average_intensity.map((item) => (
                            <div key={item.emotion_name} className="flex items-center justify-between">
                              <span>{item.emotion_name}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-40 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-orange-500 rounded-full"
                                    style={{
                                      width: `${(item.avg_intensity / 5) * 100}%`,
                                    }}
                                  />
                                </div>
                                <span className="text-sm font-medium">
                                  {item.avg_intensity.toFixed(1)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Card de Alerta */}
                {(emojiDistribution?.alert || averageIntensity?.alert) && (
                  <Card className="border-yellow-500">
                    <CardHeader className="bg-yellow-50">
                      <CardTitle className="text-yellow-700">Alerta</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <p>{emojiDistribution?.alert || averageIntensity?.alert}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Card de Registros Anônimos */}
                <Card>
                  <CardHeader>
                    <CardTitle>Registros Anônimos</CardTitle>
                    <CardDescription>
                      Análise dos registros anônimos de emoções
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {anonymousRecords?.all_user_emotion_records.length === 0 ? (
                      <p className="text-center py-8 text-gray-500">
                        Nenhum registro anônimo encontrado para este período.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {anonymousRecords?.all_user_emotion_records.map((item) => (
                          <div key={item.emotion_name} className="flex items-center justify-between">
                            <span>{item.emotion_name}</span>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <span className="text-sm text-gray-500">Freq:</span>
                                <span className="text-sm font-medium">{item.frequency}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-sm text-gray-500">Int:</span>
                                <span className="text-sm font-medium">
                                  {item.avg_intensity.toFixed(1)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Card de Emoções Recentes */}
                {teamData && teamData.emotions_reports.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Emoções Recentes</CardTitle>
                      <CardDescription>
                        Últimos registros de emoções no time
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {teamData.emotions_reports
                          .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())
                          .slice(0, 5)
                          .map((report, index) => {
                            const emotion = teamData.emotions.find(e => e.id === report.emotion_id);
                            const userName = report.is_anonymous 
                              ? 'Anônimo' 
                              : report.user_name || teamData.members.find(m => m.id === report.user_id)?.name || 'Usuário';
                            
                            return (
                              <div key={index} className="p-3 rounded-lg border" style={{ borderColor: emotion?.color || '#e2e8f0' }}>
                                <div className="flex justify-between items-center mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xl">{emotion?.emoji}</span>
                                    <span className="font-medium">{emotion?.name}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500">Intensidade:</span>
                                    <span className="text-sm font-medium">{report.intensity}/5</span>
                                  </div>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                  <span>{userName}</span>
                                  <span className="text-gray-500">
                                    {report.created_at ? new Date(report.created_at).toLocaleString('pt-BR') : 'Data não disponível'}
                                  </span>
                                </div>
                                {report.notes && (
                                  <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                                    {report.notes}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Aba de Distribuição de Emoções */}
              <TabsContent value="emotions" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Distribuição de Emoções</CardTitle>
                    <CardDescription>
                      Frequência de cada emoção registrada no período
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {emojiDistribution?.emoji_distribution.length === 0 ? (
                      <p className="text-center py-8 text-gray-500">
                        Nenhum registro de emoção encontrado para este período.
                      </p>
                    ) : (
                      <div className="space-y-6">
                        {/* Gráfico de barras */}
                        <div className="mb-8">
                          <EmotionBarChart 
                            data={emojiDistribution ? convertToChartData(emojiDistribution.emoji_distribution) : []}
                            title="Frequência de Emoções"
                            height={300}
                          />
                        </div>
                        
                        {/* Gráfico de pizza */}
                        <div className="mb-8">
                          <EmotionPieChart 
                            data={emojiDistribution ? convertToChartData(emojiDistribution.emoji_distribution) : []}
                            title="Distribuição Percentual de Emoções"
                            height={350}
                          />
                        </div>
                        
                        {/* Barras de progresso existentes */}
                        <div className="mt-8 pt-6 border-t">
                          <h3 className="font-medium mb-4">Detalhamento por Emoção</h3>
                          {emojiDistribution?.emoji_distribution.map((item) => (
                            <div key={item.emotion_name} className="space-y-2 mb-4">
                              <div className="flex items-center justify-between">
                                <span className="font-medium">{item.emotion_name}</span>
                                <span className="text-sm font-medium">{item.frequency} registros</span>
                              </div>
                              <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-blue-500 rounded-full"
                                  style={{
                                    width: `${Math.min(
                                      (item.frequency /
                                        Math.max(
                                          ...emojiDistribution.emoji_distribution.map(
                                            (i) => i.frequency
                                          )
                                        )) *
                                        100,
                                      100
                                    )}%`,
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Proporção de emoções negativas */}
                        <div className="mt-8 pt-6 border-t">
                          <h3 className="font-medium mb-2">Proporção de Emoções Negativas</h3>
                          <div className="flex items-center gap-4">
                            <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-red-500 rounded-full"
                                style={{
                                  width: `${emojiDistribution?.negative_emotion_ratio ? emojiDistribution.negative_emotion_ratio * 100 : 0}%`,
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium">
                              {emojiDistribution?.negative_emotion_ratio ? (emojiDistribution.negative_emotion_ratio * 100).toFixed(1) : 0}%
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Aba de Intensidade Média */}
              <TabsContent value="intensity" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Intensidade Média das Emoções</CardTitle>
                    <CardDescription>
                      Intensidade média de cada emoção registrada no período
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {averageIntensity?.average_intensity.length === 0 ? (
                      <p className="text-center py-8 text-gray-500">
                        Nenhum registro de emoção encontrado para este período.
                      </p>
                    ) : (
                      <div className="space-y-6">
                        {/* Gráfico de barras */}
                        <div className="mb-8">
                          <EmotionBarChart 
                            data={averageIntensity ? convertToChartData(averageIntensity.average_intensity) : []}
                            title="Intensidade Média por Emoção"
                            height={300}
                          />
                        </div>
                        
                        {/* Barras de progresso existentes */}
                        <div className="mt-8 pt-6 border-t">
                          <h3 className="font-medium mb-4">Detalhamento por Emoção</h3>
                          {averageIntensity?.average_intensity.map((item) => (
                            <div key={item.emotion_name} className="space-y-2 mb-4">
                              <div className="flex items-center justify-between">
                                <span className="font-medium">{item.emotion_name}</span>
                                <span className="text-sm font-medium">
                                  {item.avg_intensity.toFixed(1)} / 5
                                </span>
                              </div>
                              <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-orange-500 rounded-full"
                                  style={{
                                    width: `${(item.avg_intensity / 5) * 100}%`,
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Aba de Análise por Membro */}
              <TabsContent value="members" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Análise por Membro</CardTitle>
                    <CardDescription>
                      Análise detalhada das emoções por membro do time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="flex flex-wrap gap-2">
                        {members.map((member) => (
                          <Button
                            key={member.id}
                            variant={selectedMemberId === member.id ? "default" : "outline"}
                            onClick={() => setSelectedMemberId(member.id)}
                          >
                            {member.name}
                          </Button>
                        ))}
                      </div>

                      {selectedMemberId && userEmotionAnalysis ? (
                        <div className="mt-6">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium">
                              Análise de {userEmotionAnalysis.user_name}
                            </h3>
                            
                            {/* Botão de Feedback - apenas para gerentes */}
                            {teamData?.user_role === 'manager' && (
                              <FeedbackMessage 
                                teamId={teamId}
                                memberId={selectedMemberId}
                                memberName={userEmotionAnalysis.user_name}
                              />
                            )}
                          </div>
                          
                          {userEmotionAnalysis.all_user_emotion_records.length === 0 ? (
                            <p className="text-center py-8 text-gray-500">
                              Nenhum registro de emoção encontrado para este membro no período selecionado.
                            </p>
                          ) : (
                            <div className="space-y-6">
                              {userEmotionAnalysis.all_user_emotion_records.map((item) => (
                                <div key={item.emotion_name} className="space-y-4">
                                  <div className="flex justify-between items-center">
                                    <h4 className="font-medium">{item.emotion_name}</h4>
                                    
                                    {/* Botão de Feedback específico para emoção - apenas para gerentes */}
                                    {teamData?.user_role === 'manager' && (
                                      <FeedbackMessage 
                                        teamId={teamId}
                                        memberId={selectedMemberId}
                                        memberName={userEmotionAnalysis.user_name}
                                        emotionName={item.emotion_name}
                                      />
                                    )}
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm text-gray-600">Frequência</span>
                                      <span className="text-sm font-medium">{item.frequency} registros</span>
                                    </div>
                                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-blue-500 rounded-full"
                                        style={{
                                          width: `${Math.min(
                                            (item.frequency /
                                              Math.max(
                                                ...userEmotionAnalysis.all_user_emotion_records.map(
                                                  (i) => i.frequency
                                                )
                                              )) *
                                              100,
                                            100
                                          )}%`,
                                        }}
                                      />
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm text-gray-600">Intensidade Média</span>
                                      <span className="text-sm font-medium">{item.avg_intensity.toFixed(1)} / 5</span>
                                    </div>
                                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-orange-500 rounded-full"
                                        style={{
                                          width: `${(item.avg_intensity / 5) * 100}%`,
                                        }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-center py-8 text-gray-500">
                          Selecione um membro para ver sua análise de emoções.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Card de Visão Geral dos Membros */}
                {teamData && teamData.members.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Visão Geral dos Membros</CardTitle>
                      <CardDescription>
                        Distribuição de emoções por membro do time
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {teamData.members.map(member => {
                          // Filtrar relatórios para este membro
                          const memberReports = teamData.emotions_reports.filter(
                            report => !report.is_anonymous && report.user_id === member.id
                          );
                          
                          // Contar emoções
                          const emotionCounts = new Map<number, number>();
                          memberReports.forEach(report => {
                            emotionCounts.set(report.emotion_id, (emotionCounts.get(report.emotion_id) || 0) + 1);
                          });
                          
                          // Encontrar a emoção mais frequente
                          let mostFrequentEmotionId: number | null = null;
                          let maxCount = 0;
                          
                          emotionCounts.forEach((count, emotionId) => {
                            if (count > maxCount) {
                              maxCount = count;
                              mostFrequentEmotionId = emotionId;
                            }
                          });
                          
                          const mostFrequentEmotion = mostFrequentEmotionId 
                            ? teamData.emotions.find(e => e.id === mostFrequentEmotionId)
                            : null;
                          
                          return (
                            <div key={member.id} className="p-4 border rounded-lg">
                              <div className="flex justify-between items-center mb-3">
                                <h4 className="font-medium">{member.name}</h4>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-500">{member.role === 'manager' ? 'Gerente' : 'Membro'}</span>
                                  
                                  {/* Botão de Feedback - apenas para gerentes */}
                                  {teamData.user_role === 'manager' && member.role !== 'manager' && (
                                    <FeedbackMessage 
                                      teamId={teamId}
                                      memberId={member.id}
                                      memberName={member.name}
                                    />
                                  )}
                                </div>
                              </div>
                              
                              {memberReports.length > 0 ? (
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600">Total de registros:</span>
                                    <span className="text-sm font-medium">{memberReports.length}</span>
                                  </div>
                                  
                                  {mostFrequentEmotion && (
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-600">Emoção mais frequente:</span>
                                        <div className="flex items-center gap-1">
                                          <span>{mostFrequentEmotion.emoji}</span>
                                          <span className="text-sm font-medium">{mostFrequentEmotion.name}</span>
                                          <span className="text-xs text-gray-500">({maxCount} vezes)</span>
                                        </div>
                                      </div>
                                      
                                      {/* Botão de Feedback específico para emoção - apenas para gerentes */}
                                      {teamData.user_role === 'manager' && member.role !== 'manager' && (
                                        <FeedbackMessage 
                                          teamId={teamId}
                                          memberId={member.id}
                                          memberName={member.name}
                                          emotionId={mostFrequentEmotion.id}
                                          emotionName={`${mostFrequentEmotion.emoji} ${mostFrequentEmotion.name}`}
                                        />
                                      )}
                                    </div>
                                  )}
                                  
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {Array.from(emotionCounts.entries()).map(([emotionId, count]) => {
                                      const emotion = teamData.emotions.find(e => e.id === emotionId);
                                      if (!emotion) return null;
                                      
                                      return (
                                        <div 
                                          key={emotionId} 
                                          className="px-2 py-1 rounded-full text-xs flex items-center gap-1"
                                          style={{ 
                                            backgroundColor: `${emotion.color}20`, 
                                            color: emotion.color 
                                          }}
                                        >
                                          <span>{emotion.emoji}</span>
                                          <span>{count}</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              ) : (
                                <p className="text-sm text-gray-500">Nenhum registro de emoção encontrado.</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 