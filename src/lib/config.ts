export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const API_ROUTES = {
  teams: `${API_BASE_URL}/teams`
} as const; 