import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Ticket as TicketIcon, 
    Send, 
    Clock, 
    CheckCircle, 
    AlertCircle, 
    RefreshCw, 
    Paperclip, 
    X, 
    FileText,
    ShieldAlert
} from 'lucide-react';

interface Ticket {
    id: number;
    title: string;
    description: string;
    status: string;
    criticality: string;
    solution?: string;
    attachmentUrl?: string;
    createdAt: string;
    updatedAt: string;
}

const TicketManagementView: React.FC = () => {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/tickets');
            setTickets(res.data);
        } catch (error) {
            console.error('Error fetching tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        if (file) {
            formData.append('file', file);
        }

        try {
            await axios.post('/api/tickets', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setTitle('');
            setDescription('');
            setFile(null);
            fetchTickets();
        } catch (error) {
            console.error('Error creating ticket:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'Abierto': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'En Proceso': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'Resuelto': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Cerrado': return 'bg-slate-100 text-slate-600 border-slate-200';
            default: return 'bg-slate-100 text-slate-600 border-slate-200';
        }
    };

    const getCriticalityStyles = (crit: string) => {
        switch (crit) {
            case 'Baja': return 'text-slate-500';
            case 'Media': return 'text-blue-500';
            case 'Alta': return 'text-orange-500';
            case 'Crítica': return 'text-red-600 font-bold';
            default: return 'text-slate-500';
        }
    };

    return (
        <div className="h-full flex flex-col p-8 space-y-8 overflow-y-auto bg-slate-50 font-sans text-slate-900">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
                        <TicketIcon className="text-blue-600" size={32} />
                        Mesa de Ayuda
                    </h1>
                    <p className="text-slate-500 mt-1">Soporte técnico y gestión de requerimientos.</p>
                </div>
                <button 
                    onClick={fetchTickets}
                    className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
                >
                    <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Creation Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <Send size={18} className="text-blue-600" />
                            Nuevo Requerimiento
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Asunto</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                    placeholder="¿En qué podemos ayudarte?"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all placeholder:text-slate-400"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Descripción</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    required
                                    rows={4}
                                    placeholder="Detalla tu problema o duda..."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all placeholder:text-slate-400 resize-none"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Adjuntar Archivo</label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                                        className="hidden"
                                        id="file-upload"
                                    />
                                    <label 
                                        htmlFor="file-upload"
                                        className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed transition-all cursor-pointer ${file ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-slate-200 hover:border-blue-300 text-slate-500'}`}
                                    >
                                        {file ? (
                                            <>
                                                <FileText size={18} />
                                                <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                                                <X size={16} className="ml-auto hover:text-red-500" onClick={(e) => { e.preventDefault(); setFile(null); }} />
                                            </>
                                        ) : (
                                            <>
                                                <Paperclip size={18} />
                                                <span className="text-sm">Seleccionar archivo</span>
                                            </>
                                        )}
                                    </label>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-blue-200 flex items-center justify-center gap-2"
                            >
                                {submitting ? 'Enviando...' : 'Enviar Solicitud'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Ticket List */}
                <div className="lg:col-span-2">
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm min-h-[500px]">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-lg font-bold text-slate-800">Mis Solicitudes</h2>
                            <div className="text-xs font-medium text-slate-400 bg-slate-100 px-3 py-1 rounded-full">{tickets.length} Total</div>
                        </div>

                        {loading && tickets.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                                <RefreshCw className="animate-spin mb-4 text-blue-500" size={32} />
                                <p className="font-medium">Cargando historial...</p>
                            </div>
                        ) : tickets.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 text-slate-300 border-2 border-dashed border-slate-100 rounded-3xl">
                                <TicketIcon className="mb-4 opacity-10" size={64} />
                                <p className="font-semibold text-slate-400">No hay tickets registrados.</p>
                                <p className="text-xs mt-1">Tus solicitudes aparecerán aquí.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {tickets.map((ticket) => (
                                    <div key={ticket.id} className="bg-white border border-slate-100 rounded-2xl p-6 hover:border-blue-200 hover:shadow-md transition-all group">
                                        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyles(ticket.status)}`}>
                                                    {ticket.status}
                                                </span>
                                                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-slate-50 text-slate-500 border border-slate-100">
                                                    <ShieldAlert size={12} className={getCriticalityStyles(ticket.criticality)} />
                                                    {ticket.criticality}
                                                </span>
                                                <span className="text-xs font-mono text-slate-400 ml-2">#{ticket.id}</span>
                                            </div>
                                            <span className="text-xs font-medium text-slate-400">
                                                {new Date(ticket.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                        </div>
                                        
                                        <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-blue-700 transition-colors">{ticket.title}</h3>
                                        <p className="text-slate-600 text-sm leading-relaxed mb-4">{ticket.description}</p>
                                        
                                        {ticket.attachmentUrl && (
                                            <div className="mb-4">
                                                <a 
                                                    href={ticket.attachmentUrl} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                                                >
                                                    <Paperclip size={14} />
                                                    Ver Adjunto
                                                </a>
                                            </div>
                                        )}

                                        {ticket.solution && (
                                            <div className="mt-4 p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                                                <div className="flex items-center gap-2 mb-2 text-emerald-700">
                                                    <CheckCircle size={16} />
                                                    <span className="text-xs font-black uppercase tracking-wider">Solución Proporcionada</span>
                                                </div>
                                                <p className="text-slate-700 text-sm italic">{ticket.solution}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketManagementView;
