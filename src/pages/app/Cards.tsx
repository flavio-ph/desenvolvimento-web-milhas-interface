import React, { useState, useEffect } from 'react';
import { Plus, CreditCard, Trash2, X, Check, Loader2, Coins, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../components/ToastContext';
import { ConfirmModal } from '../../components/ConfirmModal'; // Importando o Modal

interface Cartao {
  id: number;
  nomePersonalizado: string;
  ultimosDigitos: string;
  fatorConversao: number;
  nomeBandeira?: string;
  nomeProgramaPontos?: string;
  cor?: string;
  possuiCompras?: boolean; // Campo necessário para o bloqueio
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
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [cards, setCards] = useState<Cartao[]>([]);
  const [bandeiras, setBandeiras] = useState<Bandeira[]>([]);
  const [programas, setProgramas] = useState<Programa[]>([]);

  const [editingCardId, setEditingCardId] = useState<number | null>(null);

  // Estados para o Modal de Exclusão
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

  const openCreateModal = () => {
    setEditingCardId(null);
    setFormData({
      nomePersonalizado: '',
      ultimosDigitos: '',
      fatorConversao: '',
      bandeiraId: '',
      programaPontosId: ''
    });
    setSelectedColor(CARD_COLORS[0]);
    setShowModal(true);
  };

  const openEditModal = (card: Cartao) => {
    // NOVA LÓGICA: Verifica se o cartão tem compras antes de abrir
    if (card.possuiCompras) {
      addToast({
        type: 'info', // ou 'warning'
        title: 'Edição não permitida',
        description: 'Não é possível editar este cartão pois ele já possui compras registradas.'
      });
      return; // Interrompe a abertura do modal
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
    setShowModal(true);
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

      setShowModal(false);
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


  // Abre o modal de confirmação em vez de usar window.confirm
  const handleDeleteCard = (id: number) => {
    setCardToDelete(id);
    setDeleteModalOpen(true);
  };

  // Função executada ao confirmar no modal
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold dark:text-white">Meus Cartões</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Gerencie seus cartões e pontuações.</p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none"
          >
            <Plus size={20} />
            Novo Cartão
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center p-12"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.length === 0 && (
              <div className="col-span-full text-center p-12 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                <CreditCard className="mx-auto text-slate-400 mb-4" size={48} />
                <p className="text-slate-500">Você ainda não tem cartões cadastrados.</p>
              </div>
            )}

            {cards.map((card) => {
              const style = getCardStyle(card);
              return (
                <div
                  key={card.id}
                  className="rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800"
                >
                  {/* PARTE DO CARTÃO */}
                  <div
                    className="p-6 text-white"
                    style={style}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
                          ⚡
                        </div>
                        <span className="text-sm font-bold uppercase">
                          {card.nomeBandeira || 'VISA'}
                        </span>
                      </div>

                      {/* Botões de Ação */}
                      <div className="flex gap-1">
                        <button
                          onClick={() => openEditModal(card)}
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

                    <div className="mb-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-6 rounded-md bg-yellow-400"></div>
                        <div className="flex gap-2 text-lg tracking-widest font-mono">
                          •••• •••• ••••
                        </div>
                      </div>
                      <div className="text-lg font-mono tracking-widest">
                        {card.ultimosDigitos}
                      </div>
                    </div>

                    <div className="flex justify-between text-xs text-white/80">
                      <div>
                        <p className="uppercase text-[10px]">Apelido</p>
                        <p className="font-bold">{card.nomePersonalizado}</p>
                      </div>
                      <div className="text-right">
                        <p className="uppercase text-[10px]">Validade</p>
                        <p className="font-bold">12/28</p>
                      </div>
                    </div>
                  </div>

                  {/* PARTE BRANCA */}
                  <div className="p-5 bg-white dark:bg-slate-900">
                    <div className="flex justify-between items-center text-sm mb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                        <span>{card.nomeProgramaPontos || 'Sem Programa'}</span>
                      </div>
                      <span className="text-indigo-600 font-bold text-xs">
                        {card.fatorConversao?.toFixed(1)} pts / R$1,00
                      </span>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => navigate('/history')}
                        className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors"
                      >
                        Ver Extrato
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

          </div>
        )}
      </div>

      {/* Modal de Cadastro/Edição */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setShowModal(false)} />

          <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl animate-scaleIn z-10 overflow-hidden flex flex-col md:flex-row max-h-[90vh]">

            {/* Coluna da Esquerda - Formulário */}
            <div className="w-full md:w-1/2 flex flex-col overflow-y-auto">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 sticky top-0 z-20">
                <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
                  {/* Ícone muda se for edição ou criação */}
                  {editingCardId ? <Edit2 className="text-indigo-600" /> : <Plus className="text-indigo-600" />}
                  {editingCardId ? 'Editar Cartão' : 'Novo Cartão'}
                </h2>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSaveCard} className="p-6 space-y-5">
                {/* Seletor de Cores */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Cor do Cartão</label>
                  <div className="flex flex-wrap gap-3">
                    {CARD_COLORS.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        style={{ backgroundColor: color }}
                        className={`w-9 h-9 rounded-full transition-all flex items-center justify-center shadow-sm ${selectedColor === color
                          ? 'ring-2 ring-offset-2 ring-indigo-600 scale-110'
                          : 'hover:scale-105 hover:shadow-md border-2 border-transparent'
                          }`}
                      >
                        {selectedColor === color && <Check size={16} className="text-white drop-shadow-md" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Campos */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Apelido do Cartão</label>
                    <input
                      type="text"
                      value={formData.nomePersonalizado}
                      onChange={e => setFormData({ ...formData, nomePersonalizado: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                      placeholder="Ex: Nubank Principal"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Últimos 4 dígitos</label>
                      <input
                        type="text"
                        maxLength={4}
                        minLength={4}
                        value={formData.ultimosDigitos}
                        onChange={e => setFormData({ ...formData, ultimosDigitos: e.target.value.replace(/\D/g, '') })}
                        className={`w-full px-4 py-3 rounded-xl border bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white text-center tracking-widest font-mono ${formData.ultimosDigitos.length > 0 && formData.ultimosDigitos.length < 4
                          ? 'border-amber-400 dark:border-amber-600'
                          : 'border-slate-200 dark:border-slate-800'
                          }`}
                        placeholder="0000"
                        required
                      />
                      {formData.ultimosDigitos.length > 0 && formData.ultimosDigitos.length < 4 && (
                        <p className="text-xs text-amber-500 mt-1">Informe os 4 dígitos completos</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Pontos por $</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={formData.fatorConversao}
                        onChange={e => setFormData({ ...formData, fatorConversao: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                        placeholder="Ex: 2.5"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Bandeira</label>
                    <div className="relative">
                      <select
                        value={formData.bandeiraId}
                        onChange={e => setFormData({ ...formData, bandeiraId: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white appearance-none"
                        required
                      >
                        <option value="">Selecione...</option>
                        {bandeiras.map(b => (
                          <option key={b.id} value={b.id}>{b.nome}</option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Programa de Pontos</label>
                    <div className="relative">
                      <select
                        value={formData.programaPontosId}
                        onChange={e => setFormData({ ...formData, programaPontosId: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white appearance-none"
                        required
                      >
                        <option value="">Selecione...</option>
                        {programas.map(p => (
                          <option key={p.id} value={p.id}>{p.nome}</option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 flex items-center justify-center gap-2 transform active:scale-95">
                    <Check size={20} />
                    {editingCardId ? 'Atualizar Cartão' : 'Salvar Cartão'}
                  </button>
                </div>
              </form>
            </div>

            {/* Coluna da Direita - Visualização */}
            <div className="hidden md:flex md:w-1/2 bg-slate-50 dark:bg-slate-950 items-center justify-center p-8 border-l border-slate-100 dark:border-slate-800 relative overflow-hidden">
              {/* Background Decorativo */}
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, gray 1px, transparent 0)',
                backgroundSize: '24px 24px'
              }}></div>

              <div className="relative w-full max-w-sm">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 text-center">Visualização</h3>

                {/* Cartão Preview */}
                <div
                  className="relative w-full aspect-[1.586/1] rounded-2xl p-6 text-white shadow-2xl transition-all duration-500 transform hover:scale-105 flex flex-col justify-between"
                  style={{
                    background: `linear-gradient(135deg, ${selectedColor} 0%, ${adjustColor(selectedColor, -40)} 100%)`,
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-8 bg-white/20 backdrop-blur-sm rounded-md flex items-center justify-center text-[10px] text-white/80 border border-white/10">Chip</div>
                    {/* Exibe o nome da bandeira selecionada no preview */}
                    <span className="text-sm font-bold text-white/90">
                      {bandeiras.find(b => b.id.toString() === formData.bandeiraId)?.nome || 'VISA/MASTER'}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div className="text-lg font-bold tracking-wide drop-shadow-md">
                      {formData.nomePersonalizado || 'Seu Cartão'}
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="font-mono text-white/80 text-sm tracking-widest">
                        •••• •••• •••• {formData.ultimosDigitos || '0000'}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/20 flex justify-between items-center text-xs text-white/70">
                    <span>
                      {programas.find(p => p.id.toString() === formData.programaPontosId)?.nome || 'Programa'}
                    </span>
                    <div className="flex items-center gap-1 font-bold text-white">
                      <Coins size={12} />
                      {formData.fatorConversao || '1.0'} pts/$
                    </div>
                  </div>
                </div>

                <p className="text-center text-xs text-slate-400 mt-8">
                  Esta é uma prévia de como seu cartão aparecerá no painel.
                </p>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
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