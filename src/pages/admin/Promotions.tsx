import React, { useState, useEffect } from 'react';
import {
  Tag, Plus, Calendar, Trash2, Loader2, Pencil,
  ExternalLink, Zap, Clock, AlertCircle, Link as LinkIcon, Type, Percent
} from 'lucide-react';
import { getPromocoes, getProgramas, createPromocao, deletePromocao, updatePromocao } from '../../services/api';
import { Promotion, LoyaltyProgram } from '../../types/types';


const AdminPromotions: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [programs, setPrograms] = useState<LoyaltyProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'gerenciar' | 'cadastrar'>('gerenciar');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (!formData.programaPontosId) return alert('Selecione um programa.');

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
        alert('Promoção atualizada com sucesso!');
      } else {
        await createPromocao(payload);
        alert('Promoção criada com sucesso!');
      }

      handleCancelEdit(); 
      fetchData(); 
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar promoção.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Deseja excluir?')) return;
    await deletePromocao(id);
    fetchData();
  };

  const getProgramName = (idStr: string) => {
    return programs.find(p => p.id.toString() === idStr)?.nome || 'Programa';
  };

  return (
    // ADICIONADO: dark:bg-slate-950 para o fundo principal
    <div className="max-w-7xl mx-auto p-8 bg-white dark:bg-slate-950 min-h-screen transition-colors">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          {/* ADICIONADO: dark:bg-rose-900/20 e dark:text-rose-400 para o ícone */}
          <div className="p-2 bg-rose-50 dark:bg-rose-900/20 rounded-lg"><Tag className="text-rose-500 dark:text-rose-400" size={24} /></div>
          {/* ADICIONADO: dark:text-white para o título */}
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Central de Promoções</h1>
        </div>
      </div>

      {/* Abas */}
      {/* ADICIONADO: dark:border-slate-800 para a linha da aba */}
      <div className="flex gap-8 border-b border-slate-100 dark:border-slate-800 mb-8">
        <button
          onClick={() => { if (editingId) handleCancelEdit(); setActiveTab('cadastrar'); }}
          // ADICIONADO: dark:border-indigo-400 e dark:text-indigo-400 para aba ativa, dark:text-slate-500 para inativa
          className={`pb-4 text-sm font-bold ${activeTab === 'cadastrar' ? 'text-indigo-600 border-b-2 border-indigo-600 dark:text-indigo-400 dark:border-indigo-400' : 'text-slate-400 dark:text-slate-500'}`}
        >
          {editingId ? 'Editando Promoção' : 'Cadastrar Nova'}
        </button>
        <button
          onClick={handleCancelEdit}
          className={`pb-4 text-sm font-bold ${activeTab === 'gerenciar' ? 'text-indigo-600 border-b-2 border-indigo-600 dark:text-indigo-400 dark:border-indigo-400' : 'text-slate-400 dark:text-slate-500'}`}
        >
          Gerenciar Ativas
        </button>
      </div>

      {activeTab === 'gerenciar' ? (
        // ADICIONADO: dark:bg-slate-900 e dark:border-slate-800 para container da tabela
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-colors">
          {loading ? <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-indigo-600 dark:text-indigo-400" /></div> : (
            <table className="w-full text-left">
              {/* ADICIONADO: dark:bg-slate-800/50 para o cabeçalho */}
              <thead className="bg-slate-50/50 dark:bg-slate-800/50">
                <tr>
                  {/* ADICIONADO: dark:text-slate-500 para textos do header */}
                  <th className="px-6 py-4 text-[11px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-bold">Promoção</th>
                  <th className="px-6 py-4 text-[11px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-bold text-center">Bônus</th>
                  <th className="px-6 py-4 text-[11px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-bold text-center">Expiração</th>
                  <th className="px-6 py-4 text-right text-[11px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-bold">Ações</th>
                </tr>
              </thead>
              {/* ADICIONADO: dark:divide-slate-800 para linhas divisórias */}
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {promotions.map((promo: any) => (
                  // ADICIONADO: hover:dark:bg-slate-800/50 para efeito hover nas linhas
                  <tr key={promo.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-5">
                      {/* ADICIONADO: dark:text-indigo-400 para nome do programa */}
                      <div className="text-[10px] uppercase font-bold text-indigo-500 dark:text-indigo-400 mt-1">{promo.nomeProgramaPontos}</div>
                      {/* ADICIONADO: dark:text-white para título */}
                      <div className="font-bold text-slate-800 dark:text-white text-base">{promo.titulo}</div>
                      {/* ADICIONADO: dark:text-slate-500 para descrição */}
                      <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed line-clamp-3">{promo.descricao || 'As regras aparecerão aqui...'} </p>
                    </td>
                    <td className="px-6 py-5 text-center font-bold text-emerald-500 dark:text-emerald-400">
                      {promo.bonusPorcentagem}%
                    </td>
                    <td className="px-6 py-5 text-center text-xs text-slate-500 dark:text-slate-400">
                      {new Date(promo.dataFim).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(promo)} 
                          // ADICIONADO: Cores de hover escuras para os botões de ação
                          className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:text-indigo-400 dark:hover:bg-indigo-900/30 rounded-lg transition-all"
                          title="Editar"
                        >
                          <Pencil size={18} />
                        </button>
                        <button onClick={() => handleDelete(promo.id)} className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:text-rose-400 dark:hover:bg-rose-900/30 rounded-lg transition-all">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-12 items-start animate-fadeIn">
          <form onSubmit={handleSubmit} className="flex-1 space-y-5 w-full">
            <div className="flex justify-between items-center mb-2">
              {/* ADICIONADO: dark:text-white */}
              <h3 className="font-bold text-slate-700 dark:text-white">
                {editingId ? 'Editar Detalhes' : 'Preencha os dados'}
              </h3>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  // ADICIONADO: dark:bg-rose-900/20 dark:text-rose-400 dark:hover:bg-rose-900/40
                  className="px-4 py-2 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 dark:text-rose-400 dark:bg-rose-900/20 dark:hover:bg-rose-900/40 rounded-xl transition-colors"
                >
                  Cancelar Edição
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Programa e Bônus */}
              <div className="space-y-1.5">
                {/* ADICIONADO: dark:text-slate-400 para labels */}
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Programa</label>
                <select
                  // CORRIGIDO: Removi dark:text-black (que estava errado) e adicionei dark:bg-slate-900 dark:border-slate-800 dark:text-white
                  className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-slate-900 dark:border-slate-800 dark:text-white dark:placeholder-slate-500 transition-colors"
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
                  // CORRIGIDO: dark:text-white em vez de black
                  className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-slate-900 dark:border-slate-800 dark:text-white dark:placeholder-slate-500 transition-colors"
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
                // CORRIGIDO: dark:text-white
                className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-slate-900 dark:border-slate-800 dark:text-white dark:placeholder-slate-500 transition-colors"
                placeholder="Ex: Transfira para o Smiles"
                value={formData.titulo}
                onChange={e => setFormData({ ...formData, titulo: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase ">Data Fim</label>
                {/* CORRIGIDO: dark:text-white e [color-scheme:dark] para o calendário ficar escuro */}
                <input type="date" className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm dark:bg-slate-900 dark:border-slate-800 dark:text-white dark:[color-scheme:dark] transition-colors" value={formData.dataValidade} onChange={e => setFormData({ ...formData, dataValidade: e.target.value })} required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Link</label>
                <input type="url"         
                // CORRIGIDO: dark:text-white
                className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm dark:bg-slate-900 dark:border-slate-800 dark:text-white dark:placeholder-slate-500 transition-colors" value={formData.link} onChange={e => setFormData({ ...formData, link: e.target.value })} required 
                placeholder="https://..."
                />
                
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Descrição</label>
              <textarea className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm h-28 dark:bg-slate-900 dark:border-slate-800 dark:text-white dark:placeholder-slate-500 transition-colors" value={formData.descricao} onChange={e => setFormData({ ...formData, descricao: e.target.value })} required
              placeholder="Descreva a promoção..."
              />
            </div>

            <button disabled={isSubmitting} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none">
              {isSubmitting ? <Loader2 className="animate-spin" /> : (editingId ? <Pencil size={18} /> : <Plus size={18} />)}
              {editingId ? 'Salvar Alterações' : 'Publicar Promoção'}
            </button>
          </form>

          {/* Preview  */}
          {/* ADICIONADO: dark:bg-slate-900 dark:border-slate-800 */}
          <div className="w-full lg:w-[400px] flex flex-col items-center bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-100 dark:border-slate-800 transition-colors">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-8 text-center">Preview no App</h4>

            {/* ADICIONADO: dark:bg-slate-950 dark:border-slate-800 */}
            <div className="bg-white dark:bg-slate-950 rounded-[2rem] shadow-2xl overflow-hidden border border-white dark:border-slate-800 w-full transition-colors">
              <div className={`p-8 text-white flex flex-col items-center transition-all duration-500 ${(parseInt(formData.bonusPorcentagem) || 0) >= 100
                ? 'bg-gradient-to-br from-indigo-600 to-violet-700'
                : 'bg-gradient-to-br from-emerald-500 to-teal-600'
                }`}>
                <span className="text-[10px] font-black uppercase opacity-60 mb-1">Bônus de</span>
                <h4 className="text-5xl font-black">{formData.bonusPorcentagem || '0'}%</h4>
                <Zap className="mt-4 opacity-30" size={24} />
              </div>

              <div className="p-8 space-y-4 bg-white dark:bg-slate-950 transition-colors">
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-400 px-2.5 py-1 rounded-md">
                  {getProgramName(formData.programaPontosId)}
                </span>
                {/* ADICIONADO: dark:text-white */}
                <h3 className="text-lg font-black text-slate-800 dark:text-white leading-tight">
                  {formData.titulo || 'Título da Promoção'}
                </h3>
                {/* ADICIONADO: dark:text-slate-400 */}
                <p className="text-xs text-slate-400 dark:text-slate-400 leading-relaxed line-clamp-3">
                  {formData.descricao || 'As regras aparecerão aqui...'}
                </p>
                <div className="pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase">
                    <Clock size={12} />
                    {formData.dataValidade ? new Date(formData.dataValidade).toLocaleDateString('pt-BR') : 'Expiração'}
                  </div>
                  {/* ADICIONADO: dark:bg-indigo-900/30 dark:text-indigo-400 */}
                  <div className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-[10px] font-black uppercase">Participar</div>
                </div>
              </div>
            </div>

            {/* ADICIONADO: dark:bg-yellow-900/10 dark:border-yellow-900/30 */}
            <div className="mt-6 flex gap-3 p-4 bg-yellow-50/50 dark:bg-yellow-900/10 rounded-2xl border border-yellow-100 dark:border-yellow-900/30">
              <AlertCircle className="text-yellow-600 dark:text-yellow-500 shrink-0" size={18} />
              <p className="text-[10px] text-yellow-700 dark:text-yellow-400 leading-relaxed font-medium">
                <strong>Dica:</strong> Promoções acima de 100% ficam roxas para destaque automático.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPromotions;