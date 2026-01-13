import React, { useState, useEffect } from 'react';
import { Calculator, AlertCircle, CheckCircle2, Upload, Loader2 } from 'lucide-react';
import api from '../services/api'; // Sua API

// Tipos para TypeScript não reclamar
interface Cartao {
  id: number;
  nome: string;
  finalCartao: string; // Verifique se no DTO do backend é 'finalCartao' ou 'ultimos4Digitos'
  fatorConversao: number; // No backend é fatorConversao? Ou multipler? (Ajustar conforme JSON de retorno)
}

const RegisterPurchase: React.FC = () => {
  const [amount, setAmount] = useState<string>('');
  const [selectedCardId, setSelectedCardId] = useState<string>('');
  const [calculatedPoints, setCalculatedPoints] = useState<number>(0);
  const [description, setDescription] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // Novo State para arquivo
  
  const [cards, setCards] = useState<Cartao[]>([]); // State para cartões reais
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // 1. Buscar Cartões do Backend ao carregar a página
  useEffect(() => {
    api.get('/cartoes')
      .then(response => {
        setCards(response.data);
        if (response.data.length > 0) setSelectedCardId(response.data[0].id.toString());
      })
      .catch(err => console.error("Erro ao buscar cartões", err));
  }, []);

  // 2. Calcular pontos (Visual apenas)
  useEffect(() => {
    const card = cards.find(c => c.id.toString() === selectedCardId);
    if (card && amount) {
      // Ajuste: usar o nome do campo correto que vem do backend (ex: fatorConversao)
      setCalculatedPoints(Math.floor(parseFloat(amount) * (card.fatorConversao || 1)));
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

    try {
      // Passo A: Criar a Compra (JSON)
      // Ajustando os nomes para bater com CompraRequest.java
      const compraBody = {
        descricao: description,
        valorGasto: parseFloat(amount),
        cartaoId: parseInt(selectedCardId)
      };

      const resCompra = await api.post('/compras', compraBody);
      const novaCompraId = resCompra.data.id; // Backend retorna o ID no CompraResponse

      // Passo B: Enviar o Arquivo (Se houver)
      if (selectedFile) {
        const formData = new FormData();
        formData.append('arquivo', selectedFile);

        await api.post(`/compras/${novaCompraId}/upload-comprovante`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' } // Importante para upload
        });
      }

      setSuccess(true);
      setAmount('');
      setDescription('');
      setSelectedFile(null);
      
    } catch (error) {
      console.error("Erro ao salvar compra:", error);
      alert("Erro ao registrar. Verifique os dados.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* ... Cabeçalho ... */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm space-y-6">
            
            {/* Campos Descrição e Valor (Mantidos iguais, só verificar os names) */}
            <div className="space-y-4">
              {/* ... Inputs de Descrição e Valor ... */}
               <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Descrição</label>
                <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="w-full px-4 py-3 bg-slate-50 rounded-xl" required />
              </div>
               <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Valor (R$)</label>
                <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className="w-full px-4 py-3 bg-slate-50 rounded-xl" required />
              </div>

              {/* Select de Cartões REAIS */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Cartão Utilizado</label>
                <select 
                  value={selectedCardId}
                  onChange={(e) => setSelectedCardId(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl"
                >
                  {cards.map(card => (
                    <option key={card.id} value={card.id}>
                       {/* Ajuste os campos para bater com o retorno do backend */}
                       {card.nome} (Final {card.finalCartao || '****'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Input de Arquivo Atualizado */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Comprovante</label>
                <input 
                  type="file" 
                  onChange={handleFileChange}
                  accept=".pdf, .png, .jpg, .jpeg"
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 className="animate-spin"/> : 'Confirmar Registro'}
            </button>
          </form>
        </div>
        
        {/* Coluna da Direita (Mantida igual, vai usar os dados do state calculado) */}
        <div className="lg:col-span-2 space-y-6">
           {/* ... Componente de visualização de pontos ... */}
           <div className="bg-indigo-600 text-white p-6 rounded-2xl shadow-xl">
              <h3 className="text-lg font-bold flex items-center gap-2 mb-6"><Calculator size={20} /> Cálculo de Pontos</h3>
              <div className="space-y-4">
                 <div className="flex justify-between"><span>Pontos Estimados</span><span className="font-bold text-2xl">{calculatedPoints}</span></div>
              </div>
           </div>

           {success && (
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex gap-3">
              <CheckCircle2 className="text-emerald-600" />
              <p className="text-emerald-800 font-bold">Compra registrada com sucesso!</p>
            </div>
           )}
        </div>
      </div>
    </div>
  );
};
export default RegisterPurchase;