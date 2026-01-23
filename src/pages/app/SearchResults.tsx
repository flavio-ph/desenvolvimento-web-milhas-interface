import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, CreditCard, ShoppingBag, Tag, ArrowRight, Loader2, Globe } from 'lucide-react';
import { getCompras, getCartoes, getPromocoes, getProgramas } from '../../services/api';
import { Transaction, CreditCard as CardType, Promotion, LoyaltyProgram } from '../../types/types';

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

        // --- FILTROS CORRIGIDOS (PORTUGUÊS) ---
        
        // 1. Compras: usa 'descricao'
        const filteredTransactions = comprasData.filter(t => 
          t.descricao && t.descricao.toLowerCase().includes(term)
        );

        // 2. Cartões: usa 'nomePersonalizado' ou 'nomeBandeira'
        const filteredCards = cartoesData.filter(c => 
          (c.nomePersonalizado && c.nomePersonalizado.toLowerCase().includes(term)) || 
          (c.nomeBandeira && c.nomeBandeira.toLowerCase().includes(term))
        );

        // 3. Promoções: usa 'titulo' ou 'descricao'
        const filteredPromotions = promocoesData.filter(p => 
          (p.titulo && p.titulo.toLowerCase().includes(term)) || 
          (p.descricao && p.descricao.toLowerCase().includes(term))
        );

        // 4. Programas: usa 'nome'
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
    return (
      <div className="flex h-[50vh] items-center justify-center flex-col gap-4">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
        <p className="text-slate-500 font-medium">Buscando por "{query}"...</p>
      </div>
    );
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
              <div key={prog.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-slate-800 flex items-center justify-center text-indigo-600 font-bold">
                    {prog.nome.charAt(0)}
                </div>
                <div>
                    <p className="font-bold text-slate-800 dark:text-white">{prog.nome}</p>
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
            {results.cards.map(card => (
              <div key={card.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                {/* Campos corrigidos: nomePersonalizado e nomeBandeira */}
                <p className="font-bold text-slate-800 dark:text-white">{card.nomePersonalizado}</p>
                <p className="text-sm text-slate-500">{card.nomeBandeira} •••• {card.ultimosDigitos}</p>
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
             {results.transactions.map((t, idx) => (
               <div key={t.id} className={`p-4 flex items-center justify-between ${idx !== results.transactions.length -1 ? 'border-b border-slate-100 dark:border-slate-800' : ''}`}>
                 <div>
                   {/* Campos corrigidos: descricao e dataCompra */}
                   <p className="font-bold text-slate-900 dark:text-white">{t.descricao}</p>
                   <p className="text-xs text-slate-500">{t.dataCompra}</p>
                 </div>
                 {/* Campos corrigidos: valorGasto */}
                 <span className="font-bold text-indigo-600">R$ {t.valorGasto.toFixed(2)}</span>
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
               <div key={p.id} onClick={() => navigate('/promotions')} className="cursor-pointer bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-2xl text-white shadow-lg">
                 <h3 className="font-bold text-lg">{p.titulo}</h3>
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