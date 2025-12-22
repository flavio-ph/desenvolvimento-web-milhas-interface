
import React, { useState, useMemo } from 'react';
import { 
  Tag, 
  Search, 
  Clock, 
  ArrowRight, 
  Zap, 
  Flame, 
  Filter,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { MOCK_PROMOTIONS, MOCK_PROGRAMS } from '../constants';

const PromotionsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('ALL');

  // No mundo real, filtraríamos por data atual. Para o demo, consideramos todas do MOCK como ativas
  const activePromotions = useMemo(() => {
    return MOCK_PROMOTIONS.filter(promo => {
      const matchesSearch = promo.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            promo.description.toLowerCase().includes(searchTerm.toLowerCase());
      // Como o mock não tem programId direto no objeto Promotion, fazemos uma busca por texto simples
      const matchesProgram = selectedProgram === 'ALL' || 
                             promo.title.toLowerCase().includes(selectedProgram.toLowerCase()) ||
                             promo.description.toLowerCase().includes(selectedProgram.toLowerCase());
      
      return matchesSearch && matchesProgram;
    });
  }, [searchTerm, selectedProgram]);

  const getDaysRemaining = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto py-4">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-indigo-600 rounded-[32px] p-8 lg:p-12 text-white shadow-2xl shadow-indigo-200 dark:shadow-none">
        <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-widest mb-6">
            <Flame size={14} className="text-orange-400" />
            Oportunidades quentes
          </div>
          <h1 className="text-4xl lg:text-5xl font-black mb-4">Aproveite os melhores bônus do mercado.</h1>
          <p className="text-indigo-100 text-lg font-medium">
            Monitoramos os principais programas 24h por dia para você nunca mais perder uma transferência de 100%.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar promoção ou programa..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white shadow-sm transition-all"
          />
        </div>
        
        <div className="flex gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:flex-none">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <select 
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              className="w-full lg:w-64 pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white shadow-sm transition-all appearance-none font-bold text-sm"
            >
              <option value="ALL">Todos os Programas</option>
              {MOCK_PROGRAMS.map(p => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Promotions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activePromotions.length > 0 ? (
          activePromotions.map((promo) => {
            const daysLeft = getDaysRemaining(promo.expiryDate);
            const isUrgent = daysLeft <= 2;

            return (
              <div key={promo.id} className="group bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-2xl hover:translate-y-[-4px] transition-all duration-500 flex flex-col sm:flex-row">
                {/* Visual Badge Area */}
                <div className={`sm:w-48 p-8 flex flex-col items-center justify-center text-white relative overflow-hidden transition-colors duration-500 ${promo.bonusPercentage >= 100 ? 'bg-gradient-to-br from-indigo-600 to-violet-700' : 'bg-gradient-to-br from-emerald-500 to-teal-600'}`}>
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span className="text-xs font-black uppercase tracking-[0.2em] opacity-80 mb-1">Bônus de</span>
                  <h4 className="text-5xl font-black">{promo.bonusPercentage}%</h4>
                  <Zap className="mt-4 opacity-40 group-hover:scale-125 transition-transform" size={24} />
                </div>

                {/* Content Area */}
                <div className="flex-1 p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight pr-4">
                        {promo.title}
                      </h3>
                      {isUrgent && (
                        <span className="shrink-0 flex items-center gap-1 px-2 py-1 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-[10px] font-black rounded-lg uppercase animate-pulse">
                          <AlertCircle size={12} />
                          Urgente
                        </span>
                      )}
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
                      {promo.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Clock size={16} />
                      <span className="text-xs font-bold uppercase tracking-wider">
                        Expira em {new Date(promo.expiryDate).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl text-sm font-black hover:bg-indigo-600 hover:text-white transition-all">
                      Participar
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-20 bg-white dark:bg-slate-900 rounded-[32px] border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-slate-300 dark:text-slate-700 mb-6">
              <Tag size={40} />
            </div>
            <h3 className="text-xl font-bold dark:text-white text-slate-900">Nenhuma promoção encontrada</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm">
              Tente ajustar seus filtros ou pesquisar por outro programa de fidelidade.
            </p>
            <button 
              onClick={() => {setSearchTerm(''); setSelectedProgram('ALL');}}
              className="mt-6 text-indigo-600 font-bold hover:underline"
            >
              Limpar todos os filtros
            </button>
          </div>
        )}
      </div>

      {/* Info Card */}
      <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 p-6 rounded-3xl flex flex-col md:flex-row items-center gap-6">
        <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-emerald-500 shrink-0 shadow-sm">
          <CheckCircle2 size={24} />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h4 className="font-bold text-emerald-900 dark:text-emerald-300">Dica de Especialista</h4>
          <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-1">
            Antes de transferir, verifique sempre o regulamento completo no site do parceiro. Algumas promoções exigem cadastro prévio no link oficial.
          </p>
        </div>
        <button className="whitespace-nowrap px-6 py-3 bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-bold rounded-2xl hover:shadow-lg transition-all">
          Como funciona?
        </button>
      </div>
    </div>
  );
};

export default PromotionsPage;
