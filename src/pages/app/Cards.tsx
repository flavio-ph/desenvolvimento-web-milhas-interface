import React, { useState, useEffect } from 'react';
import { Plus, CreditCard, Trash2, X, Check, Loader2, Coins, Edit2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../components/ToastContext';
import { ConfirmModal } from '../../components/ConfirmModal';

interface Cartao {
  id: number;
  nomePersonalizado: string;
  ultimosDigitos: string;
  fatorConversao: number;
  nomeBandeira?: string;
  nomeProgramaPontos?: string;
  cor?: string;
  possuiCompras?: boolean;
}

interface Bandeira {
  id: number;
  nome: string;
}

interface Programa {
  id: number;
  nome: string;
}

const CARD_COLORS = [
  '#820AD1',
  '#ec6708',
  '#cc092f',
  '#0056a6',
  '#1a1a1a',
  '#eab308',
  '#10b981',
];

const CardsPage: React.FC = () => {
  const { addToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [cards, setCards] = useState<Cartao[]>([]);
  const [bandeiras, setBandeiras] = useState<Bandeira[]>([]);
  const [programas, setProgramas] = useState<Programa[]>([]);

  const [editingCardId, setEditingCardId] = useState<number | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    nomePersonalizado: '',
    ultimosDigitos: '',
    fatorConversao: '',
    bandeiraId: '',
    programaPontosId: ''
  });

  const [selectedColor, setSelectedColor] = useState(CARD_COLORS[0]);

  const adjustColor = (color: string, amount: number) => {
    return '#' + color.replace(/^#/, '').replace(/../g, color => ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
  }

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cardsRes, bandeirasRes, programasRes] = await Promise.all([
        api.get('/cartoes'),
        api.get('/bandeiras/ativas'),
        api.get('/programas')
      ]);

      setCards(cardsRes.data);
      setBandeiras(bandeirasRes.data);
      setProgramas(programasRes.data);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateForm = () => {
    setEditingCardId(null);
    setFormData({
      nomePersonalizado: '',
      ultimosDigitos: '',
      fatorConversao: '',
      bandeiraId: '',
      programaPontosId: ''
    });
    setSelectedColor(CARD_COLORS[0]);
    setShowForm(true);
  };

  const openEditForm = (card: Cartao) => {
    if (card.possuiCompras) {
      addToast({
        type: 'info',
        title: 'Edição não permitida',
        description: 'Não é possível editar este cartão pois ele já possui compras registradas.'
      });
      return;
    }

    setEditingCardId(card.id);

    const bandeira = bandeiras.find(b => b.nome === card.nomeBandeira);
    const programa = programas.find(p => p.nome === card.nomeProgramaPontos);

    setFormData({
      nomePersonalizado: card.nomePersonalizado,
      ultimosDigitos: card.ultimosDigitos,
      fatorConversao: card.fatorConversao.toString(),
      bandeiraId: bandeira ? bandeira.id.toString() : '',
      programaPontosId: programa ? programa.id.toString() : ''
    });

    setSelectedColor(card.cor || CARD_COLORS[0]);
    setShowForm(true);
  };

  const handleSaveCard = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.bandeiraId || !formData.programaPontosId) {
      addToast({
        type: 'warning',
        title: 'Campos obrigatórios',
        description: 'Selecione uma bandeira e um programa de pontos.'
      });
      return;
    }

    if (formData.ultimosDigitos.length !== 4) {
      addToast({
        type: 'warning',
        title: 'Dígitos inválidos',
        description: 'Informe exatamente os 4 últimos dígitos do cartão.'
      });
      return;
    }

    try {
      const payload = {
        nomePersonalizado: formData.nomePersonalizado,
        ultimosDigitos: formData.ultimosDigitos,
        fatorConversao: parseFloat(formData.fatorConversao.replace(',', '.')),
        bandeiraId: parseInt(formData.bandeiraId),
        programaPontosId: parseInt(formData.programaPontosId),
        cor: selectedColor
      };

      if (editingCardId) {
        await api.put(`/cartoes/${editingCardId}`, payload);
      } else {
        await api.post('/cartoes', payload);
      }

      setShowForm(false);
      fetchData();

      addToast({
        type: 'success',
        title: 'Sucesso!',
        description: editingCardId ? 'O cartão foi atualizado com sucesso.' : 'Novo cartão adicionado à sua carteira.'
      });

    } catch (error: any) {
      console.error('Erro ao salvar cartão:', error);
      const msg = error.response?.data?.message || 'Verifique os dados e tente novamente.';
      addToast({
        type: 'error',
        title: 'Erro ao salvar',
        description: msg
      });
    }
  };

  const handleDeleteCard = (id: number) => {
    setCardToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!cardToDelete) return;

    try {
      setIsDeleting(true);
      await api.delete(`/cartoes/${cardToDelete}`);
      setCards(cards.filter(c => c.id !== cardToDelete));

      addToast({
        type: 'success',
        title: 'Cartão removido',
        description: 'O cartão foi excluído com sucesso.'
      });

      setDeleteModalOpen(false);

    } catch (error) {
      console.error('Erro ao deletar cartão:', error);

      addToast({
        type: 'error',
        title: 'Não foi possível excluir',
        description: 'Verifique se existem compras vinculadas a este cartão.'
      });

      setDeleteModalOpen(false);
    } finally {
      setIsDeleting(false);
      setCardToDelete(null);
    }
  };

  const getCardStyle = (card: Cartao) => {
    if (card.cor) {
      return {
        background: `linear-gradient(135deg, ${card.cor} 0%, ${adjustColor(card.cor, -20)} 100%)`,
        color: '#fff'
      };
    }
    const n = card.nomePersonalizado?.toLowerCase() || '';
    if (n.includes('black') || n.includes('infinite')) return { background: 'linear-gradient(135deg, #1f2937 0%, #000 100%)', color: '#fff' };
    if (n.includes('platinum')) return { background: 'linear-gradient(135deg, #cbd5e1 0%, #64748b 100%)', color: '#fff' };
    return { background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', color: '#fff' };
  };

  return (
    <>
      <div className="space-y-8 animate-fadeIn pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold dark:text-white">Meus Cartões</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Gerencie seus cartões e pontuações.</p>
          </div>

          {!showForm ? (
            <button
              onClick={openCreateForm}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none w-fit"
            >
              <Plus size={20} />
              Novo Cartão
            </button>
          ) : (
            <button
              onClick={() => setShowForm(false)}
              className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm w-fit"
            >
              <ArrowLeft size={20} /> Voltar à Lista
            </button>
          )}
        </div>

        {/* ── SEÇÃO DE FORMULÁRIO ── */}
        {showForm && (
          <div className="bg-white dark:bg-slate-900 w-full rounded-[32px] shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden grid grid-cols-1 lg:grid-cols-2 animate-scaleIn">
            {/* ESQUERDA - Formulário */}
            <div className="p-8 md:p-10 flex flex-col justify-center">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                  {editingCardId ? <Edit2 className="text-indigo-600" /> : <Plus className="text-indigo-600" />}
                  {editingCardId ? 'Editar Cartão' : 'Novo Cartão'}
                </h2>
                <button onClick={() => setShowForm(false)} className="lg:hidden p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-50 dark:bg-slate-800 rounded-full">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveCard} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-500 dark:text-slate-400 uppercase mb-3">Cor do Cartão</label>
                  <div className="flex flex-wrap gap-3">
                    {CARD_COLORS.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        style={{ backgroundColor: color }}
                        className={`w-10 h-10 rounded-xl transition-all flex items-center justify-center shadow-sm ${selectedColor === color
                          ? 'ring-4 ring-indigo-500 scale-110 shadow-md'
                          : 'hover:scale-105 border-2 border-transparent'
                          }`}
                      >
                        {selectedColor === color && <Check size={16} className="text-white drop-shadow-md" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Apelido do Cartão</label>
                    <input
                      type="text"
                      value={formData.nomePersonalizado}
                      onChange={e => setFormData({ ...formData, nomePersonalizado: e.target.value })}
                      className="w-full px-5 py-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      placeholder="Ex: Nubank Principal"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Últimos 4 dígitos</label>
                      <input
                        type="text"
                        maxLength={4}
                        minLength={4}
                        value={formData.ultimosDigitos}
                        onChange={e => setFormData({ ...formData, ultimosDigitos: e.target.value.replace(/\D/g, '') })}
                        className={`w-full px-5 py-4 rounded-2xl border bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-center tracking-widest font-mono ${formData.ultimosDigitos.length > 0 && formData.ultimosDigitos.length < 4
                          ? 'border-amber-400 dark:border-amber-600'
                          : 'border-slate-100 dark:border-slate-800'
                          }`}
                        placeholder="0000"
                        required
                      />
                      {formData.ultimosDigitos.length > 0 && formData.ultimosDigitos.length < 4 && (
                        <p className="text-xs text-amber-500 mt-1">Informe os 4 dígitos</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Pontos por $</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={formData.fatorConversao}
                        onChange={e => setFormData({ ...formData, fatorConversao: e.target.value })}
                        className="w-full px-5 py-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        placeholder="Ex: 2.5"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Bandeira</label>
                    <div className="relative">
                      <select
                        value={formData.bandeiraId}
                        onChange={e => setFormData({ ...formData, bandeiraId: e.target.value })}
                        className="w-full px-5 py-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none"
                        required
                      >
                        <option value="">Selecione...</option>
                        {bandeiras.map(b => (
                          <option key={b.id} value={b.id}>{b.nome}</option>
                        ))}
                      </select>
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Programa de Pontos</label>
                    <div className="relative">
                      <select
                        value={formData.programaPontosId}
                        onChange={e => setFormData({ ...formData, programaPontosId: e.target.value })}
                        className="w-full px-5 py-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none"
                        required
                      >
                        <option value="">Selecione...</option>
                        {programas.map(p => (
                          <option key={p.id} value={p.id}>{p.nome}</option>
                        ))}
                      </select>
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="w-1/3 py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-2xl transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-2"
                  >
                    <Check size={20} />
                    {editingCardId ? 'Salvar Alterações' : 'Cadastrar Cartão'}
                  </button>
                </div>
              </form>
            </div>

            {/* DIREITA - Preview */}
            <div className="bg-slate-50 dark:bg-slate-950 p-8 md:p-10 flex flex-col items-center justify-center border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, gray 1px, transparent 0)',
                backgroundSize: '24px 24px'
              }}></div>

              <div className="relative w-full max-w-sm z-10">
                <div className="flex flex-col items-center gap-2 text-slate-400 uppercase text-xs font-bold mb-8">
                  <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow flex items-center justify-center">
                    <CreditCard size={18} />
                  </div>
                  Visualização
                </div>

                {/* Cartão Preview */}
                <div
                  className="relative w-full aspect-[1.586/1] rounded-[24px] p-6 text-white shadow-2xl transition-all duration-500 transform hover:scale-105 flex flex-col justify-between"
                  style={{
                    background: `linear-gradient(135deg, ${selectedColor} 0%, ${adjustColor(selectedColor, -40)} 100%)`,
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-8 bg-white/20 backdrop-blur-sm rounded-md flex items-center justify-center text-[10px] text-white/80 border border-white/10">Chip</div>
                    <span className="text-sm font-bold text-white/90 tracking-wide uppercase">
                      {bandeiras.find(b => b.id.toString() === formData.bandeiraId)?.nome || 'Bandeira'}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div className="text-xl font-bold tracking-wide drop-shadow-md">
                      {formData.nomePersonalizado || 'Nome do Cartão'}
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="font-mono text-white/80 text-base tracking-widest">
                        •••• •••• •••• {formData.ultimosDigitos || '0000'}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/20 flex justify-between items-center text-xs text-white/70">
                    <span className="truncate pr-2">
                      {programas.find(p => p.id.toString() === formData.programaPontosId)?.nome || 'Programa de Pontos'}
                    </span>
                    <div className="flex items-center gap-1 font-bold text-white shrink-0 bg-black/20 px-2 py-1 rounded-lg">
                      <Coins size={12} />
                      {formData.fatorConversao || '0.0'} pts/$
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── LISTA DE CARTÕES (Oculta quando o form está aberto) ── */}
        {!showForm && (
          loading ? (
            <div className="flex justify-center p-12"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
              {cards.length === 0 && (
                <div className="col-span-full text-center p-16 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                  <div className="w-20 h-20 mx-auto mb-5 flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl">
                    <CreditCard className="text-indigo-400 dark:text-indigo-500" size={40} />
                  </div>
                  <p className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-1">Nenhum cartão cadastrado</p>
                  <p className="text-slate-400 text-sm mb-5">Adicione seus cartões para começar a acumular pontos.</p>
                  <button
                    onClick={openCreateForm}
                    className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none"
                  >
                    Adicionar primeiro cartão
                  </button>
                </div>
              )}

              {cards.map((card) => {
                const style = getCardStyle(card);
                return (
                  <div
                    key={card.id}
                    className="rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800"
                  >
                    <div
                      className="p-6 text-white card-shine relative"
                      style={style}
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                          <svg width="36" height="26" viewBox="0 0 36 26" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-sm">
                            <rect width="36" height="26" rx="4" fill="#D4A017" />
                            <rect x="1" y="1" width="34" height="24" rx="3" fill="#F2BF2B" />
                            <rect x="12" y="1" width="12" height="24" fill="#D4A017" opacity="0.5" />
                            <rect x="1" y="8" width="34" height="10" fill="#D4A017" opacity="0.4" />
                            <rect x="4" y="4" width="28" height="18" rx="2" fill="none" stroke="#C49A0A" strokeWidth="0.5" />
                          </svg>
                          <span className="text-sm font-bold uppercase tracking-wide">
                            {card.nomeBandeira || 'VISA'}
                          </span>
                        </div>

                        <div className="flex gap-1">
                          <button
                            onClick={() => openEditForm(card)}
                            className="p-2 rounded-full hover:bg-white/20 text-white/80 transition-colors"
                            title="Editar"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteCard(card.id)}
                            className="p-2 rounded-full hover:bg-white/20 text-white/80 transition-colors"
                            title="Excluir"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="mb-6">
                        <div className="text-xl font-mono tracking-widest flex gap-3">
                          <span className="opacity-80">••••</span>
                          <span className="opacity-80">••••</span>
                          <span className="opacity-80">••••</span>
                          <span>{card.ultimosDigitos}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-end text-xs text-white/80">
                        <div>
                          <p className="uppercase text-[10px] opacity-80 mb-0.5">Apelido</p>
                          <p className="font-bold text-sm truncate max-w-[150px]">{card.nomePersonalizado}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex justify-between items-center text-sm mb-4">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-md">
                            <Coins size={14} className="text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <span className="text-slate-600 dark:text-slate-400 font-medium truncate max-w-[120px]">{card.nomeProgramaPontos || 'Sem Programa'}</span>
                        </div>
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold text-xs bg-indigo-50 dark:bg-indigo-900/30 px-2.5 py-1 rounded-lg">
                          {card.fatorConversao?.toFixed(1)} pts/$
                        </span>
                      </div>

                      <button
                        onClick={() => navigate(`/cards/${card.id}`)}
                        className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors border border-slate-100 dark:border-slate-700"
                      >
                        Ver Movimentações
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Excluir Cartão"
        description="Tem certeza que deseja remover este cartão? Esta ação não poderá ser desfeita e removerá o histórico associado."
        confirmText="Sim, excluir"
        cancelText="Cancelar"
        isLoading={isDeleting}
        variant="danger"
      />
    </>
  );
};

export default CardsPage;