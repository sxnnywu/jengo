// API service for making HTTP requests to the backend

const DEFAULT_DEV_API_BASE_URL = 'http://localhost:5001/api';
const DEFAULT_PROD_API_BASE_URL = 'https://jengo.onrender.com/api';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? DEFAULT_DEV_API_BASE_URL : DEFAULT_PROD_API_BASE_URL);
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

const api = {
  // Auth endpoints
  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return response.json();
  },

  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return response.json();
  },

  getCurrentUser: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.json();
  },

  sendContactMessage: async (messageData) => {
    const response = await fetch(`${API_BASE_URL}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messageData)
    });
    return response.json();
  },

  // User endpoints
  getUserProfile: async (userId) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.json();
  },

  updateUserProfile: async (userId, userData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(userData)
    });
    return response.json();
  },

  uploadPitchVideo: async (userId, file) => {
    const token = localStorage.getItem('token');
    const form = new FormData();
    form.append('video', file);
    const response = await fetch(`${API_BASE_URL}/users/${userId}/pitch-video`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form
    });
    return response.json();
  },

  uploadResume: async (userId, file) => {
    const token = localStorage.getItem('token');
    const form = new FormData();
    form.append('resume', file);
    const response = await fetch(`${API_BASE_URL}/users/${userId}/resume`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form
    });
    return response.json();
  },

  uploadProfilePhoto: async (userId, file) => {
    const token = localStorage.getItem('token');
    const form = new FormData();
    form.append('photo', file);
    const response = await fetch(`${API_BASE_URL}/users/${userId}/profile-photo`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form
    });
    return response.json();
  },

  resolveMediaUrl: (url) => {
    if (!url) return '';
    if (url.startsWith('blob:')) return url;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/')) return `${API_ORIGIN}${url}`;
    return url;
  },

  // Opportunity endpoints
  getOpportunities: async () => {
    const response = await fetch(`${API_BASE_URL}/opportunities`);
    return response.json();
  },

  getOpportunity: async (opportunityId) => {
    const response = await fetch(`${API_BASE_URL}/opportunities/${opportunityId}`);
    return response.json();
  },

  createOpportunity: async (opportunityData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/opportunities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(opportunityData)
    });
    return response.json();
  },

  getMyOpportunities: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/opportunities/my`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.json();
  },

  // Application endpoints
  applyToOpportunity: async (opportunityId) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ opportunity: opportunityId })
    });
    return response.json();
  },

  getMyApplications: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/applications/my`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.json();
  },

  getOpportunityApplications: async (opportunityId) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/applications/opportunity/${opportunityId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.json();
  },

  acceptApplication: async (applicationId) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/accept`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.json();
  },

  rejectApplication: async (applicationId) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/reject`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.json();
  }
};

export default api;
