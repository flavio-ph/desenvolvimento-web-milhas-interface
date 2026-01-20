import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  CreditCard as CardIcon, 
  ArrowUpRight, 
  Wallet,
  Clock,
  Download
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
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

// --- Interfaces (Tipos) baseados no seu Backend ---

interface PontosPorCartaoDTO {
  cartaoId: number;
  nomeCartao: string;
  totalPontos: number;
}

interface PrazoMedioRecebimentoDTO {
  diasMedios: number;
}

interface DashboardResponseDTO {
  pontosPorCartao: PontosPorCartaoDTO[];
  prazoMedio: PrazoMedioRecebimentoDTO;
}

// --- Dados Mockados (Simulados) para partes que o Backend ainda não fornece ---

const MOCK_HISTORY_CHART = [
  { month: 'Jul', points: 4000 },
  { month: 'Ago', points: 3000 },
  { month: 'Set', points: 5000 },
  { month: 'Out', points: 8000 },
  { month: 'Nov', points: 6500 },
  { month: 'Dez', points: 12000 },
];

const MOCK_TRANSACTIONS = [
  { id: 1, description: 'Compra Amazon', amount: 350.00, points: 525, status: 'CREDITED', date: '2024-02-10' },
  { id: 2, description: 'Uber Trip', amount: 45.90, points: 68, status: 'PENDING', date: '2024-02-12' },
  { id: 3, description: 'Supermercado', amount: 890.50, points: 1335, status: 'PROCESSING', date: '2024-02-13' },
];

const PIE_COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

// --- Componente Principal ---

