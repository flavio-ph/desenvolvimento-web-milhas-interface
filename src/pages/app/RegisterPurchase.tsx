import React, { useState, useEffect } from 'react';
import { Calculator, AlertCircle, CheckCircle2, Upload, Loader2, CreditCard, ArrowRight, Zap } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../components/ToastContext';

interface Cartao {
  id: number;
  nomePersonalizado: string;
  ultimosDigitos: string;
  fatorConversao: number;
}

const RegisterPurchase: React.FC = () => {
  const { addToast } = useToast();
  const [amount, setAmount] = useState<string>('');
  const [selectedCardId, setSelectedCardId] = useState<string>('');
  const [calculatedPoints, setCalculatedPoints] = useState<number>(0);
  const [description, setDescription] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [cards, setCards] = useState<Cartao[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [shaking, setShaking] = useState(false);

  const triggerShake = () => {
    setShaking(true);
    setTimeout(() => setShaking(false), 600);
  };

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
        triggerShake();
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

      addToast({
        type: 'success',
        title: 'Compra Registrada!',
        description: 'Os pontos estão sendo processados e logo aparecerão no seu extrato.'
      });

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
      triggerShake();
    } finally {
      setIsSubmitting(false);
    }
  };

  const amountDisplay = amount
    ? `R$ ${parseFloat(amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    : 'R$ 0,00';

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">

      {/* ── Cabeçalho ── */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Registrar Nova Compra</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-0.5 text-sm">
          Lance seus gastos e anexe comprovantes para auditar suas milhas.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ────────────────── Formulário (esquerda) ────────────────── */}
        <div className="lg:col-span-3">
          <form
            onSubmit={handleSubmit}
            className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 space-y-5 ${shaking ? 'animate-shake' : ''}`}
          >
            {/* Erro */}
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
                <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
                <p className="text-sm font-semibold text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Descrição */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                Descrição da Compra
              </label>
              <input
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Ex: Passagem Aérea, Supermercado..."
                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all text-slate-800 dark:text-white placeholder-slate-300 dark:placeholder-slate-500 text-sm"
                required
              />
            </div>

            {/* Valor + Cartão */}
            <div className="grid grid-cols-2 gap-4">

              {/* Valor */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                  Valor (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold select-none">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0,00"
                    className="w-full pl-8 pr-3 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all text-slate-800 dark:text-white placeholder-slate-300 dark:placeholder-slate-500 text-sm"
                    required
                  />
                </div>
              </div>

              {/* Cartão */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                  Cartão Utilizado
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={15} />
                  <select
                    value={selectedCardId}
                    onChange={e => setSelectedCardId(e.target.value)}
                    className="w-full pl-9 pr-8 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all appearance-none text-slate-700 dark:text-white text-sm cursor-pointer"
                    required
                  >
                    {cards.length === 0 && <option value="">Nenhum cartão encontrado</option>}
                    {cards.map(card => (
                      <option key={card.id} value={card.id}>
                        {card.nomePersonalizado} (Final {card.ultimosDigitos})
                      </option>
                    ))}
                  </select>
                  {/* Chevron */}
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Upload */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                Comprovante (Opcional)
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.png,.jpg,.jpeg"
                id="file-upload"
                className="hidden"
              />
              <label
                htmlFor="file-upload"
                className={`flex flex-col items-center justify-center gap-2 w-full py-7 border-2 border-dashed rounded-xl cursor-pointer transition-all ${selectedFile
                  ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
                  : 'border-slate-200 dark:border-slate-700 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
              >
                {/* Ícone de upload */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedFile ? 'bg-indigo-100 dark:bg-indigo-900/40' : 'bg-slate-100 dark:bg-slate-800'
                  }`}>
                  <Upload
                    size={18}
                    className={selectedFile ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}
                  />
                </div>
                <span className={`text-sm ${selectedFile
                  ? 'text-indigo-700 dark:text-indigo-300 font-medium'
                  : 'text-slate-400 dark:text-slate-500'
                  }`}>
                  {selectedFile ? selectedFile.name : 'Clique para enviar PDF ou Imagem'}
                </span>
              </label>
            </div>

            {/* Botão */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold py-4 rounded-xl hover:from-indigo-500 hover:to-violet-500 transition-all transform hover:brightness-110 active:scale-[0.98] shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Registrando...
                </>
              ) : (
                <>
                  Confirmar Registro
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* ────────────────── Painel direito ────────────────── */}
        <div className="lg:col-span-2 flex flex-col gap-4">

          {/* Card Estimativa de Pontos */}
          <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 text-white p-5 rounded-2xl shadow-lg shadow-indigo-300/30 dark:shadow-indigo-950/30">
            {/* Blobs decorativos */}
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-8 -left-4 w-24 h-24 bg-violet-300/20 rounded-full blur-2xl pointer-events-none" />

            {/* Título */}
            <div className="relative z-10 flex items-start gap-3 mb-5">
              <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center shrink-0">
                <Calculator size={17} className="text-white" />
              </div>
              <h3 className="font-bold text-base leading-snug mt-0.5">
                Estimativa de<br />Pontos
              </h3>
            </div>

            {/* Valor Gasto */}
            <div className="relative z-10 flex items-center justify-between mb-4">
              <span className="text-indigo-200 text-[10px] font-bold uppercase tracking-widest">Valor Gasto</span>
              <span className="font-black text-lg">{amountDisplay}</span>
            </div>

            <div className="relative z-10 h-px bg-white/20 mb-4" />

            {/* Pontos */}
            <div className="relative z-10 flex items-center justify-between">
              <span className="text-indigo-200 text-[10px] font-bold uppercase tracking-widest">Pontos Gerados</span>
              <span className="font-black text-4xl tracking-tight">{calculatedPoints.toLocaleString('pt-BR')}</span>
            </div>

            {/* Nota */}
            <div className="relative z-10 flex items-center gap-1.5 mt-4">
              <div className="w-2 h-2 rounded-full bg-indigo-300 shrink-0" />
              <p className="text-indigo-300 text-[10px] leading-tight">
                Cálculo baseado na cotação atual do dólar
              </p>
            </div>
          </div>

          {/* Card Dica Pro */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center shrink-0">
                <Zap size={15} className="text-indigo-500 dark:text-indigo-400" />
              </div>
              <div>
                <p className="font-bold text-sm text-slate-800 dark:text-white">Dica Pro</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  Anexe o comprovante logo após a compra para evitar esquecimentos e garantir a auditoria.
                </p>
              </div>
            </div>
          </div>

          {/* Card Sucesso */}
          {success && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-5 rounded-2xl flex flex-col items-center text-center gap-2 animate-fadeIn">
              <div className="w-11 h-11 bg-emerald-100 dark:bg-emerald-800/50 rounded-full flex items-center justify-center mb-1">
                <CheckCircle2 className="text-emerald-600 dark:text-emerald-400" size={22} />
              </div>
              <h4 className="font-bold text-sm text-emerald-800 dark:text-emerald-300">Sucesso!</h4>
              <p className="text-xs text-emerald-600/80 dark:text-emerald-400/70 leading-relaxed">
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