import React, { useState, useEffect } from 'react';
import { 
  Tag, Plus, X, Calendar, Link as LinkIcon, 
  Percent, Type, ExternalLink, Trash2, Check, Loader2, Zap, Clock, AlertCircle 
} from 'lucide-react';
// Certifique-se de ter exportado createPromocao e deletePromocao no api.ts
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
  // Estados de Dados
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [programs, setPrograms] = useState<LoyaltyProgram[]>([]);
  
  // Estados de UI
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Formulário
  const [formData, setFormData] = useState<PromotionFormData>({
    titulo: '',
    descricao: '',
    link: '',
    dataValidade: '',
    bonusPorcentagem: '',
    programaPontosId: ''
  });

  // 1. Carregar Dados
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

  useEffect(() => {
    fetchData();
  }, []);

  // 2. Criar Promoção
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.programaPontosId) {
      alert('Selecione um programa de pontos.');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const payload = {
        titulo: formData.titulo,
        descricao: formData.descricao,
        link: formData.link,
        dataValidade: formData.dataValidade,
        bonusPorcentagem: parseInt(formData.bonusPorcentagem),
        programaPontosId: parseInt(formData.programaPontosId)
      };

      await createPromocao(payload);
      
      alert('Promoção publicada com sucesso!');
      setShowModal(false);
      // Reset form
      setFormData({ 
        titulo: '', descricao: '', link: '', 
        dataValidade: '', bonusPorcentagem: '', programaPontosId: '' 
      });
      fetchData(); // Recarrega lista

    } catch (error) {
      console.error(error);
      alert('Erro ao criar promoção.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Deletar Promoção
  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja encerrar esta promoção?')) return;
    try {
      await deletePromocao(id);
      setPromotions(promotions.filter(p => p.id !== id));
    } catch (error) {
      console.error(error);
      alert('Erro ao deletar.');
    }
  };

  // Helper para mostrar nome do programa no Preview
  const getProgramName = (idStr: string) => {
    return programs.find(p => p.id.toString() === idStr)?.name || 'Programa';
  };

  return (
    <>
      <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn pb-10">
        
        {/* Header da Página */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold dark:text-white flex items-center gap-3">
              <Tag className="text-rose-500" />
              Central de Promoções
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Gerencie campanhas de bônus e oportunidades ativas.
            </p>
          </div>
          
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none"
          >
            <Plus size={20} />
            Nova Campanha
          </button>
        </div>

        {/* Listagem de Promoções Ativas */}
        {loading ? (
          <div className="flex justify-center p-12"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>
        ) : (
          <div className="space-y-4">
            {promotions.length === 0 && (
              <div className="text-center p-12 bg-slate-50 dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                <Tag className="mx-auto text-slate-300 mb-4" size={48} />
                <p className="text-slate-500 font-medium">Nenhuma campanha ativa no momento.</p>
                <p className="text-slate-400 text-sm">Clique em "Nova Campanha" para começar.</p>
              </div>
            )}

            {promotions.map((promo) => (
              <div key={promo.id} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-6 items-center hover:shadow-md transition-all group">
                {/* Badge Visual */}
                <div className={`w-full md:w-24 h-24 rounded-xl flex flex-col items-center justify-center text-white shrink-0 ${
                  promo.bonusPercentage >= 100 
                    ? 'bg-gradient-to-br from-indigo-600 to-violet-700' 
                    : 'bg-gradient-to-br from-emerald-500 to-teal-600'
                }`}>
                  <span className="text-[10px] font-bold uppercase opacity-80">Bônus</span>
                  <span className="text-2xl font-black">{promo.bonusPercentage}%</span>
                </div>
                
                {/* Informações */}
                <div className="flex-1 text-center md:text-left overflow-hidden">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded w-fit mx-auto md:mx-0">
                      {promo.programName}
                    </span>
                    <h3 className="text-lg font-bold dark:text-white truncate">{promo.title}</h3>
                  </div>
                  
                  <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-1 mb-3">
                    {promo.description}
                  </p>
                  
                  <div className="flex items-center justify-center md:justify-start gap-4 text-xs font-medium text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar size={14}/> Validade: {new Date(promo.expiryDate).toLocaleDateString('pt-BR')}
                    </span>
                    {promo.link && (
                      <a href={promo.link} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-indigo-500 transition-colors">
                        <ExternalLink size={14} /> Link Oficial
                      </a>
                    )}
                  </div>
                </div>

                {/* Ações */}
                <div className="flex gap-2 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-4 md:pt-0 md:pl-4 w-full md:w-auto justify-end">
                  <button 
                    onClick={() => handleDelete(promo.id)}
                    className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors group-hover:bg-slate-50 dark:group-hover:bg-slate-800"
                    title="Excluir Promoção"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- MODAL FORA DA DIV ANIMADA (Correção do Blur) --- */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Overlay Escuro */}
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setShowModal(false)} />
          
          {/* Container do Modal */}
          <div className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-3xl shadow-2xl animate-scaleIn z-10 overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
            
            {/* LADO ESQUERDO: Formulário */}
            <div className="w-full md:w-1/2 flex flex-col overflow-y-auto border-r border-slate-100 dark:border-slate-800">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-900 z-20">
                <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
                  <Plus className="text-indigo-600" />
                  Nova Campanha
                </h2>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                
                {/* Linha 1: Programa e Bônus */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Programa</label>
                    <div className="relative">
                      <select
                        value={formData.programaPontosId}
                        onChange={e => setFormData({...formData, programaPontosId: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white appearance-none"
                        required
                      >
                        <option value="">Selecione...</option>
                        {programs.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Bônus (%)</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={formData.bonusPorcentagem}
                        onChange={e => setFormData({...formData, bonusPorcentagem: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                        placeholder="100"
                        required
                      />
                      <Percent className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    </div>
                  </div>
                </div>

                {/* Título */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Título da Promoção</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={formData.titulo}
                      onChange={e => setFormData({...formData, titulo: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                      placeholder="Ex: Transfira Livelo para Latam"
                      required
                    />
                    <Type className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  </div>
                </div>

                {/* Validade e Link */}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Validade</label>
                    <div className="relative">
                      <input 
                        type="date" 
                        value={formData.dataValidade}
                        onChange={e => setFormData({...formData, dataValidade: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                        required
                      />
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Link Oficial</label>
                    <div className="relative">
                      <input 
                        type="url" 
                        value={formData.link}
                        onChange={e => setFormData({...formData, link: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                        placeholder="https://..."
                        required
                      />
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    </div>
                  </div>
                </div>

                {/* Descrição */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Descrição / Regras</label>
                  <textarea 
                    value={formData.descricao}
                    onChange={e => setFormData({...formData, descricao: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white h-24 resize-none"
                    placeholder="Resumo curto das regras..."
                    required
                  />
                </div>

                <div className="pt-2">
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" /> : <Check size={20} />}
                    Publicar Promoção
                  </button>
                </div>
              </form>
            </div>

            {/* LADO DIREITO: Preview Visual */}
            <div className="hidden md:flex md:w-1/2 bg-slate-50 dark:bg-slate-950 items-center justify-center p-8 relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, gray 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
              
              <div className="relative w-full max-w-sm">
                <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6 text-center">Preview no App</h4>
                
                {/* Card Preview */}
                <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden transform hover:scale-105 transition-transform duration-500">
                  <div className={`p-8 flex flex-col items-center justify-center text-white relative overflow-hidden transition-colors duration-500 ${
                    (parseInt(formData.bonusPorcentagem) || 0) >= 100 
                      ? 'bg-gradient-to-br from-indigo-600 to-violet-700' 
                      : 'bg-gradient-to-br from-emerald-500 to-teal-600'
                  }`}>
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <span className="text-xs font-black uppercase tracking-[0.2em] opacity-80 mb-1">Bônus de</span>
                    <h4 className="text-6xl font-black">{formData.bonusPorcentagem || '0'}%</h4>
                    <Zap className="mt-4 opacity-40" size={32} />
                  </div>

                  <div className="p-8">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-lg mb-3 inline-block">
                      {getProgramName(formData.programaPontosId)}
                    </span>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight mb-3">
                      {formData.titulo || 'Título da Promoção'}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6 line-clamp-3">
                      {formData.descricao || 'A descrição da promoção aparecerá aqui...'}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase">
                        <Clock size={14} />
                        {formData.dataValidade ? new Date(formData.dataValidade).toLocaleDateString('pt-BR') : 'Expiração'}
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-black uppercase">
                        Participar
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/30 rounded-2xl">
                  <AlertCircle className="text-yellow-600 dark:text-yellow-500 shrink-0" size={20} />
                  <div>
                    <p className="text-xs font-bold text-yellow-700 dark:text-yellow-500">Dica Visual</p>
                    <p className="text-xs text-yellow-600/80 dark:text-yellow-500/70 mt-1">
                      Promoções acima de 100% ganham o fundo roxo (Destaque). Abaixo disso, usam o fundo verde (Padrão).
                    </p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default AdminPromotions;