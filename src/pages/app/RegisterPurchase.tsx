import React, { useState, useEffect } from 'react';
import { Calculator, AlertCircle, CheckCircle2, Upload, Loader2, DollarSign, CreditCard } from 'lucide-react';
import api from '../../services/api';

interface Cartao {
  id: number;
  nomePersonalizado: string; 
  ultimosDigitos: string;    
  fatorConversao: number;
}

const RegisterPurchase: React.FC = () => {
  const [amount, setAmount] = useState<string>('');
  const [selectedCardId, setSelectedCardId] = useState<string>('');
  const [calculatedPoints, setCalculatedPoints] = useState<number>(0);
  const [description, setDescription] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [cards, setCards] = useState<Cartao[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/cartoes')
      .then(response => {
        setCards(response.data);
        if (response.data.length > 0) {
          setSelectedCardId(response.data[0].id.toString());
        }
      })
      .catch(err => console.error("Erro ao buscar cartões", err));
  }, []);

  useEffect(() => {
    const card = cards.find(c => c.id.toString() === selectedCardId);
    if (card && amount) {
      const points = Math.floor(parseFloat(amount) * (card.fatorConversao || 1));
      setCalculatedPoints(points);
    } else {
      setCalculatedPoints(0);
    }
  }, [amount, selectedCardId, cards]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccess(false);
    setError('');

    try {
      if (!selectedCardId) {
        setError("Selecione um cartão para continuar.");
        setIsSubmitting(false);
        return;
      }

      const compraBody = {
        descricao: description,
        valorGasto: parseFloat(amount),
        cartaoId: parseInt(selectedCardId)
      };

      const resCompra = await api.post('/compras', compraBody);
      const novaCompraId = resCompra.data.id; 

      if (selectedFile) {
        const formData = new FormData();
        formData.append('arquivo', selectedFile); 

        await api.post(`/compras/${novaCompraId}/upload-comprovante`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      setSuccess(true);
      setAmount('');
      setDescription('');
      setSelectedFile(null);
      
    } catch (err: any) {
      console.error("Erro ao registrar compra:", err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Não foi possível registrar a compra. Tente novamente.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      
      {/* Cabeçalho */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Registrar Nova Compra</h1>
        <p className="text-slate-500 dark:text-slate-400">Lance seus gastos e anexe comprovantes para auditar suas milhas.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Lado Esquerdo: Formulário */}
        <div className="lg:col-span-3 space-y-6">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
            
            {/* Mensagem de Erro */}
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
                <AlertCircle className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" size={18} />
                <p className="text-sm font-bold text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              {/* Descrição */}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Descrição da Compra</label>
                <input 
                  type="text" 
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  placeholder="Ex: Passagem Aérea, Supermercado..."
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white" 
                  required 
                />
              </div>

              {/* Valor e Cartão */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Valor (R$)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="number" 
                      step="0.01" 
                      value={amount} 
                      onChange={e => setAmount(e.target.value)} 
                      placeholder="0,00"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white" 
                      required 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Cartão Utilizado</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <select 
                      value={selectedCardId}
                      onChange={(e) => setSelectedCardId(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none dark:text-white cursor-pointer"
                      required
                    >
                      {cards.length === 0 && <option value="">Nenhum cartão encontrado</option>}
                      {cards.map(card => (
                        <option key={card.id} value={card.id}>
                           {card.nomePersonalizado} (Final {card.ultimosDigitos})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Upload de Comprovante */}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Comprovante (Opcional)</label>
                <div className="relative group">
                  <input 
                    type="file" 
                    onChange={handleFileChange}
                    accept=".pdf, .png, .jpg, .jpeg"
                    id="file-upload"
                    className="hidden"
                  />
                  <label 
                    htmlFor="file-upload" 
                    className={`flex items-center justify-center gap-2 w-full px-4 py-4 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${selectedFile ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400'}`}
                  >
                    <Upload size={20} className={selectedFile ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'} />
                    <span className={`text-sm font-medium ${selectedFile ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-500 dark:text-slate-400'}`}>
                      {selectedFile ? selectedFile.name : 'Clique para enviar PDF ou Imagem'}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-all transform active:scale-[0.98] shadow-lg shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Registrando...
                </>
              ) : (
                'Confirmar Registro'
              )}
            </button>
          </form>
        </div>
        
        {/* Lado Direito: Preview e Resultado */}
        <div className="lg:col-span-2 space-y-6">
           
           {/* Card de Cálculo */}
           <div className="bg-indigo-600 text-white p-6 rounded-2xl shadow-xl shadow-indigo-200 dark:shadow-none overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
              
              <h3 className="text-lg font-bold flex items-center gap-2 mb-6 relative z-10">
                <Calculator size={20} className="text-indigo-200" /> 
                Estimativa de Pontos
              </h3>
              
              <div className="space-y-4 relative z-10">
                 <div className="flex justify-between items-end border-b border-indigo-500/50 pb-4">
                    <span className="text-indigo-200 text-sm">Valor Gasto</span>
                    <span className="font-medium">
                      {amount ? `R$ ${parseFloat(amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ 0,00'}
                    </span>
                 </div>
                 <div className="flex justify-between items-end">
                    <span className="text-indigo-200 text-sm">Pontos Gerados</span>
                    <span className="font-bold text-3xl text-white tracking-tight">{calculatedPoints.toLocaleString('pt-BR')}</span>
                 </div>
              </div>
           </div>

           {/* Card de Sucesso */}
           {success && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-6 rounded-2xl flex flex-col items-center text-center gap-3 animate-fadeIn">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-800 rounded-full flex items-center justify-center mb-1">
                <CheckCircle2 className="text-emerald-600 dark:text-emerald-400" size={24} />
              </div>
              <h4 className="text-lg font-bold text-emerald-800 dark:text-emerald-300">Sucesso!</h4>
              <p className="text-sm text-emerald-600 dark:text-emerald-400/80 leading-relaxed">
                A compra foi registrada e os pontos já estão sendo calculados pelo sistema.
              </p>
            </div>
           )}
        </div>

      </div>
    </div>
  );
};

export default RegisterPurchase;