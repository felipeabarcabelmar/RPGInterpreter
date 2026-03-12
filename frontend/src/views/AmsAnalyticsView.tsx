import React from 'react';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer, 
    LineChart, 
    Line, 
    PieChart, 
    Pie, 
    Cell, 
    AreaChart, 
    Area,
    ReferenceLine
} from 'recharts';
import { 
    TrendingUp, 
    Users, 
    Clock, 
    AlertCircle, 
    CheckCircle2, 
    BarChart3, 
    ArrowUpRight, 
    ArrowDownRight,
    Activity,
    Shield
} from 'lucide-react';

// DUMMY DATA
const ticketVolumeData = [
    { name: 'Lun', tickets: 12, resolved: 10 },
    { name: 'Mar', tickets: 19, resolved: 15 },
    { name: 'Mie', tickets: 15, resolved: 14 },
    { name: 'Jue', tickets: 22, resolved: 18 },
    { name: 'Vie', tickets: 30, resolved: 25 },
    { name: 'Sab', tickets: 10, resolved: 12 },
    { name: 'Dom', tickets: 5, resolved: 6 },
];

const criticalityData = [
    { name: 'Crítica', value: 15, color: '#ef4444' },
    { name: 'Alta', value: 25, color: '#f97316' },
    { name: 'Media', value: 45, color: '#3b82f6' },
    { name: 'Baja', value: 15, color: '#94a3b8' },
];

const resourceConsumptionData = [
    { name: 'ERP RPG', hours: 120, baseline: 100 },
    { name: 'Base Conocimientos', hours: 45, baseline: 50 },
    { name: 'Portal Cliente', hours: 30, baseline: 40 },
    { name: 'API Services', hours: 85, baseline: 70 },
    { name: 'Integración DB', hours: 60, baseline: 60 },
];

const slaData = [
    { time: '08:00', responseTime: 15 },
    { time: '10:00', responseTime: 25 },
    { time: '12:00', responseTime: 45 },
    { time: '14:00', responseTime: 30 },
    { time: '16:00', responseTime: 20 },
    { time: '18:00', responseTime: 10 },
];

