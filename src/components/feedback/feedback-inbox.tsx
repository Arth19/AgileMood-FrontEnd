"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, MessageSquare, RefreshCw, ChevronDown, ChevronUp, Filter } from "lucide-react";
import { useAuthContext } from "@/contexts/auth-context";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Feedback {
  id: number;
  message: string;
  emotion_record_id: number;
  is_anonymous: boolean;
  manager_id: number;
  created_at: string;
  manager_knows_identity: boolean;
  emotion_name?: string;
  emotion_emoji?: string;
}

interface EmotionRecord {
  id: number;
  emotion_name: string;
  emotion_emoji: string;
  created_at: string;
  notes?: string;
}

export function FeedbackInbox() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedFeedback, setExpandedFeedback] = useState<number | null>(null);
  const [emotionRecords, setEmotionRecords] = useState<Record<number, EmotionRecord>>({});
  const [selectedEmotionRecord, setSelectedEmotionRecord] = useState<number | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'anonymous' | 'identified'>('all');
  const { user } = useAuthContext();

  const fetchFeedbacks = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error('URL da API não configurada');
      }

      const token = localStorage.getItem('token');
      
      // Se um registro de emoção específico for selecionado, busque apenas os feedbacks para esse registro
      const endpoint = selectedEmotionRecord 
        ? `${apiUrl}/feedback/emotion-record/${selectedEmotionRecord}`
        : `${apiUrl}/feedback/`;
      
      const response = await fetch(endpoint, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Falha ao buscar feedbacks: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      setFeedbacks(data.feedbacks || []);
      
      // Buscar detalhes dos registros de emoção para cada feedback
      const uniqueEmotionRecordIds = [...new Set(data.feedbacks.map((f: Feedback) => f.emotion_record_id))];
      await fetchEmotionRecordDetails(uniqueEmotionRecordIds, token, apiUrl);
      
    } catch (error) {
      console.error("Erro ao buscar feedbacks:", error);
      setError("Ocorreu um erro ao carregar seus feedbacks. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };
  
  const fetchEmotionRecordDetails = async (recordIds: number[], token: string, apiUrl: string) => {
    const recordDetails: Record<number, EmotionRecord> = {};
    
    for (const recordId of recordIds) {
      try {
        const response = await fetch(`${apiUrl}/emotions/record/${recordId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          recordDetails[recordId] = {
            id: data.id,
            emotion_name: data.emotion.name,
            emotion_emoji: data.emotion.emoji,
            created_at: data.created_at,
            notes: data.notes
          };
        }
      } catch (error) {
        console.error(`Erro ao buscar detalhes do registro de emoção ${recordId}:`, error);
      }
    }
    
    setEmotionRecords(recordDetails);
  };

  useEffect(() => {
    fetchFeedbacks();
  }, [user, selectedEmotionRecord]);

  const toggleExpandFeedback = (id: number) => {
    setExpandedFeedback(expandedFeedback === id ? null : id);
  };
  
  const filteredFeedbacks = feedbacks.filter(feedback => {
    if (filterType === 'all') return true;
    if (filterType === 'anonymous') return feedback.is_anonymous;
    if (filterType === 'identified') return !feedback.is_anonymous;
    return true;
  });
  
  const resetFilters = () => {
    setSelectedEmotionRecord(null);
    setFilterType('all');
  };
  
  const getEmotionRecordOptions = () => {
    const uniqueRecords = [...new Set(feedbacks.map(f => f.emotion_record_id))];
    return uniqueRecords.map(id => ({
      id,
      name: emotionRecords[id]?.emotion_name || `Registro #${id}`,
      emoji: emotionRecords[id]?.emotion_emoji || '🔍'
    }));
  };

  if (loading) {
    return (
      <Card className="shadow-md border-blue-100">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b pb-4">
          <CardTitle className="text-blue-800">Seus Feedbacks Recebidos</CardTitle>
          <CardDescription className="text-blue-600">
            Feedbacks recebidos do seu gerente sobre suas emoções registradas
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-md border-red-100">
        <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50 border-b pb-4">
          <CardTitle className="text-red-800">Seus Feedbacks Recebidos</CardTitle>
          <CardDescription className="text-red-600">
            Feedbacks recebidos do seu gerente sobre suas emoções registradas
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p className="text-red-500 mb-6">{error}</p>
            <Button onClick={fetchFeedbacks} variant="outline" className="flex items-center gap-2 border-red-300 hover:bg-red-50">
              <RefreshCw className="h-4 w-4" />
              Tentar novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-blue-100 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b pb-4">
        <div className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-blue-800">Seus Feedbacks Recebidos</CardTitle>
            <CardDescription className="text-blue-600">
              Feedbacks recebidos do seu gerente sobre suas emoções registradas
            </CardDescription>
          </div>
          <div className="flex gap-2">
            
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchFeedbacks}
              className="flex items-center gap-1 border-blue-200 bg-white"
            >
              <RefreshCw className="h-4 w-4 text-blue-600" />
              <span>Atualizar</span>
            </Button>
          </div>
        </div>
        
        {(selectedEmotionRecord || filterType !== 'all') && (
          <div className="flex gap-2 mt-3">
            {selectedEmotionRecord && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
                Emoção: {emotionRecords[selectedEmotionRecord]?.emotion_emoji} {emotionRecords[selectedEmotionRecord]?.emotion_name || `#${selectedEmotionRecord}`}
                <button onClick={() => setSelectedEmotionRecord(null)} className="ml-1 hover:bg-blue-100 rounded-full p-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              </Badge>
            )}
            {filterType !== 'all' && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
                {filterType === 'anonymous' ? 'Apenas anônimos' : 'Apenas identificados'}
                <button onClick={() => setFilterType('all')} className="ml-1 hover:bg-blue-100 rounded-full p-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              </Badge>
            )}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="p-0">
        <Tabs defaultValue="list" className="w-full">
          <TabsList className="w-full grid grid-cols-2 rounded-none bg-blue-50/50">
            <TabsTrigger value="list" className="data-[state=active]:bg-white">Lista</TabsTrigger>
            <TabsTrigger value="timeline" className="data-[state=active]:bg-white">Linha do Tempo</TabsTrigger>
          </TabsList>
          
          <TabsContent value="list" className="p-4">
            {filteredFeedbacks.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">Nenhum feedback encontrado</p>
                <p className="text-sm text-gray-400">
                  {selectedEmotionRecord || filterType !== 'all' 
                    ? 'Tente remover os filtros para ver mais resultados.' 
                    : 'Você ainda não recebeu nenhum feedback.'}
                </p>
                {(selectedEmotionRecord || filterType !== 'all') && (
                  <Button onClick={resetFilters} variant="outline" className="mt-4">
                    Limpar filtros
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFeedbacks.map((feedback) => {
                  const emotionRecord = emotionRecords[feedback.emotion_record_id];
                  const isExpanded = expandedFeedback === feedback.id;
                  
                  return (
                    <div 
                      key={feedback.id} 
                      className={`p-4 border rounded-lg transition-all duration-200 ${isExpanded ? 'shadow-md' : 'shadow-sm'}`}
                      style={{
                        borderColor: feedback.is_anonymous ? '#f59e0b' : '#3b82f6',
                        borderLeftWidth: '4px'
                      }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <MessageSquare className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">
                              {feedback.is_anonymous ? 'Feedback Anônimo' : 'Feedback do Gerente'}
                            </span>
                            {feedback.is_anonymous && (
                              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                Anônimo
                              </Badge>
                            )}
                          </div>
                          {emotionRecord && (
                            <div className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                              <span>Sobre a emoção:</span>
                              <Badge variant="secondary" className="bg-gray-100 text-gray-700 flex items-center gap-1">
                                {emotionRecord.emotion_emoji} {emotionRecord.emotion_name}
                              </Badge>
                              <span className="text-xs text-gray-400">
                                {format(new Date(emotionRecord.created_at), "dd/MM/yyyy", { locale: ptBR })}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-xs text-gray-500">
                            {format(new Date(feedback.created_at), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                          </span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 px-2 text-gray-500"
                            onClick={() => toggleExpandFeedback(feedback.id)}
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      
                      <div className={`mt-3 p-4 bg-gray-50 rounded-md ${isExpanded ? 'border border-gray-200' : ''}`}>
                        <p className="text-gray-800 whitespace-pre-line">{feedback.message}</p>
                      </div>
                      
                      {isExpanded && (
                        <div className="mt-3 text-sm">
                          {feedback.is_anonymous && !feedback.manager_knows_identity && (
                            <div className="mt-2 text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                              <span className="font-medium">Nota:</span> Este feedback foi enviado de forma anônima. O gerente não sabe que foi enviado especificamente para você.
                            </div>
                          )}
                          {feedback.is_anonymous && feedback.manager_knows_identity && (
                            <div className="mt-2 text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                              <span className="font-medium">Nota:</span> Este feedback foi enviado de forma anônima, mas o gerente sabe que foi enviado para você.
                            </div>
                          )}
                          
                          {emotionRecord?.notes && (
                            <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                              <p className="text-xs text-blue-700 font-medium mb-1">Suas notas sobre esta emoção:</p>
                              <p className="text-sm text-blue-800">{emotionRecord.notes}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="timeline" className="p-4">
            {filteredFeedbacks.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">Nenhum feedback encontrado</p>
                <p className="text-sm text-gray-400">
                  {selectedEmotionRecord || filterType !== 'all' 
                    ? 'Tente remover os filtros para ver mais resultados.' 
                    : 'Você ainda não recebeu nenhum feedback.'}
                </p>
                {(selectedEmotionRecord || filterType !== 'all') && (
                  <Button onClick={resetFilters} variant="outline" className="mt-4">
                    Limpar filtros
                  </Button>
                )}
              </div>
            ) : (
              <div className="relative border-l-2 border-blue-200 pl-6 ml-3 space-y-6 py-2">
                {filteredFeedbacks.map((feedback) => {
                  const emotionRecord = emotionRecords[feedback.emotion_record_id];
                  const feedbackDate = new Date(feedback.created_at);
                  
                  return (
                    <div key={feedback.id} className="relative">
                      <div className="absolute -left-9 mt-1.5 w-4 h-4 rounded-full bg-white border-2 border-blue-500"></div>
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-600">
                          {format(feedbackDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </span>
                        <span className="text-xs text-gray-500">
                          {format(feedbackDate, "HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                      
                      <div 
                        className="p-4 border rounded-lg shadow-sm"
                        style={{
                          borderColor: feedback.is_anonymous ? '#f59e0b' : '#3b82f6',
                          borderLeftWidth: '4px'
                        }}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">
                              {feedback.is_anonymous ? 'Feedback Anônimo' : 'Feedback do Gerente'}
                            </span>
                            {feedback.is_anonymous && (
                              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                Anônimo
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {emotionRecord && (
                          <div className="text-sm text-gray-600 mb-3 flex items-center gap-1">
                            <span>Sobre a emoção:</span>
                            <Badge variant="secondary" className="bg-gray-100 text-gray-700 flex items-center gap-1">
                              {emotionRecord.emotion_emoji} {emotionRecord.emotion_name}
                            </Badge>
                          </div>
                        )}
                        
                        <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                          <p className="text-gray-800 whitespace-pre-line">{feedback.message}</p>
                        </div>
                        
                        {feedback.is_anonymous && !feedback.manager_knows_identity && (
                          <div className="mt-2 text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                            <span className="font-medium">Nota:</span> Este feedback foi enviado de forma anônima. O gerente não sabe que foi enviado especificamente para você.
                          </div>
                        )}
                        {feedback.is_anonymous && feedback.manager_knows_identity && (
                          <div className="mt-2 text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                            <span className="font-medium">Nota:</span> Este feedback foi enviado de forma anônima, mas o gerente sabe que foi enviado para você.
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 