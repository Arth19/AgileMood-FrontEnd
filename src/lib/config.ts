const fallbackUrl =
  process.env.NODE_ENV === 'production'
    ? 'https://agilemood-backend-production.up.railway.app'
    : 'http://localhost:8000';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || fallbackUrl;

export const API_ROUTES = {
  teams:    `${API_BASE_URL}/teams/`,
  emotion:  `${API_BASE_URL}/emotion/`,        // <— rota de gravação de emoções
  emotions: `${API_BASE_URL}/teams/`,          // <— rota de listagem, se usada
  // emotion_record: `${API_BASE_URL}/emotion_record/`, …
} as const;
