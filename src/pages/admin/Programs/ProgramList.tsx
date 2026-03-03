import React from 'react';
import { Loader2, TrendingUp, ExternalLink, Trash2, Plus, Pencil } from 'lucide-react';
import { LoyaltyProgram } from '../../../types/types';

interface ProgramListProps {
    programs: LoyaltyProgram[];
    loading: boolean;
    onOpenCreateForm: () => void;
    onEdit: (program: LoyaltyProgram) => void;
    onDelete: (id: number) => void;
    getCardColor: (index: number) => { bg: string; border: string; hex: string; };
}

export const ProgramList: React.FC<ProgramListProps> = ({
    programs,
    loading,
    onOpenCreateForm,
    onEdit,
    onDelete,
    getCardColor
}) => {
    return (
        <div className="animate-fadeIn">
            <div className="max-h-[600px] overflow-y-auto overflow-x-hidden custom-scrollbar pr-2 pb-4">
                {loading ? (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-20 flex justify-center border border-slate-100 dark:border-slate-800">
                        <Loader2 className="animate-spin text-indigo-600" size={32} />
                    </div>
                ) : programs.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {programs.map((program, index) => {
                            const color = getCardColor(index);
                            const initial = program.nome.charAt(0).toUpperCase();

                            return (
                                <div
                                    key={program.id}
                                    className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden flex flex-col relative"
                                >
                                    {/* Top Area with Colored Gradient Background */}
                                    <div className={`h-24 w-full ${color.bg} opacity-90 relative overflow-hidden flex items-center justify-center`}>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                        <span className="text-white/20 text-7xl font-black absolute -top-2 -right-2 select-none">
                                            {initial}
                                        </span>
                                    </div>

                                    {/* Avatar overlapping the split */}
                                    <div className="flex justify-center -mt-10 relative z-10">
                                        <div className={`w-20 h-20 rounded-2xl ${color.bg} flex items-center justify-center text-3xl text-white font-black shadow-lg shadow-${color.hex}/40 ring-4 ring-white dark:ring-slate-900 rotate-3 group-hover:rotate-0 transition-transform duration-300`}>
                                            {initial}
                                        </div>
                                    </div>

                                    {/* Content Area */}
                                    <div className="p-6 pt-5 flex flex-col items-center text-center flex-1">
                                        <h3 className="font-black text-xl text-slate-800 dark:text-white mb-4 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                                            {program.nome}
                                        </h3>

                                        {/* Metrics Box */}
                                        <div className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 mb-4 border border-slate-100 dark:border-slate-700/50">
                                            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">
                                                Saldo Global
                                            </p>
                                            <div className="flex items-center justify-center gap-2">
                                                <span className="text-2xl font-black text-slate-800 dark:text-white">
                                                    {(program as any)?.saldoTotal ? ((program as any)?.saldoTotal).toLocaleString('pt-br') : "0"}
                                                </span>
                                            </div>
                                            <div className="mt-2 flex justify-center">
                                                <span className="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                                                    <TrendingUp size={12} /> +8% este mês
                                                </span>
                                            </div>
                                        </div>

                                        {/* Action Buttons Row */}
                                        <div className="w-full flex justify-center gap-3 mt-auto pt-2">
                                            <a
                                                href={(program as any).url || '#'}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 dark:bg-slate-800 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400 rounded-xl transition-all shadow-sm"
                                                title={`Visitar ${program.nome}`}
                                            >
                                                <ExternalLink size={18} />
                                            </a>
                                            <button
                                                onClick={() => onEdit(program)}
                                                className="w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-amber-50 text-slate-400 hover:text-amber-600 dark:bg-slate-800 dark:hover:bg-amber-900/30 dark:hover:text-amber-400 rounded-xl transition-all shadow-sm"
                                                title="Editar Programa"
                                            >
                                                <Pencil size={18} />
                                            </button>
                                            <button
                                                onClick={() => onDelete(program.id)}
                                                className="w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 dark:bg-slate-800 dark:hover:bg-rose-900/30 dark:hover:text-rose-400 rounded-xl transition-all shadow-sm"
                                                title="Excluir Programa"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-16 flex flex-col items-center justify-center text-center shadow-sm">
                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                            <Plus size={32} className="text-slate-400 dark:text-slate-500" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Nenhum programa cadastrado</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">
                            Adicione os programas de fidelidade que você usará para acumular milhas.
                        </p>
                        <button
                            onClick={onOpenCreateForm}
                            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none"
                        >
                            <Plus size={20} /> Adicionar Parceiro
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
