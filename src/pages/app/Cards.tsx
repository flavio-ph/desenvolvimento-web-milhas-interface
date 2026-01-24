import React, { useState, useEffect } from 'react';
import { Plus, CreditCard, Trash2, X, Check, Loader2, Coins } from 'lucide-react';
import api from '../../services/api';

// Interfaces baseadas no seu Backend
interface Cartao {
  id: number;
  nomePersonalizado: string;
  ultimosDigitos: string;
  fatorConversao: number;
  nomeBandeira?: string;
  nomePrograma?: string;
  cor?: string;
}

interface Bandeira {
  id: number;
  nome: string;
}

interface Programa {
  id: number;
  nome: string;
}

// Constante de cores
const CARD_COLORS = [
  '#820AD1', // Nubank Roxo
  '#ec6708', // Itaú Laranja
  '#cc092f', // Bradesco Vermelho
  '#0056a6', // Azul Padrão
  '#1a1a1a', // Preto/Carbon
  '#eab308', // Dourado
  '#10b981', // Verde
];

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
    fatorConversao: '',
    bandeiraId: '',
    programaPontosId: ''
  });

  // Estado da cor selecionada
  const [selectedColor, setSelectedColor] = useState(CARD_COLORS[0]);

  // Helper para escurecer a cor (para o gradiente)
  const adjustColor = (color: string, amount: number) => {
    return '#' + color.replace(/^#/, '').replace(/../g, color => ('0'+Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
  }

  // 1. Buscar dados iniciais
  const fetchData = async () => {
    try {
      setLoading(true);
      const [cardsRes, bandeirasRes, programasRes] = await Promise.all([
        api.get('/cartoes'),
        api.get('/bandeiras'),
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

  // 2. Criar novo cartão
  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.bandeiraId || !formData.programaPontosId) {
      alert("Selecione uma bandeira e um programa de pontos.");
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
      setSelectedColor(CARD_COLORS[0]);
      fetchData(); 
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

  // Helper visual para estilo do cartão (Listagem)
  const getCardStyle = (card: Cartao) => {
    if (card.cor) {
      return {
        background: `linear-gradient(135deg, ${card.cor} 0%, ${adjustColor(card.cor, -20)} 100%)`,
        color: '#fff'
      };
    }
    // Fallback
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
              const style = getCardStyle(card);
              return (
                <div 
                  key={card.id} 
                  className="group relative rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-transparent min-h-[180px] flex flex-col justify-between"
                  style={style}
                >
                  <div className="relative z-10 h-full flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div className="w-12 h-8 bg-white/20 backdrop-blur-sm rounded-md flex items-center justify-center text-[10px] text-white/80 border border-white/10">Chip</div>
                      <button 
                        onClick={() => handleDeleteCard(card.id)}
                        className="p-2 hover:bg-white/20 rounded-full text-white/70 hover:text-white transition-colors"
                        title="Excluir Cartão"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div>
                      <h3 className="font-bold text-lg mb-1 text-white drop-shadow-sm">{card.nomePersonalizado}</h3>
                      <div className="flex justify-between items-end mb-4">
                          <p className="text-sm text-white/80 font-medium">
                            {card.nomeBandeira || 'Bandeira n/a'}
                          </p>
                          <p className="text-xs font-mono bg-black/20 px-2 py-1 rounded text-white/90 border border-white/10">
                            •••• {card.ultimosDigitos}
                          </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/20 flex justify-between items-center">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-white/60 font-bold">Programa</p>
                        <p className="text-sm font-medium text-white truncate max-w-[100px]">
                          {card.nomePrograma || '-'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-wider text-white/60 font-bold">Conversão</p>
                        <div className="flex items-center gap-1 justify-end text-white">
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
      </div>

      {/* Modal movido para fora da div principal para corrigir o blur */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setShowModal(false)} />
          
          <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl animate-scaleIn z-10 overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
            
            {/* Coluna da Esquerda - Formulário */}
            <div className="w-full md:w-1/2 flex flex-col overflow-y-auto">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 sticky top-0 z-20">
                <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
                  <Plus className="text-indigo-600" />
                  Novo Cartão
                </h2>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleCreateCard} className="p-6 space-y-5">
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
                        className={`w-9 h-9 rounded-full transition-all flex items-center justify-center shadow-sm ${
                          selectedColor === color 
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
                      onChange={e => setFormData({...formData, nomePersonalizado: e.target.value})}
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
                        value={formData.ultimosDigitos}
                        onChange={e => setFormData({...formData, ultimosDigitos: e.target.value.replace(/\D/g, '')})}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white text-center tracking-widest font-mono" 
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
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Bandeira</label>
                    <div className="relative">
                        <select
                            value={formData.bandeiraId}
                            onChange={e => setFormData({...formData, bandeiraId: e.target.value})}
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
                            onChange={e => setFormData({...formData, programaPontosId: e.target.value})}
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
                    Salvar Cartão
                  </button>
                </div>
              </form>
            </div>

            {/* Coluna da Direita - Visualização (Preview) */}
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
    </>
  );
};

export default CardsPage;