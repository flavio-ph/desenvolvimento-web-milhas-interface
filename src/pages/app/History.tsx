import React, { useState, useMemo, useEffect } from 'react';
import {
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Calendar as CalendarIcon,
  FileSpreadsheet,
  Paperclip,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import api, { getPontosPendentes, getPontosExpirando, getProgramas } from '../../services/api';
import { LoyaltyProgram, ResumoPendentesResponse } from '../../types/types';
import { useToast } from '../../components/ToastContext';

interface Transaction {
  id: number;
  tipo: 'ACUMULO' | 'USO' | 'BONUS' | 'EXPIRACAO' | 'AJUSTE' | 'TRANSFERENCIA_ENTRADA' | 'TRANSFERENCIA_SAIDA';
  quantidadePontos: number;
  dataMovimentacao: string;
  descricao: string;
  nomePrograma: string;
  nomeCartao?: string;
  nomePersonalizado?: string;
  status?: string;
  compraId?: number;
}

interface Cartao {
  id: number;
  nomePersonalizado: string;
  ultimosDigitos: string;
}

const HistoryPage: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { addToast } = useToast();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [programsList, setProgramsList] = useState<LoyaltyProgram[]>([]);
  const [cardsList, setCardsList] = useState<Cartao[]>([]); // Estado para os cartões
  const [loading, setLoading] = useState(true);

  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  const [typeFilter, setTypeFilter] = useState('ALL');
  const [programFilter, setProgramFilter] = useState('ALL');
  const [cardFilter, setCardFilter] = useState('ALL'); // Estado do filtro de cartão

  const [resumoPendentes, setResumoPendentes] = useState<ResumoPendentesResponse>({
    totalPontos: 0,
    diasParaProximoCredito: null
  });
  const [pontosExpirando, setPontosExpirando] = useState(0);

  // Pagination states
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Busca os filtros (Programas e Cartões) ao montar a tela
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [progData, cardsData] = await Promise.all([
          getProgramas(),
          api.get('/cartoes')
        ]);
        setProgramsList(progData || []);
        setCardsList(cardsData.data || []);
      } catch (error) {
        console.error("Erro ao buscar dados para os filtros", error);
      }
    };
    fetchFilters();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [year, month] = selectedMonth.split('-').map(Number);

        // Objeto de parâmetros dinâmico
        const params: any = {
          mes: month,
          ano: year
        };

        // Só envia os parâmetros se não forem "ALL"
        if (programFilter !== 'ALL') {
          params.programa = programFilter;
        }

        if (typeFilter !== 'ALL') {
          params.tipo = typeFilter;
        }

        // CORREÇÃO AQUI: Garante que "ALL" não é enviado para o backend como string
        if (cardFilter !== 'ALL') {
          params.cartaoId = cardFilter;
        }

        // Parâmetros de paginação
        params.page = page;
        params.size = pageSize;

        const response = await api.get('/movimentacoes', { params });

        const dados = response.data?.content || (Array.isArray(response.data) ? response.data : []);
        setTransactions(dados);

        if (response.data && response.data.totalPages !== undefined) {
          setTotalPages(response.data.totalPages);
        } else {
          setTotalPages(1);
        }

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

  }, [selectedMonth, programFilter, typeFilter, cardFilter, page, pageSize]); // Reage às mudanças de filtros e paginação

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [selectedMonth, programFilter, typeFilter, cardFilter]);

  const acumuladoMes = useMemo(() => {
    return transactions
      .filter(t => ['ACUMULO', 'BONUS', 'AJUSTE', 'TRANSFERENCIA_ENTRADA'].includes(t.tipo || 'ACUMULO'))
      .reduce((acc, curr) => acc + curr.quantidadePontos, 0);
  }, [transactions]);

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
      addToast({ type: 'error', title: 'Erro ao exportar', description: 'Não foi possível gerar o relatório PDF.' });
    }
  };

  const handleExportExcel = async () => {
    try {
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
      addToast({ type: 'error', title: 'Erro ao exportar', description: 'Não foi possível gerar a planilha Excel.' });
    }
  };

  const handleDownloadReceipt = async (compraId: number) => {
    try {
      const response = await api.get(`/compras/${compraId}/comprovante`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `comprovante_${compraId}.pdf`); // Pode ser pdf ou img, daremos uma extensão genérica ou a correta se soubermos
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Erro ao baixar comprovante", error);
      addToast({ type: 'error', title: 'Erro', description: 'Comprovante não encontrado ou erro no servidor.' });
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn pb-10">
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
            {resumoPendentes.totalPontos.toLocaleString('pt-BR')} pts
          </h3>

          <p className="text-xs text-slate-500 mt-1">
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

          <h3 className="text-2xl font-bold dark:text-white">
            {pontosExpirando.toLocaleString('pt-BR')} pts
          </h3>

          <p className="text-xs text-slate-500 mt-1">
            {pontosExpirando > 0
              ? `Pontos com vencimento nos próximos 30 dias`
              : 'Nenhum ponto expirando no próximo mês'}
          </p>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col xl:flex-row items-center justify-between gap-4">

        {/* Label Visual */}
        <div className="hidden xl:flex items-center gap-2 text-slate-500 shrink-0">
          <Filter size={20} />
          <span className="font-medium text-sm">Filtros</span>
        </div>

        <div className="flex flex-col sm:flex-row w-full gap-3">

          {/* Select de Cartões */}
          <select
            value={cardFilter}
            onChange={(e) => setCardFilter(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-medium dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="ALL">Todos os Cartões</option>
            {cardsList.map(card => (
              <option key={card.id} value={card.id}>
                {card.nomePersonalizado} (•••• {card.ultimosDigitos})
              </option>
            ))}
          </select>

          {/* Select de Programas */}
          <select
            value={programFilter}
            onChange={(e) => setProgramFilter(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-medium dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="ALL">Todos os Programas</option>
            {programsList.map(prog => (
              <option key={prog.id} value={prog.nome}>{prog.nome}</option>
            ))}
          </select>

          {/* Seletor de Data */}
          <div className="relative shrink-0 w-full sm:w-auto overflow-hidden rounded-xl">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-600 dark:text-indigo-400 pointer-events-none z-10">
              <CalendarIcon size={18} />
            </div>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              onClick={(e) => {
                try {
                  if ('showPicker' in e.currentTarget) {
                    e.currentTarget.showPicker();
                  }
                } catch (err) {
                  // Fallback silencioso
                }
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors border-none outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer dark:[color-scheme:dark] [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:z-0 relative"
            />
          </div>
        </div>
      </div>

      {/* Tabela de Transações */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto max-h-[460px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
          <table className="w-full relative">
            <thead className="bg-slate-50 dark:bg-slate-800/50 sticky top-0 z-10 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center">Data</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center">Descrição</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center">Cartão</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center">Programa</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center">Pontos</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center">Comprovante</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {transactions.length > 0 ? (
                transactions.map((tx) => {
                  const isNegative = ['USO', 'EXPIRACAO', 'TRANSFERENCIA_SAIDA'].includes(tx.tipo);

                  return (
                    <tr key={tx.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors duration-200 cursor-default">
                      {/* DATA */}
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex flex-col items-center">
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {new Date(tx.dataMovimentacao).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-0.5 group-hover:text-indigo-400/70 transition-colors">
                            {new Date(tx.dataMovimentacao).getFullYear()}
                          </span>
                        </div>
                      </td>

                      {/* DESCRIÇÃO */}
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-3">
                          <div className={`p-2 rounded-xl transition-transform duration-300 group-hover:scale-110 ${!isNegative ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'}`}>
                            {!isNegative ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                          </div>
                          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{tx.descricao}</span>
                        </div>
                      </td>

                      {/* CARTÃO */}
                      <td className="px-6 py-5 text-center">
                        <span className="text-[11px] font-bold tracking-wide px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50">
                          {tx.nomePersonalizado || tx.nomeCartao || '—'}
                        </span>
                      </td>

                      {/* PROGRAMA */}
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 shadow-sm"></div>
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{tx.nomePrograma}</span>
                        </div>
                      </td>

                      {/* PONTOS */}
                      <td className="px-6 py-5 text-center">
                        <span className={`text-sm font-black tracking-tight ${!isNegative ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-500 dark:text-rose-400'}`}>
                          {!isNegative ? '+' : ''}{tx.quantidadePontos.toLocaleString('pt-BR')} <span className="text-[10px] uppercase font-bold text-slate-400 ml-0.5">pts</span>
                        </span>
                      </td>

                      {/* STATUS */}
                      <td className="px-6 py-5 text-center">
                        {tx.status === 'CREDITADO' || tx.status === 'FINALIZADA' ? (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1.5 rounded-md uppercase tracking-wider bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50">
                            <CheckCircle2 size={12} />
                            Processado
                          </span>
                        ) : tx.status === 'PENDENTE' || tx.status === 'AGENDADA' ? (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1.5 rounded-md uppercase tracking-wider bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/50">
                            <Clock size={12} />
                            Aguardando
                          </span>
                        ) : tx.status === 'EXPIRADA' || tx.status === 'CANCELADA' ? (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1.5 rounded-md uppercase tracking-wider bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200/50 dark:border-rose-800/50">
                            <AlertTriangle size={12} />
                            Expirado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1.5 rounded-md uppercase tracking-wider bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50">
                            {tx.status || 'Processando'}
                          </span>
                        )}
                      </td>

                      {/* COMPROVANTE */}
                      <td className="px-6 py-5 text-center">
                        {tx.compraId ? (
                          <button
                            onClick={() => handleDownloadReceipt(tx.compraId!)}
                            className="inline-flex items-center justify-center p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400 transition-colors"
                            title="Baixar Comprovante"
                          >
                            <Paperclip size={16} />
                          </button>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/80 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-600 mb-5 shadow-sm border border-slate-100 dark:border-slate-700/50">
                        <Filter size={36} />
                      </div>
                      <p className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Nenhum resultado encontrado
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                        Não encontramos movimentações que correspondam aos filtros em {selectedMonth.split('-').reverse().join('/')}. Tente alterar os critérios acima.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer da Tabela com Paginação */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <p className="text-xs text-slate-500">Mostrando {transactions.length} movimentações (Página {page + 1} de {totalPages})</p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;