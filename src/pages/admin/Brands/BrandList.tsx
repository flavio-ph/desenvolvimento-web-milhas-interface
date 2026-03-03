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
        <div className="animate-fadeIn">
            <div className="max-h-[600px] overflow-y-auto overflow-x-hidden custom-scrollbar pr-2 pb-4">
                {isLoading ? (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-20 flex justify-center border border-slate-100 dark:border-slate-800">
                        <Loader2 className="animate-spin text-indigo-600 dark:text-indigo-400" size={32} />
                    </div>
                ) : brands.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {brands.map((brand) => (
                            <div
                                key={brand.id}
                                className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col relative"
                            >
                                {/* Header / Color Strip */}
                                <div className={`h-16 w-full ${brand.cor} opacity-90 relative overflow-hidden flex items-center justify-center`}>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                    <span className="text-white/20 text-5xl font-black absolute -bottom-4 right-0 select-none">
                                        {brand.nome.substring(0, 3).toUpperCase()}
                                    </span>
                                </div>

                                {/* Status Badge (Floating) */}
                                <div className="absolute top-4 left-4 z-10">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase shadow-sm ${brand.status === 'ACTIVE'
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-slate-500 text-white'
                                        }`}>
                                        {brand.status === 'ACTIVE' ? <CheckCircle size={10} /> : <XCircle size={10} />}
                                        {brand.status === 'ACTIVE' ? 'Ativa' : 'Inativa'}
                                    </span>
                                </div>

                                {/* Content Area */}
                                <div className="p-6 flex flex-col items-center text-center flex-1">
                                    <h3 className="font-black text-xl text-slate-800 dark:text-white mb-6 line-clamp-1">
                                        {brand.nome}
                                    </h3>

                                    {/* Metrics Box */}
                                    <div className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 mb-6 border border-slate-100 dark:border-slate-700/50 flex flex-col items-center justify-center">
                                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full mb-2">
                                            <CreditCard size={20} />
                                        </div>
                                        <span className="text-2xl font-black text-slate-800 dark:text-white leading-none mb-1">
                                            {brand.cards || 0}
                                        </span>
                                        <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                                            Cartões Vinculados
                                        </p>
                                    </div>

                                    {/* Action Buttons Row */}
                                    <div className="w-full flex justify-center gap-3 mt-auto">
                                        <button
                                            onClick={() => onEdit(brand)}
                                            className="flex-1 max-w-[120px] flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 dark:bg-slate-800 dark:hover:bg-indigo-900/30 dark:text-slate-400 dark:hover:text-indigo-400 rounded-xl transition-all shadow-sm font-bold text-xs"
                                            title="Editar Bandeira"
                                        >
                                            <Pencil size={16} /> Editar
                                        </button>
                                        <button
                                            onClick={() => onDelete(brand.id!)}
                                            className="w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 dark:bg-slate-800 dark:hover:bg-rose-900/30 dark:hover:text-rose-400 rounded-xl transition-all shadow-sm shrink-0"
                                            title="Excluir Bandeira"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-16 flex flex-col items-center justify-center text-center shadow-sm">
                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                            <CreditCard size={32} className="text-slate-400 dark:text-slate-500" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Nenhuma bandeira encontrada</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                            Você não possui bandeiras cadastradas. Cadastre novas bandeiras para vinculá-las aos seus cartões.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
