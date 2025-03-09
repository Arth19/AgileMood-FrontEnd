"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import ProtectedRoute from "@/components/ui/protected-route";
import Sidebar from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "sonner";
import { useRouter } from "next/navigation";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { ptBR } from "date-fns/locale";

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
  user_id: number;
  emotion_id: number;
  intensity: number;
  notes: string;
  is_anonymous: boolean;
  created_at: string;
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
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)), // Últimos 30 dias
    to: new Date(),
  });
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [emojiDistribution, setEmojiDistribution] = useState<EmojiDistributionResponse | null>(null);
  const [averageIntensity, setAverageIntensity] = useState<AverageIntensityResponse | null>(null);
  const [userEmotionAnalysis, setUserEmotionAnalysis] = useState<UserEmotionAnalysisResponse | null>(null);
  const [anonymousRecords, setAnonymousRecords] = useState<AnonymousRecordsResponse | null>(null);
  const [teamData, setTeamData] = useState<TeamResponse | null>(null);
  
  const router = useRouter();

  // Função para processar os registros de emoções e gerar a distribuição de emojis
  const generateEmojiDistribution = () => {
    if (!teamData) return null;
    
    const { emotions_reports, emotions } = teamData;
    
    // Filtra os registros pelo intervalo de datas selecionado
    const filteredReports = filterReportsByDateRange(emotions_reports);
    
    // Inicializa o contador para cada emoção
    const emotionCounts = new Map<number, number>();
    emotions.forEach(emotion => emotionCounts.set(emotion.id, 0));
    
    // Conta a frequência de cada emoção
    filteredReports.forEach(report => {
      const count = emotionCounts.get(report.emotion_id) || 0;
      emotionCounts.set(report.emotion_id, count + 1);
    });
    
    // Formata os dados para o formato esperado
    const distribution: EmojiDistribution[] = emotions.map(emotion => {
      const frequency = emotionCounts.get(emotion.id) || 0;
      return {
        emotion_name: `${emotion.emoji} ${emotion.name}`,
        frequency
      };
    }).sort((a, b) => b.frequency - a.frequency); // Ordena por frequência decrescente
    
    // Calcula a proporção de emoções negativas
    const totalFrequency = distribution.reduce((sum, item) => sum + item.frequency, 0);
    const negativeFrequency = emotions
      .filter(emotion => emotion.is_negative)
      .reduce((sum, emotion) => {
        return sum + (emotionCounts.get(emotion.id) || 0);
      }, 0);
    
    const negativeRatio = totalFrequency > 0 ? negativeFrequency / totalFrequency : 0;
    
    // Gera um alerta se a proporção de emoções negativas for alta
    let alert = "";
    if (negativeRatio > 0.6) {
      alert = "Atenção! A proporção de emoções negativas está muito alta. Considere realizar ações para melhorar o clima do time.";
    } else if (negativeRatio > 0.4) {
      alert = "A proporção de emoções negativas está moderadamente alta. Monitore a situação.";
    }
    
    return {
      emoji_distribution: distribution,
      negative_emotion_ratio: negativeRatio,
      alert
    };
  };

  // Função para processar os registros de emoções e gerar a intensidade média
  const generateAverageIntensity = () => {
    if (!teamData) return null;
    
    const { emotions_reports, emotions } = teamData;
    
    // Filtra os registros pelo intervalo de datas selecionado
    const filteredReports = filterReportsByDateRange(emotions_reports);
    
    // Inicializa os acumuladores para cada emoção
    const emotionIntensities = new Map<number, number[]>();
    emotions.forEach(emotion => emotionIntensities.set(emotion.id, []));
    
    // Acumula as intensidades para cada emoção
    filteredReports.forEach(report => {
      const intensities = emotionIntensities.get(report.emotion_id) || [];
      intensities.push(report.intensity);
      emotionIntensities.set(report.emotion_id, intensities);
    });
    
    // Calcula a intensidade média para cada emoção
    const intensities: AverageIntensity[] = emotions.map(emotion => {
      const intensityValues = emotionIntensities.get(emotion.id) || [];
      const avgIntensity = intensityValues.length > 0
        ? intensityValues.reduce((sum, val) => sum + val, 0) / intensityValues.length
        : 0;
      
      return {
        emotion_name: `${emotion.emoji} ${emotion.name}`,
        avg_intensity: Number(avgIntensity.toFixed(1))
      };
    }).sort((a, b) => b.avg_intensity - a.avg_intensity); // Ordena por intensidade decrescente
    
    // Calcula a proporção de intensidade de emoções negativas
    const totalIntensity = intensities.reduce((sum, item) => sum + item.avg_intensity, 0);
    const negativeIntensity = emotions
      .filter(emotion => emotion.is_negative)
      .reduce((sum, emotion) => {
        const intensityValues = emotionIntensities.get(emotion.id) || [];
        const avgIntensity = intensityValues.length > 0
          ? intensityValues.reduce((sum, val) => sum + val, 0) / intensityValues.length
          : 0;
        return sum + avgIntensity;
      }, 0);
    
    const negativeRatio = totalIntensity > 0 ? negativeIntensity / totalIntensity : 0;
    
    // Gera um alerta se a intensidade média de emoções negativas for alta
    let alert = "";
    if (negativeRatio > 0.6) {
      alert = "Atenção! A intensidade das emoções negativas está muito alta. Isso pode indicar problemas sérios no time.";
    } else if (negativeRatio > 0.4) {
      alert = "A intensidade das emoções negativas está moderadamente alta. Considere investigar as causas.";
    }
    
    return {
      average_intensity: intensities,
      negative_emotion_ratio: negativeRatio,
      alert
    };
  };

  // Função para processar os registros de emoções e gerar a análise por usuário
  const generateUserEmotionAnalysis = (userId: number) => {
    if (!teamData) return null;
    
    const { emotions_reports, emotions, members } = teamData;
    const user = members.find(member => member.team_id === userId);
    
    if (!user) return null;
    
    // Filtra os registros pelo intervalo de datas selecionado e pelo usuário
    const filteredReports = filterReportsByDateRange(emotions_reports)
      .filter(report => report.user_id === userId && !report.is_anonymous);
    
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
  };

  // Função para processar os registros de emoções anônimos
  const generateAnonymousRecords = () => {
    if (!teamData) return null;
    
    const { emotions_reports, emotions } = teamData;
    
    // Filtra os registros pelo intervalo de datas selecionado e que são anônimos
    const filteredReports = filterReportsByDateRange(emotions_reports)
      .filter(report => report.is_anonymous);
    
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
      user_name: "Registros Anônimos",
      all_user_emotion_records: records
    };
  };

  // Função auxiliar para filtrar registros pelo intervalo de datas
  const filterReportsByDateRange = (reports: EmotionReport[]) => {
    if (!dateRange?.from || !dateRange?.to) return reports;
    
    return reports.filter(report => {
      const reportDate = new Date(report.created_at);
      return reportDate >= dateRange.from! && reportDate <= dateRange.to!;
    });
  };

  // Buscar dados do time
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
      setMembers(data.members);
      if (data.members.length > 0) {
        setSelectedMemberId(data.members[0].team_id);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err);
      } else {
        setError(new Error('Erro desconhecido ao buscar dados do time'));
      }
    }
  };

  // Processar dados para o dashboard
  const processData = () => {
    if (!teamData) return;
    
    // Gera os dados para o dashboard a partir dos registros de emoções
    const emojiDistributionData = generateEmojiDistribution();
    if (emojiDistributionData) {
      setEmojiDistribution(emojiDistributionData);
    }
    
    const averageIntensityData = generateAverageIntensity();
    if (averageIntensityData) {
      setAverageIntensity(averageIntensityData);
    }
    
    const anonymousRecordsData = generateAnonymousRecords();
    if (anonymousRecordsData) {
      setAnonymousRecords(anonymousRecordsData);
    }
    
    if (selectedMemberId) {
      const userEmotionAnalysisData = generateUserEmotionAnalysis(selectedMemberId);
      if (userEmotionAnalysisData) {
        setUserEmotionAnalysis(userEmotionAnalysisData);
      }
    }
  };

  // Buscar todos os dados
  const fetchAllData = async () => {
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
  };

  // Efeito para buscar dados quando a página carrega
  useEffect(() => {
    fetchAllData();
  }, [teamId]);

  // Efeito para processar dados quando o teamData é carregado ou o intervalo de datas muda
  useEffect(() => {
    if (teamData && !loading) {
      processData();
    }
  }, [teamData, dateRange]);

  // Efeito para processar dados quando o membro selecionado muda
  useEffect(() => {
    if (teamData && selectedMemberId && !loading) {
      const userEmotionAnalysisData = generateUserEmotionAnalysis(selectedMemberId);
      if (userEmotionAnalysisData) {
        setUserEmotionAnalysis(userEmotionAnalysisData);
      }
    }
  }, [selectedMemberId, teamData]);

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
                <DateRangePicker
                  value={dateRange}
                  onChange={setDateRange}
                  locale={ptBR}
                  placeholder="Selecione um período"
                />
                <Button onClick={() => router.push(`/teams/${teamId}`)}>
                  Voltar para o Time
                </Button>
              </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                <TabsTrigger value="emotions">Distribuição de Emoções</TabsTrigger>
                <TabsTrigger value="intensity">Intensidade Média</TabsTrigger>
                <TabsTrigger value="members">Análise por Membro</TabsTrigger>
              </TabsList>

              {/* Aba de Visão Geral */}
              <TabsContent value="overview" className="space-y-6">
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
                        <div className="space-y-4">
                          {emojiDistribution?.emoji_distribution.map((item) => (
                            <div key={item.emotion_name} className="flex items-center justify-between">
                              <span>{item.emotion_name}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-40 h-2 bg-gray-200 rounded-full overflow-hidden">
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
                                <span className="text-sm font-medium">{item.frequency}</span>
                              </div>
                            </div>
                          ))}
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
                        {emojiDistribution?.emoji_distribution.map((item) => (
                          <div key={item.emotion_name} className="space-y-2">
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
                        {averageIntensity?.average_intensity.map((item) => (
                          <div key={item.emotion_name} className="space-y-2">
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
                          <h3 className="text-lg font-medium mb-4">
                            Análise de {userEmotionAnalysis.user_name}
                          </h3>
                          
                          {userEmotionAnalysis.all_user_emotion_records.length === 0 ? (
                            <p className="text-center py-8 text-gray-500">
                              Nenhum registro de emoção encontrado para este membro no período selecionado.
                            </p>
                          ) : (
                            <div className="space-y-6">
                              {userEmotionAnalysis.all_user_emotion_records.map((item) => (
                                <div key={item.emotion_name} className="space-y-4">
                                  <h4 className="font-medium">{item.emotion_name}</h4>
                                  
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
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 