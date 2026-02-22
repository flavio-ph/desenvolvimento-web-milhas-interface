import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, Plus, CreditCard, CheckCircle, XCircle,
  X, Check, Eye, Pencil, Trash2, Loader2, ArrowLeft
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../components/ToastContext';
import { ConfirmModal } from '../../components/ConfirmModal';

interface Bandeira {
  id?: number;
  nome: string;
  status: string;
  cor: string;
  cards?: number;
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
      const response = await api.get('/bandeiras');
      const dadosMapeados = response.data.map((b: any) => ({ ...b, cards: b.cards || 0 }));
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
      await api.delete(`/bandeiras/${brandToDelete}`);
      await carregarBandeiras();
      addToast({ type: 'success', title: 'Bandeira excluída', description: 'A bandeira foi removida com sucesso.' });
    } catch (error) {
      addToast({ type: 'error', title: 'Erro ao excluir', description: 'Verifique se existem cartões vinculados a esta bandeira.' });
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setBrandToDelete(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { nome: newBrand.nome, status: newBrand.status, cor: newBrand.colorObj.class };
      if (editingId) {
        await api.put(`/bandeiras/${editingId}`, payload);
        addToast({ type: 'success', title: 'Sucesso', description: 'Bandeira atualizada com sucesso.' });
      } else {
        await api.post('/bandeiras', payload);
        addToast({ type: 'success', title: 'Sucesso', description: 'Nova bandeira cadastrada.' });
      }
      await carregarBandeiras();
      setShowForm(false); // Fecha a seção
      setNewBrand({ nome: '', status: 'ACTIVE', colorObj: PRESET_COLORS[0] });
      setEditingId(null);
    } catch (error) {
      addToast({ type: 'error', title: 'Erro ao salvar', description: 'Não foi possível salvar a bandeira.' });
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

      {/* ── SEÇÃO DE FORMULÁRIO (Substitui o Modal) ── */}
      {showForm && (
        <div className="bg-white dark:bg-slate-900 w-full rounded-[32px] shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden grid grid-cols-1 lg:grid-cols-2 animate-scaleIn">
          {/* ESQUERDA - Formulário */}
          <div className="p-8 md:p-10 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                {editingId ? <Pencil className="text-indigo-600" /> : <Plus className="text-indigo-600" />}
                {editingId ? 'Editar Bandeira' : 'Nova Bandeira'}
              </h2>
              <button onClick={() => setShowForm(false)} className="lg:hidden p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-50 dark:bg-slate-800 rounded-full">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-8">
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
                  {PRESET_COLORS.map(c => (
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
                  onClick={() => setShowForm(false)}
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

            <div className="flex flex-col items-center gap-2 text-slate-400 uppercase text-xs font-bold z-10">
              <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow flex items-center justify-center">
                <Eye size={18} />
              </div>
              Visualização
            </div>

            {/* Card preview */}
            <div className={`w-full max-w-sm h-48 rounded-2xl shadow-xl ${newBrand.colorObj.class} p-6 text-white flex flex-col justify-between transform transition-all duration-300 z-10`}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <CreditCard size={16} />
                </div>
                <span className="text-sm font-bold tracking-wide uppercase">{newBrand.nome || 'Bandeira'}</span>
              </div>
              <div className="flex flex-col gap-3">
                <div className="w-10 h-6 rounded-md bg-yellow-400/90 shadow-sm" />
                <div className="w-full h-2 rounded-full bg-white/30" />
              </div>
            </div>

            {/* Preview mini-card */}
            <div className="bg-white dark:bg-slate-900 px-6 py-4 rounded-xl shadow-lg border border-slate-100 dark:border-slate-800 w-full max-w-sm z-10">
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-3 uppercase font-bold">Preview na Tabela</p>
              <div className="flex items-center gap-3">
                <span className={`w-12 h-7 rounded ${newBrand.colorObj.class} flex items-center justify-center text-[9px] text-white font-bold shadow-sm shrink-0 transition-colors`}>
                  {newBrand.nome ? newBrand.nome.substring(0, 4).toUpperCase() : 'NOME'}
                </span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  {newBrand.nome || 'Nome da Bandeira'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TABELA (Oculta quando o form está aberto) ── */}
      {!showForm && (
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
                  <tr><td colSpan={4} className="text-center py-20 flex justify-center"><Loader2 className="animate-spin text-indigo-600" /></td></tr>
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
                            onClick={() => handleEdit(brand)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:text-indigo-400 dark:hover:bg-indigo-900/30 rounded-lg transition-all"
                            title="Editar"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(brand.id!)}
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