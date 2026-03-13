import { useState, useEffect } from 'react';
import api from './api';
import { Layout, MessageSquare, LogOut, Tag, Home } from 'lucide-react';
import LoginView from './views/LoginView';
import DashboardView from './views/DashboardView';
import KnowledgeChatView from './views/KnowledgeChatView';
import CategoryManagementView from './views/CategoryManagementView';
import TicketManagementView from './views/TicketManagementView';
import SystemSelectorView from './views/SystemSelectorView';
import AmsView from './views/AmsView';
import BackofficeTicketView from './views/BackofficeTicketView';
import AmsAnalyticsView from './views/AmsAnalyticsView';

type View = 'dashboard' | 'chat' | 'categories';
type System = 'rpg' | 'ams' | 'tickets' | 'backoffice' | 'analytics' | null;



function App() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [currentSystem, setCurrentSystem] = useState<System>(null);
  const [currentView, setCurrentView] = useState<View>('dashboard');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await api.get('/api/auth/me');
      setAuthenticated(res.data.authenticated);
    } catch (err) {
      setAuthenticated(false);
    }
  };

  const logout = () => {
    document.cookie = "session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    setAuthenticated(false);
    setCurrentSystem(null);
  };

  if (authenticated === null) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#0d1117]">
        <div className="animate-pulse text-blue-500 font-medium tracking-tighter text-xl">Caleb Group Portal...</div>
      </div>
    );
  }

  if (!authenticated) {
    return <LoginView onLoginSuccess={() => setAuthenticated(true)} />;
  }

  if (currentSystem === null) {
    return <SystemSelectorView onSelect={(sys) => setCurrentSystem(sys)} />;
  }

  if (currentSystem === 'ams' || currentSystem === 'tickets' || currentSystem === 'backoffice' || currentSystem === 'analytics') {
    return (
      <div className="relative h-screen w-full">
        {currentSystem === 'ams' ? <AmsView /> : 
         currentSystem === 'tickets' ? <TicketManagementView /> : 
         currentSystem === 'backoffice' ? <BackofficeTicketView /> :
         <AmsAnalyticsView />}
        <button
          onClick={() => setCurrentSystem(null)}
          className="fixed bottom-6 left-6 z-50 bg-white border border-[#dfe1e6] p-3 rounded-full shadow-xl text-[#42526e] hover:text-[#0052cc] hover:scale-110 transition-all flex items-center gap-2 pr-5"
        >
          <Home size={20} />
          <span className="text-sm font-bold">Volver al Selector</span>
        </button>
      </div>
    );
  }


  return (
    <div className="flex h-screen w-full bg-[#0d1117] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-[#161b22] border-r border-gray-800 flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <img src="/caleblogo.png" alt="Caleb Group" className="w-10 h-10 object-contain" />
          <span className="font-bold text-white tracking-widest text-sm uppercase">Caleb Group</span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${currentView === 'dashboard' ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-inner' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
          >
            <Layout size={18} />
            <span className="text-sm font-medium">Dashboard</span>
          </button>

          <button
            onClick={() => setCurrentView('chat')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${currentView === 'chat' ? 'bg-purple-600/10 text-purple-400 border border-purple-500/20 shadow-inner' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
          >
            <MessageSquare size={18} />
            <span className="text-sm font-medium">Knowledge Chat</span>
          </button>

          <button
            onClick={() => setCurrentView('categories')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${currentView === 'categories' ? 'bg-orange-600/10 text-orange-400 border border-orange-500/20 shadow-inner' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
          >
            <Tag size={18} />
            <span className="text-sm font-medium">Categorías</span>
          </button>
        </nav>


        <div className="p-4 border-t border-gray-800/50 space-y-2">
          <button
            onClick={() => setCurrentSystem(null)}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-gray-300 hover:bg-white/5 rounded-xl transition-all"
          >
            <Home size={18} />
            <span className="text-sm font-medium">Cambiar Sistema</span>
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-500/70 hover:text-red-400 hover:bg-red-400/5 rounded-xl transition-all"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* View Container */}
      <main className="flex-1 overflow-hidden relative">
        {currentView === 'dashboard' && <DashboardView />}
        {currentView === 'chat' && <KnowledgeChatView />}
        {currentView === 'categories' && <CategoryManagementView />}
      </main>


    </div>
  );
}

export default App;
