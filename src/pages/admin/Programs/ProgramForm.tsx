import React from 'react';
import { Plus, X, Globe, Link as LinkIcon, Loader2, Check, TrendingUp, ExternalLink, Trash2 } from 'lucide-react';

interface ProgramFormProps {
    formData: {
        nome: string;
        url: string;
    };
    setFormData: React.Dispatch<React.SetStateAction<{ nome: string; url: string }>>;
    isSubmitting: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
}

export const ProgramForm: React.FC<ProgramFormProps> = ({
    formData,
    setFormData,
    isSubmitting,
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
                        Novo Programa
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
                            Cadastrar Programa
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
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-8">Como aparecerá no App</h4>

                    {/* Mini card preview */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden transform hover:scale-105 transition-transform duration-300 text-left">
                        <div className="h-1 bg-gradient-to-r from-indigo-500 to-violet-500" />
                        <div className="p-5">
                            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-lg shadow mb-3 transition-colors">
                                {formData.nome ? formData.nome.charAt(0).toUpperCase() : '?'}
                            </div>
                            <p className="font-bold text-slate-800 dark:text-white truncate">{formData.nome || 'Nome do Programa'}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Total na Plataforma</p>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-2xl font-black text-slate-900 dark:text-white">0M</span>
                                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded-full">
                                    <TrendingUp size={10} />+8%
                                </span>
                            </div>
                        </div>
                        <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-2.5 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Ações</span>
                            <div className="flex gap-1">
                                <div className="p-1.5 text-slate-300 dark:text-slate-600 rounded-lg"><ExternalLink size={14} /></div>
                                <div className="p-1.5 text-slate-300 dark:text-slate-600 rounded-lg"><Trash2 size={14} /></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
