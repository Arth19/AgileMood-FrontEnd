// Define uma URL padrão diferente para produção e desenvolvimento.
// • Em produção (Vercel), se a variável de ambiente `NEXT_PUBLIC_API_URL` não estiver
//   configurada, usaremos HTTPS para evitar Mixed‑Content.
// • Em desenvolvimento local, continuamos usando http://localhost:8000.
const fallbackUrl =
  process.env.NODE_ENV === 'production'
    ? 'https://agilemood-backend-production.up.railway.app'
    : 'http://localhost:8000';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || fallbackUrl;

export const API_ROUTES = {
  teams: `${API_BASE_URL}/teams/`,
  emotions: `${API_BASE_URL}/emotions/`,
  emotion: `${API_BASE_URL}/emotion/`,
  users: `${API_BASE_URL}/users/`,
} as const;