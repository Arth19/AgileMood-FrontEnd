"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, MessageSquare, RefreshCw } from "lucide-react";
import { useAuthContext } from "@/contexts/auth-context";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TeamMessage {
  id: number;
  team_id: number;
  message: string;
  created_at: string;
}

export function TeamMessages({ teamId }: { teamId: number }) {
  const [messages, setMessages] = useState<TeamMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthContext();

  const fetchTeamMessages = async () => {
    if (!user || !teamId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const fallbackUrl =
      process.env.NODE_ENV === 'production'
        ? 'https://agilemood-backend-production.up.railway.app'
        : 'http://localhost:8000';

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || fallbackUrl;
      if (!apiUrl) {
        throw new Error('URL da API não configurada');
      }

      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/teams/${teamId}/messages`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Falha ao buscar mensagens: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error("Erro ao buscar mensagens do time:", error);
      setError("Ocorreu um erro ao carregar as mensagens do time. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamMessages();
  }, [user, teamId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mensagens do Time</CardTitle>
          <CardDescription>
            Comunicados e informações importantes
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
          <CardTitle>Mensagens do Time</CardTitle>
          <CardDescription>
            Comunicados e informações importantes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={fetchTeamMessages} variant="outline" className="flex items-center gap-2">
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
          <CardTitle>Mensagens do Time</CardTitle>
          <CardDescription>
            Comunicados e informações importantes
          </CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchTeamMessages}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Atualizar
        </Button>
      </CardHeader>
      <CardContent>
        {messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Não há mensagens para exibir.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className="p-4 border rounded-lg border-l-4 border-l-blue-500"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <MessageSquare className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">
                      Mensagem do Time
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {format(new Date(message.created_at), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                  </span>
                </div>
                <div className="mt-3 p-3 bg-gray-50 rounded-md">
                  {message.message}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 