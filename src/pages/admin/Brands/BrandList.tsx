import React from 'react';
import { CheckCircle, XCircle, CreditCard, Pencil, Trash2, Loader2 } from 'lucide-react';

interface Bandeira {
    id?: number;
    nome: string;
    status: string;
    cor: string;
    cards?: number;
}

interface BrandListProps {
    brands: Bandeira[];
    isLoading: boolean;
    onEdit: (brand: Bandeira) => void;
    onDelete: (id: number) => void;
}

export const BrandList: React.FC<BrandListProps> = ({
    brands,
    isLoading,
    onEdit,
    onDelete
}) => {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm transition-colors animate-fadeIn">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-left">Bandeira</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center">Cartões</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {isLoading ? (
                            <tr><td colSpan={4} className="text-center py-20"><div className="flex justify-center"><Loader2 className="animate-spin text-indigo-600" /></div></td></tr>
                        ) : brands.length > 0 ? (
                            brands.map((brand) => (
                                <tr key={brand.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-6 rounded ${brand.cor} flex items-center justify-center text-[8px] text-white font-bold shadow-sm`}>
                                                {brand.nome.substring(0, 4).toUpperCase()}
                                            </div>
                                            <span className="font-bold text-slate-900 dark:text-white">{brand.nome}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <div className="flex justify-center">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase ${brand.status === 'ACTIVE'
                                                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                                                }`}>
                                                {brand.status === 'ACTIVE' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                                                {brand.status === 'ACTIVE' ? 'Ativa' : 'Inativa'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <div className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400">
                                            <CreditCard size={16} />
                                            <span className="text-sm font-bold">{brand.cards}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() => onEdit(brand)}
                                                aria-label="Editar"
                                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:text-indigo-400 dark:hover:bg-indigo-900/30 rounded-lg transition-all"
                                                title="Editar"
                                            >
                                                <Pencil size={18} />
                                            </button>
                                            <button
                                                onClick={() => onDelete(brand.id!)}
                                                aria-label="Excluir"
                                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:text-rose-400 dark:hover:bg-rose-900/30 rounded-lg transition-all"
                                                title="Excluir"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="px-6 py-20 text-center text-slate-500 dark:text-slate-400">
                                    Nenhuma bandeira cadastrada.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
