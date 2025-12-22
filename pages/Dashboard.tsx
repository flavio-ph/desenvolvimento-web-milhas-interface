
import React from 'react';
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
import { MOCK_PROGRAMS, MOCK_TRANSACTIONS } from '../constants';
import { useTheme } from '../context/ThemeContext';

const chartData = [
  { month: 'Jul', points: 4000 },
  { month: 'Ago', points: 3000 },
  { month: 'Set', points: 5000 },
  { month: 'Out', points: 8000 },
  { month: 'Nov', points: 6500 },
  { month: 'Dez', points: 12000 },
];

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'];

const Dashboard: React.FC = () => {
  const { isDarkMode } = useTheme();

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold dark:text-white">Olá, Tatiane Fabiana! 👋</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Bem-vinda de volta à sua central de milhas e pontos.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
            <Download size={18} className="text-slate-500" />
            Exportar Relatórios
          </button>
          <div className="relative group">
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none">
              <Clock size={18} />
              2024
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Acumulado', value: '259.600', icon: <Wallet className="text-indigo-600" />, trend: '+12%', color: 'border-iigo-500' },
          { label: 'Pontos Pendentes', value: '12.450', icon: <Clock className="text-emerald-600" />, trend: '+5%', color: 'border-emerald-500' },
          { label: 'Cartões Ativos', value: '03', icon: <CardIcon className="text-amber-600" />, trend: 'Estável', color: 'border-amber-500' },
          { label: 'Vencendo em 30d', value: '1.200', icon: <TrendingUp className="text-rose-600" />, trend: '-2%', color: 'border-rose-500' },
        ].map((stat, i) => (
          <div key={i} className={`bg-white dark:bg-slate-900 p-6 rounded-2xl border-l-4 ${stat.color} shadow-sm dark:shadow-none hover:translate-y-[-4px] transition-all duration-300 border-slate-100 dark:border-y-slate-800 dark:border-r-slate-800`}>
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
                {stat.icon}
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${stat.trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30' : 'bg-slate-50 text-slate-500 dark:bg-slate-800'}`}>
                {stat.trend}
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">{stat.label}</p>
            <h3 className="text-2xl font-bold dark:text-white mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm dark:shadow-none border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold dark:text-white">Histórico de Acúmulo</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Evolução mensal dos seus pontos</p>
            </div>
            <div className="flex gap-2">
              <span className="text-xs font-bold text-rose-500 bg-rose-50 dark:bg-rose-900/20 px-2 py-1 rounded">Crítico em Jan</span>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
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

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm dark:shadow-none border border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-bold dark:text-white mb-1">Pontos por Programa</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">Distribuição total da sua carteira</p>
          <div className="h-[250px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={MOCK_PROGRAMS}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="points"
                  stroke="none"
                >
                  {MOCK_PROGRAMS.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
              <span className="text-2xl font-bold dark:text-white">259.6k</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">Total</span>
            </div>
          </div>
          <div className="space-y-3 mt-4">
            {MOCK_PROGRAMS.map((program, i) => (
              <div key={program.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">{program.name}</span>
                </div>
                <span className="text-sm font-semibold dark:text-white">{(program.points / 1000).toFixed(1)}k</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-lg font-bold dark:text-white">Movimentações Recentes</h3>
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
