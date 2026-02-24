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
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm transition-colors animate-fadeIn">

            <div className="max-h-[520px] overflow-y-auto overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                <table className="w-full relative">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-10">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-left bg-slate-50 dark:bg-slate-800">Programa</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center bg-slate-50 dark:bg-slate-800">Total na Plataforma</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center bg-slate-50 dark:bg-slate-800">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {loading ? (
                            <tr><td colSpan={3} className="text-center py-20"><div className="flex justify-center"><Loader2 className="animate-spin text-indigo-600" /></div></td></tr>
                        ) : programs.length > 0 ? (
                            programs.map((program, index) => {
                                const color = getCardColor(index);
                                const initial = program.nome.charAt(0).toUpperCase();

                                return (
                                    <tr key={program.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-lg ${color.bg} flex items-center justify-center text-xs text-white font-bold shadow-sm`}>
                                                    {initial}
                                                </div>
                                                <span className="font-bold text-slate-900 dark:text-white">{program.nome}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex justify-center flex-col items-center gap-1">
                                                <span className="text-sm font-bold text-slate-900 dark:text-white">{(program as any)?.saldoTotal ? ((program as any)?.saldoTotal).toLocaleString('pt-br') : "0"}</span>
                                                <span className="inline-flex items-center justify-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                                                    <TrendingUp size={10} />
                                                    +8%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <div className="flex justify-center gap-2">
                                                <a
                                                    href={(program as any).url || '#'}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    aria-label={`Visitar site oficial do ${program.nome}`}
                                                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:text-indigo-400 dark:hover:bg-indigo-900/30 rounded-lg transition-all"
                                                    title="Visitar site"
                                                >
                                                    <ExternalLink size={18} />
                                                </a>
                                                <button
                                                    onClick={() => onEdit(program)}
                                                    aria-label={`Editar programa ${program.nome}`}
                                                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:text-indigo-400 dark:hover:bg-indigo-900/30 rounded-lg transition-all"
                                                    title="Editar"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                <button
                                                    onClick={() => onDelete(program.id)}
                                                    aria-label={`Excluir programa ${program.nome}`}
                                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:text-rose-400 dark:hover:bg-rose-900/30 rounded-lg transition-all"
                                                    title="Excluir"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={3} className="px-6 py-20 text-center text-slate-500 dark:text-slate-400">
                                    Nenhum parceiro adicionado.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
