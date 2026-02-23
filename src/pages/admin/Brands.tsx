import React, { useState, useEffect } from 'react';
import { ShieldCheck, Plus, ArrowLeft } from 'lucide-react';
import { useToast } from '../../components/ToastContext';
import { ConfirmModal } from '../../components/ConfirmModal';
import { bandeiraService, BandeiraResponse } from '../../services/bandeiraService';
import { isAxiosError } from 'axios';
import { BrandForm } from './Brands/BrandForm';
import { BrandList } from './Brands/BrandList';

export interface Bandeira extends BandeiraResponse {
  cards?: number;
  cor: string;
  status: string;
}

const PRESET_COLORS = [
  { name: 'Indigo', class: 'bg-indigo-600', hex: '#4f46e5' },
  { name: 'Slate', class: 'bg-slate-900', hex: '#0f172a' },
  { name: 'Emerald', class: 'bg-emerald-500', hex: '#10b981' },
  { name: 'Amber', class: 'bg-amber-500', hex: '#f59e0b' },
  { name: 'Rose', class: 'bg-rose-500', hex: '#f43f5e' },
  { name: 'Violet', class: 'bg-violet-600', hex: '#7c3aed' },
];

const AdminBrands: React.FC = () => {
  const { addToast } = useToast();

  // Controle de exibição do formulário
  const [showForm, setShowForm] = useState(false);

  const [brands, setBrands] = useState<Bandeira[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [newBrand, setNewBrand] = useState({
    nome: '',
    status: 'ACTIVE',
    colorObj: PRESET_COLORS[0],
  });

  useEffect(() => { carregarBandeiras(); }, []);

  const carregarBandeiras = async () => {
    try {
      setIsLoading(true);
      const response = await bandeiraService.listarTodas();
      const dadosMapeados = response.map(b => ({ ...b, cards: (b as any).cards || 0, status: (b as any).status || 'ACTIVE', cor: (b as any).cor || PRESET_COLORS[0].class }));
      setBrands(dadosMapeados);
    } catch (error) {
      addToast({ type: 'error', title: 'Erro ao carregar', description: 'Não foi possível buscar as bandeiras.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (brand: Bandeira) => {
    setEditingId(brand.id!);
    const corEncontrada = PRESET_COLORS.find(c => c.class === brand.cor) || PRESET_COLORS[0];
    setNewBrand({ nome: brand.nome, status: brand.status, colorObj: corEncontrada });
    setShowForm(true); // Abre a seção de form
  };

  const handleNew = () => {
    setEditingId(null);
    setNewBrand({ nome: '', status: 'ACTIVE', colorObj: PRESET_COLORS[0] });
    setShowForm(true); // Abre a seção de form
  };

  const handleDelete = (id: number) => {
    setBrandToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!brandToDelete) return;
    try {
      setIsDeleting(true);
      await bandeiraService.deletarBandeira(brandToDelete);
      await carregarBandeiras();
      addToast({ type: 'success', title: 'Bandeira excluída', description: 'A bandeira foi removida com sucesso.' });
    } catch (error: unknown) {
      const msg = isAxiosError(error) ? error.response?.data?.message || 'Verifique se existem cartões vinculados a esta bandeira.' : 'Verifique se existem cartões vinculados a esta bandeira.';
      addToast({ type: 'error', title: 'Erro ao excluir', description: msg });
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setBrandToDelete(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Nota: o payload de bandeira está sendo castado temporariamente com 'any' porque a API antiga usava mais campos
      // que a interface do DTO em Java. Em uma refatoração de Backend isso deveria ser padronizado.
      const payload: any = { nome: newBrand.nome, status: newBrand.status, cor: newBrand.colorObj.class, ativa: newBrand.status === 'ACTIVE' };
      if (editingId) {
        await bandeiraService.atualizarBandeira(editingId, payload);
        addToast({ type: 'success', title: 'Sucesso', description: 'Bandeira atualizada com sucesso.' });
      } else {
        await bandeiraService.criarBandeira(payload);
        addToast({ type: 'success', title: 'Sucesso', description: 'Nova bandeira cadastrada.' });
      }
      await carregarBandeiras();
      setShowForm(false); // Fecha a seção
      setNewBrand({ nome: '', status: 'ACTIVE', colorObj: PRESET_COLORS[0] });
      setEditingId(null);
    } catch (error: unknown) {
      const msg = isAxiosError(error) ? error.response?.data?.message || 'Não foi possível salvar a bandeira.' : 'Não foi possível salvar a bandeira.';
      addToast({ type: 'error', title: 'Erro ao salvar', description: msg });
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn relative pb-20 max-w-7xl mx-auto py-4">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold dark:text-white text-slate-900 flex items-center gap-3">
            <ShieldCheck className="text-emerald-600" />
            Gestão de Bandeiras
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Configure as bandeiras de cartão aceitas.</p>
        </div>

        {/* Esconde o botão Nova Bandeira se o form estiver aberto, substituindo por Voltar */}
        {!showForm ? (
          <button
            onClick={handleNew}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
          >
            <Plus size={20} /> Nova Bandeira
          </button>
        ) : (
          <button
            onClick={() => setShowForm(false)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
          >
            <ArrowLeft size={20} /> Voltar à Lista
          </button>
        )}
      </div>

      {/* ── SEÇÃO DE FORMULÁRIO ── */}
      {showForm && (
        <BrandForm
          newBrand={newBrand}
          setNewBrand={setNewBrand}
          editingId={editingId}
          presetColors={PRESET_COLORS}
          onClose={() => setShowForm(false)}
          onSubmit={handleSave}
        />
      )}

      {/* ── TABELA (Oculta quando o form está aberto) ── */}
      {!showForm && (
        <BrandList
          brands={brands}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Modal de Confirmação (Mantido para exclusão) */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Excluir Bandeira"
        description="Tem certeza que deseja remover esta bandeira? Esta ação só será possível se não houverem cartões vinculados a ela."
        confirmText="Sim, excluir"
        cancelText="Cancelar"
        isLoading={isDeleting}
        variant="danger"
      />

    </div>
  );
};

export default AdminBrands;