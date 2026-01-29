import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Plus, CreditCard, CheckCircle, XCircle, 
  X, Check, Palette, Eye, Pencil, Trash2 
} from 'lucide-react'; // Adicionei Pencil e Trash2
import  api from '../../services/api';

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
        <div className="fixed inset-0 z-[100] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
            <div className="relative bg-white dark:bg-slate-900 w-full max-w-4xl rounded-[32px] p-8 lg:p-12 z-10 flex flex-col lg:flex-row gap-8">
                {/* Lado Esquerdo (Form) */}
                <div className="flex-1 space-y-6">
                     <div className="flex justify-between">
                        <h2 className="text-2xl font-bold dark:text-white">
                            {editingId ? 'Editar Bandeira' : 'Nova Bandeira'}
                        </h2>
                        <button onClick={() => setIsModalOpen(false)}><X className="text-slate-400"/></button>
                     </div>
                     
                     <form onSubmit={handleSave} className="space-y-6">
                        {/* Campos do formulário (iguais ao anterior) */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nome</label>
                            <input 
                                type="text" 
                                value={newBrand.nome} 
                                onChange={e => setNewBrand({...newBrand, nome: e.target.value})}
                                className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl dark:text-white"
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Cor</label>
                            <div className="grid grid-cols-6 gap-2">
                                {PRESET_COLORS.map(c => (
                                    <button 
                                        type="button" 
                                        key={c.name}
                                        onClick={() => setNewBrand({...newBrand, colorObj: c})}
                                        className={`w-10 h-10 rounded-full ${c.class} ${newBrand.colorObj.name === c.name ? 'ring-4 ring-indigo-500' : ''}`}
                                    />
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Status</label>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => setNewBrand({...newBrand, status: 'ACTIVE'})} className={`flex-1 p-3 rounded-xl border ${newBrand.status === 'ACTIVE' ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 'border-slate-200 text-slate-400'}`}>Ativa</button>
                                <button type="button" onClick={() => setNewBrand({...newBrand, status: 'INACTIVE'})} className={`flex-1 p-3 rounded-xl border ${newBrand.status === 'INACTIVE' ? 'bg-red-50 border-red-500 text-red-600' : 'border-slate-200 text-slate-400'}`}>Inativa</button>
                            </div>
                        </div>

                        <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl">
                            {editingId ? 'Salvar Alterações' : 'Criar Bandeira'}
                        </button>
                     </form>
                </div>

                {/* Lado Direito (Preview - Mantive simplificado aqui no código, mas no seu deve estar completo) */}
                <div className="flex-1 bg-slate-50 dark:bg-slate-950 rounded-3xl p-8 flex items-center justify-center">
                    <div className={`w-full aspect-video rounded-2xl shadow-xl ${newBrand.colorObj.class} p-6 text-white relative overflow-hidden`}>
                        <CreditCard className="mb-4" />
                        <span className="text-xl font-bold tracking-widest uppercase">{newBrand.nome || 'BANDEIRA'}</span>
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