import React from 'react';
import { CreditCard, Edit2, Trash2, Coins } from 'lucide-react';
import { CartaoResponse } from '../../../services/cartaoService';
import { useNavigate } from 'react-router-dom';

interface CardListProps {
    cards: CartaoResponse[];
    onOpenCreateForm: () => void;
    onEditCard: (card: CartaoResponse) => void;
    onDeleteCard: (id: number) => void;
    getCardStyle: (card: CartaoResponse) => React.CSSProperties;
}

export const CardList: React.FC<CardListProps> = ({
    cards,
    onOpenCreateForm,
    onEditCard,
    onDeleteCard,
    getCardStyle
}) => {
    const navigate = useNavigate();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
            {cards.length === 0 && (
                <div className="col-span-full text-center p-16 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                    <div className="w-20 h-20 mx-auto mb-5 flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl">
                        <CreditCard className="text-indigo-400 dark:text-indigo-500" size={40} />
                    </div>
                    <p className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-1">Nenhum cartão cadastrado</p>
                    <p className="text-slate-400 text-sm mb-5">Adicione seus cartões para começar a acumular pontos.</p>
                    <button
                        onClick={onOpenCreateForm}
                        className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none"
                    >
                        Adicionar primeiro cartão
                    </button>
                </div>
            )}

            {cards.map((card) => {
                const style = getCardStyle(card);
                return (
                    <div
                        key={card.id}
                        className="rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800"
                    >
                        <div
                            className="p-6 text-white card-shine relative"
                            style={style}
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-3">
                                    <svg width="36" height="26" viewBox="0 0 36 26" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-sm">
                                        <rect width="36" height="26" rx="4" fill="#D4A017" />
                                        <rect x="1" y="1" width="34" height="24" rx="3" fill="#F2BF2B" />
                                        <rect x="12" y="1" width="12" height="24" fill="#D4A017" opacity="0.5" />
                                        <rect x="1" y="8" width="34" height="10" fill="#D4A017" opacity="0.4" />
                                        <rect x="4" y="4" width="28" height="18" rx="2" fill="none" stroke="#C49A0A" strokeWidth="0.5" />
                                    </svg>
                                    <span className="text-sm font-bold uppercase tracking-wide">
                                        {card.nomeBandeira || 'VISA'}
                                    </span>
                                </div>

                                <div className="flex gap-1">
                                    <button
                                        onClick={() => onEditCard(card)}
                                        className="p-2 rounded-full hover:bg-white/20 text-white/80 transition-colors"
                                        title="Editar"
                                        aria-label={`Editar cartão ${card.nomePersonalizado}`}
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => onDeleteCard(card.id)}
                                        className="p-2 rounded-full hover:bg-white/20 text-white/80 transition-colors"
                                        title="Excluir"
                                        aria-label={`Excluir cartão ${card.nomePersonalizado}`}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="mb-6">
                                <div className="text-xl font-mono tracking-widest flex gap-3">
                                    <span className="opacity-80">••••</span>
                                    <span className="opacity-80">••••</span>
                                    <span className="opacity-80">••••</span>
                                    <span>{card.ultimosDigitos}</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-end text-xs text-white/80">
                                <div>
                                    <p className="uppercase text-[10px] opacity-80 mb-0.5">Apelido</p>
                                    <p className="font-bold text-sm truncate max-w-[150px]">{card.nomePersonalizado}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex justify-between items-center text-sm mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-md">
                                        <Coins size={14} className="text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <span className="text-slate-600 dark:text-slate-400 font-medium truncate max-w-[120px]">{card.nomeProgramaPontos || 'Sem Programa'}</span>
                                </div>
                                <span className="text-indigo-600 dark:text-indigo-400 font-bold text-xs bg-indigo-50 dark:bg-indigo-900/30 px-2.5 py-1 rounded-lg">
                                    {card.fatorConversao?.toFixed(1)} pts/$
                                </span>
                            </div>

                            <button
                                onClick={() => navigate(`/cards/${card.id}`)}
                                className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors border border-slate-100 dark:border-slate-700"
                            >
                                Ver Movimentações
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
