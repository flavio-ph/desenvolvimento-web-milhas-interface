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
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { MENU_ITEMS, ADMIN_MENU_ITEMS } from '../constants/constants';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { getNotificacoes, marcarNotificacaoComoLida } from '../services/api';
import { Notificacao } from '../types/types';
import { useToast } from '../components/ToastContext';
import UserAvatar from '../components/UserAvatar';

interface LayoutProps {
  children: React.ReactNode;
}

const POLLING_INTERVAL_MS = 30000;

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);

  const { isDarkMode, toggleDarkMode } = useTheme();
  const { user, getAvatarUrl, getUserInitials } = useUser();
  const { addToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const notifRef = useRef<HTMLDivElement>(null);

  const toggleMobileSidebar = () => setIsMobileOpen(!isMobileOpen);
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  const getPageTitle = (path: string) => {
    if (path.startsWith('/cards/')) return 'Detalhes do Cartão';
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

  const fetchNotificacoes = async () => {
    try {
      const data = await getNotificacoes();
      const listaNotificacoes = Array.isArray(data) ? data : data.content || [];
      setNotificacoes(listaNotificacoes);
    } catch (error) {
    }
  };

  useEffect(() => {
    fetchNotificacoes();
    let interval = setInterval(fetchNotificacoes, POLLING_INTERVAL_MS);

    const handleVisibility = () => {
      if (document.hidden) {
        clearInterval(interval);
      } else {
        fetchNotificacoes();
        interval = setInterval(fetchNotificacoes, POLLING_INTERVAL_MS);
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  useEffect(() => {
    const handleUpdate = () => fetchNotificacoes();
    window.addEventListener('notificationRead', handleUpdate);
    window.addEventListener('notificacaoAtualizada', handleUpdate);
    return () => {
      window.removeEventListener('notificationRead', handleUpdate);
      window.removeEventListener('notificacaoAtualizada', handleUpdate);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const handleMarkAsRead = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await marcarNotificacaoComoLida(id);
      setNotificacoes(prev => prev.map(n => n.id === id ? { ...n, lida: true } : n));
    } catch (error) {
    }
  };

  const unreadCount = notificacoes.filter(n => !n.lida).length;

  return (
    <div className="h-screen w-full flex bg-slate-50 dark:bg-slate-950 transition-colors duration-300 overflow-hidden">

      {/* --- SIDEBAR --- */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          bg-white dark:bg-gradient-to-b dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/80
          border-r border-slate-100 dark:border-slate-800/60
          transform transition-all duration-300 ease-in-out
          lg:relative lg:translate-x-0
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isCollapsed ? 'lg:w-20' : 'lg:w-72'}
          w-72 shadow-xl shadow-slate-200/50 dark:shadow-indigo-950/30
        `}
      >
        <div className="flex flex-col h-full">
          {/* HEADER DA SIDEBAR */}
          <div className={`p-5 flex items-center mb-2 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
            <div className="flex items-center gap-3">
              <div className="relative hover:scale-105 transition-transform duration-300 shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <Plane className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className={`transition-all duration-200 ${isCollapsed ? 'hidden opacity-0 w-0' : 'block opacity-100'}`}>
                <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                  Milhas<span className="text-indigo-600 dark:text-indigo-400">Pro</span>
                </span>
                <p className="text-[10px] text-slate-400 font-medium -mt-0.5">Gestão de Pontos</p>
              </div>
            </div>

            <button onClick={toggleMobileSidebar} className="lg:hidden text-slate-500 hover:text-indigo-600 transition-colors p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
              <X size={20} />
            </button>

            <button
              onClick={toggleCollapse}
              className={`hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 ${isCollapsed ? 'absolute -right-3.5 top-7 border border-slate-200 dark:border-slate-700 shadow-md bg-white dark:bg-slate-800' : ''}`}
              title={isCollapsed ? 'Expandir Menu' : 'Recolher Menu'}
            >
              {isCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={18} />}
            </button>
          </div>

          <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar overflow-x-hidden pb-2">
            {!isCollapsed && (
              <div className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.18em] mb-2 px-3 mt-3">
                Principal
              </div>
            )}

            {MENU_ITEMS.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  title={isCollapsed ? item.label : ''}
                  className={`
                    flex items-center gap-3 py-2.5 rounded-xl transition-all duration-200 group font-medium relative
                    ${isCollapsed ? 'justify-center px-3 mx-1' : 'px-3 mx-1'}
                    ${isActive
                      ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-indigo-600 dark:hover:text-indigo-400'
                    }
                  `}
                >
                  {isActive && !isCollapsed && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 bg-indigo-600 dark:bg-indigo-500 rounded-[10px]" />
                  )}
                  <div className={`shrink-0 ${isActive
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'group-hover:scale-110 transition-transform duration-200'
                    }`}>
                    {item.icon}
                  </div>
                  {!isCollapsed && (
                    <span className="whitespace-nowrap text-sm">{item.label}</span>
                  )}
                  {isActive && isCollapsed && (
                    <span className="absolute right-1 top-1 w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                  )}
                </Link>
              );
            })}

            {(true || user?.role === 'ADMIN') && (
              <>
                <div className={`my-3 ${isCollapsed ? 'border-t border-slate-100 dark:border-slate-800/50 w-10 mx-auto' : ''}`} />
                {!isCollapsed && (
                  <div className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.18em] mb-2 px-3">
                    Administrativo
                  </div>
                )}

                {ADMIN_MENU_ITEMS.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      title={isCollapsed ? item.label : ''}
                      className={`
                        flex items-center gap-3 py-2.5 rounded-xl transition-all duration-200 group font-medium relative
                        ${isCollapsed ? 'justify-center px-3 mx-1' : 'px-3 mx-1'}
                        ${isActive
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-emerald-600 dark:hover:text-emerald-400'
                        }
                      `}
                    >
                      {isActive && !isCollapsed && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 bg-emerald-600 dark:bg-emerald-500 rounded-[10px]" />
                      )}
                      <div className={`shrink-0 ${isActive
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'group-hover:scale-110 transition-transform duration-200'
                        }`}>
                        {item.icon}
                      </div>
                      {!isCollapsed && (
                        <span className="whitespace-nowrap text-sm">{item.label}</span>
                      )}
                    </Link>
                  );
                })}
              </>
            )}
          </nav>

          {/* Footer Sidebar — Perfil + Logout */}
          <div className="p-3 mt-auto border-t border-slate-100 dark:border-slate-800/60">
            <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${isCollapsed ? 'justify-center' : ''}`}>

              <div
                className="relative shrink-0 cursor-pointer group/avatar"
                onClick={() => navigate('/profile')}
                title={isCollapsed ? (user?.nome ?? 'Perfil') : ''}
              >
                <UserAvatar
                  imageUrl={getAvatarUrl()}
                  initials={getUserInitials()}
                  size="sm"
                  className="ring-2 ring-transparent group-hover/avatar:ring-indigo-200 dark:group-hover/avatar:ring-indigo-800 transition-all"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
              </div>

              {!isCollapsed && (
                <div
                  className="flex-1 min-w-0 cursor-pointer group/name"
                  onClick={() => navigate('/profile')}
                >
                  <p className="text-sm font-bold text-slate-800 dark:text-white truncate group-hover/name:text-indigo-600 dark:group-hover/name:text-indigo-400 transition-colors">
                    {user?.nome || '...'}
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium truncate">
                    {user?.role === 'ADMIN' ? 'Administrador' : 'Plano Premium'}
                  </p>
                </div>
              )}

              {!isCollapsed && (
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
                  title="Sair da conta"
                  className="p-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-all shrink-0"
                >
                  <LogOut size={16} />
                </button>
              )}

              {isCollapsed && (
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
                  title="Sair da conta"
                  className="hidden"
                />
              )}
            </div>

            {isCollapsed && (
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
                title="Sair da conta"
                className="flex items-center justify-center w-full p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all mt-1"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Overlay mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={toggleMobileSidebar}
        />
      )}

      {/* --- CONTEÚDO PRINCIPAL --- */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* HEADER */}
        <header className="h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between px-4 lg:px-8 z-40 relative shadow-sm shadow-slate-100 dark:shadow-none">
          <div className="flex items-center gap-4">
            <button onClick={toggleMobileSidebar} className="lg:hidden text-slate-500 hover:text-indigo-600 transition-colors p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
              <Menu size={20} />
            </button>

            <div className="hidden md:flex flex-col animate-fadeIn">
              {/* Breadcrumb */}
              <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 font-medium mb-0.5">
                <span>Painel</span>
                <ChevronRight size={12} />
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{currentTitle}</span>
              </div>
              <h1 className="text-base font-bold text-slate-800 dark:text-white tracking-tight leading-tight">
                {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 lg:gap-4">
            <button
              onClick={toggleDarkMode}
              className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all hover:scale-105 active:scale-95"
              title={isDarkMode ? 'Ativar modo claro' : 'Ativar modo escuro'}
            >
              {isDarkMode
                ? <Sun size={20} className="text-amber-400 fill-amber-400" />
                : <Moon size={20} />}
            </button>

            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className={`relative p-2.5 rounded-xl transition-all hover:scale-105 active:scale-95 ${isNotifOpen ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/50' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                title="Notificações"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-red-500 border-2 border-white dark:border-slate-900 rounded-full text-[10px] font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

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