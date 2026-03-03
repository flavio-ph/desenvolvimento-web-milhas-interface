import React from 'react';
import { Plus, Pencil, X, Check, CreditCard, Eye, Trash2 } from 'lucide-react';

interface ColorObj {
    name: string;
    class: string;
    hex: string;
}

interface BrandFormProps {
    newBrand: {
        nome: string;
        status: string;
        colorObj: ColorObj;
    };
    setNewBrand: React.Dispatch<React.SetStateAction<any>>;
    editingId: number | null;
    presetColors: ColorObj[];
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
}

export const BrandForm: React.FC<BrandFormProps> = ({
    newBrand,
    setNewBrand,
    editingId,
    presetColors,
    onClose,
    onSubmit
}) => {
    return (
        <div className="bg-white dark:bg-slate-900 w-full rounded-[32px] shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden grid grid-cols-1 lg:grid-cols-2 animate-scaleIn">
            {/* ESQUERDA - Formulário */}
            <div className="p-8 md:p-10 space-y-8">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                        {editingId ? <Pencil className="text-indigo-600" /> : <Plus className="text-indigo-600" />}
                        {editingId ? 'Editar Bandeira' : 'Nova Bandeira'}
                    </h2>
                    <button onClick={onClose} aria-label="Fechar formulário" className="lg:hidden p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-50 dark:bg-slate-800 rounded-full">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={onSubmit} className="space-y-8">
                    <div>
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                            Nome da Bandeira
                        </label>
                        <input
                            value={newBrand.nome}
                            onChange={e => setNewBrand({ ...newBrand, nome: e.target.value })}
                            placeholder="Ex: Elo, Diners Club, etc"
                            className="mt-2 w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            required
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                            Cor de Identidade
                        </label>
                        <div className="flex flex-wrap gap-3 mt-3">
                            {presetColors.map(c => (
                                <button
                                    type="button"
                                    key={c.name}
                                    onClick={() => setNewBrand({ ...newBrand, colorObj: c })}
                                    className={`w-10 h-10 rounded-xl ${c.class} flex items-center justify-center transition-all ${newBrand.colorObj.name === c.name ? 'ring-4 ring-indigo-500 scale-110 shadow-md' : 'hover:scale-105'
                                        }`}
                                >
                                    {newBrand.colorObj.name === c.name && <Check className="text-white" size={16} />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                            Status Inicial
                        </label>
                        <div className="flex gap-4 mt-3">
                            <button
                                type="button"
                                onClick={() => setNewBrand({ ...newBrand, status: 'ACTIVE' })}
                                className={`flex-1 py-3 rounded-xl font-bold transition-colors text-sm ${newBrand.status === 'ACTIVE'
                                    ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                    : 'bg-slate-50 text-slate-400 dark:bg-slate-800 dark:text-slate-500 border border-transparent hover:bg-slate-100 dark:hover:bg-slate-700'
                                    }`}
                            >
                                Ativa
                            </button>
                            <button
                                type="button"
                                onClick={() => setNewBrand({ ...newBrand, status: 'INACTIVE' })}
                                className={`flex-1 py-3 rounded-xl font-bold transition-colors text-sm ${newBrand.status === 'INACTIVE'
                                    ? 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                                    : 'bg-slate-50 text-slate-400 dark:bg-slate-800 dark:text-slate-500 border border-transparent hover:bg-slate-100 dark:hover:bg-slate-700'
                                    }`}
                            >
                                Inativa
                            </button>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-1/3 py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-2xl transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="w-2/3 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
                        >
                            {editingId ? 'Salvar Alterações' : 'Cadastrar Bandeira'}
                        </button>
                    </div>
                </form>
            </div>

            {/* DIREITA – Preview */}
            <div className="bg-slate-50 dark:bg-slate-950 p-8 md:p-10 flex flex-col items-center justify-center gap-8 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 relative">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, gray 1px, transparent 0)', backgroundSize: '24px 24px' }} />

                <div className="flex flex-col items-center gap-2 text-slate-400 uppercase text-[10px] font-black tracking-widest z-10 mb-2">
                    <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow flex items-center justify-center text-slate-400">
                        <Eye size={18} />
                    </div>
                    Preview do Card
                </div>

                {/* Card preview simulando o Grid */}
                <div className="w-full max-w-[280px] group bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col relative text-left z-10 transition-transform duration-300 hover:scale-[1.02]">
                    {/* Header / Color Strip */}
                    <div className={`h-16 w-full ${newBrand.colorObj.class} opacity-90 relative overflow-hidden flex items-center justify-center`}>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                        <span className="text-white/20 text-5xl font-black absolute -bottom-4 right-0 select-none">
                            {newBrand.nome ? newBrand.nome.substring(0, 3).toUpperCase() : 'BND'}
                        </span>
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-4 left-4 z-10">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase shadow-sm ${newBrand.status === 'ACTIVE'
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-500 text-white'
                            }`}>
                            {newBrand.status === 'ACTIVE' ? <Check size={10} strokeWidth={3} /> : <X size={10} strokeWidth={3} />}
                            {newBrand.status === 'ACTIVE' ? 'Ativa' : 'Inativa'}
                        </span>
                    </div>

                    {/* Content Area */}
                    <div className="p-6 flex flex-col items-center text-center flex-1">
                        <h3 className="font-black text-xl text-slate-800 dark:text-white mb-6 line-clamp-1">
                            {newBrand.nome || 'Bandeira'}
                        </h3>

                        {/* Metrics Box */}
                        <div className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 mb-6 border border-slate-100 dark:border-slate-700/50 flex flex-col items-center justify-center">
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full mb-2">
                                <CreditCard size={20} />
                            </div>
                            <span className="text-2xl font-black text-slate-800 dark:text-white leading-none mb-1">
                                0
                            </span>
                            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                                Cartões Vinculados
                            </p>
                        </div>

                        {/* Fake Action Buttons Row */}
                        <div className="w-full flex justify-center gap-3 mt-auto">
                            <div className="flex-1 max-w-[120px] flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-50 text-slate-400 dark:bg-slate-800 rounded-xl shadow-sm text-xs font-bold">
                                <Pencil size={16} /> Editar
                            </div>
                            <div className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 dark:bg-slate-800 rounded-xl shadow-sm shrink-0">
                                <Trash2 size={18} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
