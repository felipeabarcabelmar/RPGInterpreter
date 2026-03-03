import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Layout, Plus, Trash2, Tag, AlertCircle } from 'lucide-react';

const CategoryManagementView: React.FC = () => {
    const [categories, setCategories] = useState<any[]>([]);
    const [newName, setNewName] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await axios.get('/api/categories');
            setCategories(res.data);
        } catch (err) {
            setError('Error al cargar categorías');
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) return;

        setLoading(true);
        try {
            await axios.post('/api/categories', { name: newName, description: newDesc });
            setNewName('');
            setNewDesc('');
            fetchCategories();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Error al crear categoría');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Seguro? Los archivos en esta categoría pasarán a ser "Sin Categoría".')) return;

        try {
            await axios.delete(`/api/categories/${id}`);
            setCategories(categories.filter(c => c.id !== id));
        } catch (err) {
            setError('Error al eliminar categoría');
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8 bg-[#0d1117] text-gray-300 min-h-full">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Layout className="text-blue-500" />
                        Gestión de Categorías
                    </h1>
                    <p className="text-gray-500 mt-2">Organiza tus programas AS/400 en módulos lógicos.</p>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-200 text-sm">
                    <AlertCircle size={18} />
                    {error}
                </div>
            )}

            {/* Grid: Create + List */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Create Form */}
                <div className="md:col-span-1 p-6 bg-[#161b22] border border-gray-800 rounded-2xl h-fit">
                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        <Plus size={20} className="text-green-500" />
                        Nueva Categoría
                    </h3>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-500 ml-1">Nombre</label>
                            <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="Ej. Ventas, Contabilidad..."
                                className="w-full bg-[#0d1117] border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-500 ml-1">Descripción</label>
                            <textarea
                                value={newDesc}
                                onChange={(e) => setNewDesc(e.target.value)}
                                placeholder="Opcional..."
                                className="w-full bg-[#0d1117] border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 h-24"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50"
                        >
                            {loading ? 'Guardando...' : 'Crear Categoría'}
                        </button>
                    </form>
                </div>

                {/* Categories List */}
                <div className="md:col-span-2 space-y-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Tag size={20} className="text-blue-400" />
                        Categorías Existentes
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {categories.map(cat => (
                            <div key={cat.id} className="p-5 bg-[#161b22] border border-gray-800 rounded-2xl hover:border-blue-500/30 transition-all group">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h4 className="font-bold text-white mb-1">{cat.name}</h4>
                                        <p className="text-xs text-gray-500 line-clamp-2">{cat.description || 'Sin descripción'}</p>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(cat.id)}
                                        className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {categories.length === 0 && !loading && (
                            <div className="col-span-full p-12 text-center border-2 border-dashed border-gray-800 rounded-2xl text-gray-600">
                                No hay categorías creadas aún.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoryManagementView;
