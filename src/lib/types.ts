export interface Team {
  id: number;
  name: string;
  manager_id: string;
  created_at: string;
}

export interface CreateTeamDTO {
  name: string;
  manager_id: string;
}

export interface UpdateTeamDTO extends CreateTeamDTO {
  id: number;
}

export interface TeamsResponse {
  teams: Team[];
} 