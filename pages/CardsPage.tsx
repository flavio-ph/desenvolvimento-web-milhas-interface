
import React from 'react';
import { Plus, CreditCard as CardIcon, MoreVertical, ShieldCheck, Zap } from 'lucide-react';
import { MOCK_CARDS, MOCK_PROGRAMS } from '../constants';

const CardsPage: React.FC = () => {
  return (
    <div className="space-y-8 max-w-6xl mx-auto py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold dark:text-white">Meus Cartões</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Gerencie sua carteira de cartões e programas associados.</p>
        </div>
        <button className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none">
          <Plus size={20} />
          Novo Cartão
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_CARDS.map((card) => {
          const program = MOCK_PROGRAMS.find(p => p.id === card.programId);
          return (
            <div key={card.id} className="group relative bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300">
              {/* Virtual Card Look */}
              <div className={`h-48 p-6 flex flex-col justify-between text-white relative overflow-hidden transition-all duration-500 ${
                card.brand === 'Visa' ? 'bg-gradient-to-br from-indigo-700 to-blue-500' :
                card.brand === 'MasterCard' ? 'bg-gradient-to-br from-slate-900 to-slate-700' :
                'bg-gradient-to-br from-emerald-600 to-teal-400'
              }`}>
                {/* Decorative Elements */}
                <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700"></div>
                
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Zap size={20} className="text-white" />
                    </div>
                    <span className="font-bold tracking-widest text-sm">{card.brand.toUpperCase()}</span>
                  </div>
                  <button className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                    <MoreVertical size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-7 bg-amber-400/80 rounded-md"></div> {/* Chip */}
                    <p className="text-xl font-mono tracking-[0.2em] font-medium opacity-90">
                      •••• •••• •••• {card.lastFour}
                    </p>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] uppercase font-bold opacity-70 tracking-tighter">Nome no Cartão</p>
                      <p className="text-sm font-semibold uppercase tracking-wide">Tatiane Fabiana</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold opacity-70 tracking-tighter">Validade</p>
                      <p className="text-sm font-semibold">12/28</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Details Body */}
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Apelido</span>
                  <span className="text-sm font-bold dark:text-white">{card.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Programa Principal</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full bg-${program?.color}-500`}></div>
                    <span className="text-sm font-bold dark:text-white">{program?.name}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Pontuação</span>
                  <div className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-lg">
                    {card.multiplier} pts / R$ 1,00
                  </div>
                </div>
                
                <div className="pt-4 flex gap-2">
                  <button className="flex-1 bg-slate-50 dark:bg-slate-800 py-2.5 rounded-xl text-xs font-bold dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    Ver Extrato
                  </button>
                  <button className="flex-1 bg-slate-50 dark:bg-slate-800 py-2.5 rounded-xl text-xs font-bold dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    Editar
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Empty Placeholder */}
        <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center p-8 text-center hover:border-indigo-300 dark:hover:border-indigo-900 transition-colors group cursor-pointer h-full min-h-[400px]">
          <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Plus className="text-slate-400 group-hover:text-indigo-500" size={32} />
          </div>
          <p className="font-bold dark:text-white">Adicionar Novo Cartão</p>
          <p className="text-sm text-slate-500 mt-2">Clique para vincular um novo cartão de crédito à sua conta.</p>
        </div>
      </div>
    </div>
  );
};

export default CardsPage;
