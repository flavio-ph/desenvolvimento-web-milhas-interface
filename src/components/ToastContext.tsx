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

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const addToast = useCallback(({ type, title, description }: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2); // ID simples
    const toast = { id, type, title, description };

    setMessages((state) => [...state, toast]);

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
    success: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800', text: 'text-emerald-800 dark:text-emerald-300', icon: <CheckCircle size={20} className="text-emerald-500" /> },
    error:   { bg: 'bg-rose-50 dark:bg-rose-900/20', border: 'border-rose-200 dark:border-rose-800', text: 'text-rose-800 dark:text-rose-300', icon: <AlertCircle size={20} className="text-rose-500" /> },
    info:    { bg: 'bg-indigo-50 dark:bg-indigo-900/20', border: 'border-indigo-200 dark:border-indigo-800', text: 'text-indigo-800 dark:text-indigo-300', icon: <Info size={20} className="text-indigo-500" /> },
    warning: { bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800', text: 'text-amber-800 dark:text-amber-300', icon: <AlertTriangle size={20} className="text-amber-500" /> },
  };

  const style = styles[message.type];

  return (
    <div className={`pointer-events-auto flex w-full shadow-lg rounded-2xl border ${style.bg} ${style.border} p-4 transition-all duration-300 animate-slideIn`}>
      <div className="shrink-0 mr-3 mt-0.5">{style.icon}</div>
      <div className="flex-1">
        <strong className={`block font-bold text-sm ${style.text}`}>{message.title}</strong>
        {message.description && (
          <p className={`mt-1 text-xs opacity-90 ${style.text}`}>{message.description}</p>
        )}
      </div>
      <button onClick={() => onRemove(message.id)} className="ml-4 shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
        <X size={16} />
      </button>
    </div>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};