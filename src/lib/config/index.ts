const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const API_ROUTES = {
  teams: `${API_BASE_URL}/teams`,
  users: `${API_BASE_URL}/users`,
  emotions: `${API_BASE_URL}/emotions`,
  emotionRecords: `${API_BASE_URL}/emotion_record`,
}; 