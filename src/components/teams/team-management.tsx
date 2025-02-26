"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Team } from "@/lib/types";
import { Pencil, Trash2 } from "lucide-react";
import { useTeam } from "@/contexts/team-context";
import { useAuthContext } from "@/contexts/auth-context";

export function TeamManagement() {
  const { teams, isLoading, createTeam, updateTeam, deleteTeam, loadTeams } = useTeam();
  const { user } = useAuthContext();
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [formData, setFormData] = useState({ name: "" });

  useEffect(() => {
    loadTeams();
  }, [loadTeams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!user?.email) {
      console.error("Usuário não autenticado");
      return;
    }

    try {
      if (editingTeam) {
        await updateTeam({ 
          ...formData, 
          id: editingTeam.id,
          manager_id: user.email
        });
      } else {
        await createTeam({ ...formData, manager_id: user.email });
      }
      setFormData({ name: "" });
      setEditingTeam(null);
    } catch (error) {
      console.error("Erro ao salvar time:", error);
    }
  }

  async function handleDelete(id: number) {
    if (confirm("Tem certeza que deseja excluir este time?")) {
      try {
        await deleteTeam(id);
      } catch (error) {
        console.error("Erro ao excluir time:", error);
      }
    }
  }

  function handleEdit(team: Team) {
    setEditingTeam(team);
    setFormData({ name: team.name });
  }

  if (user?.role !== "manager") {
    return (
      <Card className="p-6">
        <p className="text-center text-gray-600">
          Você precisa estar autenticado para gerenciar times.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Gerenciar Times</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              placeholder="Nome do Time"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              disabled={isLoading}
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {editingTeam ? "Atualizar Time" : "Criar Time"}
          </Button>
        </form>
      </Card>

      <div className="grid gap-4">
        {teams.map((team) => (
          <Card key={team.id} className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{team.name}</h3>
                <p className="text-sm text-gray-600">
                  Criado em: {new Date(team.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleEdit(team)}
                  disabled={isLoading}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleDelete(team.id)}
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 