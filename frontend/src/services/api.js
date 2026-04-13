import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
    });

    // Intercepteur pour ajouter le token à chaque requête
    api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        console.log('Token dans intercepteur:', token ? 'Présent' : 'Absent');
        if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        } else {
        console.warn('⚠️ Aucun token trouvé dans localStorage');
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
    );

    // Intercepteur pour gérer les erreurs 401
    api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
        console.error('❌ Non autorisé - Redirection vers login');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;