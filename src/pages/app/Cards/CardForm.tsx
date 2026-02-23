import React from 'react';
import { X, Check, CreditCard, Coins, Edit2, Plus } from 'lucide-react';
import { BandeiraResponse } from '../../../services/bandeiraService';
import { ProgramaResponse } from '../../../services/programaService';
import { CartaoPayload } from '../../../services/cartaoService';

// Extract this utility to a common place later if needed or just keep here for now
const adjustColor = (color: string, amount: number) => {
    return '#' + color.replace(/^#/, '').replace(/../g, color => ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
};

interface CardFormProps {
    formData: {
        nomePersonalizado: string;
        ultimosDigitos: string;
        fatorConversao: string;
        bandeiraId: string;
        programaPontosId: string;
    };
    setFormData: React.Dispatch<React.SetStateAction<any>>;
    selectedColor: string;
    setSelectedColor: React.Dispatch<React.SetStateAction<string>>;
    editingCardId: number | null;
    bandeiras: BandeiraResponse[];
    programas: ProgramaResponse[];
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    cardColors: string[];
}

export const CardForm: React.FC<CardFormProps> = ({
    formData,
    setFormData,
    selectedColor,
    setSelectedColor,
    editingCardId,
    bandeiras,
    programas,
    onClose,
    onSubmit,
    cardColors
}) => {
    return (
        <div className="bg-white dark:bg-slate-900 w-full rounded-[32px] shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden grid grid-cols-1 lg:grid-cols-2 animate-scaleIn">
            {/* ESQUERDA - Formulário */}
            <div className="p-8 md:p-10 flex flex-col justify-center">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                        {editingCardId ? <Edit2 className="text-indigo-600" /> : <Plus className="text-indigo-600" />}
                        {editingCardId ? 'Editar Cartão' : 'Novo Cartão'}
                    </h2>
                    <button onClick={onClose} aria-label="Fechar formulário" className="lg:hidden p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-50 dark:bg-slate-800 rounded-full">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={onSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-500 dark:text-slate-400 uppercase mb-3">Cor do Cartão</label>
                        <div className="flex flex-wrap gap-3">
                            {cardColors.map(color => (
                                <button
                                    key={color}
                                    type="button"
                                    aria-label={`Selecionar cor ${color}`}
                                    onClick={() => setSelectedColor(color)}
                                    style={{ backgroundColor: color }}
                                    className={`w-10 h-10 rounded-xl transition-all flex items-center justify-center shadow-sm ${selectedColor === color
                                        ? 'ring-4 ring-indigo-500 scale-110 shadow-md'
                                        : 'hover:scale-105 border-2 border-transparent'
                                        }`}
                                >
                                    {selectedColor === color && <Check size={16} className="text-white drop-shadow-md" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Apelido do Cartão</label>
                            <input
                                type="text"
                                value={formData.nomePersonalizado}
                                onChange={e => setFormData({ ...formData, nomePersonalizado: e.target.value })}
                                className="w-full px-5 py-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                placeholder="Ex: Nubank Principal"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Últimos 4 dígitos</label>
                                <input
                                    type="text"
                                    maxLength={4}
                                    minLength={4}
                                    value={formData.ultimosDigitos}
                                    onChange={e => setFormData({ ...formData, ultimosDigitos: e.target.value.replace(/\D/g, '') })}
                                    className={`w-full px-5 py-4 rounded-2xl border bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-center tracking-widest font-mono ${formData.ultimosDigitos.length > 0 && formData.ultimosDigitos.length < 4
                                        ? 'border-amber-400 dark:border-amber-600'
                                        : 'border-slate-100 dark:border-slate-800'
                                        }`}
                                    placeholder="0000"
                                    required
                                />
                                {formData.ultimosDigitos.length > 0 && formData.ultimosDigitos.length < 4 && (
                                    <p className="text-xs text-amber-500 mt-1">Informe os 4 dígitos</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Pontos por $</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    value={formData.fatorConversao}
                                    onChange={e => setFormData({ ...formData, fatorConversao: e.target.value })}
                                    className="w-full px-5 py-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    placeholder="Ex: 2.5"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Bandeira</label>
                            <div className="relative">
                                <select
                                    value={formData.bandeiraId}
                                    onChange={e => setFormData({ ...formData, bandeiraId: e.target.value })}
                                    className="w-full px-5 py-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none"
                                    required
                                >
                                    <option value="">Selecione...</option>
                                    {bandeiras.map(b => (
                                        <option key={b.id} value={b.id}>{b.nome}</option>
                                    ))}
                                </select>
                                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Programa de Pontos</label>
                            <div className="relative">
                                <select
                                    value={formData.programaPontosId}
                                    onChange={e => setFormData({ ...formData, programaPontosId: e.target.value })}
                                    className="w-full px-5 py-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none"
                                    required
                                >
                                    <option value="">Selecione...</option>
                                    {programas.map(p => (
                                        <option key={p.id} value={p.id}>{p.nome}</option>
                                    ))}
                                </select>
                                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                            </div>
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
                            className="w-2/3 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-2"
                        >
                            <Check size={20} />
                            {editingCardId ? 'Salvar Alterações' : 'Cadastrar Cartão'}
                        </button>
                    </div>
                </form>
            </div>

            {/* DIREITA - Preview */}
            <div className="bg-slate-50 dark:bg-slate-950 p-8 md:p-10 flex flex-col items-center justify-center border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, gray 1px, transparent 0)',
                    backgroundSize: '24px 24px'
                }}></div>

                <div className="relative w-full max-w-sm z-10">
                    <div className="flex flex-col items-center gap-2 text-slate-400 uppercase text-xs font-bold mb-8">
                        <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow flex items-center justify-center">
                            <CreditCard size={18} />
                        </div>
                        Visualização
                    </div>

                    {/* Cartão Preview */}
                    <div
                        className="relative w-full aspect-[1.586/1] rounded-[24px] p-6 text-white shadow-2xl transition-all duration-500 transform hover:scale-105 flex flex-col justify-between"
                        style={{
                            background: `linear-gradient(135deg, ${selectedColor} 0%, ${adjustColor(selectedColor, -40)} 100%)`,
                        }}
                    >
                        <div className="flex justify-between items-start">
                            <div className="w-12 h-8 bg-white/20 backdrop-blur-sm rounded-md flex items-center justify-center text-[10px] text-white/80 border border-white/10">Chip</div>
                            <span className="text-sm font-bold text-white/90 tracking-wide uppercase">
                                {bandeiras.find(b => b.id.toString() === formData.bandeiraId)?.nome || 'Bandeira'}
                            </span>
                        </div>

                        <div className="space-y-4">
                            <div className="text-xl font-bold tracking-wide drop-shadow-md">
                                {formData.nomePersonalizado || 'Nome do Cartão'}
                            </div>
                            <div className="flex justify-between items-end">
                                <div className="font-mono text-white/80 text-base tracking-widest">
                                    •••• •••• •••• {formData.ultimosDigitos || '0000'}
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-white/20 flex justify-between items-center text-xs text-white/70">
                            <span className="truncate pr-2">
                                {programas.find(p => p.id.toString() === formData.programaPontosId)?.nome || 'Programa de Pontos'}
                            </span>
                            <div className="flex items-center gap-1 font-bold text-white shrink-0 bg-black/20 px-2 py-1 rounded-lg">
                                <Coins size={12} />
                                {formData.fatorConversao || '0.0'} pts/$
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
