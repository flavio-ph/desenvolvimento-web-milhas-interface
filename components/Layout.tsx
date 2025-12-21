
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Moon, 
  Sun, 
  Bell, 
  LogOut, 
  Search
} from 'lucide-react';
import { MENU_ITEMS, ADMIN_MENU_ITEMS } from '../constants';
import { useTheme } from '../context/ThemeContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { isDarkMode, toggleDarkMode } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
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

            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-8 mb-2 px-2">Administrativo</div>
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

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-4">
            <button onClick={toggleSidebar} className="lg:hidden text-slate-500">
              <Menu size={24} />
            </button>
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar por transação, cartão..." 
                className="pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-full text-sm w-64 focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            <button 
              onClick={toggleDarkMode}
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors focus:outline-none"
              aria-label="Alternar Tema"
            >
              {isDarkMode ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} />}
            </button>
            
            <Link to="/notifications" className="relative p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
            </Link>

            <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 mx-2"></div>

            <div className="flex items-center gap-3 ml-2 cursor-pointer group" onClick={() => navigate('/profile')}>
              <div className="hidden lg:block text-right">
                <p className="text-sm font-semibold dark:text-white">Tatiane Fabiana</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Plano Premium</p>
              </div>
              <img 
                src="https://picsum.photos/seed/user123/100/100" 
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
