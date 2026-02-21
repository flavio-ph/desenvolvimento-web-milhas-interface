import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';

const NotFoundPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
            <div className="text-center max-w-md animate-fadeIn">
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <span className="text-[8rem] font-black text-slate-100 dark:text-slate-800 leading-none select-none">
                            404
                        </span>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <AlertCircle size={56} className="text-indigo-500" />
                        </div>
                    </div>
                </div>

                <h1 className="text-2xl font-black text-slate-800 dark:text-white mb-3">
                    Página não encontrada
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">
                    A página que você está procurando não existe ou foi removida.
                </p>

                <button
                    onClick={() => navigate('/')}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none hover:scale-[1.02] active:scale-95"
                >
                    <Home size={20} />
                    Ir para o início
                </button>
            </div>
        </div>
    );
};

export default NotFoundPage;
