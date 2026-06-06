import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

// Attach JWT token to every request if present
api.interceptors.request.use(config => {
  const token = localStorage.getItem('bf_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const register = (data) => api.post('/auth/register', data);
export const login    = (data) => api.post('/auth/login', data);
export const getMe    = ()     => api.get('/auth/me');

// Scores
export const submitScore    = (data) => api.post('/scores', data);
export const getLeaderboard = ()     => api.get('/scores/leaderboard');
export const getMyScores    = ()     => api.get('/scores/me');

// Progress
export const loadProgress  = ()     => api.get('/progress');
export const saveProgress  = (data) => api.post('/progress/save', data);
export const clearProgress = ()     => api.delete('/progress/save');

export default api;
