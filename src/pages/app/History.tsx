import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Calendar as CalendarIcon,
  FileSpreadsheet // Ícone para o Excel
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import api, { getPontosPendentes, getPontosExpirando, ResumoPendentesResponse, creditarCompra } from '../../services/api';


interface Transaction {
  id: number;
  tipo: 'ACUMULO' | 'USO' | 'BONUS' | 'EXPIRACAO' | 'AJUSTE' | 'TRANSFERENCIA_ENTRADA' | 'TRANSFERENCIA_SAIDA';
  quantidadePontos: number;
  dataMovimentacao: string;
  descricao: string;
  nomePrograma: string;
}

const HistoryPage: React.FC = () => {
  const { isDarkMode } = useTheme();

  // Estados
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Estado para o Mês Selecionado (Formato YYYY-MM)
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [programFilter, setProgramFilter] = useState('ALL');
  // Estado para Pontos Pendentes
  const [resumoPendentes, setResumoPendentes] = useState<ResumoPendentesResponse>({
    totalPontos: 0,
    diasParaProximoCredito: null
  });
  // Estado para Pontos Expirando
  const [pontosExpirando, setPontosExpirando] = useState(0);

 useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const response = await api.get('/movimentacoes', {
          params: {
            mes: selectedMonth, 
            termo: searchTerm,  
            programa: programFilter === 'ALL' ? '' : programFilter 
          }
        });
        
        setTransactions(response.data);

        const pendentes = await getPontosPendentes();
        setResumoPendentes(pendentes);

        const expirando = await getPontosExpirando(30);
        setPontosExpirando(expirando);

      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        
        setTransactions([]);
        setResumoPendentes({ totalPontos: 0, diasParaProximoCredito: null });
        setPontosExpirando(0);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchData();
    }, 500);

    return () => clearTimeout(delayDebounceFn);

  }, [selectedMonth, searchTerm, programFilter]); //

  const uniquePrograms = useMemo(() => {
    const programs = new Set(transactions.map(t => t.nomePrograma));
    return Array.from(programs);
  }, [transactions]);

  // --- LÓGICA DE FILTRO ---
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const matchesSearch = tx.descricao.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesProgram = programFilter === 'ALL' || tx.nomePrograma === programFilter;

      const txDate = new Date(tx.dataMovimentacao);
      const [selYear, selMonth] = selectedMonth.split('-').map(Number);
      const matchesDate = txDate.getFullYear() === selYear && (txDate.getMonth() + 1) === selMonth;

      return matchesSearch && matchesProgram && matchesDate;
    });
  }, [searchTerm, programFilter, selectedMonth, transactions]);

  const acumuladoMes = useMemo(() => {
    return filteredTransactions
      .filter(t => ['ACUMULO', 'BONUS', 'AJUSTE', 'TRANSFERENCIA_ENTRADA'].includes(t.tipo || 'ACUMULO'))
      .reduce((acc, curr) => acc + curr.quantidadePontos, 0);
  }, [filteredTransactions]);

  // --- FUNÇÕES DE EXPORTAÇÃO ---

  const handleExportPdf = async () => {
    try {
      const response = await api.get('/relatorios/movimentacoes/pdf', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'extrato_milhas.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Erro ao baixar PDF", error);
      alert("Erro ao gerar relatório PDF.");
    }
  };

  const handleExportExcel = async () => {
    try {
      // Chama o endpoint CSV que abre no Excel
      const response = await api.get('/relatorios/movimentacoes/csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'extrato_milhas.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Erro ao baixar Excel", error);
      alert("Erro ao gerar planilha Excel.");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold dark:text-white text-slate-900">Extrato de Pontos</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Acompanhe detalhadamente suas entradas e saídas.</p>
        </div>

        {/* Botões de Ação */}
        <div className="flex gap-3">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-xl text-sm font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-all shadow-sm"
          >
            <FileSpreadsheet size={18} />
            Exportar Excel
          </button>

          <button
            onClick={handleExportPdf}
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
          >
            <Download size={18} />
            Exportar PDF
          </button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-indigo-600 p-6 rounded-2xl text-white shadow-lg shadow-indigo-200 dark:shadow-none relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <ArrowUpRight size={80} />
          </div>
          <p className="text-sm font-medium opacity-80 mb-1">Entradas em {selectedMonth.split('-').reverse().join('/')}</p>
          <h3 className="text-3xl font-bold">+{acumuladoMes.toLocaleString('pt-BR')} pts</h3>
          <p className="text-xs mt-2 bg-white/20 inline-block px-2 py-1 rounded-full">Filtrado por data</p>
        </div>

        {/* Card Aguardando Crédito */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <Clock className="text-amber-600" size={20} />
            </div>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Aguardando Crédito</span>
          </div>

          <h3 className="text-2xl font-bold dark:text-white">
            {/* Agora usamos .totalPontos */}
            {resumoPendentes.totalPontos.toLocaleString('pt-BR')} pts
          </h3>

          <p className="text-xs text-slate-500 mt-1">
            {/* Lógica Dinâmica dos Dias */}
            {resumoPendentes.totalPontos > 0 ? (
              resumoPendentes.diasParaProximoCredito !== null && resumoPendentes.diasParaProximoCredito > 0
                ? `Próximo crédito em ${resumoPendentes.diasParaProximoCredito} dias`
                : (resumoPendentes.diasParaProximoCredito === 0 ? 'Crédito agendado para hoje!' : 'Processando...')
            ) : (
              'Sem lançamentos pendentes'
            )}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-rose-50 dark:bg-rose-900/20 rounded-lg">
              <AlertTriangle className="text-rose-600" size={20} />
            </div>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Expirando em Breve</span>
          </div>
          {/* Valor Dinâmico vindo do estado pontosExpirando */}
          <h3 className="text-2xl font-bold dark:text-white">
            {pontosExpirando.toLocaleString('pt-BR')} pts
          </h3>

          {/* Lógica condicional para o texto de apoio */}
          <p className="text-xs text-slate-500 mt-1">
            {pontosExpirando > 0
              ? `Pontos com vencimento nos próximos 30 dias`
              : 'Nenhum ponto expirando no próximo mês'}
          </p>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por descrição..."
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
            {uniquePrograms.map(prog => (
              <option key={prog} value={prog}>{prog}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-medium dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="ALL">Status: Todos</option>
            <option value="CREDITED">Creditados</option>
          </select>

          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-600 dark:text-indigo-400 pointer-events-none">
              <CalendarIcon size={18} />
            </div>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl text-sm font-bold hover:bg-indigo-100 transition-colors border-none outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Tabela de Transações */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full"> {/* Removido text-left */}
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
              <tr>
                {/* Adicionado text-center em todos os THs */}
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center">Data</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center">Descrição</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center">Programa</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center">Pontos</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center">Status</th>
                {/* Coluna "Ação" foi removida daqui */}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx) => {
                  const isNegative = ['USO', 'EXPIRACAO', 'TRANSFERENCIA_SAIDA'].includes(tx.tipo);

                  return (
                    <tr key={tx.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-default">

                      {/* 1. DATA (Centralizado com items-center) */}
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex flex-col items-center"> {/* items-center centraliza verticalmente */}
                          <span className="text-sm font-semibold dark:text-white">
                            {new Date(tx.dataMovimentacao).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                          </span>
                          <span className="text-[10px] text-slate-400 uppercase">
                            {new Date(tx.dataMovimentacao).getFullYear()}
                          </span>
                        </div>
                      </td>

                      {/* 2. DESCRIÇÃO (Centralizado com justify-center) */}
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-3"> {/* justify-center centraliza horizontalmente */}
                          <div className={`p-2 rounded-lg ${!isNegative ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600'
                            }`}>
                            {!isNegative ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                          </div>
                          <span className="text-sm font-medium dark:text-white">{tx.descricao}</span>
                        </div>
                      </td>

                      {/* 3. PROGRAMA (Centralizado com justify-center) */}
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-2"> {/* justify-center */}
                          <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                          <span className="text-sm text-slate-600 dark:text-slate-400">{tx.nomePrograma}</span>
                        </div>
                      </td>

                      {/* 4. PONTOS (Centralizado com text-center na TD) */}
                      <td className="px-6 py-5 text-center">
                        <span className={`text-sm font-bold ${!isNegative ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-500'}`}>
                          {!isNegative ? '+' : ''}{tx.quantidadePontos.toLocaleString('pt-BR')} pts
                        </span>
                      </td>

                      {/* 5. STATUS (Centralizado com text-center na TD) */}
                      <td className="px-6 py-5 text-center">
                        {tx.status === 'CREDITADO' || tx.status === 'FINALIZADA' ? (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-tight bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30">
                            <CheckCircle2 size={10} />
                            Processado
                          </span>
                        ) : tx.status === 'PENDENTE' || tx.status === 'AGENDADA' ? (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-tight bg-amber-50 text-amber-600 dark:bg-amber-900/30">
                            <Clock size={10} />
                            Aguardando
                          </span>
                        ) : tx.status === 'EXPIRADA' || tx.status === 'CANCELADA' ? (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-tight bg-rose-50 text-rose-600 dark:bg-rose-900/30">
                            <AlertTriangle size={10} />
                            Expirado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-tight bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                            {tx.status || 'Processando'}
                          </span>
                        )}
                      </td>

                      {/* Coluna "Ação" removida daqui também */}

                    </tr>
                  );
                })
              ) : (
                <tr>
                  {/* Ajustado colSpan para 5, já que removemos uma coluna */}
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-300 dark:text-slate-700 mb-4">
                        <Filter size={32} />
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 font-medium">
                        Nenhuma transação encontrada em <span className="font-bold text-slate-700 dark:text-white">{selectedMonth.split('-').reverse().join('/')}</span>.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination (Visual) */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <p className="text-xs text-slate-500">Mostrando {filteredTransactions.length} movimentações</p>
          <div className="flex gap-2">
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;