"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TeamMessages } from "@/components/feedback/team-messages";
import { TeamMessageSender } from "@/components/feedback/team-message-sender";
import ProtectedRoute from "@/components/ui/protected-route";
import Sidebar from "@/components/ui/sidebar";
import { Toaster } from "sonner";
import { TeamResponse } from "@/lib/types/index";

interface MessagesPageClientProps {
  teamId: number;
}

export default function MessagesPageClient({ teamId }: MessagesPageClientProps) {
  const [loading, setLoading] = useState(true);
  const [teamData, setTeamData] = useState<TeamResponse | null>(null);
  const router = useRouter();

  const fetchTeamData = async () => {
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
      const response = await fetch(`${apiUrl}/teams/${teamId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar dados do time: ${response.status}`);
      }

      const data = await response.json();
      setTeamData(data);
    } catch (error) {
      console.error('Erro ao buscar dados do time:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamData();
  }, [teamId]);

  const handleMessageSent = () => {
    // Recarregar as mensagens após enviar uma nova
    // Isso será tratado pelo componente TeamMessages
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex h-screen">
          <Sidebar />
          <div className="flex-1 overflow-y-auto bg-gray-100">
            <div className="flex h-screen items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Carregando dados do time...</p>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const isManager = teamData?.user_role === 'manager';
  const teamName = teamData?.team_data?.name || 'Time';

  return (
    <ProtectedRoute>
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 overflow-y-auto bg-gray-100">
          <Toaster richColors position="bottom-right" />
          <div className="container mx-auto py-6">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => router.push(`/teams/${teamId}`)}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-2xl font-bold">Mensagens do Time: {teamName}</h1>
              </div>
              
              {isManager && (
                <TeamMessageSender 
                  teamId={teamId} 
                  onMessageSent={handleMessageSent}
                />
              )}
            </div>
            
            <TeamMessages teamId={teamId} />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 