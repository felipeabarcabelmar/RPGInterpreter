import axios from 'axios';

// En producción, esto debería ser la URL de tu backend (ej: http://am400-backend...)
// En desarrollo, usamos el proxy relative path
const isProduction = import.meta.env.PROD;
const API_BASE_URL = import.meta.env.VITE_API_URL || (isProduction ? '' : '');

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Importante para las cookies de sesión
});

export default api;
