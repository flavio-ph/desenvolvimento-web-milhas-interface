import React, { useState, useEffect } from 'react';
import {
  Tag, Plus, Trash2, Loader2, Pencil, Zap, AlertCircle, ArrowLeft
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full mb-2">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Tag className="text-indigo-600 dark:text-indigo-400" />
            Gestão de Promoções
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Cadastre e gerencie as ofertas disponíveis no app.
          </p>
        </div>

        {activeTab === 'gerenciar' ? (
          <button
            onClick={() => setActiveTab('cadastrar')}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none w-full sm:w-auto justify-center sm:justify-start shrink-0"
          >
            <Plus size={20} />
            Cadastrar Nova
          </button>
        ) : (
          <button
            onClick={() => {
              if (editingId) handleCancelEdit();
              setActiveTab('gerenciar');
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm w-full sm:w-auto justify-center sm:justify-start shrink-0"
          >
            <ArrowLeft size={20} /> Voltar à Lista
          </button>
        )}
      </div>


      {activeTab === 'gerenciar' ? (
        // CARDS (Antiga Tabela)
        <div className="animate-fadeIn">
          {loading ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-20 flex justify-center border border-slate-100 dark:border-slate-800">
              <Loader2 className="animate-spin text-indigo-600 dark:text-indigo-400" size={32} />
            </div>
          ) : (
            <>
              {promotions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {promotions.map((promo: any) => {
                    const isExpired = promo.dataFim ? new Date(promo.dataFim).getTime() < new Date().getTime() : false;
                    const isHighBonus = promo.bonusPorcentagem >= 100;

                    return (
                      <div
                        key={promo.id}
                        className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col relative"
                      >
                        {/* DECORAÇÃO DE TOPO */}
                        <div className={`h-2 w-full ${isHighBonus ? 'bg-gradient-to-r from-purple-500 to-indigo-600' : 'bg-gradient-to-r from-emerald-400 to-teal-500'}`} />

                        {/* CONTEÚDO */}
                        <div className="p-6 flex flex-col flex-1">

                          {/* Top Row: Programa & Status */}
                          <div className="flex justify-between items-start mb-4">
                            <span className="text-[10px] uppercase font-black tracking-widest text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-400 px-2.5 py-1 rounded-md">
                              {promo.nomeProgramaPontos}
                            </span>
                            <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${isExpired ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400 border border-rose-100 dark:border-rose-800/50' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50'}`}>
                              {isExpired ? 'Expirada' : 'Ativa'}
                            </span>
                          </div>

                          {/* Título & Descrição */}
                          <h3 className="text-lg font-bold text-slate-800 dark:text-white leading-tight mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {promo.titulo}
                          </h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-6 flex-1">
                            {promo.descricao || 'Sem descrição cadastrada.'}
                          </p>

                          {/* Footer do Card: Bonus & Expiração */}
                          <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50 dark:border-slate-800/50">

                            {/* Bonus */}
                            <div className="flex items-center gap-1.5">
                              <div className={`p-1.5 rounded-lg ${isHighBonus ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400'}`}>
                                <Zap size={14} className="fill-current" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Bônus</span>
                                <span className={`text-sm font-black ${isHighBonus ? 'text-purple-600 dark:text-purple-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                  {promo.bonusPorcentagem}%
                                </span>
                              </div>
                            </div>

                            {/* Expiração */}
                            <div className="flex flex-col text-right">
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Expira em</span>
                              <span className={`text-sm font-bold ${isExpired ? 'text-rose-500' : 'text-slate-700 dark:text-slate-300'}`}>
                                {promo.dataFim ? new Date(promo.dataFim).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : 'Indeterminado'}
                              </span>
                            </div>

                          </div>
                        </div>

                        {/* OVERLAY DE AÇÕES NO HOVER (Desktop) / Visível em Mobile */}
                        <div className="absolute inset-x-0 bottom-0 top-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-4 translate-y-4 group-hover:translate-y-0 z-10 pointer-events-none group-hover:pointer-events-auto sm:opacity-0 opacity-100 sm:translate-y-4 sm:flex-row flex-col">
                          <div className="flex gap-3 px-4">
                            <button
                              onClick={() => handleEdit(promo)}
                              className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white dark:bg-indigo-900/40 dark:text-indigo-400 dark:hover:bg-indigo-600 dark:hover:text-white rounded-xl transition-colors font-bold text-sm shadow-sm"
                            >
                              <Pencil size={16} /> Editar
                            </button>
                            <button
                              onClick={() => handleDelete(promo.id)}
                              className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white dark:bg-rose-900/30 dark:text-rose-400 dark:hover:bg-rose-600 dark:hover:text-white rounded-xl transition-colors font-bold text-sm shadow-sm"
                            >
                              <Trash2 size={16} /> Excluir
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-16 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <Tag size={32} className="text-slate-400 dark:text-slate-500" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Nenhuma promoção encontrada</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">
                    Você ainda não cadastrou nenhuma oferta. Clique no botão acima para criar a primeira promoção.
                  </p>
                  <button
                    onClick={() => setActiveTab('cadastrar')}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-xl font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                  >
                    <Plus size={18} /> Criar Promoção
                  </button>
                </div>
              )}
            </>
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
          <div className="w-full lg:w-[380px] flex flex-col items-center shrink-0">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-6 text-center">Preview do Card</h4>

            <div className="w-full group bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-md flex flex-col relative overflow-hidden text-left">
              {/* DECORAÇÃO DE TOPO */}
              <div className={`h-2 w-full ${(parseFloat(formData.bonusPorcentagem) || 0) >= 100 ? 'bg-gradient-to-r from-purple-500 to-indigo-600' : 'bg-gradient-to-r from-emerald-400 to-teal-500'}`} />

              {/* CONTEÚDO */}
              <div className="p-6 flex flex-col flex-1">

                {/* Top Row: Programa & Status */}
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] uppercase font-black tracking-widest text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-400 px-2.5 py-1 rounded-md truncate max-w-[140px]">
                    {getProgramName(formData.programaPontosId)}
                  </span>
                  <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50">
                    Ativa
                  </span>
                </div>

                {/* Título & Descrição */}
                <h3 className="text-lg font-bold text-slate-800 dark:text-white leading-tight mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {formData.titulo || 'Título da Promoção'}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-6 flex-1 min-h-[40px]">
                  {formData.descricao || 'A descrição detalhada da promoção aparecerá aqui...'}
                </p>

                {/* Footer do Card: Bonus & Expiração */}
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50 dark:border-slate-800/50">

                  {/* Bonus */}
                  <div className="flex items-center gap-1.5">
                    <div className={`p-1.5 rounded-lg ${(parseFloat(formData.bonusPorcentagem) || 0) >= 100 ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400'}`}>
                      <Zap size={14} className="fill-current" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Bônus</span>
                      <span className={`text-sm font-black ${(parseFloat(formData.bonusPorcentagem) || 0) >= 100 ? 'text-purple-600 dark:text-purple-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {formData.bonusPorcentagem || '0'}%
                      </span>
                    </div>
                  </div>

                  {/* Expiração */}
                  <div className="flex flex-col text-right">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Expira em</span>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      {formData.dataValidade ? new Date(formData.dataValidade).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : 'Indeterminado'}
                    </span>
                  </div>

                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/30 w-full">
              <Zap className="text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" size={16} />
              <p className="text-[11px] text-indigo-700 dark:text-indigo-300 leading-relaxed font-medium">
                Promoções com <strong>bônus de 100% ou mais</strong> recebem destaque premium (roxo) automaticamente.
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