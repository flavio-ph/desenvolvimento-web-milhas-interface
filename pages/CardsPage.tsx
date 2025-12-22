
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  CreditCard as CardIcon, 
  MoreVertical, 
  ShieldCheck, 
  Zap, 
  X, 
  Check,
  CreditCard,
  Info,
  Trash2,
  Edit
} from 'lucide-react';
import { MOCK_CARDS as INITIAL_CARDS, MOCK_PROGRAMS } from '../constants';
import { CardBrand, CreditCard as CreditCardType } from '../types';

const CardsPage: React.FC = () => {
  const [cards, setCards] = useState<CreditCardType[]>(INITIAL_CARDS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    brand: CardBrand.VISA,
    lastFour: '',
    programId: MOCK_PROGRAMS[0].id,
    multiplier: '1.0'
  });

  const getBrandStyles = (brand: CardBrand) => {
    switch (brand) {
      case CardBrand.VISA: return 'bg-gradient-to-br from-indigo-700 to-blue-500';
      case CardBrand.MASTERCARD: return 'bg-gradient-to-br from-slate-900 to-slate-700';
      case CardBrand.ELO: return 'bg-gradient-to-br from-emerald-600 to-teal-400';
      case CardBrand.AMEX: return 'bg-gradient-to-br from-amber-500 to-orange-400';
      default: return 'bg-slate-400';
    }
  };

  const handleOpenAddModal = () => {
    setEditingCardId(null);
    setFormData({
      name: '',
      brand: CardBrand.VISA,
      lastFour: '',
      programId: MOCK_PROGRAMS[0].id,
      multiplier: '1.0'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (card: CreditCardType) => {
    setEditingCardId(card.id);
    setFormData({
      name: card.name,
      brand: card.brand,
      lastFour: card.lastFour,
      programId: card.programId,
      multiplier: card.multiplier.toString()
    });
    setIsModalOpen(true);
    setActiveMenuId(null);
  };

  const handleDeleteCard = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cartão?')) {
      setCards(cards.filter(c => c.id !== id));
      setActiveMenuId(null);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCardId) {
      setCards(cards.map(c => c.id === editingCardId ? {
        ...c,
        name: formData.name,
        brand: formData.brand,
        lastFour: formData.lastFour,
        programId: formData.programId,
        multiplier: parseFloat(formData.multiplier)
      } : c));
    } else {
      const newCard: CreditCardType = {
        id: Math.random().toString(36).substr(2, 9),
        name: formData.name,
        brand: formData.brand,
        lastFour: formData.lastFour,
        programId: formData.programId,
        multiplier: parseFloat(formData.multiplier)
      };
      setCards([...cards, newCard]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-4 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold dark:text-white">Meus Cartões</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Gerencie sua carteira de cartões e programas associados.</p>
        </div>
        <button 
          onClick={handleOpenAddModal}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none"
        >
          <Plus size={20} />
          Novo Cartão
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => {
          const program = MOCK_PROGRAMS.find(p => p.id === card.programId);
          return (
            <div key={card.id} className="group relative bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300">
              <div className={`h-48 p-6 flex flex-col justify-between text-white relative overflow-hidden transition-all duration-500 ${getBrandStyles(card.brand)}`}>
                <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700"></div>
                
                <div className="flex justify-between items-start relative z-10">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Zap size={20} className="text-white" />
                    </div>
                    <span className="font-bold tracking-widest text-sm">{card.brand.toUpperCase()}</span>
                  </div>
                  
                  <div className="relative">
                    <button 
                      onClick={() => setActiveMenuId(activeMenuId === card.id ? null : card.id)}
                      className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <MoreVertical size={20} />
                    </button>
                    
                    {activeMenuId === card.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setActiveMenuId(null)}></div>
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 z-20 overflow-hidden animate-scaleIn">
                          <button 
                            onClick={() => handleOpenEditModal(card)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                          >
                            <Edit size={16} className="text-indigo-500" />
                            Editar Dados
                          </button>
                          <button 
                            onClick={() => handleDeleteCard(card.id)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors border-t border-slate-50 dark:border-slate-700"
                          >
                            <Trash2 size={16} />
                            Excluir Cartão
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-4 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-7 bg-amber-400/80 rounded-md"></div>
                    <p className="text-xl font-mono tracking-[0.2em] font-medium opacity-90">
                      •••• •••• •••• {card.lastFour}
                    </p>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] uppercase font-bold opacity-70 tracking-tighter">Apelido</p>
                      <p className="text-sm font-semibold uppercase tracking-wide">{card.name}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold opacity-70 tracking-tighter">Validade</p>
                      <p className="text-sm font-semibold">12/28</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Programa Principal</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: program?.color }}></div>
                    <span className="text-sm font-bold dark:text-white">{program?.name}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Pontuação</span>
                  <div className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-lg">
                    {card.multiplier} pts / R$ 1,00
                  </div>
                </div>
                
                <div className="pt-4 flex gap-2">
                  <button className="flex-1 bg-slate-50 dark:bg-slate-800 py-2.5 rounded-xl text-xs font-bold dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    Ver Extrato
                  </button>
                  <button 
                    onClick={() => handleOpenEditModal(card)}
                    className="flex-1 bg-slate-50 dark:bg-slate-800 py-2.5 rounded-xl text-xs font-bold dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    Editar
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        <div 
          onClick={handleOpenAddModal}
          className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center p-8 text-center hover:border-indigo-300 dark:hover:border-indigo-900 transition-colors group cursor-pointer h-full min-h-[400px]"
        >
          <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Plus className="text-slate-400 group-hover:text-indigo-500" size={32} />
          </div>
          <p className="font-bold dark:text-white">Adicionar Novo Cartão</p>
          <p className="text-sm text-slate-500 mt-2">Clique para vincular um novo cartão de crédito à sua conta.</p>
        </div>
      </div>

      {/* MODAL CADASTRAR/EDITAR CARTÃO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto">
          {/* Background Overlay - Ajustado para cobrir tudo com scroll */}
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="relative bg-white dark:bg-slate-900 w-full max-w-4xl rounded-[32px] shadow-2xl overflow-hidden animate-scaleIn border border-white/20 dark:border-slate-800">
              <div className="flex flex-col lg:flex-row h-full">
                
                {/* Form Section */}
                <div className="flex-1 p-8 lg:p-12 overflow-y-auto">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                      {editingCardId ? 'Editar Cartão' : 'Novo Cartão'}
                    </h2>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400">
                      <X size={20} />
                    </button>
                  </div>

                  <form onSubmit={handleSave} className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 ml-1">Apelido do Cartão</label>
                        <input 
                          type="text" 
                          placeholder="Ex: Cartão Principal / Viagens"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 dark:text-white outline-none font-medium transition-all"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 ml-1">Bandeira</label>
                          <select 
                            value={formData.brand}
                            onChange={(e) => setFormData({...formData, brand: e.target.value as CardBrand})}
                            className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 dark:text-white outline-none font-medium transition-all"
                          >
                            <option value={CardBrand.VISA}>Visa</option>
                            <option value={CardBrand.MASTERCARD}>MasterCard</option>
                            <option value={CardBrand.ELO}>Elo</option>
                            <option value={CardBrand.AMEX}>American Express</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 ml-1">Últimos 4 Dígitos</label>
                          <input 
                            type="text" 
                            placeholder="0000"
                            maxLength={4}
                            value={formData.lastFour}
                            onChange={(e) => setFormData({...formData, lastFour: e.target.value.replace(/\D/g, '')})}
                            className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 dark:text-white outline-none font-mono text-lg transition-all"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 ml-1">Programa de Fidelidade</label>
                        <select 
                          value={formData.programId}
                          onChange={(e) => setFormData({...formData, programId: e.target.value})}
                          className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 dark:text-white outline-none font-medium transition-all"
                        >
                          {MOCK_PROGRAMS.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 ml-1">Pontos por R$ 1,00</label>
                        <div className="relative">
                          <Zap className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input 
                            type="number" 
                            step="0.1"
                            value={formData.multiplier}
                            onChange={(e) => setFormData({...formData, multiplier: e.target.value})}
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 dark:text-white outline-none font-medium transition-all"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                      <button 
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="flex-1 py-4 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                      >
                        Cancelar
                      </button>
                      <button 
                        type="submit"
                        className="flex-1 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 dark:shadow-none flex items-center justify-center gap-2"
                      >
                        <Check size={20} />
                        {editingCardId ? 'Salvar Alterações' : 'Salvar Cartão'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Visual Preview Section */}
                <div className="hidden lg:flex lg:w-[40%] bg-slate-50 dark:bg-slate-950 p-12 flex-col items-center justify-center border-l border-slate-100 dark:border-slate-800">
                  <div className="text-center mb-8">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Prévia do Cartão</p>
                    <div className="h-1 w-8 bg-indigo-600 mx-auto rounded-full"></div>
                  </div>

                  {/* Card Preview */}
                  <div className={`w-full aspect-[1.586/1] rounded-[24px] p-6 text-white shadow-2xl relative overflow-hidden transition-all duration-700 ${getBrandStyles(formData.brand)}`}>
                    <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                    
                    <div className="flex justify-between items-start relative z-10">
                      <div className="flex items-center gap-2">
                        <Zap size={20} className="text-white" />
                        <span className="font-bold tracking-widest text-sm uppercase">{formData.brand}</span>
                      </div>
                    </div>

                    <div className="mt-12 mb-8 relative z-10">
                      <div className="w-10 h-7 bg-amber-400/80 rounded-md mb-4 shadow-inner"></div>
                      <p className="text-xl font-mono tracking-[0.2em] font-medium opacity-90">
                        •••• •••• •••• {formData.lastFour || '0000'}
                      </p>
                    </div>

                    <div className="flex justify-between items-end relative z-10">
                      <div>
                        <p className="text-[10px] uppercase font-bold opacity-70 tracking-tighter">Apelido</p>
                        <p className="text-sm font-semibold uppercase truncate max-w-[120px]">{formData.name || 'MEU CARTÃO'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase font-bold opacity-70 tracking-tighter">Acúmulo</p>
                        <p className="text-sm font-semibold">{formData.multiplier}x pts</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-12 p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl flex gap-3 max-w-[280px]">
                    <Info className="text-indigo-600 shrink-0" size={18} />
                    <p className="text-[10px] text-indigo-700 dark:text-indigo-400 leading-relaxed font-medium">
                      {editingCardId ? 'Você está editando as configurações deste cartão.' : 'Os cartões cadastrados aqui servem para o controle manual de seus gastos.'}
                    </p>
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

export default CardsPage;
