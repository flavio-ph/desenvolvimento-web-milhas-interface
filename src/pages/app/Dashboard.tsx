import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  CreditCard as CardIcon,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Clock,
  Download,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import api from '../../services/api';
import { useTheme } from '../../context/ThemeContext';


interface PontosPorCartaoDTO {
  cartaoId: number;
  nomeCartao: string;
  totalPontos: number;
}

interface HistoricoMensalDTO {
  mes: string;
  pontos: number;
}

interface MovimentacaoDTO {
  id: number;
  tipo: string;
  quantidadePontos: number;
  dataMovimentacao: string;
  descricao: string;
  nomePrograma: string;
}

interface DashboardResponseDTO {
  pontosPorCartao: PontosPorCartaoDTO[];
  prazoMedio: { diasMedios: number };
  pontosExpirando: number;
  historicoPontos: HistoricoMensalDTO[];
  ultimasMovimentacoes: MovimentacaoDTO[];
}

const PIE_COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const Dashboard: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [data, setData] = useState<DashboardResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/dashboard');
        setData(response.data);
        setError(false);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleExportPdf = async () => {
    try {
      const response = await api.get('/relatorios/movimentacoes/pdf', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'relatorio_dashboard.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao baixar PDF', error);
    }
  };

  const handleExportExcel = async () => {
    try {
      const response = await api.get('/relatorios/movimentacoes/csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'relatorio_dashboard.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao baixar Excel', error);
    }
  };

  const totalPontos = data?.pontosPorCartao?.reduce((acc, curr) => acc + curr.totalPontos, 0) || 0;
  const qtdCartoes = data?.pontosPorCartao?.length || 0;
  const prazoMedio = data?.prazoMedio?.diasMedios || 0;
  const expirando = data?.pontosExpirando || 0;

  const pieData = data?.pontosPorCartao?.map(i => ({ name: i.nomeCartao, value: i.totalPontos })) || [];
  const areaData = data?.historicoPontos?.map(h => ({ month: h.mes, points: h.pontos })) || [];

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="flex flex-col h-96 items-center justify-center text-slate-500 animate-fadeIn">
        <AlertCircle size={48} className="text-red-400 mb-4" />
        <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">Não foi possível carregar o dashboard</h3>
        <p className="mb-4">Ocorreu um erro ao comunicar com o servidor.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold dark:text-white">Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Visão geral em tempo real.</p>
        </div>

        {/* BOTÕES DE EXPORTAÇÃO */}
        <div className="flex gap-2">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-lg text-sm font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-all shadow-sm"
          >
            <FileSpreadsheet size={18} />
            Excel
          </button>

          <button
            onClick={handleExportPdf}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
          >
            <Download size={18} />
            PDF
          </button>
        </div>
      </div>

      {/* Cards Superiores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Acumulado"
          value={totalPontos.toLocaleString('pt-BR')}
          icon={<Wallet />}
          color="indigo"
        />
        <StatCard
          title="Prazo Médio"
          value={`${prazoMedio} dias`}
          icon={<Clock />}
          color="emerald"
        />
        <StatCard
          title="Programas Ativos"
          value={qtdCartoes.toString()}
          icon={<CardIcon />}
          color="amber"
        />
        <StatCard
          title="Vencendo em 30d"
          value={expirando.toLocaleString('pt-BR')}
          icon={<TrendingUp />}
          color="rose"
          subText={expirando > 0 ? "Atenção necessária" : undefined}
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Histórico - Gráfico de Linha */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-bold dark:text-white mb-6">Gráfico de Pontos</h3>
          <div className="h-[300px] w-full">
            {areaData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={areaData}> {/* LineChart */}
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#1e293b' : '#e2e8f0'} />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Line
                    type="monotone"
                    dataKey="points"
                    stroke="#4f46e5"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#f14714', strokeWidth: 2, stroke: '#e9da0d' }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <p>Sem dados de histórico suficientes.</p>
              </div>
            )}
          </div>
        </div>

        {/* Pizza */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-bold dark:text-white mb-2">Por Programa</h3>
          <div className="h-[250px] w-full relative">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">
                Sem cartões cadastrados.
              </div>
            )}

            {pieData.length > 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold dark:text-white">
                  {totalPontos > 1000 ? `${(totalPontos / 1000).toFixed(1)}k` : totalPontos}
                </span>
                <span className="text-[10px] text-slate-500 uppercase font-bold">Total</span>
              </div>
            )}
          </div>
          <div className="space-y-3 mt-4">
            {pieData.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-slate-600 dark:text-slate-400">{item.name}</span>
                </div>
                <span className="font-semibold dark:text-white">{item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabela de Movimentações */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-bold dark:text-white">Últimas Movimentações</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Descrição</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Programa</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Pontos</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {data?.ultimasMovimentacoes && data.ultimasMovimentacoes.length > 0 ? (
                data.ultimasMovimentacoes.map((tx) => {
                  const isNegative = ['RESGATE', 'EXPIRACAO'].includes(tx.tipo);
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${!isNegative ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                            {!isNegative ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                          </div>
                          <span className="text-sm font-medium dark:text-white">{tx.descricao}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{tx.nomePrograma}</td>
                      <td className={`px-6 py-4 text-sm font-bold ${!isNegative ? 'text-indigo-600' : 'text-rose-500'}`}>
                        {!isNegative ? '+' : ''}{tx.quantidadePontos.toLocaleString()} pts
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {new Date(tx.dataMovimentacao).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    Nenhuma movimentação recente encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: 'indigo' | 'emerald' | 'amber' | 'rose';
  subText?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, subText }) => {
  const gradients: Record<StatCardProps['color'], string> = {
    indigo: 'from-indigo-500 to-indigo-600',
    emerald: 'from-emerald-500 to-emerald-600',
    amber: 'from-amber-400 to-amber-500',
    rose: 'from-rose-500 to-rose-600',
  };
  const shadows: Record<StatCardProps['color'], string> = {
    indigo: 'shadow-indigo-200 dark:shadow-indigo-900/30',
    emerald: 'shadow-emerald-200 dark:shadow-emerald-900/30',
    amber: 'shadow-amber-200 dark:shadow-amber-900/30',
    rose: 'shadow-rose-200 dark:shadow-rose-900/30',
  };
  const lightBg: Record<StatCardProps['color'], string> = {
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20',
    amber: 'bg-amber-50 dark:bg-amber-900/20',
    rose: 'bg-rose-50 dark:bg-rose-900/20',
  };

  return (
    <div className="group bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${gradients[color]} shadow-md ${shadows[color]}`}>
          <div className="text-white [&>svg]:w-5 [&>svg]:h-5">{icon}</div>
        </div>
        <div className={`text-xs font-bold px-2 py-1 rounded-full ${lightBg[color]}`}>
          <span className={`
            ${color === 'indigo' ? 'text-indigo-600 dark:text-indigo-400' :
              color === 'emerald' ? 'text-emerald-600 dark:text-emerald-400' :
                color === 'amber' ? 'text-amber-600 dark:text-amber-400' :
                  'text-rose-600 dark:text-rose-400'}
          `}>
            ↑ Ativo
          </span>
        </div>
      </div>
      <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider">{title}</p>
      <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">{value}</h3>
      {subText && <p className="text-xs text-rose-500 font-semibold mt-1.5 flex items-center gap-1"><span>⚠</span>{subText}</p>}
    </div>
  );
};

// ── Skeleton Screen ──────────────────────────────────────────────────────────
const Shimmer = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded-xl ${className ?? ''}`} />
);

const DashboardSkeleton: React.FC = () => (
  <div className="space-y-8 pb-10">
    {/* Header skeleton */}
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div className="space-y-2">
        <Shimmer className="h-8 w-48" />
        <Shimmer className="h-4 w-64" />
      </div>
      <div className="flex gap-2">
        <Shimmer className="h-9 w-24" />
        <Shimmer className="h-9 w-20" />
      </div>
    </div>

    {/* Stat cards skeleton */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
      {[0, 1, 2, 3].map(i => (
        <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
          <Shimmer className="h-10 w-10" />
          <Shimmer className="h-3 w-28" />
          <Shimmer className="h-8 w-20" />
        </div>
      ))}
    </div>

    {/* Charts skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
        <Shimmer className="h-5 w-40 mb-6" />
        <Shimmer className="h-[300px] w-full" />
      </div>
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
        <Shimmer className="h-5 w-32 mb-4" />
        <Shimmer className="h-[250px] w-full rounded-full mx-auto" />
        <div className="mt-4 space-y-3">
          {[0, 1, 2].map(i => (
            <div key={i} className="flex justify-between items-center">
              <Shimmer className="h-3 w-24" />
              <Shimmer className="h-3 w-12" />
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Table skeleton */}
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800">
        <Shimmer className="h-5 w-48" />
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shimmer className="h-8 w-8" />
              <Shimmer className="h-4 w-40" />
            </div>
            <Shimmer className="h-4 w-20" />
            <Shimmer className="h-4 w-16" />
            <Shimmer className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default Dashboard;