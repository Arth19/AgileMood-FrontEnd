"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, MessageSquare, RefreshCw } from "lucide-react";
import { useAuthContext } from "@/contexts/auth-context";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Feedback {
  id: number;
  team_id: number;
  user_id: number | null;
  emotion_id: number | null;
  message: string;
  is_anonymous: boolean;
  created_at: string;
  emotion_name?: string;
  emotion_emoji?: string;
}

export function FeedbackInbox() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
      const response = await fetch(`${apiUrl}/feedback/user`, {
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
    } catch (error) {
      console.error("Erro ao buscar feedbacks:", error);
      setError("Ocorreu um erro ao carregar seus feedbacks. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, [user]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Seus Feedbacks</CardTitle>
          <CardDescription>
            Mensagens de feedback do seu gerente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Seus Feedbacks</CardTitle>
          <CardDescription>
            Mensagens de feedback do seu gerente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={fetchFeedbacks} variant="outline" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Tentar novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Seus Feedbacks</CardTitle>
          <CardDescription>
            Mensagens de feedback do seu gerente
          </CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchFeedbacks}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Atualizar
        </Button>
      </CardHeader>
      <CardContent>
        {feedbacks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Você ainda não recebeu nenhum feedback.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {feedbacks.map((feedback) => (
              <div 
                key={feedback.id} 
                className="p-4 border rounded-lg"
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
                    </div>
                    {feedback.emotion_name && (
                      <div className="text-sm text-gray-600 mb-1">
                        Sobre a emoção: {feedback.emotion_emoji} {feedback.emotion_name}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {format(new Date(feedback.created_at), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                  </span>
                </div>
                <div className="mt-3 p-3 bg-gray-50 rounded-md">
                  {feedback.message}
                </div>
                {feedback.is_anonymous && (
                  <div className="mt-2 text-xs text-amber-600">
                    Nota: Este feedback foi enviado de forma anônima. O gerente não sabe que foi enviado especificamente para você.
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 