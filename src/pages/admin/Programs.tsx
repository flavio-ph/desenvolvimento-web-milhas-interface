import React, { useState, useEffect } from 'react';
import { Globe, Plus, ArrowLeft } from 'lucide-react';
import { programaService } from '../../services/programaService';
import { LoyaltyProgram } from '../../types/types';
import { isAxiosError } from 'axios';
import { useToast } from '../../components/ToastContext';
import { ConfirmModal } from '../../components/ConfirmModal';
import { ProgramForm } from './Programs/ProgramForm';
import { ProgramList } from './Programs/ProgramList';

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
  const [editingId, setEditingId] = useState<number | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [programToDelete, setProgramToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({ nome: '', url: '' });

  const loadPrograms = async () => {
    try {
      setLoading(true);
      const data = await programaService.listarProgramas();
      // map explicitly based on expected types
      setPrograms(data as LoyaltyProgram[] || []);
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
      if (editingId) {
        await programaService.atualizarPrograma(editingId, { nome: formData.nome, url: formData.url });
        addToast({ type: 'success', title: 'Programa atualizado', description: 'Programa de fidelidade atualizado com sucesso!' });
      } else {
        await programaService.criarPrograma({ nome: formData.nome, url: formData.url });
        addToast({ type: 'success', title: 'Programa criado', description: 'Programa de fidelidade adicionado com sucesso!' });
      }
      setShowForm(false);
      setFormData({ nome: '', url: '' });
      setEditingId(null);
      loadPrograms();
    } catch (error: unknown) {
      const msg = isAxiosError(error) ? error.response?.data?.message || 'Não foi possível criar o programa.' : 'Não foi possível criar o programa.';
      addToast({ type: 'error', title: 'Erro ao criar', description: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (program: LoyaltyProgram) => {
    setEditingId(program.id);
    setFormData({ nome: program.nome, url: (program as any).url || '' });
    setShowForm(true);
  };

  const handleNew = () => {
    setEditingId(null);
    setFormData({ nome: '', url: '' });
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    setProgramToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!programToDelete) return;
    try {
      setIsDeleting(true);
      await programaService.deletarPrograma(programToDelete);
      setPrograms(programs.filter(p => p.id !== programToDelete));
      addToast({ type: 'success', title: 'Programa removido', description: 'O programa foi excluído com sucesso.' });
    } catch (error: unknown) {
      const msg = isAxiosError(error) ? error.response?.data?.message || 'Não foi possível excluir o programa.' : 'Não foi possível excluir o programa.';
      addToast({ type: 'error', title: 'Erro ao remover', description: msg });
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
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
              onClick={handleNew}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none w-full sm:w-auto justify-center sm:justify-start shrink-0"
            >
              <Plus size={20} />
              Novo Programa
            </button>
          ) : (
            <button
              onClick={() => setShowForm(false)}
              className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm w-full sm:w-auto justify-center sm:justify-start shrink-0"
            >
              <ArrowLeft size={20} /> Voltar à Lista
            </button>
          )}
        </div>

        {/* ── Formulário Embutido ── */}
        {showForm && (
          <ProgramForm
            formData={formData}
            setFormData={setFormData}
            isSubmitting={isSubmitting}
            editingId={editingId}
            onClose={() => setShowForm(false)}
            onSubmit={handleSubmit}
          />
        )}

        {/* ── Grid de Programas (Oculto se formulário estiver aberto) ── */}
        {!showForm && (
          <ProgramList
            programs={programs}
            loading={loading}
            onOpenCreateForm={handleNew}
            onEdit={handleEdit}
            onDelete={handleDelete}
            getCardColor={getCardColor}
          />
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