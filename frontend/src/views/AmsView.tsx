import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
    Search,
    MessageCircle,
    FileText,
    ChevronRight,
    Info,
    Send,
    User,
    Bot,
    Loader2,
    X,
    Code2,
    GitBranch,
    Terminal,
    Activity,
    Layers,
    ChevronDown
} from 'lucide-react';

interface Category {
    id: number;
    name: string;
    description?: string;
}

interface RPGFile {
    id: number;
    filename: string;
    content: string;
    documentation?: string;
    businessLogic?: string;
    mermaidDiagram?: string;
    htmlDiagram?: string;
    uploadedAt: string;
    categoryId?: number;
    category?: Category;
}

const AmsView: React.FC = () => {
    const [files, setFiles] = useState<RPGFile[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [activeFileId, setActiveFileId] = useState<number | 'welcome'>('welcome');
    const [activeTab, setActiveTab] = useState<'docs' | 'logic' | 'code' | 'diagram'>('docs');

    const [chatMessage, setChatMessage] = useState('');
    const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'bot'; content: string }[]>([]);
    const [loadingChat, setLoadingChat] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [expandedCategories, setExpandedCategories] = useState<Record<number, boolean>>({});
    const [loadingFiles, setLoadingFiles] = useState(true);

    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    const fetchData = async () => {
        try {
            setLoadingFiles(true);
            const [filesRes, catsRes] = await Promise.all([
                axios.get('/api/files'),
                axios.get('/api/categories')
            ]);
            setFiles(filesRes.data);
            setCategories(catsRes.data);

            // Expand all categories by default
            const expanded: Record<number, boolean> = {};
            catsRes.data.forEach((c: Category) => expanded[c.id] = true);
            setExpandedCategories(expanded);
        } catch (err) {
            console.error("Error fetching AMS data:", err);
        } finally {
            setLoadingFiles(false);
        }
    };

    const handleSendChat = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!chatMessage.trim() || loadingChat) return;

        const userMsg = chatMessage.trim();
        setChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);
        setChatMessage('');
        setLoadingChat(true);

        try {
            const activeFile = typeof activeFileId === 'number' ? files.find(f => f.id === activeFileId) : null;
            const res = await axios.post('/api/chat', {
                query: userMsg,
                filter_type: activeFile ? 'file' : 'all',
                filter_id: activeFile ? activeFile.id : undefined
            });
            setChatHistory(prev => [...prev, { role: 'bot', content: res.data.response }]);
        } catch (err) {
            setChatHistory(prev => [...prev, { role: 'bot', content: "Lo siento, no pude obtener una respuesta de la base de conocimientos." }]);
        } finally {
            setLoadingChat(false);
        }
    };

    const activeFile = typeof activeFileId === 'number' ? files.find(f => f.id === activeFileId) : null;

    const toggleCategory = (id: number) => {
        setExpandedCategories(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const filteredSearchFiles = files.filter(f =>
        f.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.documentation?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="h-screen w-full bg-[#f4f5f7] flex flex-col font-sans text-[#172b4d] overflow-hidden">
            {/* Top Header - Jira Style */}
            <header className="h-14 bg-white border-b border-[#dfe1e6] flex items-center px-6 gap-8 shadow-sm relative z-30">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveFileId('welcome')}>
                    <img src="/caleblogo.png" alt="Caleb Group" className="w-8 h-8 object-contain" />
                    <span className="font-bold text-xl tracking-tight">AMS <span className="text-[#0052cc]">Portal</span></span>
                </div>

                <div className="ml-auto flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#42526e]" size={16} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar programa o documentación..."
                            className="bg-[#f4f5f7] border border-[#dfe1e6] rounded-md py-1.5 pl-10 pr-4 text-sm w-80 focus:bg-white focus:border-[#0052cc] focus:ring-1 focus:ring-[#0052cc] outline-none transition-all shadow-inner"
                        />
                        {searchQuery && (
                            <div className="absolute top-12 left-0 w-full bg-white border border-[#dfe1e6] rounded-lg shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                {filteredSearchFiles.length > 0 ? filteredSearchFiles.slice(0, 10).map(f => (
                                    <button
                                        key={f.id}
                                        onClick={() => { setActiveFileId(f.id); setSearchQuery(''); }}
                                        className="w-full text-left px-4 py-3 hover:bg-[#f4f5f7] text-sm border-b last:border-0 flex items-center gap-3"
                                    >
                                        <FileText size={16} className="text-[#0052cc]" />
                                        <div>
                                            <div className="font-bold text-[#172b4d]">{f.filename}</div>
                                            <div className="text-[10px] text-[#6b778c] uppercase">{f.category?.name || 'Sin Categoría'}</div>
                                        </div>
                                    </button>
                                )) : (
                                    <div className="p-4 text-xs text-center text-[#6b778c]">No se encontraron programas</div>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="w-8 h-8 bg-[#0052cc] text-white font-bold rounded-full flex items-center justify-center text-xs shadow-md">FA</div>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar - Confluence Style */}
                <aside className="w-72 bg-[#f4f5f7] border-r border-[#dfe1e6] py-4 overflow-y-auto flex flex-col">
                    <div className="px-6 mb-4 text-[10px] font-bold text-[#6b778c] uppercase tracking-widest">Explorador de Sistemas</div>

                    <div className="flex-1 px-3 space-y-1">
                        <button
                            onClick={() => setActiveFileId('welcome')}
                            className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md font-medium transition-colors ${activeFileId === 'welcome' ? 'bg-[#0052cc]/10 text-[#0052cc]' : 'text-[#42526e] hover:bg-[#ebecf0]'}`}
                        >
                            <Activity size={16} />
                            <span>Resumen General</span>
                        </button>

                        {loadingFiles ? (
                            <div className="p-4 flex flex-col items-center gap-2 opacity-30">
                                <Loader2 size={24} className="animate-spin" />
                                <span className="text-[10px] font-bold">Cargando base de datos...</span>
                            </div>
                        ) : (
                            categories.map(cat => (
                                <div key={cat.id} className="pt-2">
                                    <button
                                        onClick={() => toggleCategory(cat.id)}
                                        className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-bold text-[#6b778c] hover:text-[#172b4d] transition-colors uppercase tracking-tight"
                                    >
                                        <span className="truncate">{cat.name}</span>
                                        <ChevronDown size={14} className={`transition-transform duration-200 ${expandedCategories[cat.id] ? '' : '-rotate-90'}`} />
                                    </button>

                                    {expandedCategories[cat.id] && (
                                        <div className="mt-1 space-y-0.5 border-l-2 border-[#dfe1e6] ml-4">
                                            {files.filter(f => f.categoryId === cat.id).map(f => (
                                                <button
                                                    key={f.id}
                                                    onClick={() => { setActiveFileId(f.id); setActiveTab('docs'); }}
                                                    className={`w-full text-left px-4 py-1.5 text-xs rounded-r-md transition-all ${activeFileId === f.id ? 'bg-[#0052cc] text-white shadow-md' : 'text-[#42526e] hover:bg-[#ebecf0]'}`}
                                                >
                                                    {f.filename}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}

                        {/* Uncategorized */}
                        {!loadingFiles && files.some(f => !f.categoryId) && (
                            <div className="pt-2">
                                <button className="w-full text-left px-3 py-1.5 text-[11px] font-bold text-[#6b778c] uppercase">Otros Archivos</button>
                                <div className="mt-1 space-y-0.5 border-l-2 border-[#dfe1e6] ml-4">
                                    {files.filter(f => !f.categoryId).map(f => (
                                        <button
                                            key={f.id}
                                            onClick={() => { setActiveFileId(f.id); setActiveTab('docs'); }}
                                            className={`w-full text-left px-4 py-1.5 text-xs rounded-r-md transition-all ${activeFileId === f.id ? 'bg-[#0052cc] text-white shadow-md' : 'text-[#42526e] hover:bg-[#ebecf0]'}`}
                                        >
                                            {f.filename}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 bg-white overflow-hidden flex flex-col relative">
                    {activeFileId === 'welcome' ? (
                        <div className="flex-1 overflow-y-auto p-12 animate-in fade-in duration-500">
                            <div className="max-w-4xl mx-auto">
                                <div className="flex items-center gap-2 text-xs text-[#6b778c] mb-6 font-medium">
                                    <span>AMS</span>
                                    <ChevronRight size={12} />
                                    <span className="text-[#172b4d] font-semibold">Resumen del Sistema</span>
                                </div>

                                <h1 className="text-5xl font-extrabold mb-4 tracking-tighter text-[#172b4d]">Plataforma de Conocimiento AMS</h1>
                                <p className="text-xl text-[#42526e] mb-10 leading-relaxed font-light">Centralizamos el código, la lógica y la documentación para una gestión técnica impecable.</p>

                                <div className="grid grid-cols-4 gap-6 mb-12">
                                    <div className="bg-[#f4f5f7] p-6 rounded-2xl border border-[#dfe1e6] text-center">
                                        <div className="text-3xl font-black text-[#0052cc] mb-1">{files.length}</div>
                                        <div className="text-[10px] font-bold text-[#6b778c] uppercase tracking-widest">Programas</div>
                                    </div>
                                    <div className="bg-[#f4f5f7] p-6 rounded-2xl border border-[#dfe1e6] text-center">
                                        <div className="text-3xl font-black text-[#0052cc] mb-1">{categories.length}</div>
                                        <div className="text-[10px] font-bold text-[#6b778c] uppercase tracking-widest">Módulos</div>
                                    </div>
                                    <div className="bg-[#0052cc] p-6 rounded-2xl text-center shadow-lg shadow-blue-500/20">
                                        <div className="text-3xl font-black text-white mb-1">IA</div>
                                        <div className="text-[10px] font-bold text-blue-100 uppercase tracking-widest">Activa</div>
                                    </div>
                                    <div className="bg-indigo-600 p-6 rounded-2xl text-center shadow-lg shadow-indigo-500/20 border border-indigo-400/30 animate-pulse">
                                        <div className="text-xs font-black text-white mb-1 leading-tight">NUEVO MÓDULO</div>
                                        <div className="text-[10px] font-bold text-indigo-100 uppercase tracking-tight">Código Fuente</div>
                                    </div>
                                </div>

                                <div className="p-8 bg-blue-50 border border-blue-100 rounded-3xl flex items-start gap-6">
                                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center flex-shrink-0">
                                        <Layers className="text-[#0052cc]" size={32} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-[#0747a6] mb-2">Comienza a explorar</h3>
                                        <p className="text-sm text-[#42526e] leading-relaxed">Selecciona un componente del menú lateral para acceder a su documentación técnica completa, incluyendo diagramas de flujo generados bajo demanda y análisis de lógica de negocio.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : activeFile ? (
                        <>
                            {/* File Header & Tabs */}
                            <div className="px-12 pt-8 border-b border-[#dfe1e6] bg-[#f4f5f7]/30">
                                <div className="max-w-5xl mx-auto">
                                    <div className="flex items-center gap-2 text-xs text-[#6b778c] mb-4 font-medium uppercase tracking-tight">
                                        <span>Módulo: {activeFile.category?.name || 'Varios'}</span>
                                        <ChevronRight size={12} />
                                        <span className="text-[#172b4d] font-bold underline decoration-[#0052cc] decoration-2 underline-offset-4">{activeFile.filename}</span>
                                    </div>

                                    <h1 className="text-3xl font-black mb-6 text-[#172b4d]">{activeFile.filename}</h1>

                                    <div className="flex gap-8">
                                        <button
                                            onClick={() => setActiveTab('docs')}
                                            className={`pb-4 px-2 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${activeTab === 'docs' ? 'border-[#0052cc] text-[#0052cc]' : 'border-transparent text-[#42526e] hover:text-[#172b4d]'}`}
                                        >
                                            <FileText size={16} />
                                            Documentación
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('logic')}
                                            className={`pb-4 px-2 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${activeTab === 'logic' ? 'border-[#0052cc] text-[#0052cc]' : 'border-transparent text-[#42526e] hover:text-[#172b4d]'}`}
                                        >
                                            <GitBranch size={16} />
                                            Lógica de Negocio
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('code')}
                                            className={`pb-4 px-2 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${activeTab === 'code' ? 'border-[#0052cc] text-[#0052cc]' : 'border-transparent text-[#42526e] hover:text-[#172b4d]'}`}
                                        >
                                            <Code2 size={16} />
                                            Código Fuente
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('diagram')}
                                            className={`pb-4 px-2 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${activeTab === 'diagram' ? 'border-[#0052cc] text-[#0052cc]' : 'border-transparent text-[#42526e] hover:text-[#172b4d]'}`}
                                        >
                                            <Activity size={16} />
                                            Diagrama de Flujo
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Tab Content */}
                            <div className="flex-1 overflow-y-auto p-12 bg-white scroll-smooth relative">
                                <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    {activeTab === 'docs' && (
                                        <div className="prose prose-slate max-w-none prose-h3:text-[#0052cc] prose-strong:text-[#172b4d]">
                                            <h3 className="flex items-center gap-2 text-xl font-bold mb-4">
                                                <Info size={20} />
                                                Descripción Técnica
                                            </h3>
                                            <div className="bg-[#f4f5f7]/50 p-8 rounded-3xl border border-[#dfe1e6] whitespace-pre-wrap text-[#42526e] leading-relaxed shadow-sm">
                                                {activeFile.documentation || 'No hay documentación disponible para este programa. Ejecuta un análisis en el Dashboard para generarla.'}
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'logic' && (
                                        <div className="prose prose-slate max-w-none">
                                            <h3 className="flex items-center gap-2 text-xl font-bold mb-4 text-[#0052cc]">
                                                <Activity size={20} />
                                                Reglas de Negocio Extraídas
                                            </h3>
                                            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 whitespace-pre-wrap text-[#42526e] leading-relaxed italic border-l-[6px] border-l-[#0052cc]">
                                                {activeFile.businessLogic || 'No se ha detectado lógica de negocio automatizada.'}
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'code' && (
                                        <div className="bg-[#0d1117] rounded-2xl overflow-hidden shadow-2xl">
                                            <div className="bg-[#161b22] px-6 py-3 border-b border-gray-800 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Terminal size={14} className="text-blue-400" />
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">AS/400 RPG SOURCE CODE</span>
                                                </div>
                                            </div>
                                            <pre className="p-8 text-xs font-mono text-gray-300 overflow-x-auto leading-loose selection:bg-blue-500/30">
                                                <code>{activeFile.content}</code>
                                            </pre>
                                        </div>
                                    )}

                                    {activeTab === 'diagram' && (
                                        <div className="flex flex-col items-center">
                                            <div className="w-full flex justify-between items-center mb-6">
                                                <h3 className="text-xl font-bold text-[#172b4d]">Representación del Flujo</h3>
                                                <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-green-200">SVG Activo</div>
                                            </div>
                                            {activeFile.htmlDiagram ? (
                                                <div
                                                    className="w-full bg-[#f4f5f7] rounded-3xl p-10 border border-[#dfe1e6] shadow-inner overflow-auto min-h-[500px]"
                                                    dangerouslySetInnerHTML={{ __html: activeFile.htmlDiagram }}
                                                />
                                            ) : (
                                                <div className="flex flex-col items-center justify-center p-20 bg-[#f4f5f7] rounded-3xl border border-[#dfe1e6] text-center w-full">
                                                    <Activity size={48} className="text-[#6b778c] mb-4 opacity-30" />
                                                    <p className="text-[#42526e] font-medium opacity-70">El diagrama no ha sido generado.</p>
                                                    <p className="text-xs text-[#6b778c] mt-2">Visita el Dashboard Principal para generar diagramas bajo demanda.</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : null}

                    {/* Floating Chat Bot - Jira/Confluence Style */}
                    <div className={`fixed bottom-8 right-8 w-[400px] bg-white border border-[#dfe1e6] rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 z-50 ${isChatOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
                        <div className="bg-[#0052cc] p-4 text-white flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                    <MessageCircle size={18} />
                                </div>
                                <div>
                                    <div className="font-bold text-sm leading-none">AMS Asistente de IA</div>
                                    <div className="text-[10px] text-blue-200 mt-1 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                                        {activeFile ? `Contexto: ${activeFile.filename}` : 'Contexto Global'}
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setIsChatOpen(false)} className="hover:bg-white/10 p-1.5 rounded-lg transition-colors">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="h-[350px] overflow-y-auto p-4 flex flex-col gap-4 bg-[#f4f5f7]">
                            {chatHistory.length === 0 ? (
                                <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-[#dfe1e6] text-xs self-start max-w-[85%] shadow-sm leading-relaxed">
                                    Hola, soy el asistente de conocimiento AMS. {activeFile ? `Puedo explicarte cualquier detalle sobre el programa **${activeFile.filename}** que estamos visualizando.` : 'Puedo responder preguntas sobre todos los módulos documentales del sistema.'} ¿Cómo puedo ayudarte?
                                </div>
                            ) : (
                                chatHistory.map((msg, i) => (
                                    <div key={i} className={`flex items-start gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-[#172b4d]' : 'bg-[#0052cc]'}`}>
                                            {msg.role === 'user' ? <User size={12} className="text-white" /> : <Bot size={12} className="text-white" />}
                                        </div>
                                        <div className={`p-3 rounded-2xl text-[11px] leading-relaxed shadow-sm border ${msg.role === 'user' ? 'bg-[#172b4d] text-white border-[#172b4d] rounded-tr-none' : 'bg-white text-[#172b4d] border-[#dfe1e6] rounded-tl-none'}`}>
                                            {msg.content}
                                        </div>
                                    </div>
                                ))
                            )}
                            {loadingChat && (
                                <div className="flex items-start gap-2">
                                    <div className="w-6 h-6 rounded-full bg-[#0052cc] flex items-center justify-center">
                                        <Loader2 size={12} className="text-white animate-spin" />
                                    </div>
                                    <div className="p-3 rounded-2xl bg-white border border-[#dfe1e6] text-[11px] italic text-[#6b778c]">Consultando la base de conocimiento...</div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        <div className="p-4 bg-white border-t border-[#dfe1e6]">
                            <form onSubmit={handleSendChat} className="relative">
                                <input
                                    value={chatMessage}
                                    onChange={(e) => setChatMessage(e.target.value)}
                                    type="text"
                                    placeholder="Pregunta algo sobre el sistema..."
                                    className="w-full border border-[#dfe1e6] rounded-xl py-3 pl-4 pr-12 text-sm focus:border-[#0052cc] focus:ring-1 focus:ring-[#0052cc] outline-none transition-all bg-[#f4f5f7] focus:bg-white"
                                    disabled={loadingChat}
                                />
                                <button
                                    type="submit"
                                    disabled={loadingChat || !chatMessage.trim()}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#0052cc] text-white p-2 rounded-lg hover:bg-[#0747a6] transition-colors disabled:opacity-50"
                                >
                                    <Send size={16} />
                                </button>
                            </form>
                        </div>
                    </div>

                    {!isChatOpen && (
                        <button
                            onClick={() => setIsChatOpen(true)}
                            className="fixed bottom-8 right-8 w-14 h-14 bg-[#0052cc] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all z-50 border-4 border-white active:scale-90"
                        >
                            <MessageCircle size={24} />
                        </button>
                    )}
                </main>
            </div>
        </div>
    );
};

export default AmsView;
