import React, { useState } from 'react';
import { Globe, Plus, Settings2, Trash2, ExternalLink, TrendingUp, X } from 'lucide-react';
import { MOCK_PROGRAMS } from '../constants';

const AdminPrograms: React.FC = () => {
  // Estado para controlar a visibilidade do Popup
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-8 animate-fadeIn relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold dark:text-white flex items-center gap-3">
            <Globe className="text-indigo-600" />
            Programas de Fidelidade
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Gerencie os parceiros e regras de acúmulo de pontos.</p>
        </div>
        
        {/* Adicionado onClick para abrir o modal */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none"
        >
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

        {/* Adicionado onClick para abrir o modal */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 text-slate-400 hover:border-indigo-400 hover:text-indigo-600 transition-all group min-h-[220px]"
        >
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-full group-hover:scale-110 transition-transform">
            <Plus size={24} />
          </div>
          <span className="font-bold">Adicionar Parceiro</span>
        </button>
      </div>

      {/* --- INÍCIO DO POPUP (MODAL) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            
            {/* Cabeçalho do Modal */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold dark:text-white">Novo Programa</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 rounded-full transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Conteúdo do Formulário */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">Nome do Programa</label>
                <input 
                  type="text" 
                  placeholder="Ex: TudoAzul, Latam Pass..." 
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all font-medium dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">Cor de Identificação</label>
                <div className="flex gap-3">
                  {['#4f46e5', '#ec4899', '#06b6d4', '#eab308', '#84cc16'].map((color) => (
                    <button 
                      key={color}
                      className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-700 shadow-sm hover:scale-110 transition-transform focus:ring-2 focus:ring-offset-2 ring-indigo-500"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Rodapé do Modal */}
            <div className="flex gap-3 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-4 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none">
                Criar Programa
              </button>
            </div>

          </div>
        </div>
      )}
      {/* --- FIM DO POPUP (MODAL) --- */}
    </div>
  );
};

export default AdminPrograms;