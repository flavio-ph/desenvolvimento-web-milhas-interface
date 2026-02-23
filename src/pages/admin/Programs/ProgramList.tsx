import React from 'react';
import { Loader2, TrendingUp, ExternalLink, Trash2, Plus } from 'lucide-react';
import { LoyaltyProgram } from '../../../types/types';

interface ProgramListProps {
    programs: LoyaltyProgram[];
    loading: boolean;
    onOpenCreateForm: () => void;
    onDelete: (id: number) => void;
    getCardColor: (index: number) => { bg: string; border: string; hex: string; };
}

export const ProgramList: React.FC<ProgramListProps> = ({
    programs,
    loading,
    onOpenCreateForm,
    onDelete,
    getCardColor
}) => {
    if (loading) {
        return (
            <div className="flex justify-center py-24">
                <Loader2 className="animate-spin text-indigo-600" size={32} />
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {programs.map((program, index) => {
                const color = getCardColor(index);
                const initial = program.nome.charAt(0).toUpperCase();

                return (
                    <div
                        key={program.id}
                        className={`group bg-white dark:bg-slate-900 rounded-2xl border-t-2 ${color.border} border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col overflow-hidden`}
                    >
                        {/* Corpo */}
                        <div className="p-4 flex-1">
                            {/* Avatar */}
                            <div className={`w-10 h-10 rounded-xl ${color.bg} flex items-center justify-center text-white font-black text-lg shadow-md mb-3`}>
                                {initial}
                            </div>
                            {/* Nome */}
                            <p className="font-bold text-slate-800 dark:text-white text-base leading-tight truncate" title={program.nome}>{program.nome}</p>
                            <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">
                                Total na Plataforma
                            </p>
                            {/* Stat */}
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-2xl font-black text-slate-900 dark:text-white">{(program as any)?.saldoTotal ? ((program as any)?.saldoTotal).toLocaleString('pt-br') : "0"}</span>
                                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 px-1.5 py-0.5 rounded-full">
                                    <TrendingUp size={10} />
                                    +8%
                                </span>
                            </div>
                        </div>

                        {/* Rodapé */}
                        <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-2.5 flex items-center justify-between">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Ações</span>
                            <div className="flex items-center gap-1">
                                <a
                                    href={(program as any).url || '#'}
                                    target="_blank"
                                    rel="noreferrer"
                                    aria-label={`Visitar site oficial do ${program.nome}`}
                                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
                                    title="Visitar site"
                                >
                                    <ExternalLink size={14} />
                                </a>
                                <button
                                    onClick={() => onDelete(program.id)}
                                    aria-label={`Excluir programa ${program.nome}`}
                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all"
                                    title="Excluir"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}

            {/* Card Adicionar */}
            <button
                onClick={onOpenCreateForm}
                className="group bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-all duration-300 flex flex-col items-center justify-center gap-3 min-h-[160px] p-6"
            >
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 flex items-center justify-center transition-colors">
                    <Plus size={22} className="text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                </div>
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 uppercase tracking-widest transition-colors">
                    Adicionar Parceiro
                </span>
            </button>

        </div>
    );
};
