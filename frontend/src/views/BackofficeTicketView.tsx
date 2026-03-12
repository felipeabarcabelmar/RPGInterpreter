import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    ShieldCheck, 
    RefreshCw, 
    Search, 
    Filter, 
    Edit3, 
    CheckCircle2, 
    Clock, 
    AlertTriangle, 
    Paperclip,
    ExternalLink,
    X,
    Trash2,
    AlertCircle
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
}

const BackofficeTicketView: React.FC = () => {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(false);
    const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newStatus, setNewStatus] = useState('');
    const [newCriticality, setNewCriticality] = useState('');
    const [solution, setSolution] = useState('');
    const [saving, setSaving] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

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

    const handleEdit = (ticket: Ticket) => {
        setEditingTicket(ticket);
        setNewTitle(ticket.title);
        setNewDescription(ticket.description);
        setNewStatus(ticket.status);
        setNewCriticality(ticket.criticality);
        setSolution(ticket.solution || '');
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingTicket) return;

        setSaving(true);
        try {
            await axios.patch(`/api/tickets/${editingTicket.id}`, {
                title: newTitle,
                description: newDescription,
                status: newStatus,
                criticality: newCriticality,
                solution: solution
            });
            setEditingTicket(null);
            fetchTickets();
        } catch (error) {
            console.error('Error updating ticket:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await axios.delete(`/api/tickets/${id}`);
            setShowDeleteConfirm(null);
            fetchTickets();
        } catch (error) {
            console.error('Error deleting ticket:', error);
        }
    };

    return (
        <div className="h-full flex flex-col p-8 space-y-8 overflow-y-auto bg-[#f8fafc]">
            <header className="flex justify-between items-end bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                        <ShieldCheck className="text-indigo-600" size={28} />
                        Backoffice de Tráfico
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Gestión avanzada y resolución de requerimientos técnicos.</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={fetchTickets}
                        className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-100 transition-all font-bold text-xs flex items-center gap-2"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        Actualizar
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 gap-6">
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">ID</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Requerimiento</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Estado</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Criticidad</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Fecha</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {tickets.map(ticket => (
                                <tr key={ticket.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 text-sm font-mono text-slate-400">#{ticket.id}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-800 text-sm">{ticket.title}</div>
                                        <div className="text-xs text-slate-500 mt-1 line-clamp-1">{ticket.description}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider ${
                                            ticket.status === 'Abierto' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                            ticket.status === 'En Proceso' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                            ticket.status === 'Resuelto' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                            'bg-slate-50 text-slate-500 border-slate-100'
                                        }`}>
                                            {ticket.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs font-bold ${
                                            ticket.criticality === 'Crítica' ? 'text-red-600' :
                                            ticket.criticality === 'Alta' ? 'text-orange-500' :
                                            ticket.criticality === 'Media' ? 'text-blue-500' :
                                            'text-slate-400'
                                        }`}>
                                            {ticket.criticality}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-slate-500">
                                        {new Date(ticket.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                                        <button 
                                            onClick={() => handleEdit(ticket)}
                                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                            title="Editar"
                                        >
                                            <Edit3 size={18} />
                                        </button>
                                        <button 
                                            onClick={() => setShowDeleteConfirm(ticket.id)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Eliminar"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {tickets.length === 0 && !loading && (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                            <Filter size={48} className="opacity-10 mb-4" />
                            <p className="font-bold text-slate-400">No hay tickets pendientes</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-6 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200 p-8 text-center">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle size={32} className="text-red-500" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-2">¿Confirmar eliminación?</h3>
                        <p className="text-slate-500 text-sm mb-8">Esta acción borrará permanentemente el ticket #{showDeleteConfirm} y no se puede deshacer.</p>
                        <div className="flex gap-4">
                            <button 
                                onClick={() => setShowDeleteConfirm(null)}
                                className="flex-1 px-6 py-3 rounded-2xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={() => handleDelete(showDeleteConfirm)}
                                className="flex-1 px-6 py-3 rounded-2xl bg-red-500 text-white font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-200"
                            >
                                Eliminar Ahora
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editingTicket && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 leading-none">Gestionar Ticket #{editingTicket.id}</h3>
                                <p className="text-xs text-slate-500 mt-2 italic">Fecha registro: {new Date(editingTicket.createdAt).toLocaleString()}</p>
                            </div>
                            <button onClick={() => setEditingTicket(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                                <X size={20} className="text-slate-400" />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-8 space-y-6">
                            {/* Title and Description Editing */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Asunto (Editable)</label>
                                    <input 
                                        type="text"
                                        value={newTitle}
                                        onChange={(e) => setNewTitle(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-700"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Descripción del Requerimiento</label>
                                    <textarea
                                        value={newDescription}
                                        onChange={(e) => setNewDescription(e.target.value)}
                                        rows={3}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-slate-600 leading-relaxed"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 text-center">Estado</label>
                                    <select 
                                        value={newStatus}
                                        onChange={(e) => setNewStatus(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-700 cursor-pointer"
                                    >
                                        <option value="Abierto">Abierto</option>
                                        <option value="En Proceso">En Proceso</option>
                                        <option value="Resuelto">Resuelto</option>
                                        <option value="Cerrado">Cerrado</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 text-center">Criticidad</label>
                                    <select 
                                        value={newCriticality}
                                        onChange={(e) => setNewCriticality(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-700 cursor-pointer"
                                    >
                                        <option value="Baja">Baja</option>
                                        <option value="Media">Media</option>
                                        <option value="Alta">Alta</option>
                                        <option value="Crítica">Crítica</option>
                                    </select>
                                </div>
                            </div>

                            {editingTicket.attachmentUrl && (
                                <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                                            <Paperclip size={18} className="text-indigo-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-indigo-900 uppercase tracking-widest">Archivo Adjunto</p>
                                            <p className="text-[10px] text-indigo-500">Documento subido por el cliente</p>
                                        </div>
                                    </div>
                                    <a 
                                        href={editingTicket.attachmentUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="px-4 py-2 bg-white border border-indigo-200 rounded-xl text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center gap-2 shadow-sm"
                                    >
                                        Ver Archivo
                                        <ExternalLink size={12} />
                                    </a>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Resolución y Solución Oficial</label>
                                <textarea
                                    value={solution}
                                    onChange={(e) => setSolution(e.target.value)}
                                    rows={4}
                                    placeholder="Explique aquí la solución o los pasos a seguir que verá el cliente..."
                                    className="w-full bg-indigo-50/30 border border-slate-200 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium leading-relaxed"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                            >
                                {saving ? (
                                    <>
                                        <RefreshCw size={14} className="animate-spin" />
                                        Guardando cambios...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 size={16} />
                                        Guardar Cambios y Notificar
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BackofficeTicketView;
