
import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar, 
  ChevronDown,
  Download,
  Clock,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { MOCK_TRANSACTIONS, MOCK_PROGRAMS } from '../../constants/constants';
import { useTheme } from '../../context/ThemeContext';

const HistoryPage: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [programFilter, setProgramFilter] = useState('ALL');

  const filteredTransactions = useMemo(() => {
    return MOCK_TRANSACTIONS.filter(tx => {
      const matchesSearch = tx.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || tx.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold dark:text-white text-slate-900">Extrato de Pontos</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Acompanhe detalhadamente suas entradas e saídas.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm">
          <Download size={18} />
          Exportar PDF
        </button>
      </div>

      {/* Quick Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-indigo-600 p-6 rounded-2xl text-white shadow-lg shadow-indigo-200 dark:shadow-none relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <ArrowUpRight size={80} />
          </div>
          <p className="text-sm font-medium opacity-80 mb-1">Acumulado no Mês</p>
          <h3 className="text-3xl font-bold">+18.540 pts</h3>
          <p className="text-xs mt-2 bg-white/20 inline-block px-2 py-1 rounded-full">+12% vs mês anterior</p>
        </div>
        
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <Clock className="text-amber-600" size={20} />
            </div>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Aguardando Crédito</span>
          </div>
          <h3 className="text-2xl font-bold dark:text-white">4.200 pts</h3>
          <p className="text-xs text-slate-500 mt-1">Previsão para os próximos 15 dias</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-rose-50 dark:bg-rose-900/20 rounded-lg">
              <AlertTriangle className="text-rose-600" size={20} />
            </div>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Expirando em Breve</span>
          </div>
          <h3 className="text-2xl font-bold dark:text-white">850 pts</h3>
          <p className="text-xs text-slate-500 mt-1">Pontos com validade até 30/11</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por estabelecimento..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white transition-all"
          />
        </div>
        
        <div className="flex flex-wrap gap-3">
          <select 
            value={programFilter}
            onChange={(e) => setProgramFilter(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-medium dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="ALL">Todos os Programas</option>
            {MOCK_PROGRAMS.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-medium dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="ALL">Status: Todos</option>
            <option value="CREDITED">Creditados</option>
            <option value="PENDING">Pendentes</option>
            <option value="EXPIRED">Expirados</option>
          </select>

          <button className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl text-sm font-bold hover:bg-indigo-100 transition-colors">
            <Calendar size={18} />
            Outubro/2023
            <ChevronDown size={16} />
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Data</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Descrição</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Programa</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Pontos</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-default">
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold dark:text-white">
                          {new Date(tx.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase">2023</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          tx.points > 0 ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600'
                        }`}>
                          {tx.points > 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                        </div>
                        <span className="text-sm font-medium dark:text-white">{tx.description}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        {/* Simulating program mapping */}
                        <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                        <span className="text-sm text-slate-600 dark:text-slate-400">Smiles</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`text-sm font-bold ${tx.points > 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-500'}`}>
                        {tx.points > 0 ? `+${tx.points}` : tx.points} pts
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-tight ${
                        tx.status === 'CREDITED' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30' :
                        tx.status === 'PENDING' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/30' :
                        'bg-rose-50 text-rose-600 dark:bg-rose-900/30'
                      }`}>
                        {tx.status === 'CREDITED' && <CheckCircle2 size={10} />}
                        {tx.status === 'PENDING' && <Clock size={10} />}
                        {tx.status === 'EXPIRED' && <AlertTriangle size={10} />}
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button className="text-slate-400 hover:text-indigo-600 transition-colors p-1">
                        Ver detalhes
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-300 dark:text-slate-700 mb-4">
                        <Filter size={32} />
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 font-medium">Nenhuma transação encontrada com esses filtros.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Placeholder */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <p className="text-xs text-slate-500">Mostrando {filteredTransactions.length} de {MOCK_TRANSACTIONS.length} movimentações</p>
          <div className="flex gap-2">
            <button disabled className="px-3 py-1 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-lg text-xs font-bold cursor-not-allowed">Anterior</button>
            <button className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors">Próxima</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
