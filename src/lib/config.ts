const fallbackUrl =
  process.env.NODE_ENV === 'production'
    ? 'https://agilemood-backend-production.up.railway.app'
    : 'http://localhost:8000';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || fallbackUrl;

export const API_ROUTES = {
  teams: `${API_BASE_URL}/teams`,
  users: `${API_BASE_URL}/users`,
  emotions: `${API_BASE_URL}/emotions`,
  emotion: `${API_BASE_URL}/emotion`,
  emotionRecords: `${API_BASE_URL}/emotion_record`,
} as const;
