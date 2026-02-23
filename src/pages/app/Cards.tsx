import React, { useState, useEffect } from 'react';
import { Plus, CreditCard, ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from '../../components/ToastContext';
import { ConfirmModal } from '../../components/ConfirmModal';
import { cartaoService, CartaoResponse, CartaoPayload } from '../../services/cartaoService';
import { bandeiraService, BandeiraResponse } from '../../services/bandeiraService';
import { programaService, ProgramaResponse } from '../../services/programaService';
import { isAxiosError } from 'axios';
import { CardForm } from './Cards/CardForm';
import { CardList } from './Cards/CardList';

// Interfaces substituted by services domain models

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

  const [cards, setCards] = useState<CartaoResponse[]>([]);
  const [bandeiras, setBandeiras] = useState<BandeiraResponse[]>([]);
  const [programas, setProgramas] = useState<ProgramaResponse[]>([]);

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
        cartaoService.listarCartoes(),
        bandeiraService.listarAtivas(),
        programaService.listarProgramas()
      ]);

      setCards(cardsRes);
      setBandeiras(bandeirasRes);
      setProgramas(programasRes);
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

  const openEditForm = (card: CartaoResponse) => {
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
      const payload: CartaoPayload = {
        nomePersonalizado: formData.nomePersonalizado,
        ultimosDigitos: formData.ultimosDigitos,
        fatorConversao: parseFloat(formData.fatorConversao.replace(',', '.')),
        bandeiraId: parseInt(formData.bandeiraId),
        programaPontosId: parseInt(formData.programaPontosId),
        cor: selectedColor
      };

      if (editingCardId) {
        await cartaoService.atualizarCartao(editingCardId, payload);
      } else {
        await cartaoService.criarCartao(payload);
      }

      setShowForm(false);
      fetchData();

      addToast({
        type: 'success',
        title: 'Sucesso!',
        description: editingCardId ? 'O cartão foi atualizado com sucesso.' : 'Novo cartão adicionado à sua carteira.'
      });

    } catch (error: unknown) {
      console.error('Erro ao salvar cartão:', error);
      const msg = isAxiosError(error) ? (error.response?.data?.message || 'Verifique os dados e tente novamente.') : 'Verifique os dados e tente novamente.';
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
      await cartaoService.deletarCartao(cardToDelete);
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

  const getCardStyle = (card: CartaoResponse) => {
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
          <CardForm
            formData={formData}
            setFormData={setFormData}
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
            editingCardId={editingCardId}
            bandeiras={bandeiras}
            programas={programas}
            onClose={() => setShowForm(false)}
            onSubmit={handleSaveCard}
            cardColors={CARD_COLORS}
          />
        )}

        {/* ── LISTA DE CARTÕES (Oculta quando o form está aberto) ── */}
        {!showForm && (
          loading ? (
            <div className="flex justify-center p-12"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>
          ) : (
            <CardList
              cards={cards}
              onOpenCreateForm={openCreateForm}
              onEditCard={openEditForm}
              onDeleteCard={handleDeleteCard}
              getCardStyle={getCardStyle}
            />
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