import React from 'react';
import { AlertTriangle, X, Loader2 } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  variant?: 'danger' | 'warning' | 'info'; // Para mudar a cor do ícone/botão se quiser reutilizar para outras coisas
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  isLoading = false,
  variant = 'danger'
}) => {
  if (!isOpen) return null;

  const colors = {
    danger: { icon: 'text-red-600', bgIcon: 'bg-red-100 dark:bg-red-900/30', btn: 'bg-red-600 hover:bg-red-700' },
    warning: { icon: 'text-amber-600', bgIcon: 'bg-amber-100 dark:bg-amber-900/30', btn: 'bg-amber-600 hover:bg-amber-700' },
    info: { icon: 'text-indigo-600', bgIcon: 'bg-indigo-100 dark:bg-indigo-900/30', btn: 'bg-indigo-600 hover:bg-indigo-700' }
  };

  const style = colors[variant];

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      {/* Overlay com Blur */}
      <div 
        className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={!isLoading ? onClose : undefined} 
      />

      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl z-10 overflow-hidden transform transition-all scale-100 relative border border-slate-100 dark:border-slate-800">
        
        {/* Botão Fechar */}
        <button 
          onClick={onClose} 
          disabled={isLoading}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors disabled:opacity-50"
        >
          <X size={20} />
        </button>

        <div className="p-6 text-center">
          {/* Ícone de Alerta */}
          <div className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${style.bgIcon}`}>
            <AlertTriangle className={`w-8 h-8 ${style.icon}`} />
          </div>

          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            {title}
          </h3>
          
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-8">
            {description}
          </p>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-3 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              {cancelText}
            </button>
            
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 py-3 px-4 text-white rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${style.btn} disabled:opacity-70 disabled:cursor-not-allowed`}
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};