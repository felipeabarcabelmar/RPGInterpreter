import React from 'react';
import { Database, Shield, ArrowRight, Tag, Activity } from 'lucide-react';
import logo from '../assets/caleblogo.png';

interface SystemSelectorViewProps {
    onSelect: (system: 'rpg' | 'ams' | 'tickets' | 'backoffice' | 'analytics') => void;
}

const SystemSelectorView: React.FC<SystemSelectorViewProps> = ({ onSelect }) => {
    return (
        <div className="min-h-screen w-full bg-[#0d1117] flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full"></div>

            <div className="max-w-6xl w-full relative z-10 text-center">
                <div className="flex items-center justify-center gap-4 mb-12">
                    <img src={logo} alt="Caleb Group Logo" className="w-16 h-16 object-contain drop-shadow-2xl" />
                    <h1 className="text-3xl font-bold text-white tracking-widest uppercase italic">Caleb Group</h1>
                </div>

                <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
                    Bienvenido al <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Portal de Gestión</span>
                </h2>
                <p className="text-gray-400 text-lg mb-12 max-w-2xl mx-auto font-light">
                    Seleccione el sistema al que desea acceder para continuar con sus operaciones.
                </p>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* RPG Card */}
                    <button
                        onClick={() => onSelect('rpg')}
                        className="group relative bg-[#161b22] border border-gray-800 p-8 rounded-3xl text-left transition-all hover:border-blue-500/50 hover:bg-[#1c2128] hover:shadow-2xl hover:shadow-blue-900/10 flex flex-col"
                    >
                        <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Database size={28} className="text-blue-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">RPG Interpreter</h3>
                        <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-1">
                            Herramienta de análisis y documentación de código RPG para AS/400 v7.4. Generación de diagramas y lógica de negocio mediante IA.
                        </p>
                        <div className="flex items-center gap-2 text-blue-400 font-semibold group-hover:gap-3 transition-all">
                            <span>Acceder</span>
                            <ArrowRight size={18} />
                        </div>
                    </button>

                    {/* AMS Card */}
                    <button
                        onClick={() => onSelect('ams')}
                        className="group relative bg-[#161b22] border border-gray-800 p-8 rounded-3xl text-left transition-all hover:border-indigo-500/50 hover:bg-[#1c2128] hover:shadow-2xl hover:shadow-indigo-900/10 flex flex-col"
                    >

                        <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Shield size={28} className="text-indigo-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">Base de Conocimientos</h3>
                        <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-1">
                            Plataforma de gestión y documentación de aplicaciones. Interfaz profesional tipo Jira para usuarios finales y soporte técnico.
                        </p>
                        <div className="flex items-center gap-2 text-indigo-400 font-semibold group-hover:gap-3 transition-all">
                            <span>Acceder</span>
                            <ArrowRight size={18} />
                        </div>
                    </button>

                    {/* Tickets Card */}
                    <button
                        onClick={() => onSelect('tickets')}
                        className="group relative bg-[#161b22] border border-gray-800 p-8 rounded-3xl text-left transition-all hover:border-green-500/50 hover:bg-[#1c2128] hover:shadow-2xl hover:shadow-green-900/10 flex flex-col"
                    >
                        <div className="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Tag size={28} className="text-green-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">Gestión de Tickets</h3>
                        <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-1">
                            Sistema de soporte y seguimiento de consultas. Envía tus requerimientos y revisa el estado de resolución en tiempo real.
                        </p>
                        <div className="flex items-center gap-2 text-green-400 font-semibold group-hover:gap-3 transition-all">
                            <span>Acceder</span>
                            <ArrowRight size={18} />
                        </div>
                    </button>

                    {/* Backoffice Card */}
                    <button
                        onClick={() => onSelect('backoffice')}
                        className="group relative bg-[#161b22] border border-gray-800 p-8 rounded-3xl text-left transition-all hover:border-indigo-500/50 hover:bg-[#1c2128] hover:shadow-2xl hover:shadow-indigo-900/10 flex flex-col"
                    >
                        <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Shield size={28} className="text-indigo-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">Backoffice de Tráfico</h3>
                        <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-1">
                            Panel administrativo para la resolución de tickets, asignación de criticidad y comunicación de soluciones técnicas.
                        </p>
                        <div className="flex items-center gap-2 text-indigo-400 font-bold group-hover:gap-3 transition-all">
                            <span>Ingresar</span>
                            <ArrowRight size={18} />
                        </div>
                    </button>

                    {/* Analytics Card */}
                    <button
                        onClick={() => onSelect('analytics')}
                        className="group relative bg-[#161b22] border border-gray-800 p-8 rounded-3xl text-left transition-all hover:border-amber-500/50 hover:bg-[#1c2128] hover:shadow-2xl hover:shadow-amber-900/10 flex flex-col"
                    >
                        <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Activity size={28} className="text-amber-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">Analíticas AMS</h3>
                        <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-1">
                            Dashboard ejecutivo con KPIs de rendimiento, cumplimiento de SLA, volumen de tickets y consumo de recursos Caleb Group.
                        </p>
                        <div className="flex items-center gap-2 text-amber-400 font-bold group-hover:gap-3 transition-all">
                            <span>Ver Reportes</span>
                            <ArrowRight size={18} />
                        </div>
                    </button>
                </div>


                <div className="mt-16 text-gray-600 text-xs font-medium tracking-widest uppercase">
                    © 2026 Caleb Group v2.0
                </div>
            </div>
        </div>
    );
};

export default SystemSelectorView;
