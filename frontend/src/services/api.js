import axios from 'axios';

// Plus besoin de spécifier le port, le proxy s'en charge
const api = axios.create({
    baseURL: '/api',  // Au lieu de 'http://localhost:5000/api'
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Intercepteur pour ajouter le token
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

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;