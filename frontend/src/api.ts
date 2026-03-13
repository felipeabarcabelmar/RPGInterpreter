import axios from 'axios';

// En desarrollo usamos el proxy. En producción detectamos la URL del backend automáticamente si no se provee.
const isProduction = import.meta.env.PROD;
let api_url = import.meta.env.VITE_API_URL || '';

if (isProduction && !api_url && typeof window !== 'undefined') {
    const currentUrl = window.location.href;
    // Si estamos en un subdominio de frontend, intentamos cambiarlo a backend
    if (currentUrl.includes('-frontend-')) {
        api_url = currentUrl.split('/')[0] + '//' + window.location.host.replace('-frontend-', '-backend-');
    }
}

const api = axios.create({
    baseURL: api_url,
    withCredentials: true,
});

export default api;
