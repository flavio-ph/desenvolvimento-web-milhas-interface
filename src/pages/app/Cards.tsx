import React, { useState, useEffect } from 'react';
import { Plus, CreditCard, Trash2, X, Check, Loader2, Coins } from 'lucide-react';
import api from '../../services/api';

// Interfaces baseadas no seu Backend
interface Cartao {
  id: number;
  nomePersonalizado: string; // Atualizado conforme DTO
  ultimosDigitos: string;
  fatorConversao: number;    // Novo campo
  nomeBandeira?: string;     // Para exibição
  nomePrograma?: string;     // Para exibição
}

interface Bandeira {
  id: number;
  nome: string;
}

interface Programa {
  id: number;
  nome: string;
}

const CardsPage: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Listas de dados
  const [cards, setCards] = useState<Cartao[]>([]);
  const [bandeiras, setBandeiras] = useState<Bandeira[]>([]);
  const [programas, setProgramas] = useState<Programa[]>([]);

  // Estado do Formulário
  const [formData, setFormData] = useState({
    nomePersonalizado: '',
    ultimosDigitos: '',
    fatorConversao: '', // String para facilitar digitação de decimais
    bandeiraId: '',
    programaPontosId: ''
  });

  // 1. Buscar dados iniciais (Cartões, Bandeiras e Programas)
  const fetchData = async () => {
    try {
      setLoading(true);
      const [cardsRes, bandeirasRes, programasRes] = await Promise.all([
        api.get('/cartoes'),
        api.get('/bandeiras'),
        api.get('/programas') // Assumindo que essa rota existe (AdminPrograms)
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

  // 2. Criar novo cartão
  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação simples para garantir que selecionou as opções
    if (!formData.bandeiraId || !formData.programaPontosId) {
      alert("Selecione uma bandeira e um programa de pontos.");
      return;
    }

    try {
      // Montando o payload EXATAMENTE como o CartaoRequest.java espera
      const payload = {
        nomePersonalizado: formData.nomePersonalizado,
        ultimosDigitos: formData.ultimosDigitos,
        fatorConversao: parseFloat(formData.fatorConversao),
        bandeiraId: parseInt(formData.bandeiraId),
        programaPontosId: parseInt(formData.programaPontosId)
      };

      await api.post('/cartoes', payload);
      
      // Sucesso
      setShowModal(false);
      setFormData({ 
        nomePersonalizado: '', 
        ultimosDigitos: '', 
        fatorConversao: '', 
        bandeiraId: '', 
        programaPontosId: '' 
      });
      fetchData(); // Recarrega a lista
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

  // Helper visual para cor do cartão
  const getCardVariant = (nome: string) => {
    const n = nome?.toLowerCase() || '';
    if (n.includes('black') || n.includes('infinite')) return 'black';
    if (n.includes('platinum')) return 'platinum';
    return 'default';
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold dark:text-white">Meus Cartões</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Gerencie seus cartões e pontuações.</p>
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
            const variant = getCardVariant(card.nomePersonalizado);
            return (
              <div key={card.id} className="group relative bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all">
                {/* Background Decorativo */}
                <div className={`absolute inset-0 bg-gradient-to-br ${
                  variant === 'black' ? 'from-slate-800 to-black' : 
                  variant === 'platinum' ? 'from-slate-300 to-slate-500' : 
                  'from-indigo-500 to-purple-600'
                } opacity-5 rounded-2xl transition-opacity group-hover:opacity-10 pointer-events-none`}></div>
                
                <div className="relative">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-8 bg-slate-200 dark:bg-slate-700 rounded-md opacity-50 flex items-center justify-center text-[10px] text-slate-500">Chip</div>
                    <button 
                      onClick={() => handleDeleteCard(card.id)}
                      className="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-full text-slate-400 hover:text-rose-600 transition-colors"
                      title="Excluir Cartão"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <h3 className="font-bold text-lg dark:text-white mb-1">{card.nomePersonalizado}</h3>
                  <div className="flex justify-between items-end mb-4">
                     <p className="text-sm text-slate-500 dark:text-slate-400">
                       {card.nomeBandeira || 'Bandeira n/a'}
                     </p>
                     <p className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-600 dark:text-slate-300">
                        •••• {card.ultimosDigitos}
                     </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Programa</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate max-w-[100px]">
                        {card.nomePrograma || '-'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Conversão</p>
                      <div className="flex items-center gap-1 justify-end text-indigo-600 dark:text-indigo-400">
                        <Coins size={14} />
                        <p className="font-bold text-sm">{card.fatorConversao?.toFixed(1) || '1.0'}</p>
                      </div>
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
              {/* Nome do Cartão */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome do Cartão (Apelido)</label>
                <input 
                  type="text" 
                  value={formData.nomePersonalizado}
                  onChange={e => setFormData({...formData, nomePersonalizado: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white" 
                  placeholder="Ex: Nubank Ultravioleta" 
                  required
                />
              </div>

              {/* Últimos Dígitos e Conversão */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Últimos 4 dígitos</label>
                  <input 
                    type="text" 
                    maxLength={4} 
                    value={formData.ultimosDigitos}
                    onChange={e => setFormData({...formData, ultimosDigitos: e.target.value.replace(/\D/g, '')})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white text-center tracking-widest" 
                    placeholder="0000" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Pontos por $</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    min="0"
                    value={formData.fatorConversao}
                    onChange={e => setFormData({...formData, fatorConversao: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white" 
                    placeholder="Ex: 2.5" 
                    required
                  />
                </div>
              </div>
              
              {/* Seleção de Bandeira */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Bandeira</label>
                <div className="relative">
                    <select
                        value={formData.bandeiraId}
                        onChange={e => setFormData({...formData, bandeiraId: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white appearance-none"
                        required
                    >
                        <option value="">Selecione a bandeira...</option>
                        {bandeiras.map(b => (
                            <option key={b.id} value={b.id}>{b.nome}</option>
                        ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                </div>
                {bandeiras.length === 0 && (
                    <p className="text-xs text-amber-500 mt-1">Nenhuma bandeira encontrada. Cadastre em "Bandeiras".</p>
                )}
              </div>

              {/* Seleção de Programa */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Programa de Pontos</label>
                <div className="relative">
                    <select
                        value={formData.programaPontosId}
                        onChange={e => setFormData({...formData, programaPontosId: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white appearance-none"
                        required
                    >
                        <option value="">Selecione o programa...</option>
                        {programas.map(p => (
                            <option key={p.id} value={p.id}>{p.nome}</option>
                        ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                </div>
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