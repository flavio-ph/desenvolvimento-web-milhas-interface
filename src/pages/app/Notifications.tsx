
import React, { useState } from 'react';
import { 
  Bell, 
  Tag, 
  Clock, 
  Shield, 
  Info, 
  CheckCheck, 
  Trash2, 
  ChevronRight,
  Search,
  AlertCircle
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface Notification {
  id: string;
  type: 'PROMO' | 'EXPIRY' | 'SECURITY' | 'SYSTEM';
  title: string;
  description: string;
  time: string;
  isRead: boolean;
  priority: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'PROMO',
    title: 'Bônus Smiles 100%',
    description: 'Transfira seus pontos Livelo até amanhã e ganhe 100% de bônus no Smiles.',
    time: '2 horas atrás',
    isRead: false,
    priority: true,
  },
  {
    id: '2',
    type: 'EXPIRY',
    title: 'Pontos Expirando em Breve',
    description: 'Você possui 1.250 pontos no programa Latam Pass que expiram em 15 dias.',
    time: '5 horas atrás',
    isRead: false,
    priority: true,
  },
  {
    id: '3',
    type: 'SECURITY',
    title: 'Novo Login Detectado',
    description: 'Um novo login foi realizado em um dispositivo Chrome no Windows.',
    time: 'Ontem às 14:20',
    isRead: true,
    priority: false,
  },
  {
    id: '4',
    type: 'SYSTEM',
    title: 'Atualização de Sistema',
    description: 'A MilhasPro agora conta com integração automática com o programa Esfera.',
    time: '2 dias atrás',
    isRead: true,
    priority: false,
  },
  {
    id: '5',
    type: 'PROMO',
    title: 'Compra Bonificada: Casas Bahia',
    description: 'Ganhe 10 pontos por real gasto em produtos selecionados das Casas Bahia via Livelo.',
    time: '3 dias atrás',
    isRead: true,
    priority: false,
  },
];

const NotificationsPage: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState<'ALL' | 'UNREAD' | 'IMPORTANT'>('ALL');

  const filteredNotifications = MOCK_NOTIFICATIONS.filter(n => {
    if (activeTab === 'UNREAD') return !n.isRead;
    if (activeTab === 'IMPORTANT') return n.priority;
    return true;
  });

  const getTypeStyles = (type: Notification['type']) => {
    switch (type) {
      case 'PROMO': return { icon: <Tag size={18} />, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' };
      case 'EXPIRY': return { icon: <Clock size={18} />, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' };
      case 'SECURITY': return { icon: <Shield size={18} />, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' };
      case 'SYSTEM': return { icon: <Info size={18} />, color: 'text-slate-600', bg: 'bg-slate-50 dark:bg-slate-800' };
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold dark:text-white text-slate-900 flex items-center gap-3">
            <Bell className="text-indigo-600" />
            Notificações
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Fique por dentro de tudo o que acontece com seus pontos.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
            <CheckCheck size={18} />
            Lidas
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors">
            <Trash2 size={18} />
            Limpar
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm w-fit">
        {[
          { id: 'ALL', label: 'Todas' },
          { id: 'UNREAD', label: 'Não lidas' },
          { id: 'IMPORTANT', label: 'Importantes' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab.id 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none' 
                : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Pesquisar notificações..." 
          className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white shadow-sm transition-all"
        />
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((n) => {
            const styles = getTypeStyles(n.type);
            return (
              <div 
                key={n.id}
                className={`group relative flex items-start gap-4 p-5 bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-200 hover:shadow-md cursor-pointer ${
                  n.isRead 
                    ? 'border-slate-100 dark:border-slate-800 opacity-80' 
                    : 'border-indigo-100 dark:border-indigo-900/30 ring-1 ring-indigo-50 dark:ring-indigo-900/10'
                }`}
              >
                {!n.isRead && (
                  <div className="absolute top-6 left-2 w-1.5 h-1.5 bg-indigo-600 rounded-full"></div>
                )}
                
                <div className={`p-3 rounded-xl shrink-0 ${styles.bg} ${styles.color}`}>
                  {styles.icon}
                </div>

                <div className="flex-1 space-y-1 pr-8">
                  <div className="flex items-center justify-between">
                    <h3 className={`text-sm font-bold ${n.isRead ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'}`}>
                      {n.title}
                    </h3>
                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{n.time}</span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {n.description}
                  </p>
                  {n.type === 'PROMO' && (
                    <div className="pt-2">
                      <button className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline">
                        Ver detalhes da promoção
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-16 text-center border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300 dark:text-slate-700">
              <Bell size={40} />
            </div>
            <h3 className="text-xl font-bold dark:text-white text-slate-900">Silêncio por aqui...</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-xs mx-auto">
              Você não tem nenhuma notificação {activeTab === 'UNREAD' ? 'não lida' : activeTab === 'IMPORTANT' ? 'importante' : ''} no momento.
            </p>
          </div>
        )}
      </div>

      {/* Quick Tips */}
      <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 p-4 rounded-2xl flex gap-4 items-start">
        <div className="p-2 bg-white dark:bg-slate-900 rounded-lg text-indigo-600 shrink-0">
          <AlertCircle size={20} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-300">Dica MilhasPro</h4>
          <p className="text-xs text-indigo-700 dark:text-indigo-400 mt-0.5">
            Ative as notificações do navegador no seu perfil para receber alertas de promoções relâmpago em tempo real!
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
