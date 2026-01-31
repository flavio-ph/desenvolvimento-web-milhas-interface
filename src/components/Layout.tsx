import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Moon, 
  Sun, 
  Bell, 
  LogOut, 
  Search,
  Check,
  ArrowRight
} from 'lucide-react';
import { MENU_ITEMS, ADMIN_MENU_ITEMS } from '../constants/constants';
import { useTheme } from '../context/ThemeContext';
import { getNotificacoes, marcarNotificacaoComoLida } from '../services/api';
import { Notificacao } from '../types/types';
import api from '../services/api';

interface UserData {
  nome: string;
  fotoPerfil?: string;
  role?: string;
}

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Estados para Notificações
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  
  // Estado para Busca
  const [searchTerm, setSearchTerm] = useState('');
  // Estado para Usuário 
  const [user, setUser] = useState<{ nome: string; fotoPerfil?: string; role?: string } | null>(null);

  const { isDarkMode, toggleDarkMode } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const notifRef = useRef<HTMLDivElement>(null);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  

  // --- LÓGICA DE BUSCA ---
  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      // Navega para a rota de busca passando o termo na URL
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
      setIsNotifOpen(false); // Fecha notificação se estiver aberta
    }
  };

  // --- LÓGICA DE NOTIFICAÇÕES ---
  const fetchNotificacoes = async () => {
    try {
      const data = await getNotificacoes();
      setNotificacoes(data);
    } catch (error) {
      console.error("Erro ao atualizar notificações:", error);
    }
  };

  useEffect(() => {
    const handleCustomUpdate = () => {
      fetchNotificacoes(); // Recarrega o sino quando a página de notificações marcar algo como lido
    };

    window.addEventListener('notificationRead', handleCustomUpdate);
    return () => window.removeEventListener('notificationRead', handleCustomUpdate);
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Faz a chamada para o UsuarioController através do axios configurado
        const response = await api.get('/usuarios/me');
        setUser(response.data);
      } catch (error) {
        console.error("Erro ao carregar perfil no Layout:", error);
      }
    };
    fetchUserProfile();
  }, []);

  useEffect(() => {
    fetchNotificacoes();
    
    // Criamos uma função para atualizar o sino
    const atualizarSino = () => fetchNotificacoes();

    // Escuta o evento que dispararemos da página de notificações
    window.addEventListener('notificacaoAtualizada', atualizarSino);
    
    const interval = setInterval(fetchNotificacoes, 30000);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('notificacaoAtualizada', atualizarSino);
    };
  }, [location.pathname]);

  // Fecha o dropdown se clicar fora dele
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      // 1. Atualiza no Banco
      await marcarNotificacaoComoLida(id);
      
      // 2. Atualiza o estado local para sumir o ponto azul na hora
      setNotificacoes(prev => prev.map(n => n.id === id ? { ...n, lida: true } : n));
    } catch (error) {
      console.error("Erro ao marcar como lida no Layout", error);
    }
  };

  const unreadCount = notificacoes.filter(n => !n.lida).length;

  return (
    <div className="h-screen w-full flex bg-slate-50 dark:bg-slate-950 transition-colors duration-300 overflow-hidden">
      
      {/* --- SIDEBAR --- */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">M</div>
              <span className="text-xl font-bold tracking-tight dark:text-white">MilhasPro</span>
            </div>
            <button onClick={toggleSidebar} className="lg:hidden text-slate-500">
              <X size={24} />
            </button>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar">
             <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">Menu Principal</div>
            {MENU_ITEMS.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${location.pathname === item.path ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 font-medium' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}

            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-16 mb-12 px-2">Administrativo</div>
            {ADMIN_MENU_ITEMS.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${location.pathname === item.path ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 font-medium' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-200 dark:border-slate-800">
            <button 
              onClick={() => navigate('/login')}
              className="flex items-center gap-3 w-full px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <LogOut size={20} />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </aside>

      {/* --- CONTEÚDO PRINCIPAL --- */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* HEADER */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-8 z-40 relative">
            <div className="flex items-center gap-4">
                <button onClick={toggleSidebar} className="lg:hidden text-slate-500">
                  <Menu size={24} />
                </button>
                
                {/* BARRA DE BUSCA FUNCIONAL */}
                <div className="relative hidden md:block">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                      type="text" 
                      placeholder="Buscar por transação, cartão..." 
                      className="pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-full text-sm w-64 focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white transition-all focus:w-80"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={handleSearch}
                  />
                </div>
            </div>

            <div className="flex items-center gap-2 lg:gap-4">
                <button 
                  onClick={toggleDarkMode}
                  className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors focus:outline-none"
                >
                  {isDarkMode ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} />}
                </button>
                
                {/* SINO COM DROPDOWN */}
                <div className="relative" ref={notifRef}>
                  <button 
                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                    className={`relative p-2 rounded-full transition-colors ${isNotifOpen ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/50' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                  >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 border-2 border-white dark:border-slate-900 rounded-full transform translate-x-1/4 -translate-y-1/4">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* POPUP DE NOTIFICAÇÕES */}
                  {isNotifOpen && (
                    <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-xl ring-1 ring-slate-900/5 dark:ring-white/10 overflow-hidden animate-fadeIn origin-top-right">
                      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <h3 className="font-bold text-slate-900 dark:text-white">Notificações</h3>
                        <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                          {unreadCount} novas
                        </span>
                      </div>

                      <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        {notificacoes.length > 0 ? (
                          notificacoes.slice(0, 5).map((notif) => (
                            <div 
                              key={notif.id} 
                              className={`p-4 border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group relative ${!notif.lida ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}
                              onClick={() => {
                                setIsNotifOpen(false);
                                navigate('/notifications');
                              }}
                            >
                              <div className="flex gap-3">
                                <div className={`w-2 h-2 mt-2 rounded-full shrink-0 ${notif.lida ? 'bg-transparent' : 'bg-indigo-500'}`}></div>
                                <div className="flex-1">
                                  <p className={`text-sm ${!notif.lida ? 'font-semibold text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                                    {notif.mensagem}
                                  </p>
                                  <p className="text-xs text-slate-400 mt-1">
                                    {new Date(notif.dataEnvio).toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                </div>
                                {!notif.lida && (
                                  <button 
                                    onClick={(e) => handleMarkAsRead(notif.id, e)}
                                    className="opacity-0 group-hover:opacity-100 p-1.5 text-indigo-600 hover:bg-indigo-100 rounded-full transition-all self-start"
                                    title="Marcar como lida"
                                  >
                                    <Check size={14} />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-8 text-center text-slate-500">
                            <Bell size={32} className="mx-auto mb-2 opacity-20" />
                            <p className="text-sm">Nenhuma notificação</p>
                          </div>
                        )}
                      </div>

                      <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 text-center">
                        <Link 
                          to="/notifications" 
                          onClick={() => setIsNotifOpen(false)}
                          className="text-sm font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 inline-flex items-center gap-1"
                        >
                          Ver todas as notificações <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 mx-2"></div>

                <div className="flex items-center gap-3 ml-2 cursor-pointer group" onClick={() => navigate('/profile')}>
                  <div className="hidden lg:block text-right">
                    <p className="text-sm font-semibold dark:text-white">
                      {user?.nome || 'Carregando...'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {/* Verifica o UserRole definido no seu enum Java */}
                      {user?.role === 'ADMIN' ? 'Administrador' : 'Plano Premium'}
                    </p>
                  </div>
                  <img 
                    src={user?.fotoPerfil 
                      ? `http://localhost:8080/uploads/${user.fotoPerfil}` 
                      : "https://github.com/shadcn.png"
                    }
                    alt="Profile" 
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-transparent group-hover:ring-indigo-500 transition-all"
                  />
                </div>
            </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;