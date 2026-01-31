import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, Plus, CreditCard, CheckCircle, XCircle,
  X, Check, Palette, Eye, Pencil, Trash2
} from 'lucide-react'; // Adicionei Pencil e Trash2
import api from '../../services/api';

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [brands, setBrands] = useState<Bandeira[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Estado para controlar Edição
  const [editingId, setEditingId] = useState<number | null>(null);

  const [newBrand, setNewBrand] = useState({
    nome: '',
    status: 'ACTIVE',
    colorObj: PRESET_COLORS[0]
  });

  useEffect(() => {
    carregarBandeiras();
  }, []);

  const carregarBandeiras = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/bandeiras');
      // O backend logo vai mandar o número certo de cartões.
      // Por enquanto, se vier null, fica 0.
      const dadosMapeados = response.data.map((b: any) => ({
        ...b,
        cards: b.cards || 0
      }));
      setBrands(dadosMapeados);
    } catch (error) {
      console.error("Erro ao buscar", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Prepara o modal para EDIÇÃO
  const handleEdit = (brand: Bandeira) => {
    setEditingId(brand.id!); // Salva o ID que estamos mexendo

    // Acha a cor certa no array de presets
    const corEncontrada = PRESET_COLORS.find(c => c.class === brand.cor) || PRESET_COLORS[0];

    setNewBrand({
      nome: brand.nome,
      status: brand.status,
      colorObj: corEncontrada
    });
    setIsModalOpen(true);
  };

  // Prepara o modal para CRIAÇÃO (Limpa tudo)
  const handleNew = () => {
    setEditingId(null);
    setNewBrand({ nome: '', status: 'ACTIVE', colorObj: PRESET_COLORS[0] });
    setIsModalOpen(true);
  };

  // EXCLUIR
  const handleDelete = async (id: number) => {
    if (!window.confirm("Tem certeza que deseja excluir esta bandeira?")) return;

    try {
      await api.delete(`/bandeiras/${id}`);
      await carregarBandeiras();
    } catch (error) {
      alert("Erro ao excluir. Verifique se existem cartões vinculados.");
    }
  };

  // SALVAR (Decide se é POST ou PUT)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        nome: newBrand.nome,
        status: newBrand.status,
        cor: newBrand.colorObj.class
      };

      if (editingId) {
        // SE TEM ID, É EDIÇÃO (PUT)
        await api.put(`/bandeiras/${editingId}`, payload);
      } else {
        // SE NÃO TEM, É CRIAÇÃO (POST)
        await api.post('/bandeiras', payload);
      }

      await carregarBandeiras();
      setIsModalOpen(false);
      setNewBrand({ nome: '', status: 'ACTIVE', colorObj: PRESET_COLORS[0] });
      setEditingId(null);

    } catch (error) {
      console.error(error);
      alert("Erro ao salvar bandeira.");
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn relative pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold dark:text-white flex items-center gap-3">
            <ShieldCheck className="text-emerald-600" />
            Gestão de Bandeiras
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Configure as bandeiras de cartão aceitas.</p>
        </div>
        <button
          onClick={handleNew} // Usa a função nova de limpar
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
        >
          <Plus size={20} /> Nova Bandeira
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Bandeira</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Cartões</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr><td colSpan={4} className="text-center py-8 text-slate-500">Carregando...</td></tr>
              ) : brands.map((brand) => (
                <tr key={brand.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-6 rounded ${brand.cor} flex items-center justify-center text-[8px] text-white font-bold`}>
                        {brand.nome.substring(0, 4).toUpperCase()}
                      </div>
                      <span className="font-bold dark:text-white">{brand.nome}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase ${brand.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                      {brand.status === 'ACTIVE' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                      {brand.status === 'ACTIVE' ? 'Ativa' : 'Inativa'}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <CreditCard size={16} />
                      <span className="text-sm font-medium">{brand.cards}</span>
                    </div>
                  </td>
                  {/* BOTÕES DE AÇÃO FUNCIONAIS */}
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(brand)}
                        className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(brand.id!)}
                        className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* O MODAL CONTINUA IGUAL, SÓ MUDA O TÍTULO PARA EDIÇÃO SE PRECISAR */}
      {isModalOpen && (
        <div
          className="fixed top-0 left-0 w-screen h-screen z-[9999]"
          style={{ margin: 0, padding: 0 }}
        >
          {/* BACKDROP */}
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            onClick={() => setIsModalOpen(false)}
          />

          {/* CONTAINER DO MODAL */}
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <div className="bg-white dark:bg-slate-900 w-full max-w-6xl rounded-[32px] shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">

              {/* ESQUERDA */}
              <div className="p-10 space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold dark:text-white">
                    {editingId ? 'Editar Bandeira' : 'Nova Bandeira'}
                  </h2>
                  <button onClick={() => setIsModalOpen(false)}>
                    <X className="text-slate-400 hover:text-slate-600" />
                  </button>
                </div>

                <form onSubmit={handleSave} className="space-y-8">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      Nome da Bandeira
                    </label>
                    <input
                      value={newBrand.nome}
                      onChange={e => setNewBrand({ ...newBrand, nome: e.target.value })}
                      placeholder="Ex: Elo, Diners Club, etc"
                      className="mt-2 w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      Cor de Identidade
                    </label>
                    <div className="flex gap-4 mt-3">
                      {PRESET_COLORS.map(c => (
                        <button
                          type="button"
                          key={c.name}
                          onClick={() => setNewBrand({ ...newBrand, colorObj: c })}
                          className={`w-12 h-12 rounded-xl ${c.class} flex items-center justify-center ${newBrand.colorObj.name === c.name
                            ? 'ring-4 ring-indigo-500'
                            : ''
                            }`}
                        >
                          {newBrand.colorObj.name === c.name && (
                            <Check className="text-white" size={18} />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      Status Inicial
                    </label>
                    <div className="flex gap-4 mt-3">
                      <button
                        type="button"
                        onClick={() => setNewBrand({ ...newBrand, status: 'ACTIVE' })}
                        className={`flex-1 py-3 rounded-xl font-bold ${newBrand.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-600'
                          : 'bg-slate-100 text-slate-400'
                          }`}
                      >
                        Ativa
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewBrand({ ...newBrand, status: 'INACTIVE' })}
                        className={`flex-1 py-3 rounded-xl font-bold ${newBrand.status === 'INACTIVE'
                          ? 'bg-slate-200 text-slate-600'
                          : 'bg-slate-100 text-slate-400'
                          }`}
                      >
                        Inativa
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl"
                  >
                    {editingId ? 'Salvar Alterações' : 'Cadastrar Bandeira'}
                  </button>
                </form>
              </div>

              {/* DIREITA */}
              {/* DIREITA - VISUALIZAÇÃO */}
              <div className="bg-slate-50 dark:bg-slate-950 p-10 flex flex-col items-center justify-center gap-8 border-l border-slate-200 dark:border-slate-800">

                {/* TÍTULO */}
                <div className="flex flex-col items-center gap-2 text-slate-400 uppercase text-xs font-bold">
                  <div className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center">
                    <Eye size={18} />
                  </div>
                  Visualização
                </div>

                {/* CARTÃO */}
                <div
                  className={`w-full max-w-sm h-48 rounded-2xl shadow-xl ${newBrand.colorObj.class} p-6 text-white flex flex-col justify-between`}
                >
                  {/* TOPO */}
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                      <CreditCard size={16} />
                    </div>
                    <span className="text-sm font-bold tracking-wide">BANDEIRA</span>
                  </div>

                  {/* MEIO */}
                  <div className="flex flex-col gap-3">
                    <div className="w-10 h-6 rounded-md bg-yellow-400"></div>
                    <div className="w-full h-2 rounded-full bg-white/40"></div>
                  </div>
                </div>

                {/* TAG NA TABELA */}
                <div className="bg-white dark:bg-slate-800 px-6 py-4 rounded-xl shadow text-sm font-bold w-full max-w-sm">
                  <p className="text-xs text-slate-400 mb-2 uppercase">Tag na Tabela</p>
                  <div className="flex items-center gap-3">
                    <span className="bg-indigo-600 text-white px-2 py-1 rounded-md text-xs">
                      BAND
                    </span>
                    {newBrand.nome || 'Nome da Bandeira'}
                  </div>
                </div>

              </div>


            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default AdminBrands;