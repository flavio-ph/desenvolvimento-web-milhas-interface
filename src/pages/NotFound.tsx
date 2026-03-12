import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, SearchX } from 'lucide-react';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Blobs decorativos de fundo */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-200/30 dark:bg-indigo-900/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-violet-200/30 dark:bg-violet-900/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 text-center max-w-md mx-auto animate-fadeIn">

        {/* Ícone flutuante */}
        <div className="mb-8 flex justify-center">
          <div className="w-28 h-28 rounded-[32px] bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/40 dark:to-violet-900/40 flex items-center justify-center shadow-xl shadow-indigo-200/50 dark:shadow-indigo-900/30 animate-float">
            <SearchX size={52} className="text-indigo-500 dark:text-indigo-400" />
          </div>
        </div>

        {/* Código 404 */}
        <h1
          className="text-8xl font-black tracking-tight mb-4"
          style={{
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          404
        </h1>

        {/* Texto */}
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">
          Página não encontrada
        </h2>
        <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-10">
          A rota que você tentou acessar não existe ou foi movida.
          Voltando ao Dashboard você encontra tudo que precisa.
        </p>

        {/* Botão de volta */}
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl font-bold text-base hover:from-indigo-500 hover:to-violet-500 transition-all shadow-lg shadow-indigo-300/40 dark:shadow-indigo-900/40 hover:-translate-y-0.5 active:scale-[0.97]"
        >
          <ArrowLeft size={20} />
          Voltar ao Dashboard
        </button>

        {/* Link alternativo */}
        <p className="mt-6 text-sm text-slate-400 dark:text-slate-600">
          ou{' '}
          <button
            onClick={() => navigate(-1)}
            className="text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold transition-colors hover:underline"
          >
            voltar à página anterior
          </button>
        </p>
      </div>
    </div>
  );
};

export default NotFound;
