export interface Team {
  id: number;
  name: string;
  manager_id: number;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  name: string;
  email: string;
  team_id: number;
  role: "employee" | "manager";
  avatar?: string;
}

export interface TeamEmotion {
  id: number;
  name: string;
  emoji: string;
  color: string;
  team_id: number;
  is_negative: boolean;
}

export interface EmotionReport {
  id: number;
  user_id: number;
  emotion_id: number;
  intensity: number;
  notes: string;
  is_anonymous: boolean;
  created_at: string;
}

export interface CreateTeamDTO {
  name: string;
  manager_id: number;
}

export interface UpdateTeamDTO {
  id: number;
  name: string;
  manager_id: number;
}

export interface TeamResponse {
  team_data: Team;
  members: TeamMember[];
  emotions_reports: EmotionReport[];
  emotions: TeamEmotion[];
  user_role?: "employee" | "manager";
}

export interface TeamsResponse {
  teams: Team[];
} 