const Dashboard: React.FC = () => {
  const { isDarkMode } = useTheme();
  
  // Estado para armazenar os dados vindos do backend
  const [dashboardData, setDashboardData] = useState<DashboardResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);

  // Busca os dados ao carregar a página
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/dashboard');
        setDashboardData(response.data);
      } catch (error) {
        console.error('Erro ao buscar dados do dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // --- Processamento dos Dados ---

  // Calcula o total de pontos somando todos os cartões
  const totalPontos = dashboardData?.pontosPorCartao.reduce((acc, curr) => acc + curr.totalPontos, 0) || 0;

  // Prepara os dados para o gráfico de pizza
  const pieChartData = dashboardData?.pontosPorCartao.map((item) => ({
    name: item.nomeCartao,
    points: item.totalPontos
  })) || [];

  // Pega o prazo médio (ou 0 se não existir)
  const prazoMedio = dashboardData?.prazoMedio?.diasMedios || 0;
  
  // Conta quantos cartões existem na lista
  const qtdCartoes = dashboardData?.pontosPorCartao.length || 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn pb-10">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold dark:text-white">Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Visão geral dos seus pontos e milhas.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
            <Download size={18} className="text-slate-500" />
            Exportar
          </button>
          <div className="relative group">
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none">
              <Clock size={18} />
              2025
            </button>
          </div>
        </div>
      </div>

      {/* Cards de Estatísticas (Cards Superiores) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Total Acumulado (DADO REAL) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border-l-4 border-indigo-500 shadow-sm dark:shadow-none hover:translate-y-[-4px] transition-all duration-300 border-slate-100 dark:border-y-slate-800 dark:border-r-slate-800">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <Wallet className="text-indigo-600" />
            </div>
            <span className="text-xs font-bold px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30">
              Atual
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">Total Acumulado</p>
          <h3 className="text-2xl font-bold dark:text-white mt-1">{totalPontos.toLocaleString('pt-BR')}</h3>
        </div>

        {/* Card 2: Prazo Médio (DADO REAL) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border-l-4 border-emerald-500 shadow-sm dark:shadow-none hover:translate-y-[-4px] transition-all duration-300 border-slate-100 dark:border-y-slate-800 dark:border-r-slate-800">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <Clock className="text-emerald-600" />
            </div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">Prazo Médio</p>
          <h3 className="text-2xl font-bold dark:text-white mt-1">{prazoMedio.toFixed(0)} dias</h3>
        </div>

        {/* Card 3: Cartões Ativos (DADO REAL - Contagem) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border-l-4 border-amber-500 shadow-sm dark:shadow-none hover:translate-y-[-4px] transition-all duration-300 border-slate-100 dark:border-y-slate-800 dark:border-r-slate-800">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <CardIcon className="text-amber-600" />
            </div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">Cartões Ativos</p>
          <h3 className="text-2xl font-bold dark:text-white mt-1">{qtdCartoes.toString().padStart(2, '0')}</h3>
        </div>

        {/* Card 4: Vencendo em 30d (MOCK - Backend ainda não fornece) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border-l-4 border-rose-500 shadow-sm dark:shadow-none hover:translate-y-[-4px] transition-all duration-300 border-slate-100 dark:border-y-slate-800 dark:border-r-slate-800">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <TrendingUp className="text-rose-600" />
            </div>
            <span className="text-xs font-bold px-2 py-1 rounded-full bg-slate-50 text-slate-500 dark:bg-slate-800">
              Estável
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">Vencendo em 30d</p>
          <h3 className="text-2xl font-bold dark:text-white mt-1">0</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Histórico (MOCKADO - Backend ainda não fornece histórico) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm dark:shadow-none border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold dark:text-white">Histórico de Acúmulo</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Evolução mensal dos seus pontos (Simulado)</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_HISTORY_CHART}>
                <defs>
                  <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#1e293b' : '#e2e8f0'} />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: isDarkMode ? '#64748b' : '#94a3b8', fontSize: 12}} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: isDarkMode ? '#64748b' : '#94a3b8', fontSize: 12}} 
                />
                <Tooltip 
                  contentStyle={{
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', 
                    backgroundColor: isDarkMode ? '#1e293b' : '#fff',
                    color: isDarkMode ? '#fff' : '#000'
                  }} 
                  itemStyle={{ color: isDarkMode ? '#818cf8' : '#4f46e5' }}
                />
                <Area type="monotone" dataKey="points" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorPoints)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Pizza (DADOS REAIS - Pontos por Cartão) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm dark:shadow-none border border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-bold dark:text-white mb-1">Pontos por Cartão</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">Distribuição da sua carteira</p>
          <div className="h-[250px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="points"
                  stroke="none"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    borderRadius: '12px', 
                    border: 'none', 
                    backgroundColor: isDarkMode ? '#1e293b' : '#fff',
                    color: isDarkMode ? '#fff' : '#000'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold dark:text-white">
                {totalPontos > 1000 ? `${(totalPontos / 1000).toFixed(1)}k` : totalPontos}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">Total</span>
            </div>
          </div>
          <div className="space-y-3 mt-4">
            {pieChartData.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}></div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">{item.name}</span>
                </div>
                <span className="text-sm font-semibold dark:text-white">{item.points.toLocaleString('pt-BR')}</span>
              </div>
            ))}
            {pieChartData.length === 0 && (
              <p className="text-center text-sm text-slate-400">Nenhum cartão cadastrado</p>
            )}
          </div>
        </div>
      </div>

      {/* Tabela de Transações (MOCKADO - Backend ainda não fornece) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-lg font-bold dark:text-white">Movimentações Recentes (Simulado)</h3>
          <button className="text-indigo-600 dark:text-indigo-400 text-sm font-semibold hover:underline">Ver todas</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Descrição</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Valor</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pontos</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {MOCK_TRANSACTIONS.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center mr-3">
                        <ArrowUpRight size={16} className="text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <span className="text-sm font-medium dark:text-white">{tx.description}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm dark:text-white">R$ {tx.amount.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">+{tx.points} pts</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter ${
                      tx.status === 'CREDITED' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
                      tx.status === 'PENDING' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
                      'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{new Date(tx.date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;