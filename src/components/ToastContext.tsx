import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

interface ToastContextData {
  addToast: (params: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextData>({} as ToastContextData);

const MAX_TOASTS = 4;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const addToast = useCallback(({ type, title, description }: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2);
    const toast = { id, type, title, description };

    setMessages((state) => {
      // Remove o mais antigo se já atingiu o limite
      const trimmed = state.length >= MAX_TOASTS ? state.slice(1) : state;
      return [...trimmed, toast];
    });

    setTimeout(() => {
      setMessages((state) => state.filter((message) => message.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setMessages((state) => state.filter((message) => message.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}

      {/* Container dos Toasts (Fica flutuando na tela) */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full p-4 pointer-events-none">
        {messages.map((message) => (
          <ToastItem key={message.id} message={message} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem: React.FC<{ message: ToastMessage; onRemove: (id: string) => void }> = ({ message, onRemove }) => {
  const styles = {
    success: {
      wrapper: 'border-l-4 border-l-emerald-500 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800',
      iconBg: 'bg-emerald-50 dark:bg-emerald-900/20',
      icon: <CheckCircle size={18} className="text-emerald-500" />,
      title: 'text-slate-900 dark:text-white',
      desc: 'text-slate-500 dark:text-slate-400',
      bar: 'bg-emerald-500',
    },
    error: {
      wrapper: 'border-l-4 border-l-rose-500 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800',
      iconBg: 'bg-rose-50 dark:bg-rose-900/20',
      icon: <AlertCircle size={18} className="text-rose-500" />,
      title: 'text-slate-900 dark:text-white',
      desc: 'text-slate-500 dark:text-slate-400',
      bar: 'bg-rose-500',
    },
    info: {
      wrapper: 'border-l-4 border-l-indigo-500 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800',
      iconBg: 'bg-indigo-50 dark:bg-indigo-900/20',
      icon: <Info size={18} className="text-indigo-500" />,
      title: 'text-slate-900 dark:text-white',
      desc: 'text-slate-500 dark:text-slate-400',
      bar: 'bg-indigo-500',
    },
    warning: {
      wrapper: 'border-l-4 border-l-amber-500 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800',
      iconBg: 'bg-amber-50 dark:bg-amber-900/20',
      icon: <AlertTriangle size={18} className="text-amber-500" />,
      title: 'text-slate-900 dark:text-white',
      desc: 'text-slate-500 dark:text-slate-400',
      bar: 'bg-amber-500',
    },
  };

  const style = styles[message.type];

  return (
    <div className={`relative pointer-events-auto flex w-full shadow-lg rounded-2xl overflow-hidden ${style.wrapper} animate-slideIn`}>
      <div className="flex flex-1 p-4 gap-3">
        <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${style.iconBg}`}>
          {style.icon}
        </div>
        <div className="flex-1 min-w-0">
          <strong className={`block font-bold text-sm ${style.title}`}>{message.title}</strong>
          {message.description && (
            <p className={`mt-0.5 text-xs leading-relaxed ${style.desc}`}>{message.description}</p>
          )}
        </div>
        <button
          onClick={() => onRemove(message.id)}
          className="shrink-0 text-slate-300 hover:text-slate-500 dark:hover:text-slate-200 transition-colors ml-2 mt-0.5"
        >
          <X size={15} />
        </button>
      </div>
      {/* Barra de progresso */}
      <div className="h-0.5 w-full absolute bottom-0 left-0 overflow-hidden rounded-full opacity-60">
        <div
          className={`h-full ${style.bar} animate-[shrink_4s_linear_forwards]`}
          style={{ animation: 'shrink 4s linear forwards' }}
        />
      </div>
    </div>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};