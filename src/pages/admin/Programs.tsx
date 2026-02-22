import React, { useState, useEffect } from 'react';
import { Globe, Plus, Trash2, ExternalLink, X, Check, Loader2, Link as LinkIcon, TrendingUp, ArrowLeft } from 'lucide-react';
import { getProgramas, createPrograma, deletePrograma } from '../../services/api';
import { LoyaltyProgram } from '../../types/types';
import { useToast } from '../../components/ToastContext';
import { ConfirmModal } from '../../components/ConfirmModal';

/* Paleta de cores para os avatares dos programas */
const CARD_COLORS = [
  { bg: 'bg-indigo-600', border: 'border-t-indigo-500', hex: '#4f46e5' },
  { bg: 'bg-pink-500', border: 'border-t-pink-400', hex: '#ec4899' },
  { bg: 'bg-orange-500', border: 'border-t-orange-400', hex: '#f97316' },
  { bg: 'bg-red-500', border: 'border-t-red-400', hex: '#ef4444' },
  { bg: 'bg-cyan-500', border: 'border-t-cyan-400', hex: '#06b6d4' },
  { bg: 'bg-violet-600', border: 'border-t-violet-500', hex: '#7c3aed' },
  { bg: 'bg-emerald-500', border: 'border-t-emerald-400', hex: '#10b981' },
  { bg: 'bg-amber-500', border: 'border-t-amber-400', hex: '#f59e0b' },
  { bg: 'bg-teal-500', border: 'border-t-teal-400', hex: '#14b8a6' },
  { bg: 'bg-rose-500', border: 'border-t-rose-400', hex: '#f43f5e' },
];

const getCardColor = (index: number) => CARD_COLORS[index % CARD_COLORS.length];

const AdminPrograms: React.FC = () => {
  const { addToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [programs, setPrograms] = useState<LoyaltyProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [programToDelete, setProgramToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({ nome: '', url: '' });

  const loadPrograms = async () => {
    try {
      setLoading(true);
      const data = await getProgramas();
      setPrograms(data || []);
    } catch (e) {
      addToast({ type: 'error', title: 'Erro ao carregar', description: 'Não foi possível listar os programas.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPrograms(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await createPrograma(formData);
      addToast({ type: 'success', title: 'Programa criado', description: 'Programa de fidelidade adicionado com sucesso!' });
      setShowForm(false);
      setFormData({ nome: '', url: '' });
      loadPrograms();
    } catch (error) {
      addToast({ type: 'error', title: 'Erro ao criar', description: 'Não foi possível criar o programa.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: number) => {
    setProgramToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!programToDelete) return;
    try {
      setIsDeleting(true);
      await deletePrograma(programToDelete);
      setPrograms(programs.filter(p => p.id !== programToDelete));
      addToast({ type: 'success', title: 'Programa removido', description: 'O programa foi excluído com sucesso.' });
    } catch (error) {
      addToast({ type: 'error', title: 'Erro ao remover', description: 'Não foi possível excluir o programa.' });
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setProgramToDelete(null);
    }
  };

  return (
    <>
      <div className="space-y-8 animate-fadeIn pb-10 max-w-7xl mx-auto py-4">

        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <Globe className="text-indigo-600 dark:text-indigo-400" />
              Programas de Fidelidade
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Gerencie os parceiros e regras de acúmulo de pontos.
            </p>
          </div>

          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none w-fit"
            >
              <Plus size={20} />
              Novo Programa
            </button>
          ) : (
            <button
              onClick={() => setShowForm(false)}
              className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm w-fit"
            >
              <ArrowLeft size={20} /> Voltar à Lista
            </button>
          )}
        </div>

        {/* ── Formulário Embutido ── */}
        {showForm && (
          <div className="bg-white dark:bg-slate-900 w-full rounded-[32px] shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden grid grid-cols-1 lg:grid-cols-2 animate-scaleIn">

            {/* Esquerda: formulário */}
            <div className="p-8 md:p-10 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                  <Plus className="text-indigo-600" />
                  Novo Programa
                </h2>
                <button onClick={() => setShowForm(false)} className="lg:hidden p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-50 dark:bg-slate-800 rounded-full">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
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
                    onClick={() => setShowForm(false)}
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
        )}

        {/* ── Grid de Programas (Oculto se formulário estiver aberto) ── */}
        {!showForm && (
          loading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="animate-spin text-indigo-600" size={32} />
            </div>
          ) : (
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
                        <span className="text-2xl font-black text-slate-900 dark:text-white">0M</span>
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
                          href={program.url || '#'}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
                          title="Visitar site"
                        >
                          <ExternalLink size={14} />
                        </a>
                        <button
                          onClick={() => handleDelete(program.id)}
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
                onClick={() => setShowForm(true)}
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
          )
        )}
      </div>

      {/* Modal de Confirmação */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Excluir Programa"
        description="Tem certeza que deseja remover este programa de fidelidade? Esta ação pode afetar promoções vinculadas."
        confirmText="Sim, excluir"
        cancelText="Cancelar"
        isLoading={isDeleting}
        variant="danger"
      />
    </>
  );
};

export default AdminPrograms;