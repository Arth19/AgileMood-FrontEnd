// ⚠️ Importa do arquivo de tipagens completo (src/lib/types/index.ts) para ter TeamResponse
import {
  CreateTeamDTO,
  Team,
  TeamsResponse,
  UpdateTeamDTO,
  TeamResponse,
} from "../types/index";
import { API_ROUTES } from "../config";

class TeamService {
  async listTeams(): Promise<Team[]> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ROUTES.teams, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Falha ao buscar times');
      }
      const data: TeamsResponse = await response.json();
      return data.teams;
    } catch (error) {
      console.error('Erro ao buscar times:', error);
      throw error;
    }
  }

  async createTeam(data: CreateTeamDTO): Promise<Team> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ROUTES.teams, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Falha ao criar time');
      }

      const responseData = await response.json();
      return responseData.team;
    } catch (error) {
      console.error('Erro ao criar time:', error);
      throw error;
    }
  }

  async updateTeam(data: UpdateTeamDTO): Promise<Team> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ROUTES.teams}/${data.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: data.name,
          manager_id: Number(data.manager_id)
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Falha ao atualizar time');
      }

      return response.json();
    } catch (error) {
      console.error('Erro ao atualizar time:', error);
      throw error;
    }
  }

  async deleteTeam(id: number): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ROUTES.teams}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Falha ao excluir time');
      }
    } catch (error) {
      console.error('Erro ao excluir time:', error);
      throw error;
    }
  }

  async getTeamById(id: number): Promise<TeamResponse> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ROUTES.teams}/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Falha ao buscar time');
      }

      return response.json();
    } catch (error) {
      console.error('Erro ao buscar time:', error);
      throw error;
    }
  }
}

export const teamService = new TeamService(); 