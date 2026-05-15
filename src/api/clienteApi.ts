import axios from 'axios';

console.log("Mi API URL actual es:", import.meta.env.VITE_API_URL);

const clienteApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5079/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

clienteApi.interceptors.request.use(
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

export default clienteApi;
