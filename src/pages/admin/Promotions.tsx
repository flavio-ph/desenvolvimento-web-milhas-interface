import React, { useState, useEffect } from 'react';
import {
  Tag, Plus, Trash2, Loader2, Pencil, Zap, AlertCircle
} from 'lucide-react';
import { getPromocoes, getProgramas, createPromocao, deletePromocao, updatePromocao } from '../../services/api';
import { Promotion, LoyaltyProgram } from '../../types/types';
import { useToast } from '../../components/ToastContext';
import { ConfirmModal } from '../../components/ConfirmModal';

const AdminPromotions: React.FC = () => {
  const { addToast } = useToast();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [programs, setPrograms] = useState<LoyaltyProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'gerenciar' | 'cadastrar'>('gerenciar');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para o Modal de Exclusão
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [promoToDelete, setPromoToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    link: '',
    dataValidade: '',
    bonusPorcentagem: '',
    programaPontosId: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [promosData, programsData] = await Promise.all([
        getPromocoes(),
        getProgramas()
      ]);
      setPromotions(promosData || []);
      setPrograms(programsData || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      addToast({
        type: 'error',
        title: 'Erro ao carregar',
        description: 'Não foi possível buscar as promoções.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleEdit = (promo: any) => {
    setFormData({
      titulo: promo.titulo,
      descricao: promo.descricao,
      link: promo.urlPromocao,
      dataValidade: promo.dataFim,
      bonusPorcentagem: promo.bonusPorcentagem?.toString() || '',
      programaPontosId: promo.programaPontosId?.toString() || ''
    });
    setEditingId(promo.id);
    setActiveTab('cadastrar');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ titulo: '', descricao: '', link: '', dataValidade: '', bonusPorcentagem: '', programaPontosId: '' });
    setActiveTab('gerenciar');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.programaPontosId) {
      addToast({
        type: 'warning',
        title: 'Atenção',
        description: 'Selecione um programa de pontos.'
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const originalPromo = editingId ? promotions.find(p => p.id === editingId) : null;
      const dataInicio = originalPromo ? originalPromo.dataInicio : new Date().toISOString().split('T')[0];

      const payload = {
        titulo: formData.titulo,
        descricao: formData.descricao,
        urlPromocao: formData.link,
        dataInicio: dataInicio,
        dataFim: formData.dataValidade,
        programaPontosId: parseInt(formData.programaPontosId),
        bonusPorcentagem: parseFloat(formData.bonusPorcentagem)
      };

      if (editingId) {
        await updatePromocao(editingId, payload);
        addToast({
          type: 'success',
          title: 'Promoção atualizada',
          description: 'As alterações foram salvas com sucesso.'
        });
      } else {
        await createPromocao(payload);
        addToast({
          type: 'success',
          title: 'Promoção criada',
          description: 'Nova promoção publicada com sucesso.'
        });
      }

      handleCancelEdit();
      fetchData();
    } catch (error) {
      console.error(error);
      addToast({
        type: 'error',
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar a promoção.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: number) => {
    setPromoToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!promoToDelete) return;

    try {
      setIsDeleting(true);
      await deletePromocao(promoToDelete);
      setDeleteModalOpen(false);
      fetchData();

      addToast({
        type: 'success',
        title: 'Promoção excluída',
        description: 'A promoção foi removida com sucesso.'
      });
    } catch (error) {
      console.error(error);
      addToast({
        type: 'error',
        title: 'Erro ao excluir',
        description: 'Não foi possível remover a promoção.'
      });
    } finally {
      setIsDeleting(false);
      setPromoToDelete(null);
    }
  };

  const getProgramName = (idStr: string) => {
    return programs.find(p => p.id.toString() === idStr)?.nome || 'Programa';
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto py-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Tag className="text-indigo-600" />
            Gestão de Promoções
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Cadastre e gerencie as ofertas disponíveis no app.</p>
        </div>
      </div>

      {/* Abas de Navegação */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
        <button
          onClick={() => { if (editingId) handleCancelEdit(); setActiveTab('gerenciar'); }}
          className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'gerenciar'
            ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
            }`}
        >
          Gerenciar Ativas
        </button>
        <button
          onClick={() => { if (editingId) handleCancelEdit(); setActiveTab('cadastrar'); }}
          className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'cadastrar'
            ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
            }`}
        >
          {editingId ? 'Editando Promoção' : 'Cadastrar Nova'}
        </button>
      </div>

      {activeTab === 'gerenciar' ? (
        // TABELA
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors">
          {loading ? (
            <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-indigo-600 dark:text-indigo-400" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    {/* CABEÇALHOS CENTRALIZADOS */}
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center">Promoção</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center">Bônus</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center">Expiração</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {promotions.length > 0 ? (
                    promotions.map((promo: any) => (
                      <tr key={promo.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">

                        {/* COLUNA: PROMOÇÃO (Centralizada) */}
                        <td className="px-6 py-5">
                          <div className="flex flex-col items-center">
                            <span className="text-[10px] uppercase font-bold text-indigo-500 dark:text-indigo-400 tracking-wide mb-1">
                              {promo.nomeProgramaPontos}
                            </span>
                            <span className="text-sm font-bold text-slate-800 dark:text-white leading-tight">
                              {promo.titulo}
                            </span>
                            <span className="text-xs text-slate-400 dark:text-slate-500 mt-1 line-clamp-1 max-w-[200px] text-center">
                              {promo.descricao || 'Sem descrição.'}
                            </span>
                          </div>
                        </td>

                        {/* COLUNA: BÔNUS (Centralizada) */}
                        <td className="px-6 py-5 text-center">
                          <div className="flex justify-center">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${promo.bonusPorcentagem >= 100
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                              }`}>
                              <Zap size={14} className="fill-current" />
                              {promo.bonusPorcentagem}%
                            </span>
                          </div>
                        </td>

                        {/* COLUNA: EXPIRAÇÃO (Centralizada) */}
                        <td className="px-6 py-5 whitespace-nowrap text-center">
                          <div className="flex flex-col items-center">
                            <span className="text-sm font-bold text-slate-700 dark:text-white capitalize">
                              {new Date(promo.dataFim).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                            </span>
                            <span className="text-[10px] text-slate-400 uppercase font-bold">
                              {new Date(promo.dataFim).getFullYear()}
                            </span>
                          </div>
                        </td>

                        {/* COLUNA: AÇÕES (Centralizada e Sempre Visível) */}
                        <td className="px-6 py-5 text-center">
                          {/* CORREÇÃO: justify-center e removida a opacidade */}
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleEdit(promo)}
                              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:text-indigo-400 dark:hover:bg-indigo-900/30 rounded-lg transition-all"
                              title="Editar"
                            >
                              <Pencil size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(promo.id)}
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
                        Nenhuma promoção cadastrada.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        // FORMULÁRIO DE CADASTRO
        <div className="flex flex-col lg:flex-row gap-12 items-start animate-fadeIn">
          <form onSubmit={handleSubmit} className="flex-1 space-y-5 w-full bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-slate-700 dark:text-white text-lg">
                {editingId ? 'Editar Detalhes' : 'Preencha os dados'}
              </h3>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 dark:text-rose-400 dark:bg-rose-900/20 dark:hover:bg-rose-900/40 rounded-xl transition-colors"
                >
                  Cancelar Edição
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Programa</label>
                <select
                  className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-indigo-500 outline-none dark:border-slate-800 dark:text-white transition-colors appearance-none"
                  value={formData.programaPontosId}
                  onChange={e => setFormData({ ...formData, programaPontosId: e.target.value })}
                  required
                >
                  <option value="">Selecione...</option>
                  {programs.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Bônus %</label>
                <input
                  type="number"
                  className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-indigo-500 outline-none dark:border-slate-800 dark:text-white transition-colors"
                  placeholder="Ex: 100"
                  value={formData.bonusPorcentagem}
                  onChange={e => setFormData({ ...formData, bonusPorcentagem: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Título</label>
              <input
                className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-indigo-500 outline-none dark:border-slate-800 dark:text-white transition-colors"
                placeholder="Ex: Transfira para o Smiles"
                value={formData.titulo}
                onChange={e => setFormData({ ...formData, titulo: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase ">Data Fim</label>
                <input type="date" className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-950 text-sm dark:border-slate-800 dark:text-white dark:[color-scheme:dark] transition-colors" value={formData.dataValidade} onChange={e => setFormData({ ...formData, dataValidade: e.target.value })} required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Link</label>
                <input type="url"
                  className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-950 text-sm dark:border-slate-800 dark:text-white transition-colors" value={formData.link} onChange={e => setFormData({ ...formData, link: e.target.value })} required
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Descrição</label>
              <textarea className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-950 text-sm h-28 dark:border-slate-800 dark:text-white transition-colors resize-none" value={formData.descricao} onChange={e => setFormData({ ...formData, descricao: e.target.value })} required
                placeholder="Descreva a promoção..."
              />
            </div>

            <button disabled={isSubmitting} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none">
              {isSubmitting ? <Loader2 className="animate-spin" /> : (editingId ? <Pencil size={18} /> : <Plus size={18} />)}
              {editingId ? 'Salvar Alterações' : 'Publicar Promoção'}
            </button>
          </form>

          {/* Preview */}
          <div className="w-full lg:w-[350px] flex flex-col items-center">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-6 text-center">Preview no App</h4>
            <div className="bg-white dark:bg-slate-950 rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 w-full transition-colors relative group">
              <div className={`p-8 text-white flex flex-col items-center transition-all duration-500 ${(parseInt(formData.bonusPorcentagem) || 0) >= 100
                ? 'bg-gradient-to-br from-indigo-600 to-violet-700'
                : 'bg-gradient-to-br from-emerald-500 to-teal-600'
                }`}>
                <span className="text-[10px] font-black uppercase opacity-60 mb-1">Bônus de</span>
                <h4 className="text-5xl font-black">{formData.bonusPorcentagem || '0'}%</h4>
                <Zap className="mt-4 opacity-30" size={24} />
              </div>

              <div className="p-6 space-y-3 bg-white dark:bg-slate-950 transition-colors">
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-400 px-2.5 py-1 rounded-md">
                  {getProgramName(formData.programaPontosId)}
                </span>
                <h3 className="text-lg font-black text-slate-800 dark:text-white leading-tight">
                  {formData.titulo || 'Título da Promoção'}
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-400 leading-relaxed line-clamp-3">
                  {formData.descricao || 'As regras aparecerão aqui...'}
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-2xl border border-yellow-100 dark:border-yellow-900/30 w-full">
              <AlertCircle className="text-yellow-600 dark:text-yellow-500 shrink-0" size={18} />
              <p className="text-[10px] text-yellow-700 dark:text-yellow-400 leading-relaxed font-medium">
                <strong>Nota:</strong> Promoções acima de 100% ganham destaque roxo automaticamente no app.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Excluir Promoção"
        description="Tem certeza que deseja remover esta promoção? Esta ação não pode ser desfeita."
        confirmText="Sim, excluir"
        cancelText="Cancelar"
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  );
};

export default AdminPromotions;