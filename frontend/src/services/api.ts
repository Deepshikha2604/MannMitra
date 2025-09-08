import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable cookies for session management
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  sendOTP: (phone: string) => api.post('/api/auth/send-otp', { phone }),
  verifyOTP: (phone: string, otp: string) => api.post('/api/auth/verify-otp', { phone, otp }),
  completeOnboarding: (data: any) => api.post('/api/auth/onboarding', data),
};

export const chatAPI = {
  sendMessage: (content: string, sessionId?: string) => 
    api.post('/api/chat/send', { content, session_id: sessionId }),
  getHistory: (sessionId: string) => api.get(`/api/chat/history/${sessionId}`),
  getSessions: () => api.get('/api/chat/sessions'),
};

export const moodAPI = {
  logMood: (data: any) => api.post('/api/mood/log', data),
  getHistory: () => api.get('/api/mood/history'),
  getAnalytics: () => api.get('/api/mood/analytics'),
  getToday: () => api.get('/api/mood/today'),
};

export const activitiesAPI = {
  getActivities: () => api.get('/api/activities'),
  getQuickActivities: () => api.get('/api/activities/quick'),
  getRecommendations: () => api.get('/api/activities/recommendations'),
  completeActivity: (data: any) => api.post('/api/activities/complete', data),
};

export const aiAPI = {
  analyzeSentiment: (text: string, language: string = 'hindi') => 
    api.post('/api/ai/analyze-sentiment', { text, language }),
  detectEmotion: (text: string, language: string = 'hindi') => 
    api.post('/api/ai/detect-emotion', { text, language }),
  getMotivationalContent: (language: string = 'hindi', type: string = 'quote') => 
    api.get(`/api/ai/motivational-content?language=${language}&type=${type}`),
  getHealthTips: (category: string = 'general', language: string = 'hindi') => 
    api.get(`/api/ai/health-tips?category=${category}&language=${language}`),
};

export const crisisAPI = {
  detectCrisis: (message: string, userId?: string) => 
    api.post('/api/crisis/detect', { message, user_id: userId }),
  getHelplines: (location?: string) => 
    api.get(`/api/crisis/helplines${location ? `?location=${location}` : ''}`),
  getResources: () => api.get('/api/crisis/resources'),
};

export default api;





