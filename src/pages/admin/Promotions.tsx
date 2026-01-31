import React, { useState, useEffect } from 'react';
import {
  Tag, Plus, Calendar, Trash2, Loader2, Pencil,
  ExternalLink, Zap, Clock, AlertCircle, Link as LinkIcon, Type, Percent
} from 'lucide-react';
import { getPromocoes, getProgramas, createPromocao, deletePromocao } from '../../services/api';
import { Promotion, LoyaltyProgram } from '../../types/types';

interface PromotionFormData {
  titulo: string;
  descricao: string;
  link: string;
  dataValidade: string;
  bonusPorcentagem: string;
  programaPontosId: string;
}

const AdminPromotions: React.FC = () => {
  // --- ESTADOS ---
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [programs, setPrograms] = useState<LoyaltyProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'gerenciar' | 'cadastrar'>('gerenciar');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<PromotionFormData>({
    titulo: '',
    descricao: '',
    link: '',
    dataValidade: '',
    bonusPorcentagem: '',
    programaPontosId: ''
  });

  // --- LÓGICA DE DADOS ---
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.programaPontosId) return alert('Selecione um programa de pontos.');

    try {
      setIsSubmitting(true);
      const payload = {
        titulo: formData.titulo,
        descricao: formData.descricao,
        urlPromocao: formData.link,
        dataInicio: new Date().toISOString().split('T')[0],
        dataFim: formData.dataValidade,
        programaPontosId: parseInt(formData.programaPontosId)
      };

      await createPromocao(payload);
      alert('Promoção publicada com sucesso!');

      // Reset e volta para a tabela
      setFormData({ titulo: '', descricao: '', link: '', dataValidade: '', bonusPorcentagem: '', programaPontosId: '' });
      setActiveTab('gerenciar');
      fetchData();
    } catch (error) {
      alert('Erro ao criar promoção.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja encerrar esta promoção?')) return;
    try {
      await deletePromocao(id);
      setPromotions(promotions.filter(p => p.id !== id));
    } catch (error) {
      alert('Erro ao deletar.');
    }
  };

  const getProgramName = (idStr: string) => {
    return programs.find(p => p.id.toString() === idStr)?.nome || 'Programa';
  };

  return (
    <div className="max-w-7xl mx-auto p-8 bg-white min-h-screen animate-fadeIn">

      {/* HEADER (Estilo Imagem) */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-rose-50 rounded-lg">
            <Tag className="text-rose-500" size={24} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Central de Promoções</h1>
        </div>
        <p className="text-slate-500 text-sm">Crie e gerencie campanhas de bônus e compras bonificadas.</p>
      </div>

      {/* ABAS DE NAVEGAÇÃO */}
      <div className="flex gap-8 border-b border-slate-100 mb-8">
        <button
          onClick={() => setActiveTab('cadastrar')}
          className={`pb-4 text-sm font-bold transition-all ${activeTab === 'cadastrar' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Cadastrar Nova
        </button>
        <button
          onClick={() => setActiveTab('gerenciar')}
          className={`pb-4 text-sm font-bold transition-all ${activeTab === 'gerenciar' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Gerenciar Ativas
        </button>
      </div>

      {activeTab === 'gerenciar' ? (
        /* --- LISTAGEM (TABELA IGUAL À IMAGEM) --- */
        /* --- LISTAGEM (TABELA CORRIGIDA) --- */
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center p-20"><Loader2 className="animate-spin text-slate-300" size={40} /></div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Promoção</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Bônus</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Expiração</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {promotions.map((promo) => (
                  <tr key={promo.id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-6 py-5">
                      {/* Título e Programa */}
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-indigo-600 uppercase mb-0.5">
                          {promo.programName || "Programa"}
                        </span>
                        <div className="font-bold text-slate-800 text-sm">
                          {promo.title || promo.titulo}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5 line-clamp-1 italic">
                          {promo.description || promo.descricao}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      {/* Ajuste conforme o nome que vem da sua API (bonusPercentage ou bonusPorcentagem) */}
                      <span className="text-emerald-500 font-bold">
                        {promo.bonusPercentage || promo.bonusPorcentagem || "0"}%
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="flex items-center justify-center gap-2 text-slate-500 text-xs font-medium">
                        <Calendar size={14} className="text-slate-300" />
                        {promo.expiryDate || promo.dataFim
                          ? new Date(promo.expiryDate || promo.dataFim).toLocaleDateString('pt-BR')
                          : "Sem data"}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center">
                        <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-2.5 py-1 rounded-md uppercase flex items-center gap-1.5">
                          <div className="w-1 h-1 bg-emerald-500 rounded-full" /> Ativa
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(promo.id)}
                          className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        >
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
        /* --- FORMULÁRIO + PREVIEW (TUDO REINTEGRADO) --- */
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* LADO ESQUERDO: CAMPOS */}
          <form onSubmit={handleSubmit} className="flex-1 space-y-5 w-full">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Programa</label>
                <select
                  className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  value={formData.programaPontosId}
                  onChange={e => setFormData({ ...formData, programaPontosId: e.target.value })}
                  required
                >
                  <option value="">Selecione...</option>
                  {programs.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Bônus %</label>
                <div className="relative">
                  <input
                    type="number"
                    className="w-full p-3.5 pl-10 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="100"
                    value={formData.bonusPorcentagem}
                    onChange={e => setFormData({ ...formData, bonusPorcentagem: e.target.value })}
                    required
                  />
                  <Percent className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Título</label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full p-3.5 pl-10 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Ex: Transfira para o Smiles"
                  value={formData.titulo}
                  onChange={e => setFormData({ ...formData, titulo: e.target.value })}
                  required
                />
                <Type className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Validade</label>
                <div className="relative">
                  <input
                    type="date"
                    className="w-full p-3.5 pl-10 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.dataValidade}
                    onChange={e => setFormData({ ...formData, dataValidade: e.target.value })}
                    required
                  />
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Link Oficial</label>
                <div className="relative">
                  <input
                    type="url"
                    className="w-full p-3.5 pl-10 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="https://..."
                    value={formData.link}
                    onChange={e => setFormData({ ...formData, link: e.target.value })}
                    required
                  />
                  <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Descrição/Regras</label>
              <textarea
                className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:ring-2 focus:ring-indigo-500 outline-none h-28 resize-none"
                placeholder="Detalhes da promoção..."
                value={formData.descricao}
                onChange={e => setFormData({ ...formData, descricao: e.target.value })}
                required
              />
            </div>

            <button
              disabled={isSubmitting}
              className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
              Publicar Promoção
            </button>
          </form>

          {/* LADO DIREITO: PREVIEW DINÂMICO (Mantendo sua lógica de gradiente) */}
          <div className="w-full lg:w-[400px] flex flex-col items-center bg-slate-50 rounded-[2.5rem] p-10 border border-slate-100">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8 text-center">Preview no App</h4>

            <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-white w-full">
              <div className={`p-8 text-white flex flex-col items-center transition-all duration-500 ${(parseInt(formData.bonusPorcentagem) || 0) >= 100
                  ? 'bg-gradient-to-br from-indigo-600 to-violet-700'
                  : 'bg-gradient-to-br from-emerald-500 to-teal-600'
                }`}>
                <span className="text-[10px] font-black uppercase opacity-60 mb-1">Bônus de</span>
                <h4 className="text-5xl font-black">{formData.bonusPorcentagem || '0'}%</h4>
                <Zap className="mt-4 opacity-30" size={24} />
              </div>

              <div className="p-8 space-y-4">
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                  {getProgramName(formData.programaPontosId)}
                </span>
                <h3 className="text-lg font-black text-slate-800 leading-tight">
                  {formData.titulo || 'Título da Promoção'}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                  {formData.descricao || 'As regras aparecerão aqui...'}
                </p>
                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase">
                    <Clock size={12} />
                    {formData.dataValidade ? new Date(formData.dataValidade).toLocaleDateString('pt-BR') : 'Expiração'}
                  </div>
                  <div className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase">Participar</div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3 p-4 bg-yellow-50/50 rounded-2xl border border-yellow-100">
              <AlertCircle className="text-yellow-600 shrink-0" size={18} />
              <p className="text-[10px] text-yellow-700 leading-relaxed font-medium">
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