// Breakpoints
export const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
  DESKTOP: 1280,
} as const;

// Delays
export const DELAYS = {
  DEBOUNCE: 250,
  ANIMATION: 300,
  TRANSITION: 200,
} as const;

const fallbackUrl =
  process.env.NODE_ENV === 'production'
    ? 'https://agilemood-backend-production.up.railway.app'
    : 'http://localhost:8000';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || fallbackUrl;

// API
export const API = {
  BASE_URL: API_BASE_URL,
  TIMEOUT: 10000,
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  THEME: 'agile-mood-theme',
  USER: 'agile-mood-user',
  TOKEN: 'agile-mood-token',
} as const;

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/home',
  TEAM: '/team',
  PROFILE: '/profile',
} as const; 