
import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Plus, 
  MoreHorizontal, 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  X, 
  Check, 
  Palette,
  Eye
} from 'lucide-react';
import { CardBrand } from '../types';

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
  const [brands, setBrands] = useState([
    { name: CardBrand.VISA, status: 'ACTIVE', cards: 1240, color: 'bg-indigo-600' },
    { name: CardBrand.MASTERCARD, status: 'ACTIVE', cards: 980, color: 'bg-slate-900' },
    { name: CardBrand.ELO, status: 'ACTIVE', cards: 450, color: 'bg-emerald-500' },
    { name: CardBrand.AMEX, status: 'INACTIVE', cards: 120, color: 'bg-amber-500' },
  ]);

  const [newBrand, setNewBrand] = useState({
    name: '',
    status: 'ACTIVE',
    color: PRESET_COLORS[0]
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulação de salvamento
    const brandToLink = {
      name: newBrand.name as CardBrand,
      status: newBrand.status,
      cards: 0,
      color: newBrand.color.class
    };
    setBrands([...brands, brandToLink]);
    setIsModalOpen(false);
    setNewBrand({ name: '', status: 'ACTIVE', color: PRESET_COLORS[0] });
  };

  return (
    <div className="space-y-8 animate-fadeIn relative pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold dark:text-white flex items-center gap-3">
            <ShieldCheck className="text-emerald-600" />
            Gestão de Bandeiras
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Configure as bandeiras de cartão de crédito aceitas na plataforma.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none"
        >
          <Plus size={20} />
          Nova Bandeira
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Bandeira</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Cartões Vinculados</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {brands.map((brand, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-6 rounded ${brand.color} flex items-center justify-center text-[8px] text-white font-bold shadow-sm`}>
                        {brand.name.substring(0, 4).toUpperCase()}
                      </div>
                      <span className="font-bold dark:text-white">{brand.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      brand.status === 'ACTIVE' 
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30' 
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                    }`}>
                      {brand.status === 'ACTIVE' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                      {brand.status === 'ACTIVE' ? 'Ativa' : 'Inativa'}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <CreditCard size={16} />
                      <span className="text-sm font-medium">{brand.cards.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-400">
                      <MoreHorizontal size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CADASTRAR BANDEIRA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            {/* Background Overlay - Ajustado para cobrir tudo sem cortes */}
            <div 
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" 
              onClick={() => setIsModalOpen(false)}
            ></div>
            
            <div className="relative bg-white dark:bg-slate-900 w-full max-w-4xl rounded-[32px] shadow-2xl overflow-hidden animate-scaleIn border border-white/20 dark:border-slate-800 flex flex-col lg:flex-row">
              
              {/* Form Section */}
              <div className="flex-1 p-8 lg:p-12">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">Nova Bandeira</h2>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400">
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 ml-1">Nome da Bandeira</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Elo, Diners Club, etc"
                      value={newBrand.name}
                      onChange={(e) => setNewBrand({...newBrand, name: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 dark:text-white outline-none font-medium transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 ml-1 flex items-center gap-2">
                      <Palette size={14} /> Cor de Identidade
                    </label>
                    <div className="grid grid-cols-6 gap-3">
                      {PRESET_COLORS.map((color) => (
                        <button
                          key={color.name}
                          type="button"
                          onClick={() => setNewBrand({...newBrand, color})}
                          className={`w-full aspect-square rounded-xl transition-all ${color.class} ${newBrand.color.name === color.name ? 'ring-4 ring-indigo-500/30 scale-110 shadow-lg' : 'hover:scale-105 opacity-80'}`}
                          title={color.name}
                        >
                          {newBrand.color.name === color.name && <Check className="text-white mx-auto" size={20} />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 ml-1">Status Inicial</label>
                    <div className="flex gap-4">
                      <button 
                        type="button"
                        onClick={() => setNewBrand({...newBrand, status: 'ACTIVE'})}
                        className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all border-2 ${newBrand.status === 'ACTIVE' ? 'border-emerald-500 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' : 'border-slate-100 dark:border-slate-800 text-slate-400'}`}
                      >
                        Ativa
                      </button>
                      <button 
                        type="button"
                        onClick={() => setNewBrand({...newBrand, status: 'INACTIVE'})}
                        className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all border-2 ${newBrand.status === 'INACTIVE' ? 'border-rose-500 bg-rose-50 text-rose-600 dark:bg-rose-900/20' : 'border-slate-100 dark:border-slate-800 text-slate-400'}`}
                      >
                        Inativa
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button 
                      type="submit"
                      className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 dark:shadow-none flex items-center justify-center gap-2"
                    >
                      Cadastrar Bandeira
                    </button>
                  </div>
                </form>
              </div>

              {/* Preview Section */}
              <div className="lg:w-[40%] bg-slate-50 dark:bg-slate-950 p-12 flex flex-col items-center justify-center border-l border-slate-100 dark:border-slate-800">
                <div className="text-center mb-10">
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm mb-4 inline-block">
                    <Eye className="text-indigo-600" size={24} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Visualização</h3>
                </div>

                {/* Card Preview Mini */}
                <div className={`w-full aspect-[1.586/1] rounded-[24px] p-6 text-white shadow-2xl relative overflow-hidden transition-all duration-700 ${newBrand.color.class} mb-12`}>
                  <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                  <div className="flex justify-between items-start relative z-10">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                        <CreditCard size={16} />
                      </div>
                      <span className="font-bold tracking-widest text-xs uppercase">{newBrand.name || 'BANDEIRA'}</span>
                    </div>
                  </div>
                  <div className="mt-8">
                    <div className="w-8 h-6 bg-amber-400/80 rounded mb-2"></div>
                    <div className="h-2 w-3/4 bg-white/20 rounded-full"></div>
                  </div>
                </div>

                {/* Table Row Preview */}
                <div className="w-full bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-3 ml-1">Tag na Tabela</p>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-6 rounded ${newBrand.color.class} flex items-center justify-center text-[8px] text-white font-bold`}>
                      {(newBrand.name || 'BAND').substring(0, 4).toUpperCase()}
                    </div>
                    <span className="text-sm font-bold dark:text-white">{newBrand.name || 'Nome da Bandeira'}</span>
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
