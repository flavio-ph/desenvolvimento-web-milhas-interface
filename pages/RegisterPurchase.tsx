
import React, { useState, useEffect } from 'react';
import { Camera, FileText, Calculator, AlertCircle, CheckCircle2, Upload } from 'lucide-react';
import { MOCK_CARDS } from '../constants';

const RegisterPurchase: React.FC = () => {
  const [amount, setAmount] = useState<string>('');
  const [selectedCardId, setSelectedCardId] = useState<string>(MOCK_CARDS[0].id);
  const [calculatedPoints, setCalculatedPoints] = useState<number>(0);
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const card = MOCK_CARDS.find(c => c.id === selectedCardId);
    if (card && amount) {
      setCalculatedPoints(Math.floor(parseFloat(amount) * card.multiplier));
    } else {
      setCalculatedPoints(0);
    }
  }, [amount, selectedCardId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
      setAmount('');
      setDescription('');
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold dark:text-white">Nova Aquisição</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Registre suas compras e calcule seus pontos automaticamente.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Descrição da Compra</label>
                <input 
                  type="text" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Amazon Prime"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 dark:text-white outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Valor (R$)</label>
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0,00"
                    step="0.01"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 dark:text-white outline-none font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Cartão Utilizado</label>
                  <select 
                    value={selectedCardId}
                    onChange={(e) => setSelectedCardId(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 dark:text-white outline-none"
                  >
                    {MOCK_CARDS.map(card => (
                      <option key={card.id} value={card.id}>{card.name} (***{card.lastFour})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Comprovante (Imagem ou PDF)</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 dark:border-slate-700 border-dashed rounded-xl hover:border-indigo-500 transition-colors group cursor-pointer">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                    <div className="flex text-sm text-slate-600 dark:text-slate-400">
                      <label className="relative cursor-pointer bg-transparent rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                        <span>Anexar arquivo</span>
                        <input type="file" className="sr-only" />
                      </label>
                      <p className="pl-1">ou arraste aqui</p>
                    </div>
                    <p className="text-xs text-slate-500">PNG, JPG, PDF até 10MB</p>
                  </div>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-none disabled:opacity-50"
            >
              {isSubmitting ? 'Processando...' : 'Confirmar Registro'}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-indigo-600 text-white p-6 rounded-2xl shadow-xl">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
              <Calculator size={20} />
              Cálculo de Pontos
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center opacity-80">
                <span>Valor Base</span>
                <span>R$ {parseFloat(amount || '0').toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center opacity-80">
                <span>Multiplicador do Cartão</span>
                <span>{MOCK_CARDS.find(c => c.id === selectedCardId)?.multiplier}x</span>
              </div>
              <div className="h-[1px] bg-white/20 my-4"></div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs uppercase font-bold opacity-60">Total Estimado</p>
                  <p className="text-4xl font-bold">{calculatedPoints}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs opacity-80">Prazo de crédito:</p>
                  <p className="font-semibold">7 dias úteis</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 p-4 rounded-xl flex gap-3">
            <AlertCircle className="text-amber-600 shrink-0" size={20} />
            <p className="text-sm text-amber-800 dark:text-amber-400">
              Lembre-se de anexar o comprovante para que nossa IA valide os pontos caso ocorra algum erro no crédito automático.
            </p>
          </div>

          {success && (
            <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-900/30 p-4 rounded-xl flex gap-3 animate-bounce">
              <CheckCircle2 className="text-emerald-600 shrink-0" size={20} />
              <div>
                <p className="text-sm font-bold text-emerald-800 dark:text-emerald-400">Sucesso!</p>
                <p className="text-xs text-emerald-700 dark:text-emerald-500">Sua compra foi registrada e os pontos estão em processamento.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterPurchase;
