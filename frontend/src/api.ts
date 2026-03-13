import axios from 'axios';

// En desarrollo usamos el proxy. En producción detectamos la URL del backend automáticamente si no se provee.
const isProduction = import.meta.env.PROD;
let api_url = import.meta.env.VITE_API_URL || '';

if (isProduction && !api_url && typeof window !== 'undefined') {
    console.log('[API Debug] Host actual:', window.location.host);
    // Si estamos en un subdominio de frontend, intentamos cambiarlo a backend
    if (window.location.host.includes('-frontend-')) {
        api_url = window.location.protocol + '//' + window.location.host.replace('-frontend-', '-backend-');
        console.log('[API Debug] URL de Backend autodetectada:', api_url);
    } else {
        console.warn('[API Debug] No se detectó el patrón "-frontend-". Usando el host actual para la API.');
    }
}

const api = axios.create({
    baseURL: api_url,
    withCredentials: true,
});

export default api;
