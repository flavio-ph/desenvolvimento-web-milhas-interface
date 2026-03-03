import React from 'react';
import { Plus, X, Globe, Link as LinkIcon, Loader2, Check, TrendingUp, ExternalLink, Trash2, Pencil } from 'lucide-react';

interface ProgramFormProps {
    formData: {
        nome: string;
        url: string;
    };
    setFormData: React.Dispatch<React.SetStateAction<{ nome: string; url: string }>>;
    isSubmitting: boolean;
    editingId?: number | null;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
}

export const ProgramForm: React.FC<ProgramFormProps> = ({
    formData,
    setFormData,
    isSubmitting,
    editingId,
    onClose,
    onSubmit
}) => {
    return (
        <div className="bg-white dark:bg-slate-900 w-full rounded-[32px] shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden grid grid-cols-1 lg:grid-cols-2 animate-scaleIn">
            {/* Esquerda: formulário */}
            <div className="p-8 md:p-10 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                        <Plus className="text-indigo-600" />
                        {editingId ? 'Editar Programa' : 'Novo Programa'}
                    </h2>
                    <button onClick={onClose} aria-label="Fechar formulário" className="lg:hidden p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-50 dark:bg-slate-800 rounded-full">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={onSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Nome do Programa</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={formData.nome}
                                onChange={e => setFormData({ ...formData, nome: e.target.value })}
                                className="w-full px-5 py-4 pl-12 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white text-base"
                                placeholder="Ex: Livelo"
                                required
                            />
                            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">URL do Site Oficial</label>
                        <div className="relative">
                            <input
                                type="url"
                                value={formData.url}
                                onChange={e => setFormData({ ...formData, url: e.target.value })}
                                className="w-full px-5 py-4 pl-12 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white text-base"
                                placeholder="https://www.livelo.com.br"
                                required
                            />
                            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
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
                            disabled={isSubmitting}
                            className="w-2/3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" /> : <Check size={20} />}
                            {editingId ? 'Salvar Alterações' : 'Cadastrar Programa'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Direita: preview */}
            <div className="bg-slate-50 dark:bg-slate-950 p-8 md:p-10 flex flex-col items-center justify-center relative overflow-hidden">
                <div
                    className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, gray 1px, transparent 0)', backgroundSize: '24px 24px' }}
                />

                <div className="relative w-full max-w-xs text-center z-10">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-6 text-center">Preview no App</h4>

                    {/* Card Preview */}
                    <div className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col relative text-left transition-transform duration-300 hover:scale-[1.02]">
                        {/* Top Area with Colored Gradient Background */}
                        <div className="h-24 w-full bg-indigo-600 opacity-90 relative overflow-hidden flex items-center justify-center">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                            <span className="text-white/20 text-7xl font-black absolute -top-2 -right-2 select-none">
                                {formData.nome ? formData.nome.charAt(0).toUpperCase() : '?'}
                            </span>
                        </div>

                        {/* Avatar overlapping the split */}
                        <div className="flex justify-center -mt-10 relative z-10">
                            <div className="w-20 h-20 rounded-2xl bg-indigo-600 flex items-center justify-center text-3xl text-white font-black shadow-lg shadow-indigo-600/40 ring-4 ring-white dark:ring-slate-900 rotate-3 group-hover:rotate-0 transition-transform duration-300">
                                {formData.nome ? formData.nome.charAt(0).toUpperCase() : '?'}
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="p-6 pt-5 flex flex-col items-center text-center flex-1">
                            <h3 className="font-black text-xl text-slate-800 dark:text-white mb-4 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                                {formData.nome || 'Nome do Programa'}
                            </h3>

                            {/* Metrics Box */}
                            <div className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 mb-4 border border-slate-100 dark:border-slate-700/50">
                                <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">
                                    Saldo Global
                                </p>
                                <div className="flex items-center justify-center gap-2">
                                    <span className="text-2xl font-black text-slate-800 dark:text-white">
                                        0
                                    </span>
                                </div>
                                <div className="mt-2 flex justify-center">
                                    <span className="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                                        <TrendingUp size={12} /> Novo Parceiro
                                    </span>
                                </div>
                            </div>

                            {/* Action Buttons Row */}
                            <div className="w-full flex justify-center gap-3 mt-auto pt-2">
                                <button className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 dark:bg-slate-800 rounded-xl shadow-sm">
                                    <ExternalLink size={18} />
                                </button>
                                <button className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 dark:bg-slate-800 rounded-xl shadow-sm">
                                    <Pencil size={18} />
                                </button>
                                <button className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 dark:bg-slate-800 rounded-xl shadow-sm">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
