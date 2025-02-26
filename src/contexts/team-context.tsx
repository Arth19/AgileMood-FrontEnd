"use client";

import { createContext, useContext, ReactNode, useState, useCallback } from "react";
import { Team, CreateTeamDTO, UpdateTeamDTO } from "@/lib/types";
import { teamService } from "@/lib/services/team-service";

interface TeamContextData {
  teams: Team[];
  isLoading: boolean;
  createTeam: (data: CreateTeamDTO) => Promise<void>;
  updateTeam: (data: UpdateTeamDTO) => Promise<void>;
  deleteTeam: (id: number) => Promise<void>;
  loadTeams: () => Promise<void>;
}

const TeamContext = createContext<TeamContextData>({} as TeamContextData);

export function TeamProvider({ children }: { children: ReactNode }) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadTeams = useCallback(async () => {
    try {
      setIsLoading(true);
      const teamsList = await teamService.listTeams();
      setTeams(teamsList);
    } catch (error) {
      console.error('Erro ao carregar times:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createTeam = useCallback(async (data: CreateTeamDTO) => {
    try {
      setIsLoading(true);
      await teamService.createTeam(data);
      await loadTeams();
    } catch (error) {
      console.error('Erro ao criar time:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [loadTeams]);

  const updateTeam = useCallback(async (data: UpdateTeamDTO) => {
    try {
      setIsLoading(true);
      await teamService.updateTeam(data);
      await loadTeams();
    } catch (error) {
      console.error('Erro ao atualizar time:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [loadTeams]);

  const deleteTeam = useCallback(async (id: number) => {
    try {
      setIsLoading(true);
      await teamService.deleteTeam(id);
      await loadTeams();
    } catch (error) {
      console.error('Erro ao excluir time:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [loadTeams]);

  return (
    <TeamContext.Provider 
      value={{ 
        teams, 
        isLoading, 
        createTeam, 
        updateTeam, 
        deleteTeam, 
        loadTeams 
      }}
    >
      {children}
    </TeamContext.Provider>
  );
}

export const useTeam = () => {
  const context = useContext(TeamContext);
  if (!context) {
    throw new Error('useTeam deve ser usado dentro de um TeamProvider');
  }
  return context;
}; 