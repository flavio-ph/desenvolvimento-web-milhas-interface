import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft, Search, Download, Loader2,
    ShoppingBag, Utensils, Car, Tv, Plane, ShoppingCart,
    TrendingUp, Coins, Zap, Star, CheckCircle2, XCircle,
    Filter, ChevronRight, ChevronLeft
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../components/ToastContext';
import { parseSafeDate, formatDate, humanDate, formatCurrency } from '../../utils/dateUtils';
import Pagination from '../../components/Pagination';
import { isAxiosError } from 'axios';

/* ─── Tipos ─────────────────────────────────────────────────── */
interface Cartao {
    id: number;
    nomePersonalizado: string;
    ultimosDigitos: string;
    fatorConversao: number;
    nomeBandeira?: string;
    nomeProgramaPontos?: string;
    cor?: string;
    status?: string;
}

interface Compra {
    id: number;
    descricao: string;
    categoria?: string;
    valorGasto: number;
    pontosCalculados?: number;
    dataCompra: string | number[];
    status?: 'PENDENTE' | 'CREDITADO' | 'CANCELADO' | string;
}

/* ─── Helpers ────────────────────────────────────────────────── */
const adjustColor = (color: string, amount: number) =>
    '#' + color.replace(/^#/, '').replace(/../g, (c) =>
        ('0' + Math.min(255, Math.max(0, parseInt(c, 16) + amount)).toString(16)).slice(-2));

const getCategoryIcon = (categoria?: string) => {
    const cat = (categoria || '').toLowerCase();
    if (cat.includes('restaur') || cat.includes('aliment') || cat.includes('food')) return Utensils;
    if (cat.includes('transporte') || cat.includes('uber') || cat.includes('taxi')) return Car;
    if (cat.includes('viagem') || cat.includes('aéreo') || cat.includes('hotel')) return Plane;
    if (cat.includes('stream') || cat.includes('netflix') || cat.includes('serviç')) return Tv;
    if (cat.includes('shopping') || cat.includes('loja') || cat.includes('moda')) return ShoppingCart;
    return ShoppingBag;
};

