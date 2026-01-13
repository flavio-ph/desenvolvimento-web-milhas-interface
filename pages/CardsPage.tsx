import React, { useState, useEffect } from 'react';
import { Plus, CreditCard, Trash2, Edit2, X, Check, Loader2 } from 'lucide-react';
import api from '../services/api';

// Tipos baseados nos DTOs do Java (CartaoResponse e CartaoRequest)
interface Cartao {
  id: number;
  nome: string;
  ultimosDigitos: string;
  diaVencimento: number;
  nomeBandeira?: string;
  nomePrograma?: string;
}

// Simples mapeamento para cores visuais dos cartões
const getCardVariant = (nome: string) => {
  const n = nome.toLowerCase();
  if (n.includes('black') || n.includes('infinite')) return 'black';
  if (n.includes('platinum')) return 'platinum';
  return 'default';
};

const CardsPage: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [cards, setCards] = useState<Cartao[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados do Formulário
  const [formData, setFormData] = useState({
    nome: '',
    ultimosDigitos: '',
    diaVencimento: '',
    bandeiraId: 1, // Default temporário, ideal seria buscar do backend
    programaPontosId: 1 // Default temporário
  });

  // 1. Buscar cartões ao carregar a página
  const fetchCards = async () => {
    try {
      const response = await api.get('/cartoes');
      setCards(response.data);
    } catch (error) {
      console.error('Erro ao buscar cartões:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  // 2. Criar novo cartão
  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/cartoes', {
        ...formData,
        diaVencimento: parseInt(formData.diaVencimento)
      });
      setShowModal(false);
      setFormData({ nome: '', ultimosDigitos: '', diaVencimento: '', bandeiraId: 1, programaPontosId: 1 }); // Limpa form
      fetchCards(); // Recarrega a lista
    } catch (error) {
      console.error('Erro ao criar cartão:', error);
      alert('Erro ao criar cartão. Verifique os dados.');
    }
  };

  // 3. Deletar cartão
  const handleDeleteCard = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este cartão?')) return;
    try {
      await api.delete(`/cartoes/${id}`);
      setCards(cards.filter(c => c.id !== id));
    } catch (error) {
      console.error('Erro ao deletar cartão:', error);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold dark:text-white">Meus Cartões</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Gerencie seus cartões de crédito.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
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
            const variant = getCardVariant(card.nome);
            return (
              <div key={card.id} className="group relative bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all">
                {/* Background Decorativo */}
                <div className={`absolute inset-0 bg-gradient-to-br ${
                  variant === 'black' ? 'from-slate-800 to-black' : 
                  variant === 'platinum' ? 'from-slate-300 to-slate-500' : 
                  'from-indigo-500 to-purple-600'
                } opacity-5 rounded-2xl transition-opacity group-hover:opacity-10 pointer-events-none`}></div>
                
                <div className="relative">
                  <div className="flex justify-between items-start mb-8">
                    <div className="w-12 h-8 bg-slate-200 dark:bg-slate-700 rounded-md opacity-50 flex items-center justify-center text-[10px] text-slate-500">Chip</div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleDeleteCard(card.id)}
                        className="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-full text-slate-400 hover:text-rose-600 transition-colors"
                        title="Excluir Cartão"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-lg dark:text-white mb-1">{card.nome}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                    {card.nomePrograma || 'Sem programa vinculado'}
                  </p>

                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Final</p>
                      <p className="font-mono text-slate-600 dark:text-slate-300">•••• {card.ultimosDigitos}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Vencimento</p>
                      <p className="font-medium text-slate-900 dark:text-white">Dia {card.diaVencimento}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Criação */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl animate-scaleIn">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-bold dark:text-white">Adicionar Novo Cartão</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleCreateCard} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome do Cartão (Apelido)</label>
                <input 
                  type="text" 
                  value={formData.nome}
                  onChange={e => setFormData({...formData, nome: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white" 
                  placeholder="Ex: Nubank Ultravioleta" 
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Últimos 4 dígitos</label>
                  <input 
                    type="text" 
                    maxLength={4} 
                    value={formData.ultimosDigitos}
                    onChange={e => setFormData({...formData, ultimosDigitos: e.target.value.replace(/\D/g, '')})}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white" 
                    placeholder="0000" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Dia Vencimento</label>
                  <input 
                    type="number" 
                    min={1} 
                    max={31} 
                    value={formData.diaVencimento}
                    onChange={e => setFormData({...formData, diaVencimento: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white" 
                    placeholder="DD" 
                    required
                  />
                </div>
              </div>
              
              {/* Nota: Idealmente, você buscaria estas listas do backend (/programas e /bandeiras) */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Programa de Pontos (ID)</label>
                <input 
                   type="number"
                   value={formData.programaPontosId}
                   onChange={e => setFormData({...formData, programaPontosId: parseInt(e.target.value)})}
                   className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                   placeholder="ID do Programa (ex: 1)"
                />
                <p className="text-xs text-slate-400 mt-1">Coloque 1 se ainda não criou programas.</p>
              </div>

              <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 mt-4">
                <Check size={20} />
                Salvar Cartão
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardsPage;