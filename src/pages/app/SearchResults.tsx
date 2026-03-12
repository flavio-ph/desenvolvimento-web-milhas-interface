import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, CreditCard, ShoppingBag, Tag, ArrowRight, Globe } from 'lucide-react';
import { getCompras, getCartoes, getPromocoes, getProgramas } from '../../services/api';
import { Transaction, CreditCard as CardType, Promotion, LoyaltyProgram } from '../../types/types';

/* ── Shimmer helper ── */
const Shimmer = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded-xl ${className ?? ''}`} />
);

/* ── Skeleton enquanto carrega ── */
const SearchSkeleton: React.FC<{ query: string }> = ({ query }) => (
  <div className="max-w-5xl mx-auto space-y-8 py-4">
    <div className="space-y-2">
      <Shimmer className="h-9 w-80" />
      <Shimmer className="h-4 w-52" />
    </div>
    {/* Seção de resultados skeleton */}
    {[...Array(3)].map((_, s) => (
      <div key={s} className="space-y-4">
        <Shimmer className="h-6 w-36" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
              <Shimmer className="h-4 w-3/4" />
              <Shimmer className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

/* ── Highlight de termo buscado ── */
const highlightTerm = (text: string, query: string): React.ReactNode => {
  if (!query || !text) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part)
      ? <mark key={i} className="bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 rounded px-0.5">{part}</mark>
      : part
  );
};



const SearchResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState({
    transactions: [] as Transaction[],
    cards: [] as CardType[],
    promotions: [] as Promotion[],
    programs: [] as LoyaltyProgram[]
  });

  useEffect(() => {
    const performSearch = async () => {
      if (!query) return;
      setLoading(true);

      try {
        const [comprasData, cartoesData, promocoesData, programasData] = await Promise.all([
          getCompras().catch(err => { console.error("Erro compras:", err); return []; }),
          getCartoes().catch(err => { console.error("Erro cartões:", err); return []; }),
          getPromocoes().catch(err => { console.error("Erro promoções:", err); return []; }),
          getProgramas().catch(err => { console.error("Erro programas:", err); return []; })
        ]);

        const term = query.toLowerCase();

        const filteredTransactions = comprasData.filter(t =>
          t.descricao && t.descricao.toLowerCase().includes(term)
        );

        const filteredCards = cartoesData.filter((c: any) =>
          (c.nomePersonalizado && c.nomePersonalizado.toLowerCase().includes(term)) ||
          (c.nomeBandeira && c.nomeBandeira.toLowerCase().includes(term))
        );

        const filteredPromotions = promocoesData.filter(p =>
          (p.titulo && p.titulo.toLowerCase().includes(term)) ||
          (p.descricao && p.descricao.toLowerCase().includes(term))
        );

        const filteredPrograms = programasData.filter(p =>
          p.nome && p.nome.toLowerCase().includes(term)
        );

        setResults({
          transactions: filteredTransactions,
          cards: filteredCards,
          promotions: filteredPromotions,
          programs: filteredPrograms
        });

      } catch (error) {
        console.error("Erro geral na busca:", error);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [query]);

  if (loading) {
    return <SearchSkeleton query={query} />;
  }

  const hasResults = results.transactions.length > 0 || results.cards.length > 0 || results.promotions.length > 0 || results.programs.length > 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn py-4">
      <div>
        <h1 className="text-3xl font-bold dark:text-white flex items-center gap-3">
          <Search className="text-indigo-600" />
          Resultados para "{query}"
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Encontramos registros em {Object.keys(results).filter(k => results[k as keyof typeof results].length > 0).length} categorias.
        </p>
      </div>

      {!hasResults && (
        <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
          <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
            <Search size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Nenhum resultado encontrado</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Verificamos em Compras, Cartões, Promoções e Programas.
          </p>
        </div>
      )}

      {/* RESULTADOS: PROGRAMAS */}
      {results.programs.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Globe size={20} /> Programas
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {results.programs.map(prog => (
              <div key={prog.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default">
                <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-slate-800 flex items-center justify-center text-indigo-600 font-bold">
                  {prog.nome.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-white">{highlightTerm(prog.nome, query)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RESULTADOS: CARTÕES */}
      {results.cards.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <CreditCard size={20} /> Cartões
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.cards.map((card: any) => (
              <div key={card.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <p className="font-bold text-slate-800 dark:text-white">{highlightTerm(card.nomePersonalizado, query)}</p>
                <p className="text-sm text-slate-500">{highlightTerm(card.nomeBandeira, query)} •••• {card.ultimosDigitos}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RESULTADOS: COMPRAS */}
      {results.transactions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <ShoppingBag size={20} /> Transações
          </h2>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
            {results.transactions.map((t: any, idx) => (
              <div key={t.id} className={`p-4 flex items-center justify-between ${idx !== results.transactions.length - 1 ? 'border-b border-slate-100 dark:border-slate-800' : ''}`}>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{highlightTerm(t.descricao, query)}</p>
                  <p className="text-xs text-slate-500">{t.dataMovimentacao || t.dataCompra}</p>
                </div>
                <span className="font-bold text-indigo-600">R$ {t.valorGasto ? t.valorGasto.toFixed(2) : (t.quantidadePontos ? t.quantidadePontos.toLocaleString('pt-br') : "0")}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RESULTADOS: PROMOÇÕES */}
      {results.promotions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Tag size={20} /> Promoções
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.promotions.map(p => (
              <div key={p.id} onClick={() => navigate('/promotions')} className="cursor-pointer bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-2xl text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200">
                <h3 className="font-bold text-lg">{highlightTerm(p.titulo, query)}</h3>
                <div className="flex items-center gap-2 mt-2 text-indigo-100 text-sm font-medium">
                  Ver detalhes <ArrowRight size={16} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResults;