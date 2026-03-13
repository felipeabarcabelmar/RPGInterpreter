import React, { useState } from 'react';
import api from '../api';
import introVideo from '../assets/Intro.mp4';
import logo from '../assets/caleblogo.png';

interface LoginViewProps {
    onLoginSuccess: () => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            console.log('Intentando login en:', api.defaults.baseURL + '/api/auth/login');
            const response = await api.post('/api/auth/login', { username, password });
            console.log('Respuesta de login:', response.data);
            if (response.data.success) {
                onLoginSuccess();
            }
        } catch (err: any) {
            console.error('Error detallado de login:', err);
            const status = err.response?.status;
            const message = err.response?.data?.error || err.message;
            
            if (status === 405) {
                setError(`Error 405: El servidor no permite esta operación. Verifica si la URL del backend ${api.defaults.baseURL} es correcta.`);
            } else if (status === 401) {
                setError('Usuario o contraseña incorrectos.');
            } else if (!err.response) {
                setError(`Error de red: No se pudo contactar con el backend en ${api.defaults.baseURL}. Verifica tu conexión.`);
            } else {
                setError(`Error (${status || 'desconocido'}): ${message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-black">
            {/* Background Video */}
            <video
                autoPlay
                muted
                loop
                id="video-background"
                className="fixed right-0 bottom-0 min-w-full min-h-full w-auto h-auto object-cover z-0 blur-[10px] brightness-[0.6]"
            >
                <source src={introVideo} type="video/mp4" />
                Your browser does not support the video tag.
            </video>

            {/* Login Card */}
            <div className="relative z-10 w-full max-w-md p-8 rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-700">
                <div className="text-center mb-8">
                    <img
                        src={logo}
                        alt="Caleb Group Logo"
                        className="w-32 mx-auto mb-6 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]"
                    />
                    <h1 className="text-2xl font-light tracking-widest text-white">RPG Interpreter</h1>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-500/20 border border-red-500/40 text-red-200 text-sm rounded-lg text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/70 ml-1">Usuario</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                            required
                            autoComplete="username"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/70 ml-1">Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold rounded-xl shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Ingresando...' : 'Iniciar Sesión'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginView;
