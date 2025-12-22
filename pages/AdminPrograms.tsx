
import React from 'react';
import { Globe, Plus, Settings2, Trash2, ExternalLink, TrendingUp } from 'lucide-react';
import { MOCK_PROGRAMS } from '../constants';

const AdminPrograms: React.FC = () => {
  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold dark:text-white flex items-center gap-3">
            <Globe className="text-indigo-600" />
            Programas de Fidelidade
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Gerencie os parceiros e regras de acúmulo de pontos.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none">
          <Plus size={20} />
          Novo Programa
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {MOCK_PROGRAMS.map((program) => (
          <div key={program.id} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm group hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300">
            <div className="flex justify-between items-start mb-6">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-${program.color}-100 dark:shadow-none`} style={{ backgroundColor: program.color }}>
                {program.name.charAt(0)}
              </div>
              <div className="flex gap-2">
                <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all">
                  <Settings2 size={18} />
                </button>
              </div>
            </div>
            
            <h3 className="text-xl font-bold dark:text-white mb-1">{program.name}</h3>
            <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-4">Total na Plataforma</p>
            
            <div className="flex items-end gap-2 mb-6">
              <span className="text-2xl font-black dark:text-white">{(program.points / 1000).toFixed(0)}M</span>
              <span className="text-xs text-emerald-500 font-bold mb-1 flex items-center">
                <TrendingUp size={12} className="mr-1" />
                +8%
              </span>
            </div>

            <div className="pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase">Ações</span>
              <div className="flex gap-1">
                <button className="p-2 text-slate-400 hover:text-rose-600 transition-colors">
                  <Trash2 size={16} />
                </button>
                <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                  <ExternalLink size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}

        <button className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 text-slate-400 hover:border-indigo-400 hover:text-indigo-600 transition-all group min-h-[220px]">
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-full group-hover:scale-110 transition-transform">
            <Plus size={24} />
          </div>
          <span className="font-bold">Adicionar Parceiro</span>
        </button>
      </div>
    </div>
  );
};

export default AdminPrograms;