const AmsAnalyticsView: React.FC = () => {
    return (
        <div className="h-full flex flex-col p-8 space-y-8 overflow-y-auto bg-slate-50 font-sans text-slate-900 custom-scrollbar">
            <header className="flex justify-between items-start mb-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-widest rounded-full">Reporte Ejecutivo</span>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                        <BarChart3 className="text-indigo-600" size={32} />
                        Analíticas y Gestión AMS
                    </h1>
                    <p className="text-slate-500 mt-1">Monitoreo de rendimiento, SLAs y consumo de recursos Caleb Group.</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                            <Activity size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Status del Servicio</p>
                            <p className="text-lg font-black text-emerald-600 leading-none mt-1">OPERATIVO</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Top KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Tickets (Mes)', value: '1,248', change: '+12.5%', icon: <TrendingUp size={20} />, color: 'blue', up: true },
                    { label: 'Usuarios Activos', value: '458', change: '+5.2%', icon: <Users size={20} />, color: 'indigo', up: true },
                    { label: 'Tiempo Resp. Prom.', value: '18.5 min', change: '-2.1 min', icon: <Clock size={20} />, color: 'orange', up: false },
                    { label: 'SLA Cumplimiento', value: '99.8%', change: '+0.1%', icon: <Shield size={20} />, color: 'emerald', up: true },
                ].map((kpi, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-${kpi.color}-500/5 rounded-bl-full -mr-8 -mt-8`} />
                        <div className="flex justify-between items-start relative z-10">
                            <div className={`p-3 rounded-2xl bg-${kpi.color}-50 text-${kpi.color}-600`}>
                                {kpi.icon}
                            </div>
                            <div className={`flex items-center gap-1 text-[10px] font-black ${kpi.up ? 'text-emerald-600' : 'text-orange-500'}`}>
                                {kpi.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                {kpi.change}
                            </div>
                        </div>
                        <div className="mt-4">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{kpi.label}</h3>
                            <p className="text-2xl font-black text-slate-800 mt-1">{kpi.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Ticket Volume Chart */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-lg font-black text-slate-800">Volumen de Tickets</h3>
                            <p className="text-xs text-slate-400 mt-1">Comparativa semanal: Solicitados vs Resueltos</p>
                        </div>
                        <select className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-[10px] font-black text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10">
                            <option>Últimos 7 días</option>
                            <option>Últimos 30 días</option>
                        </select>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={ticketVolumeData}>
                                <defs>
                                    <linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                                <Tooltip 
                                    contentStyle={{backgroundColor: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                                />
                                <Area type="monotone" dataKey="tickets" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorTickets)" />
                                <Area type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={3} strokeDasharray="5 5" fill="transparent" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Criticality Distribution */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col">
                    <div className="mb-8">
                        <h3 className="text-lg font-black text-slate-800">Distribución de Criticidad</h3>
                        <p className="text-xs text-slate-400 mt-1">Estado de severidad de casos actuales</p>
                    </div>
                    <div className="flex-1 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                        <div className="h-[250px] w-full md:w-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={criticalityData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {criticalityData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex-1 grid grid-cols-2 gap-4">
                            {criticalityData.map((item, i) => (
                                <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-2 h-2 rounded-full" style={{backgroundColor: item.color}} />
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.name}</span>
                                    </div>
                                    <p className="text-lg font-black text-slate-800">{item.value}%</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Resource Consumption */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                    <div className="mb-8">
                        <h3 className="text-lg font-black text-slate-800">Consumo por Sistema</h3>
                        <p className="text-xs text-slate-400 mt-1">Horas dedicadas vs Presupuesto base</p>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={resourceConsumptionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                                <Tooltip 
                                    cursor={{fill: '#f8fafc'}}
                                    contentStyle={{backgroundColor: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                                />
                                <Bar dataKey="hours" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                                <Bar dataKey="baseline" fill="#e2e8f0" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* SLA Response Time */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col">
                    <div className="mb-8 flex justify-between items-start">
                        <div>
                            <h3 className="text-lg font-black text-slate-800">Rendimiento SLA (min)</h3>
                            <p className="text-xs text-slate-400 mt-1">Tiempo de respuesta según hora del día</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target</p>
                            <p className="text-lg font-black text-indigo-600 leading-none mt-1">{'<'} 30m</p>
                        </div>
                    </div>
                    <div className="flex-1 h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={slaData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} domain={[0, 60]} />
                                <Tooltip 
                                    contentStyle={{backgroundColor: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                                />
                                <Line type="step" dataKey="responseTime" stroke="#f97316" strokeWidth={4} dot={{r: 6, fill: '#f97316', strokeWidth: 2, stroke: '#fff'}} />
                                <ReferenceLine y={30} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'right', value: 'SLA Limit', fill: '#ef4444', fontSize: 10, fontWeight: 'bold' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Footer Summary */}
            <footer className="bg-indigo-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
                <div className="relative z-10 text-center md:text-left">
                    <h4 className="text-xl font-black">Eficiencia del Servicio AMS</h4>
                    <p className="text-indigo-200 text-sm mt-1 mb-4">Métrica global basada en satisfacción, tiempo y resolución técnica.</p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl border border-white/10">
                            <CheckCircle2 size={16} className="text-emerald-400" />
                            <span className="text-xs font-bold">Resuelto 1er Contacto: 82%</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl border border-white/10">
                            <AlertCircle size={16} className="text-amber-400" />
                            <span className="text-xs font-bold">Backlog: 42 tickets</span>
                        </div>
                    </div>
                </div>
                <div className="relative z-10 text-center flex flex-col items-center">
                    <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1">Health Score</p>
                    <div className="text-6xl font-black">94<span className="text-2xl text-indigo-300">/100</span></div>
                </div>
            </footer>
        </div>
    );
};

export default AmsAnalyticsView;
