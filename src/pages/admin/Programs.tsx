import React, { useState, useEffect } from 'react';
import { Globe, Plus, Trash2, ExternalLink, X, Check, Loader2, Link as LinkIcon } from 'lucide-react';
import { getProgramas, createPrograma, deletePrograma } from '../../services/api';
import { LoyaltyProgram } from '../../types/types';

// Constante de cores para o seletor (se quiser implementar cor no futuro)
// Por enquanto, usaremos cores geradas baseadas no nome ou aleatórias para o preview
const PREVIEW_COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6'];

const AdminPrograms: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [programs, setPrograms] = useState<LoyaltyProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    nome: '',
    url: ''
  });

  // Carregar dados
  const loadPrograms = async () => {
    try {
      setLoading(true);
      const data = await getProgramas();
      setPrograms(data || []);
    } catch (e) {
      console.error("Erro ao listar programas", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrograms();
  }, []);

  // Criar Programa
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await createPrograma(formData);

      alert('Programa criado com sucesso!');
      setIsModalOpen(false);
      setFormData({ nome: '', url: '' });
      loadPrograms();
    } catch (error) {
      console.error(error);
      alert('Erro ao criar programa.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Deletar Programa
  const handleDelete = async (id: number) => {
    if (!confirm('Deseja realmente remover este programa?')) return;
    try {
      await deletePrograma(id);
      setPrograms(programs.filter(p => p.id !== id));
    } catch (error) {
      console.error(error);
      alert('Erro ao remover programa.');
    }
  };

  // Helper para cor aleatória consistente (baseada no ID ou Index)
  const getColor = (index: number) => PREVIEW_COLORS[index % PREVIEW_COLORS.length];

  return (
    <>
      <div className="space-y-8 animate-fadeIn pb-10 max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold dark:text-white flex items-center gap-3">
              <Globe className="text-indigo-600" />
              Programas de Fidelidade
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Gerencie os parceiros e regras de acúmulo de pontos.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg"
          >
            <Plus size={20} />
            Novo Programa
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {programs.length === 0 && (
              <div className="col-span-full text-center p-12 bg-slate-50 dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                <Globe className="mx-auto text-slate-300 mb-4" size={48} />
                <p className="text-slate-500">Nenhum programa cadastrado.</p>
              </div>
            )}

            {programs.map((program, index) => (
              <div
                key={program.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                      style={{ backgroundColor: getColor(index) }}
                    >
                      {program.nome.charAt(0).toUpperCase()}
                    </div>


                  </div>

                  <h3 className="mt-3 text-lg font-bold dark:text-white">
                    {program.nome}
                  </h3>
                  <span className="text-xs text-slate-400">TOTAL NA PLATAFORMA</span>
                  <div className="mt-2 text-2xl font-bold dark:text-white">
                    0M <span className="text-sm text-emerald-500">↗ +8%</span>
                  </div>
                </div>

                <div className="pt-4 mt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400 uppercase">Ações</span>

                  <div className="flex gap-3">
                    <a
                      href={program.url || '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-400 hover:text-indigo-600 transition"
                    >
                      <ExternalLink size={18} />
                    </a>

                    <button
                      onClick={() => handleDelete(program.id)}
                      className="text-slate-400 hover:text-red-500 transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* CARD ADICIONAR */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 text-slate-400 hover:border-indigo-400 hover:text-indigo-600 transition min-h-[220px]"
            >
              <Plus size={32} />
              <span className="font-bold text-sm uppercase tracking-wide">
                Adicionar Parceiro
              </span>
            </button>
          </div>
        )}
      </div>

      {/* MODAL — MANTIDO IGUAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl animate-scaleIn z-10 overflow-hidden flex flex-col md:flex-row max-h-[90vh]">

            {/* LADO ESQUERDO */}
            <div className="w-full md:w-1/2 flex flex-col overflow-y-auto border-r border-slate-100 dark:border-slate-800">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-900 z-20">
                <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
                  <Plus className="text-indigo-600" />
                  Novo Programa
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Nome do Programa
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.nome}
                      onChange={e => setFormData({ ...formData, nome: e.target.value })}
                      className="w-full px-4 py-3 pl-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                      placeholder="Ex: Livelo"
                      required
                    />
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    URL do Site Oficial
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      value={formData.url}
                      onChange={e => setFormData({ ...formData, url: e.target.value })}
                      className="w-full px-4 py-3 pl-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                      placeholder="https://www.livelo.com.br"
                      required
                    />
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" /> : <Check size={20} />}
                    Cadastrar Programa
                  </button>
                </div>
              </form>
            </div>

            {/* LADO DIREITO */}
            <div className="hidden md:flex md:w-1/2 bg-slate-50 dark:bg-slate-950 items-center justify-center p-8 relative overflow-hidden">
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: 'radial-gradient(circle at 2px 2px, gray 1px, transparent 0)',
                  backgroundSize: '24px 24px'
                }}
              />

              <div className="relative w-full max-w-xs text-center">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-8">
                  Como aparecerá no App
                </h4>

                <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-100 dark:border-slate-800 shadow-2xl flex flex-col items-center gap-6">
                  <div className="w-24 h-24 rounded-3xl bg-indigo-600 shadow-xl flex items-center justify-center text-white text-4xl font-black">
                    {formData.nome ? formData.nome.charAt(0).toUpperCase() : '?'}
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-2xl font-black dark:text-white">
                      {formData.nome || 'Nome do Programa'}
                    </h3>
                    <p className="text-sm text-slate-400 truncate max-w-[200px] mx-auto">
                      {formData.url || 'www.siteoficial.com.br'}
                    </p>
                  </div>

                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                    Parceiro Oficial
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </>
  );

};

export default AdminPrograms;