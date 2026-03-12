import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, Bot, User, Filter, Eraser } from 'lucide-react';

const KnowledgeChatView: React.FC = () => {
    const [query, setQuery] = useState('');
    const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'bot'; content: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [filterType, setFilterType] = useState<'all' | 'category' | 'file'>('all');
    const [filterId, setFilterId] = useState<number | undefined>(undefined);
    const [categories, setCategories] = useState<any[]>([]);
    const [files, setFiles] = useState<any[]>([]);

    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchFilters();
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    const fetchFilters = async () => {
        try {
            const [catsRes, filesRes] = await Promise.all([
                axios.get('/api/categories'),
                axios.get('/api/files')
            ]);
            setCategories(catsRes.data);
            setFiles(filesRes.data);
        } catch (err) {
            console.error("Error fetching filters:", err);
        }
    };

    const handleSend = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!query.trim() || loading) return;

        const userMessage = query.trim();
        setChatHistory(prev => [...prev, { role: 'user', content: userMessage }]);
        setQuery('');
        setLoading(true);

        try {
            const res = await axios.post('/api/chat', {
                query: userMessage,
                filter_type: filterType,
                filter_id: filterId
            });

            setChatHistory(prev => [...prev, { role: 'bot', content: res.data.response }]);
        } catch (err: any) {
            setChatHistory(prev => [...prev, { role: 'bot', content: `Error: ${err.response?.data?.error || 'No se pudo obtener respuesta.'}` }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#0d1117] text-gray-300">
            {/* Chat Header / Filters */}
            <header className="p-4 bg-[#161b22] border-b border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded-lg border border-gray-700">
                        <Filter size={16} className="text-blue-400" />
                        <select
                            value={filterType}
                            onChange={(e) => { setFilterType(e.target.value as any); setFilterId(undefined); }}
                            className="bg-transparent text-sm outline-none cursor-pointer"
                        >
                            <option value="all">Todo el sistema</option>
                            <option value="category">Por Categoría</option>
                            <option value="file">Por Archivo</option>
                        </select>
                    </div>

                    {filterType !== 'all' && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded-lg border border-gray-700 animate-in fade-in slide-in-from-left-2 transition-all">
                            <select
                                value={filterId || ''}
                                onChange={(e) => setFilterId(Number(e.target.value))}
                                className="bg-transparent text-sm outline-none cursor-pointer max-w-[200px]"
                            >
                                <option value="">Seleccionar...</option>
                                {filterType === 'category'
                                    ? categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                                    : files.map(f => <option key={f.id} value={f.id}>{f.filename}</option>)
                                }
                            </select>
                        </div>
                    )}
                </div>

                <button
                    onClick={() => setChatHistory([])}
                    className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                    title="Limpiar chat"
                >
                    <Eraser size={20} />
                </button>
            </header>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {chatHistory.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-40">
                        <Bot size={64} />
                        <div className="text-center">
                            <p className="text-lg font-medium">Asistente RPG Senior</p>
                            <p className="text-sm">Haz una pregunta técnica sobre los programas cargados.</p>
                        </div>
                    </div>
                ) : (
                    chatHistory.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                            <div className={`max-w-[80%] flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-blue-600' : 'bg-purple-600'}`}>
                                    {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                                </div>
                                <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-lg ${msg.role === 'user' ? 'bg-blue-600/20 border border-blue-500/30' : 'bg-[#161b22] border border-gray-800'}`}>
                                    <div className="whitespace-pre-wrap">{msg.content}</div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
                {loading && (
                    <div className="flex justify-start animate-pulse">
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                                <Bot size={18} />
                            </div>
                            <div className="p-4 rounded-2xl bg-[#161b22] border border-gray-800 text-sm italic text-gray-500">
                                Analizando contexto y escribiendo...
                            </div>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <footer className="p-4 bg-[#161b22] border-t border-gray-800">
                <form onSubmit={handleSend} className="max-w-4xl mx-auto flex gap-3">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Pregunta sobre lógica de negocio, campos definidos o flujo de programas..."
                        className="flex-1 bg-[#0d1117] border border-gray-700 rounded-xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={loading || !query.trim()}
                        className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-900/20 active:scale-95 transition-all disabled:opacity-50"
                    >
                        <Send size={20} />
                    </button>
                </form>
            </footer>
        </div>
    );
};

export default KnowledgeChatView;
