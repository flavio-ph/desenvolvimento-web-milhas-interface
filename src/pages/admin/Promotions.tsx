
import React, { useState } from 'react';
import { Tag, Plus, Calendar, Percent, Trash2, Edit3, CheckCircle, Clock } from 'lucide-react';
import { MOCK_PROMOTIONS, MOCK_PROGRAMS } from '../../constants/constants';

const AdminPromotions: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'NEW' | 'HISTORY'>('NEW');

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold dark:text-white flex items-center gap-3">
            <Tag className="text-rose-500" />
            Central de Promoções
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Crie e gerencie campanhas de bônus e compras bonificadas.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800">
        <button 
          onClick={() => setActiveTab('NEW')}
          className={`pb-4 text-sm font-bold transition-all relative ${activeTab === 'NEW' ? 'text-indigo-600' : 'text-slate-400'}`}
        >
          Cadastrar Nova
          {activeTab === 'NEW' && <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 rounded-t-full"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('HISTORY')}
          className={`pb-4 text-sm font-bold transition-all relative ${activeTab === 'HISTORY' ? 'text-indigo-600' : 'text-slate-400'}`}
        >
          Gerenciar Ativas
          {activeTab === 'HISTORY' && <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 rounded-t-full"></div>}
        </button>
      </div>

      {activeTab === 'NEW' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
            <h3 className="text-xl font-bold dark:text-white">Nova Campanha</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Título da Promoção</label>
                <input type="text" placeholder="Ex: 100% de Bônus Smiles e Livelo" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 dark:text-white outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Bônus (%)</label>
                  <div className="relative">
                    <Percent className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="number" placeholder="100" className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 dark:text-white outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Data de Expiração</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="date" className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 dark:text-white outline-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Programas Participantes</label>
                <div className="flex flex-wrap gap-2">
                  {MOCK_PROGRAMS.map(p => (
                    <button key={p.id} className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border-2 border-transparent hover:border-indigo-500 rounded-xl text-sm font-medium dark:text-white transition-all">
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Descrição / Regras</label>
                <textarea rows={4} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 dark:text-white outline-none resize-none" placeholder="Detalhes da promoção..."></textarea>
              </div>
            </div>

            <button className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none">
              Publicar Promoção
            </button>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900 rounded-3xl p-6 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Tag size={100} />
              </div>
              <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Preview no App</h4>
              <div className="space-y-4">
                <div className="bg-white/10 p-4 rounded-2xl">
                  <div className="w-10 h-10 bg-indigo-500 rounded-lg mb-3"></div>
                  <h5 className="font-bold text-lg">Título Exemplo</h5>
                  <p className="text-xs text-slate-400">Expira em 24h</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Promoção</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Bônus</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Expiração</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {MOCK_PROMOTIONS.map((promo) => (
                <tr key={promo.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-5">
                    <div>
                      <p className="font-bold dark:text-white">{promo.title}</p>
                      <p className="text-xs text-slate-500 truncate max-w-[200px]">{promo.description}</p>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-emerald-500 font-black text-lg">{promo.bonusPercentage}%</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Calendar size={14} />
                      {new Date(promo.expiryDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 text-[10px] font-bold rounded-full uppercase">
                      <CheckCircle size={10} /> Ativa
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Edit3 size={18} /></button>
                      <button className="p-2 text-slate-400 hover:text-rose-600 transition-colors"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminPromotions;
