import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, FileText, Layout, Trash2, ChevronRight, Brain } from 'lucide-react';

const DashboardView: React.FC = () => {
    const [files, setFiles] = useState<any[]>([]);
    const [selectedFile, setSelectedFile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [categoryId, setCategoryId] = useState<string>('');

    const [isEditing, setIsEditing] = useState(false);
    const [editedDocs, setEditedDocs] = useState('');
    const [editedLogic, setEditedLogic] = useState('');
    const [analyzing, setAnalyzing] = useState(false);

    const hasDocumentation = selectedFile?.documentation && selectedFile.documentation.trim().length > 0;


    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (selectedFile) {
            setEditedDocs(selectedFile.documentation || '');
            setEditedLogic(selectedFile.businessLogic || '');
            setIsEditing(false);
        }
    }, [selectedFile]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [filesRes, catsRes] = await Promise.all([
                axios.get('/api/files'),
                axios.get('/api/categories')
            ]);
            setFiles(filesRes.data);
            setCategories(catsRes.data);
        } catch (err) {
            console.error("Error fetching data:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAnalyze = async () => {
        if (!selectedFile || analyzing) return;
        setAnalyzing(true);
        try {
            const res = await axios.post(`/api/files/${selectedFile.id}/analyze`);
            setSelectedFile(res.data);
            setFiles(files.map(f => f.id === selectedFile.id ? res.data : f));
        } catch (err) {
            console.error("Analysis error:", err);
            alert("Error al analizar el registro.");
        } finally {
            setAnalyzing(false);
        }
    };

    const handleSaveEdit = async () => {
        if (!selectedFile) return;
        try {
            const res = await axios.patch(`/api/files/${selectedFile.id}`, {
                documentation: editedDocs,
                businessLogic: editedLogic
            });
            setSelectedFile(res.data);
            setFiles(files.map(f => f.id === selectedFile.id ? res.data : f));
            setIsEditing(false);
        } catch (err) {
            console.error("Save error:", err);
            alert("Error al guardar los cambios.");
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        if (categoryId) formData.append('categoryId', categoryId);

        try {
            const res = await axios.post('/api/files/upload', formData);
            fetchData();
            setSelectedFile(res.data); // Select the newly uploaded file
        } catch (err) {
            console.error("Upload error:", err);
        } finally {
            setUploading(false);
        }
    };

    const deleteFile = async (id: number) => {
        if (!confirm('¿Seguro que deseas eliminar este archivo?')) return;
        try {
            await axios.delete(`/api/files/${id}`);
            setFiles(files.filter(f => f.id !== id));
            if (selectedFile?.id === id) setSelectedFile(null);
        } catch (err) {
            console.error("Delete error:", err);
        }
    };

    const generateDiagram = async (id: number) => {
        try {
            const res = await axios.post(`/api/files/${id}/generate-diagram`);
            const updatedFile = { ...selectedFile, htmlDiagram: res.data.html_diagram };
            setSelectedFile(updatedFile);
            setFiles(files.map(f => f.id === id ? updatedFile : f));
        } catch (err) {
            console.error("Diagram error:", err);
        }
    };

    return (
        <div className="flex h-full bg-[#0d1117] text-gray-300">
            {/* File List Pane */}
            <div className="w-80 border-r border-gray-800 flex flex-col bg-[#161b22]/30">
                <header className="p-4 border-b border-gray-800 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-bold text-white uppercase tracking-wider">Archivos</h2>
                        <label className={`p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md cursor-pointer transition-all ${uploading ? 'opacity-50' : ''}`}>
                            <Upload size={14} />
                            <input type="file" className="hidden" onChange={handleFileUpload} accept=".txt,.rpg,.rpgle" />
                        </label>
                    </div>
                    <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="w-full bg-[#0d1117] border border-gray-700 rounded-md px-2 py-1 text-xs outline-none"
                    >
                        <option value="">Gral / Todas</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </header>

                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="p-4 text-center text-xs text-gray-600">Cargando...</div>
                    ) : files.length === 0 ? (
                        <div className="p-4 text-center text-xs text-gray-600 italic">No hay archivos.</div>
                    ) : (
                        <div className="divide-y divide-gray-800/50">
                            {files.filter(f => !categoryId || f.categoryId === parseInt(categoryId)).map(file => (
                                <div
                                    key={file.id}
                                    onClick={() => setSelectedFile(file)}
                                    className={`p-3 cursor-pointer hover:bg-gray-800/40 transition-all ${selectedFile?.id === file.id ? 'bg-blue-600/10 border-l-2 border-blue-500' : ''}`}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-medium text-white truncate max-w-[180px]">{file.filename}</span>
                                        <button onClick={(e) => { e.stopPropagation(); deleteFile(file.id); }} className="text-gray-600 hover:text-red-400 p-1">
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] px-1.5 py-0.5 bg-gray-800 rounded text-gray-400">
                                            {file.category?.name || 'Gral'}
                                        </span>
                                        {!file.documentation ? (
                                            <span className="text-[9px] px-1.5 py-0.5 bg-yellow-900/40 text-yellow-500 rounded border border-yellow-700/30 flex items-center gap-1">
                                                <Brain size={8} /> Pendiente
                                            </span>
                                        ) : (
                                            <span className="text-[9px] px-1.5 py-0.5 bg-green-900/40 text-green-500 rounded border border-green-700/30 flex items-center gap-1">
                                                <Brain size={8} /> Analizado
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Analysis View (3-column style) */}
            <div className="flex-1 overflow-y-auto bg-[#0d1117]">
                {selectedFile ? (
                    <div className="p-6 space-y-6 animate-in fade-in duration-500">
                        {/* Action Bar */}
                        <header className="flex items-center justify-between border-b border-gray-800 pb-4">
                            <div className="flex items-center gap-4">
                                <FileText className="text-blue-500" size={24} />
                                <h1 className="text-xl font-bold text-white">{selectedFile.filename}</h1>
                            </div>
                            <div className="flex items-center gap-3">
                                {analyzing ? (
                                    <div className="flex items-center gap-2 px-4 py-1.5 bg-blue-600/20 text-blue-400 rounded-lg text-xs animate-pulse ring-1 ring-blue-500/50 shadow-lg shadow-blue-900/20">
                                        <Brain size={14} className="animate-spin" />
                                        La IA está interpretando el código...
                                    </div>
                                ) : (!hasDocumentation && (
                                    <button
                                        onClick={handleAnalyze}
                                        className="px-6 py-2 text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold shadow-xl shadow-blue-900/40 transition-all flex items-center gap-2 active:scale-95 group"
                                    >
                                        <Brain size={16} className="group-hover:rotate-12 transition-transform" />
                                        Analizar Registro
                                    </button>
                                ))}

                                {isEditing ? (
                                    <>
                                        <button onClick={() => setIsEditing(false)} className="px-3 py-1.5 text-xs text-gray-400 hover:text-white transition-colors">Cancelar</button>
                                        <button onClick={handleSaveEdit} className="px-4 py-1.5 text-xs bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium shadow-lg shadow-green-900/20 transition-all active:scale-95">Guardar Cambios</button>
                                    </>
                                ) : (
                                    hasDocumentation && (
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={handleAnalyze}
                                                className="px-4 py-1.5 text-xs bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-600/30 rounded-lg font-medium transition-all active:scale-95 flex items-center gap-2"
                                                title="Volver a analizar con IA"
                                            >
                                                <Brain size={14} />
                                                Re-analizar
                                            </button>
                                            <button
                                                onClick={() => setIsEditing(true)}
                                                className="px-4 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-all hover:bg-gray-700/80 active:scale-95"
                                            >
                                                Editar Análisis
                                            </button>
                                        </div>
                                    )
                                )}
                            </div>
                        </header>

                        {/* 3-Column Grid */}
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-fit relative">
                            {/* Overlay if not analyzed and NOT currently analyzing */}
                            {!hasDocumentation && !analyzing && (
                                <div className="absolute inset-0 z-20 bg-[#0d1117]/80 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center space-y-4 border border-gray-800/50">
                                    <div className="p-8 bg-[#161b22] rounded-3xl border border-gray-700 shadow-2xl flex flex-col items-center max-w-sm text-center transform transition-all hover:scale-[1.02]">
                                        <div className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center mb-6 ring-1 ring-blue-500/30">
                                            <Brain size={40} className="text-blue-500 animate-pulse" />
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-3">Análisis Requerido</h3>
                                        <p className="text-sm text-gray-400 mb-8 leading-relaxed">
                                            Este programa ha sido cargado con éxito. Pulsa el botón inferior para realizar el análisis técnico con IA.
                                        </p>
                                        <button
                                            onClick={handleAnalyze}
                                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-blue-900/40 transition-all flex items-center justify-center gap-2 active:scale-95"
                                        >
                                            <Brain size={20} />
                                            Iniciar Análisis IA
                                        </button>
                                    </div>
                                </div>
                            )}


                            {/* Column 1: Source Code */}
                            <section className="flex flex-col bg-[#161b22] rounded-xl border border-gray-800 overflow-hidden min-h-[500px]">
                                <div className="px-4 py-3 bg-gray-800/40 border-b border-gray-800 flex items-center gap-2">
                                    <ChevronRight size={14} className="text-blue-400" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Código Fuente RPG</span>
                                </div>
                                <pre className="p-4 text-[11px] font-mono leading-relaxed overflow-auto text-blue-200/70 whitespace-pre-wrap flex-1 bg-black/20">
                                    {selectedFile.content}
                                </pre>
                            </section>

                            {/* Column 2: Documentation */}
                            <section className="flex flex-col bg-[#161b22] rounded-xl border border-gray-800 overflow-hidden min-h-[500px]">
                                <div className="px-4 py-3 bg-gray-800/40 border-b border-gray-800 flex items-center gap-2">
                                    <Brain size={14} className="text-purple-400" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Documentación Técnica</span>
                                </div>
                                <div className="p-4 flex-1 flex flex-col overflow-y-auto">
                                    {isEditing ? (
                                        <textarea
                                            value={editedDocs}
                                            onChange={(e) => setEditedDocs(e.target.value)}
                                            className="w-full flex-1 bg-[#0d1117] border border-gray-700 rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all resize-none font-sans"
                                        />
                                    ) : (
                                        selectedFile.documentation ? (
                                            <p className="text-sm leading-relaxed text-gray-300 whitespace-pre-wrap">{selectedFile.documentation}</p>
                                        ) : (
                                            <div className="flex-1 flex flex-col items-center justify-center text-gray-600 italic text-center p-8 space-y-4 opacity-50">
                                                <Brain size={32} />
                                                <p>Sin documentación técnica.</p>
                                            </div>
                                        )
                                    )}
                                </div>
                            </section>

                            {/* Column 3: Business Logic */}
                            <section className="flex flex-col bg-[#161b22] rounded-xl border border-gray-800 overflow-hidden min-h-[500px]">
                                <div className="px-4 py-3 bg-gray-800/40 border-b border-gray-800 flex items-center gap-2">
                                    <Layout size={14} className="text-green-400" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Lógica de Negocio</span>
                                </div>
                                <div className="p-4 flex-1 flex flex-col overflow-y-auto">
                                    {isEditing ? (
                                        <textarea
                                            value={editedLogic}
                                            onChange={(e) => setEditedLogic(e.target.value)}
                                            className="w-full flex-1 bg-[#0d1117] border border-gray-700 rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all resize-none font-sans"
                                        />
                                    ) : (
                                        selectedFile.businessLogic ? (
                                            <p className="text-sm leading-relaxed text-gray-300 whitespace-pre-wrap">{selectedFile.businessLogic}</p>
                                        ) : (
                                            <div className="flex-1 flex flex-col items-center justify-center text-gray-600 italic text-center p-8 space-y-4 opacity-50">
                                                <Layout size={32} />
                                                <p>Lógica de negocio no extraída.</p>
                                            </div>
                                        )
                                    )}
                                </div>
                            </section>
                        </div>


                        {/* Mermaid / Graphic Flow Section */}
                        <section className="p-6 bg-[#161b22] rounded-2xl border border-gray-800">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <Layout size={14} className="text-orange-400" /> Diagrama de Flujo Interactivo
                                </h3>
                                {selectedFile.documentation && !selectedFile.htmlDiagram && (
                                    <button
                                        onClick={() => generateDiagram(selectedFile.id)}
                                        className="text-xs px-3 py-1 bg-orange-600/20 text-orange-400 border border-orange-600/30 rounded-md hover:bg-orange-600/40 transition-all"
                                    >
                                        Generar Visualización
                                    </button>
                                )}
                            </div>

                            {selectedFile.htmlDiagram ? (
                                <div
                                    className="bg-[#0d1117] rounded-xl overflow-hidden min-h-[500px] border border-gray-800 shadow-inner"
                                    dangerouslySetInnerHTML={{ __html: selectedFile.htmlDiagram }}
                                />
                            ) : (
                                <div className="h-[300px] flex flex-col items-center justify-center border-2 border-dashed border-gray-800 rounded-xl text-gray-600 text-sm italic">
                                    {selectedFile.documentation
                                        ? "Haz clic en el botón para que la IA dibuje el diagrama SVG de este programa."
                                        : "Debes analizar el registro primero para poder generar un diagrama de flujo."}
                                </div>
                            )}
                        </section>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-600 gap-4 opacity-30">
                        <Layout size={64} />
                        <p className="text-sm font-medium">Selecciona un programa para iniciar el análisis profundo</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardView;
