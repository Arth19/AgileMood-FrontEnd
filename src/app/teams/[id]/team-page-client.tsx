"use client";

import { useEffect, useState } from "react";
import { TeamResponse, TeamMember, TeamEmotion } from "@/lib/types/index";
import { notFound } from "next/navigation";
import { Loader2 } from "lucide-react";
import ProtectedRoute from "@/components/ui/protected-route";

interface TeamPageClientProps {
  teamId: number;
}

export default function TeamPageClient({ teamId }: TeamPageClientProps) {
  const [teamData, setTeamData] = useState<TeamResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
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
      } catch (error) {
        console.error('Erro ao buscar dados do time:', error);
        setError(error instanceof Error ? error : new Error('Erro desconhecido'));
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, [teamId]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando dados do time...</p>
        </div>
      </div>
    );
  }

  if (error || !teamData) {
    notFound();
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-3xl font-bold mb-6">{teamData.team_data.name}</h1>
          
          {/* Seção de Membros */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Membros do Time</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teamData.members.map((member: TeamMember) => (
                <div key={member.email} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    {member.avatar && (
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-10 h-10 rounded-full"
                      />
                    )}
                    <div>
                      <p className="font-semibold">{member.name}</p>
                      <p className="text-sm text-gray-600">{member.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Seção de Emoções */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Emoções do Time</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {teamData.emotions.map((emotion: TeamEmotion) => (
                <div
                  key={emotion.id}
                  className="flex items-center gap-2 p-3 rounded-lg"
                  style={{ backgroundColor: `${emotion.color}20` }}
                >
                  <span className="text-2xl">{emotion.emoji}</span>
                  <span className="font-medium">{emotion.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 