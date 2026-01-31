import React, { useEffect, useState, useMemo } from 'react';
import { 
  Bell, 
  CheckCircle2, 
  ShoppingBag, 
  ArrowRightLeft, 
  Tag, 
  Clock, 
  Info,
  Check,
  Loader2,
  Filter,
  AlertTriangle,
  MailOpen,
  XCircle
} from 'lucide-react';
import { getNotificacoes, marcarNotificacaoComoLida } from '../../services/api';
import { Notificacao } from '../../types/types';

// Tipos de filtro disponíveis
type FilterType = 'ALL' | 'UNREAD' | 'IMPORTANT';

const NotificationsPage: React.FC = () => {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterType>('ALL');

  useEffect(() => {
    carregarNotificacoes();
  }, []);

  const carregarNotificacoes = async () => {
    try {
      setLoading(true);
      const data = await getNotificacoes();
      setNotificacoes(data);
    } catch (error) {
      console.error("Erro ao carregar notificações", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      // 1. Primeiro garantimos a persistência no Backend
      await marcarNotificacaoComoLida(id);
      
      // 2. Atualizamos o estado da página
      setNotificacoes(prev => prev.map(n => 
        n.id === id ? { ...n, lida: true } : n
      ));

      // 3. DISPARAMOS O EVENTO para o Layout (Sino) saber que mudou
      window.dispatchEvent(new Event('notificacaoAtualizada'));
      
    } catch (error) {
      console.error("Erro ao marcar como lida na página", error);
      // Se o erro persistir, verifique se o ID está chegando correto
      alert("Não foi possível marcar como lida. Tente novamente.");
    }
  };

  const markAllAsRead = async () => {
    const unread = notificacoes.filter(n => !n.lida);
    // Idealmente seria um endpoint único no backend: /notificacoes/ler-todas
    // Aqui faremos um loop simples para o exemplo visual
    for (const notif of unread) {
      handleMarkAsRead(notif.id);
    }
  };

  // Lógica para definir o que é "Importante"
  const isImportant = (n: Notificacao) => {
    return (
      n.tipo === 'EXPIRACAO' || 
      n.tipo === 'TRANSFERENCIA' ||
      n.tipo === 'AVISO_EXPIRACAO' || // <--- ADICIONE ESTE
      n.tipo === 'PONTOS_EXPIRADOS'   // <--- ADICIONE ESTE
    );
  };

  // Filtra as notificações com base na aba selecionada
  const filteredNotifications = useMemo(() => {
    return notificacoes.filter(n => {
      if (activeTab === 'UNREAD') return !n.lida;
      if (activeTab === 'IMPORTANT') return isImportant(n);
      return true; // 'ALL'
    });
  }, [notificacoes, activeTab]);

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'COMPRA': return <ShoppingBag size={20} className="text-blue-500" />;
      case 'TRANSFERENCIA': return <ArrowRightLeft size={20} className="text-emerald-500" />;
      case 'PROMOCAO': return <Tag size={20} className="text-purple-500" />;
      
      // Mantive o antigo caso existir legado
      case 'EXPIRACAO': return <Clock size={20} className="text-rose-500" />;

      // 👇 NOVOS CASOS DO BACKEND
      case 'AVISO_EXPIRACAO': 
        return <AlertTriangle size={20} className="text-amber-500" />; // Amarelo (Alerta)
      
      case 'PONTOS_EXPIRADOS': 
        return <XCircle size={20} className="text-red-500" />; // Vermelho (Perda)
        
      case 'CREDITO_REALIZADO':
        return <CheckCircle2 size={20} className="text-emerald-500" />; // Verde (Ganho)

      default: return <Info size={20} className="text-slate-500" />;
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Agora mesmo';
    if (diffInSeconds < 3600) return `Há ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Há ${Math.floor(diffInSeconds / 3600)} h`;
    return date.toLocaleDateString('pt-BR');
  };

  const unreadCount = notificacoes.filter(n => !n.lida).length;

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn py-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold dark:text-white flex items-center gap-3">
            <Bell className="text-indigo-600" />
            Notificações
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Fique por dentro de tudo que acontece com seus pontos.
          </p>
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl text-sm font-bold hover:bg-indigo-100 transition-colors"
          >
            <MailOpen size={16} />
            Marcar todas como lidas
          </button>
        )}
      </div>

      {/* Tabs de Filtro */}
      <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-full md:w-fit">
        <button 
          onClick={() => setActiveTab('ALL')}
          className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'ALL' 
              ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' 
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          Todas
        </button>
        <button 
          onClick={() => setActiveTab('UNREAD')}
          className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'UNREAD' 
              ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' 
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          Não lidas
          {unreadCount > 0 && (
            <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[1.25rem]">
              {unreadCount}
            </span>
          )}
        </button>
        <button 
          onClick={() => setActiveTab('IMPORTANT')}
          className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'IMPORTANT' 
              ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' 
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          Importantes
          <AlertTriangle size={14} className={activeTab === 'IMPORTANT' ? 'text-indigo-600' : 'text-slate-400'} />
        </button>
      </div>

      {/* Lista de Notificações */}
      <div className="space-y-4">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notificacao) => (
            <div 
              key={notificacao.id} 
              className={`relative p-6 rounded-3xl border transition-all duration-300 ${
                notificacao.lida 
                  ? 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 opacity-75' 
                  : 'bg-white dark:bg-slate-900 border-indigo-100 dark:border-indigo-900/50 shadow-lg shadow-indigo-100/50 dark:shadow-none scale-[1.01]'
              }`}
            >
              {!notificacao.lida && (
                <div className="absolute top-6 right-6 w-3 h-3 bg-indigo-500 rounded-full animate-pulse shadow-lg shadow-indigo-500/50"></div>
              )}

              <div className="flex gap-5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${notificacao.lida ? 'bg-slate-50 dark:bg-slate-800' : 'bg-indigo-50 dark:bg-slate-800'}`}>
                  {getIcon(notificacao.tipo)}
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start pr-6">
                    <p className={`text-base font-semibold mb-1 ${notificacao.lida ? 'text-slate-600 dark:text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                      {notificacao.mensagem}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-xs font-medium text-slate-400 flex items-center gap-1">
                       {formatTimeAgo(notificacao.dataEnvio)}
                    </p>
                    {isImportant(notificacao) && (
                       <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 bg-rose-50 dark:bg-rose-900/20 px-2 py-0.5 rounded-full">
                         Importante
                       </span>
                    )}
                  </div>
                </div>

                {!notificacao.lida && (
                  <button 
                    onClick={() => handleMarkAsRead(notificacao.id)}
                    className="self-center p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-full transition-colors tooltip"
                    title="Marcar como lida"
                  >
                    <Check size={20} />
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-[32px] border border-dashed border-slate-200 dark:border-slate-800">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
              {activeTab === 'IMPORTANT' ? <AlertTriangle size={40} /> : <CheckCircle2 size={40} />}
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {activeTab === 'IMPORTANT' 
                ? 'Nenhuma notificação importante' 
                : activeTab === 'UNREAD' 
                  ? 'Você leu tudo!' 
                  : 'Tudo limpo por aqui!'}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              {activeTab === 'IMPORTANT' 
                ? 'Fique tranquilo, nada urgente pendente.' 
                : 'Você não tem novas notificações neste filtro.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;