const getCategoryColor = (categoria?: string) => {
    const cat = (categoria || '').toLowerCase();
    if (cat.includes('restaur') || cat.includes('aliment') || cat.includes('food')) return { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400' };
    if (cat.includes('transporte') || cat.includes('uber') || cat.includes('taxi')) return { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' };
    if (cat.includes('viagem') || cat.includes('aéreo') || cat.includes('hotel')) return { bg: 'bg-violet-100 dark:bg-violet-900/30', text: 'text-violet-600 dark:text-violet-400' };
    if (cat.includes('stream') || cat.includes('netflix') || cat.includes('serviç')) return { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400' };
    return { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-600 dark:text-indigo-400' };
};

const groupByDate = (compras: Compra[]): Record<string, Compra[]> => {
    return compras.reduce((acc, c) => {
        const key = formatDate(c.dataCompra) !== '—' ? formatDate(c.dataCompra) : 'Data Desconhecida';
        if (!acc[key]) acc[key] = [];
        acc[key].push(c);
        return acc;
    }, {} as Record<string, Compra[]>);
};

/* ─── Helpers ────────────────────────────────────────────────── */
const CardDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { addToast } = useToast();

    const [cartao, setCartao] = useState<Cartao | null>(null);
    const [compras, setCompras] = useState<Compra[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('TODOS');

    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    useEffect(() => {
        setPage(0);
    }, [search, filterStatus]);

    useEffect(() => {
        if (!id) return;
        const load = async () => {
            try {
                setLoading(true);
                const queryParams: Record<string, string | number> = { page, size: pageSize };

                if (filterStatus !== 'TODOS') queryParams.status = filterStatus;
                if (search) queryParams.descricao = search;

                const [cartaoRes, comprasRes] = await Promise.all([
                    api.get(`/cartoes/${id}`),
                    api.get(`/compras?cartaoId=${id}`, { params: queryParams })
                ]);
                setCartao(cartaoRes.data);

                const listaCompras = comprasRes.data?.content || (Array.isArray(comprasRes.data) ? comprasRes.data : []);
                setCompras(listaCompras);

                if (comprasRes.data && comprasRes.data.totalPages !== undefined) {
                    setTotalPages(comprasRes.data.totalPages);
                } else {
                    setTotalPages(1);
                }

            } catch (err: unknown) {
                if (isAxiosError(err) && err.response?.status === 404) {
                    addToast({ type: 'error', title: 'Cartão não encontrado', description: 'Este cartão não existe ou foi removido.' });
                    navigate('/cards');
                } else {
                    addToast({ type: 'error', title: 'Erro ao carregar', description: 'Não foi possível carregar os dados do cartão.' });
                }
            } finally {
                setLoading(false);
            }
        };

        const debounceFn = setTimeout(() => {
            load();
        }, 500);

        return () => clearTimeout(debounceFn);
    }, [id, page, pageSize, search, filterStatus]);

    const totalPontos = useMemo(() =>
        compras.filter(c => c.status === 'CREDITADO').reduce((s, c) => s + (c.pontosCalculados || 0), 0), [compras]);

    const gastoMensal = useMemo(() => {
        const now = new Date();
        return compras
            .filter(c => {
                const d = parseSafeDate(c.dataCompra);
                if (!d) return false;
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            })
            .reduce((s, c) => s + (c.valorGasto || 0), 0);
    }, [compras]);

    const comprasFiltradas = useMemo(() => {
        return compras.filter(c => {
            const matchSearch =
                !search ||
                (c.descricao || '').toLowerCase().includes(search.toLowerCase()) ||
                (c.categoria || '').toLowerCase().includes(search.toLowerCase());
            const matchStatus = filterStatus === 'TODOS' || c.status === filterStatus;
            return matchSearch && matchStatus;
        });
    }, [compras, search, filterStatus]);

    const grouped = useMemo(() => groupByDate(comprasFiltradas), [comprasFiltradas]);
    const dateKeys = Object.keys(grouped).sort((a, b) => {
        if (a === 'Data Desconhecida') return 1;
        if (b === 'Data Desconhecida') return -1;
        const parse = (s: string) => { const [d, m, y] = s.split('/'); return new Date(`${y}-${m}-${d}`).getTime(); };
        return parse(b) - parse(a);
    });

    const cardStyle = cartao?.cor ? {
        background: `linear-gradient(135deg, ${cartao.cor} 0%, ${adjustColor(cartao.cor, -40)} 100%)`
    } : { background: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)' };

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="animate-spin text-indigo-600" size={40} />
            </div>
        );
    }

    if (!cartao) return null;

    const isAtivo = cartao.status !== 'INACTIVE';

    return (
        <div className="space-y-6 animate-fadeIn pb-10">

            {/* ─── Breadcrumb / Header ─── */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2 text-sm">
                    <button
                        onClick={() => navigate('/cards')}
                        className="flex items-center gap-1.5 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 font-medium transition-colors"
                    >
                        <ArrowLeft size={16} />
                        Meus Cartões
                    </button>
                    <ChevronRight size={14} className="text-slate-300 dark:text-slate-600" />
                    <span className="text-slate-800 dark:text-white font-semibold">{cartao.nomePersonalizado}</span>
                </div>
                <button
                    onClick={() => navigate('/cards')}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
                >
                    <ArrowLeft size={16} />
                    Voltar para cartões
                </button>
            </div>

            {/* ─── Hero: Card + KPIs ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Visual do cartão */}
                <div
                    className="relative rounded-3xl p-6 text-white shadow-2xl overflow-hidden col-span-1"
                    style={cardStyle}
                >
                    <div className="absolute -right-12 -top-12 w-44 h-44 rounded-full bg-white/10 pointer-events-none" />
                    <div className="absolute -right-4 -bottom-10 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />

                    <div className="flex justify-between items-start mb-6 relative z-10">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${isAtivo ? 'bg-emerald-500/25 text-emerald-100' : 'bg-white/20 text-white/70'}`}>
                            {isAtivo ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                            {isAtivo ? 'Ativo' : 'Inativo'}
                        </span>

                        <svg width="36" height="26" viewBox="0 0 36 26" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-sm">
                            <rect width="36" height="26" rx="4" fill="#D4A017" />
                            <rect x="1" y="1" width="34" height="24" rx="3" fill="#F2BF2B" />
                            <rect x="12" y="1" width="12" height="24" fill="#D4A017" opacity="0.5" />
                            <rect x="1" y="8" width="34" height="10" fill="#D4A017" opacity="0.4" />
                            <rect x="4" y="4" width="28" height="18" rx="2" fill="none" stroke="#C49A0A" strokeWidth="0.5" />
                        </svg>
                    </div>

                    <div className="relative z-10 mb-6">
                        <div className="font-mono text-lg tracking-widest text-white/90">
                            •••• •••• •••• {cartao.ultimosDigitos}
                        </div>
                    </div>

                    <div className="relative z-10 flex justify-between items-end">
                        <div>
                            <p className="text-[10px] text-white/60 uppercase font-bold mb-0.5">Titular</p>
                            <p className="font-bold text-sm truncate max-w-[140px]">{cartao.nomePersonalizado}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-white/60 uppercase font-bold mb-0.5">Bandeira</p>
                            <p className="font-bold text-sm">{cartao.nomeBandeira || '—'}</p>
                        </div>
                    </div>
                </div>

                {/* KPIs */}
                <div className="col-span-1 lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">

                    {/* Pontos Acumulados */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
                        <div className="flex justify-between items-start mb-3">
                            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl">
                                <Coins size={20} className="text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">
                                <TrendingUp size={10} />
                                +12%
                            </span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">Pontos Acumulados</p>
                        <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                            {totalPontos.toLocaleString('pt-BR')}{' '}
                            <span className="text-base font-bold text-slate-400">pts</span>
                        </p>
                        <p className="text-xs text-slate-400 mt-1">{cartao.fatorConversao?.toFixed(1)} pts por R$1</p>
                    </div>

                    {/* Gasto Mensal */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
                        <div className="flex justify-between items-start mb-3">
                            <div className="p-2.5 bg-violet-50 dark:bg-violet-900/30 rounded-xl">
                                <ShoppingCart size={20} className="text-violet-600 dark:text-violet-400" />
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full uppercase">
                                Este mês
                            </span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">Gasto Mensal</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">
                            {formatCurrency(gastoMensal)}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">{cartao.nomeProgramaPontos || 'Sem programa vinculado'}</p>
                    </div>

                    {/* Total de Compras */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
                        <div className="p-2.5 bg-amber-50 dark:bg-amber-900/30 rounded-xl shrink-0">
                            <Star size={20} className="text-amber-500 dark:text-amber-400" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 font-medium">Total de compras</p>
                            <p className="text-xl font-black text-slate-900 dark:text-white">{compras.length}</p>
                        </div>
                    </div>

                    {/* Pendentes */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
                        <div className="p-2.5 bg-orange-50 dark:bg-orange-900/30 rounded-xl shrink-0">
                            <Loader2 size={20} className="text-orange-500 dark:text-orange-400" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 font-medium">Pendentes</p>
                            <p className="text-xl font-black text-slate-900 dark:text-white">
                                {compras.filter(c => c.status === 'PENDENTE').length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Barra de busca + filtros ─── */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Buscar estabelecimentos..."
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
                    />
                </div>

                <div className="flex gap-2">
                    <div className="relative">
                        <select
                            value={filterStatus}
                            onChange={e => setFilterStatus(e.target.value)}
                            className="pl-9 pr-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none appearance-none shadow-sm cursor-pointer"
                        >
                            <option value="TODOS">Todos</option>
                            <option value="CREDITADO">Creditados</option>
                            <option value="PENDENTE">Pendentes</option>
                            <option value="CANCELADO">Cancelados</option>
                        </select>
                        <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>

                    <button
                        onClick={() => addToast({ type: 'info', title: 'Exportar', description: 'Funcionalidade em breve.' })}
                        className="flex items-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
                    >
                        <Download size={16} />
                        Exportar
                    </button>
                </div>
            </div>

            {/* ─── Lista de movimentações ─── */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">

                {comprasFiltradas.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/80 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-600 mb-5 shadow-sm border border-slate-100 dark:border-slate-700/50">
                            <ShoppingBag size={36} />
                        </div>
                        <p className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Nenhuma movimentação
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                            {search || filterStatus !== 'TODOS'
                                ? 'Não encontramos compras para os filtros aplicados neste cartão.'
                                : 'Suas compras com este cartão aparecerão detalhadas aqui.'}
                        </p>
                    </div>
                ) : (
                    <div>
                        {dateKeys.map((date, di) => (
                            <div key={date}>
                                <div className={`px-6 py-2.5 bg-slate-50 dark:bg-slate-800/50 ${di > 0 ? 'border-t border-slate-100 dark:border-slate-800' : ''}`}>
                                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                        {humanDate(date)}
                                    </span>
                                </div>

                                {grouped[date].map((compra, i) => {
                                    const Icon = getCategoryIcon(compra.categoria);
                                    const color = getCategoryColor(compra.categoria);
                                    const isLast = i === grouped[date].length - 1;

                                    return (
                                        <div
                                            key={compra.id}
                                            className={`group flex items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors duration-200 cursor-default ${!isLast ? 'border-b border-slate-50 dark:border-slate-800/60' : ''}`}
                                        >
                                            <div className={`w-10 h-10 rounded-xl ${color.bg} flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110`}>
                                                <Icon size={18} className={color.text} />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-slate-900 dark:text-white text-sm truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{compra.descricao || 'Compra Registrada'}</p>
                                                <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-0.5 group-hover:text-slate-500 dark:group-hover:text-slate-400 transition-colors">
                                                    {compra.categoria || 'Compra'}
                                                </p>
                                            </div>

                                            <div className="text-right shrink-0">
                                                <p className="font-bold text-slate-900 dark:text-white text-sm tracking-tight scale-100 group-hover:scale-[1.02] transition-transform origin-right">
                                                    {formatCurrency(compra.valorGasto)}
                                                </p>
                                                <div className="flex items-center justify-end gap-2 mt-1">
                                                    {compra.status === 'PENDENTE' && (
                                                        <span className="text-[9px] font-black uppercase tracking-wider text-amber-500 bg-amber-50 dark:bg-amber-500/10 px-1.5 py-0.5 rounded-full border border-amber-200/50 dark:border-amber-800/50">Pendente</span>
                                                    )}
                                                    {compra.status === 'CANCELADO' && (
                                                        <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full border border-slate-200/50 dark:border-slate-700/50">Cancelado</span>
                                                    )}
                                                    {compra.pontosCalculados !== undefined && compra.pontosCalculados > 0 && compra.status !== 'CANCELADO' && (
                                                        <span className="text-[10px] font-black tracking-tight text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-200/50 dark:border-indigo-800/50">
                                                            +{compra.pontosCalculados.toLocaleString('pt-BR')} <span className="text-[8px] uppercase">pts</span>
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}

                        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
                    </div>
                )}
            </div>

            {/* ─── Banner Acelerador de Pontos ─── */}
            <div
                className="relative rounded-3xl p-8 overflow-hidden text-white group"
                style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 60%, #a855f7 100%)' }}
            >
                <div className="absolute right-0 top-0 w-64 h-full opacity-20 pointer-events-none">
                    <div className="absolute right-8 top-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-white/40 blur-3xl animate-pulse" />
                    <div className="absolute right-24 top-1/4 w-20 h-20 rounded-full bg-white/30 blur-2xl group-hover:scale-150 transition-transform duration-1000" />
                </div>
                <div className="absolute right-6 bottom-4 w-16 h-16 rounded-full bg-white/10 flex items-center justify-center pointer-events-none ring-1 ring-white/20 shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                    <Zap size={28} className="text-white drop-shadow-md" />
                </div>

                <div className="relative z-10 max-w-lg">
                    <h3 className="text-xl font-black mb-2">Acelerador de Pontos</h3>
                    <p className="text-white/80 text-sm leading-relaxed mb-5">
                        Ative o acelerador e ganhe o dobro de pontos em todas as compras na categoria
                        Gastronomia durante este final de semana.
                    </p>
                    <button
                        onClick={() => addToast({ type: 'success', title: 'Acelerador ativo!', description: 'Você está ganhando 2x pontos no período promocional.' })}
                        className="px-6 py-3 bg-white text-indigo-700 font-black rounded-xl text-sm hover:bg-indigo-50 transition-colors shadow-lg"
                    >
                        Ativar agora
                    </button>
                </div>
            </div>

        </div>
    );
};

export default CardDetailPage;