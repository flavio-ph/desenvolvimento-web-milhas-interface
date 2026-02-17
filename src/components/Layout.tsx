import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  Moon,
  Sun,
  Bell,
  LogOut,
  Check,
  ArrowRight,
  Plane,
  LayoutDashboard,
  CreditCard,
  History,
  ChevronLeft, // Importado para o botão de colapsar
  ChevronRight // Importado para o botão de expandir
} from 'lucide-react';
import { MENU_ITEMS, ADMIN_MENU_ITEMS } from '../constants/constants';
import { useTheme } from '../context/ThemeContext';
import { getNotificacoes, marcarNotificacaoComoLida } from '../services/api';
import { Notificacao } from '../types/types';
import api from '../services/api';
import { useToast } from '../components/ToastContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  // Controle do menu Mobile (aberto/fechado fora da tela)
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // NOVO ESTADO: Controle do menu Desktop (largo/estreito)
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [user, setUser] = useState<{ nome: string; fotoPerfil?: string; role?: string } | null>(null);

  const { isDarkMode, toggleDarkMode } = useTheme();
  const { addToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const notifRef = useRef<HTMLDivElement>(null);

  // Função para abrir/fechar no mobile
  const toggleMobileSidebar = () => setIsMobileOpen(!isMobileOpen);

  // Função para colapsar/expandir no desktop
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  const getPageTitle = (path: string) => {
    // ... (sua lógica de títulos permanece igual)
    switch (path) {
      case '/': return 'Visão Geral';
      case '/cards': return 'Carteira de Cartões';
      case '/history': return 'Extrato de Movimentações';
      case '/promotions': return 'Promoções e Bônus';
      case '/new-purchase': return 'Registrar Nova Compra';
      case '/profile': return 'Meu Perfil';
      case '/notifications': return 'Central de Notificações';
      case '/admin/programs': return 'Gerenciar Programas';
      case '/admin/brands': return 'Gerenciar Bandeiras';
      case '/admin/new-promotion': return 'Gerenciar Promoções';
      default: return 'MilhasPro';
    }
  };

  const currentTitle = getPageTitle(location.pathname);

  // ... (Seus useEffects de notificação e user profile permanecem iguais)
  const fetchNotificacoes = async () => {
    try {
      const data = await getNotificacoes();
      setNotificacoes(data);
    } catch (error) {
      console.error("Erro ao atualizar notificações:", error);
    }
  };

  useEffect(() => {
    const handleCustomUpdate = () => fetchNotificacoes();
    window.addEventListener('notificationRead', handleCustomUpdate);
    return () => window.removeEventListener('notificationRead', handleCustomUpdate);
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
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
    const atualizarSino = () => fetchNotificacoes();
    window.addEventListener('notificacaoAtualizada', atualizarSino);
    const interval = setInterval(fetchNotificacoes, 30000);
    return () => {
      clearInterval(interval);
      window.removeEventListener('notificacaoAtualizada', atualizarSino);
    };
  }, [location.pathname]);

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
      await marcarNotificacaoComoLida(id);
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
        className={`
          fixed inset-y-0 left-0 z-50 
          bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 
          transform transition-all duration-300 ease-in-out 
          lg:relative lg:translate-x-0
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} 
          ${isCollapsed ? 'lg:w-20' : 'lg:w-72'} 
          w-72
        `}
      >
        <div className="flex flex-col h-full">
          {/* HEADER DA SIDEBAR COM LOGO E BOTÃO DE COLAPSAR */}
          <div className={`p-6 flex items-center mb-4 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>

            {/* Logo e Texto (Se não estiver colapsado) */}
            <div className="flex items-center gap-3">
              <div className="hover:scale-105 transition-transform duration-300 shrink-0">
                <Plane className="w-9 h-9 text-indigo-600 dark:text-indigo-400" />
              </div>

              {/* Esconde o texto "MilhasPro" se estiver colapsado */}
              <span className={`text-2xl font-black tracking-tight text-slate-900 dark:text-white transition-opacity duration-200 ${isCollapsed ? 'hidden opacity-0' : 'block opacity-100'}`}>
                MilhasPro
              </span>
            </div>

            {/* Botão Fechar (Aparece só no Mobile) */}
            <button onClick={toggleMobileSidebar} className="lg:hidden text-slate-500 hover:text-indigo-600 transition-colors">
              <X size={24} />
            </button>

            {/* Botão Colapsar (Aparece só no Desktop e se estiver expandido) */}
            <button
              onClick={toggleCollapse}
              className={`hidden lg:flex p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-600 transition-colors ${isCollapsed ? 'absolute -right-3 top-8 border border-slate-200 dark:border-slate-700 shadow-sm bg-white' : ''}`}
              title={isCollapsed ? "Expandir Menu" : "Recolher Menu"}
            >
              {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={20} />}
            </button>
          </div>

          <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto custom-scrollbar overflow-x-hidden">

            {/* Título da Seção (Esconde se colapsado) */}
            {!isCollapsed && (
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-4 mt-2 animate-fadeIn">
                Menu Principal
              </div>
            )}

            {MENU_ITEMS.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                title={isCollapsed ? item.label : ''} // Mostra tooltip nativo se colapsado
                className={`
                  flex items-center gap-3 px-4 py-3 mx-2 rounded-xl transition-all duration-300 group font-medium relative
                  ${location.pathname === item.path
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400'
                  }
                  ${isCollapsed ? 'justify-center px-0 mx-0' : ''} 
                `}
              >
                <div className={`${location.pathname === item.path ? 'text-white' : 'group-hover:scale-110 transition-transform duration-200'}`}>
                  {item.icon}
                </div>

                {/* Texto do Link (Esconde se colapsado) */}
                {!isCollapsed && (
                  <span className="whitespace-nowrap">{item.label}</span>
                )}
              </Link>
            ))}

            {/* Título da Seção Adm (Esconde se colapsado) */}
            {!isCollapsed && (
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-10 mb-3 px-4 animate-fadeIn">
                Administrativo
              </div>
            )}

            {/* Divisor simples se estiver colapsado para separar seções visualmente */}
            {isCollapsed && <div className="my-4 border-t border-slate-100 dark:border-slate-800 w-10 mx-auto"></div>}

            {ADMIN_MENU_ITEMS.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                title={isCollapsed ? item.label : ''}
                className={`
                  flex items-center gap-3 px-4 py-3 mx-2 rounded-xl transition-all duration-300 group font-medium
                  ${location.pathname === item.path
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400'
                  }
                  ${isCollapsed ? 'justify-center px-0 mx-0' : ''}
                `}
              >
                <div className={`${location.pathname === item.path ? 'text-white' : 'group-hover:scale-110 transition-transform duration-200'}`}>
                  {item.icon}
                </div>
                {!isCollapsed && (
                  <span className="whitespace-nowrap">{item.label}</span>
                )}
              </Link>
            ))}
          </nav>

          {/* Footer Sidebar (Logout) */}
          <div className="p-4 mt-auto border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm">
            <button
              onClick={() => {
                localStorage.removeItem('token');
                addToast({
                  type: 'info',
                  title: 'Logout realizado',
                  description: 'Você saiu do sistema com segurança.'
                });
                navigate('/login');
              }}
              title={isCollapsed ? "Sair da conta" : ''}
              className={`
                flex items-center gap-3 w-full px-4 py-3 text-slate-600 dark:text-slate-400 
                hover:bg-white dark:hover:bg-slate-800 hover:text-red-600 dark:hover:text-red-400 
                rounded-xl transition-all duration-300 hover:shadow-sm group font-medium
                ${isCollapsed ? 'justify-center' : ''}
              `}
            >
              <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
              {!isCollapsed && <span>Sair da conta</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* --- CONTEÚDO PRINCIPAL --- */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* HEADER */}
        <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-8 z-40 relative">
          <div className="flex items-center gap-4">
            {/* Botão Hamburger (Só Mobile) */}
            <button onClick={toggleMobileSidebar} className="lg:hidden text-slate-500 hover:text-indigo-600 transition-colors">
              <Menu size={24} />
            </button>

            <div className="hidden md:flex flex-col animate-fadeIn">
              <h1 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">
                {currentTitle}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 lg:gap-6">
            <button
              onClick={toggleDarkMode}
              className="p-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all hover:scale-105 active:scale-95 focus:outline-none"
            >
              {isDarkMode ? <Sun size={20} className="text-amber-400 fill-amber-400" /> : <Moon size={20} />}
            </button>

            {/* SINO COM DROPDOWN */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className={`relative p-2.5 rounded-xl transition-all hover:scale-105 active:scale-95 ${isNotifOpen ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/50' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 inline-flex items-center justify-center min-w-[10px] h-[10px] bg-red-500 border-2 border-white dark:border-slate-900 rounded-full animate-pulse">
                  </span>
                )}
              </button>

              {/* POPUP DE NOTIFICAÇÕES (Mantido igual) */}
              {isNotifOpen && (
                <div className="absolute right-0 top-14 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 ring-1 ring-slate-900/5 dark:ring-white/10 overflow-hidden animate-fadeIn origin-top-right z-50">
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                    <h3 className="font-bold text-slate-900 dark:text-white">Notificações</h3>
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-400 px-2.5 py-1 rounded-full border border-indigo-100 dark:border-indigo-800">
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
                            <div className={`w-2.5 h-2.5 mt-1.5 rounded-full shrink-0 shadow-sm ${notif.lida ? 'bg-slate-200 dark:bg-slate-700' : 'bg-indigo-500'}`}></div>
                            <div className="flex-1">
                              <p className={`text-sm ${!notif.lida ? 'font-bold text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                                {notif.mensagem}
                              </p>
                              <p className="text-xs text-slate-400 mt-1 font-medium">
                                {new Date(notif.dataEnvio).toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            {!notif.lida && (
                              <button
                                onClick={(e) => handleMarkAsRead(notif.id, e)}
                                className="opacity-0 group-hover:opacity-100 p-1.5 text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded-full transition-all self-start"
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
                        <p className="text-sm font-medium">Nenhuma notificação</p>
                      </div>
                    )}
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 text-center">
                    <Link
                      to="/notifications"
                      onClick={() => setIsNotifOpen(false)}
                      className="text-sm font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 inline-flex items-center gap-1 hover:gap-2 transition-all"
                    >
                      Ver todas as notificações <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 mx-2"></div>

            <div className="flex items-center gap-3 pl-2 cursor-pointer group" onClick={() => navigate('/profile')}>
              {/* Oculta informações do usuário no header em mobile, mas exibe normal em desktop */}
              <div className="hidden lg:block text-right">
                <p className="text-sm font-bold dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {user?.nome || 'Carregando...'}
                </p>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {user?.role === 'ADMIN' ? 'Administrador' : 'Plano Premium'}
                </p>
              </div>
              <div className="relative">
                <img
                  src={user?.fotoPerfil
                    ? `http://localhost:8080/uploads/${user.fotoPerfil}`
                    : "https://github.com/shadcn.png"
                  }
                  alt="Profile"
                  className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-100 dark:ring-slate-800 group-hover:ring-indigo-500 transition-all shadow-sm"
                />
                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar bg-slate-50/50 dark:bg-slate-950">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;