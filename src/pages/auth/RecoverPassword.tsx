import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  Key, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2,
  Loader2,
  ShieldAlert,
  AlertCircle
} from 'lucide-react';
import api from '../../services/api';

const RecoverPassword: React.FC = () => {
  const navigate = useNavigate();
  
  // Estados de Controle
  const [step, setStep] = useState<'REQUEST' | 'RESET'>('REQUEST');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Estados do Formulário
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // ETAPA 1: Solicitar o Reset
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await api.post('/auth/forgot-password', { email });
      
      setSuccessMsg('Solicitação enviada! Verifique seu terminal/email.');
      
      // Limpa os campos da próxima etapa para evitar lixo de autofill
      setToken('');
      setNewPassword('');
      setConfirmPassword('');
      
      setStep('RESET'); 
    } catch (err: any) {
      console.error(err);
      setError('E-mail não encontrado ou erro no sistema.');
    } finally {
      setLoading(false);
    }
  };

  // ETAPA 2: Executar o Reset
  const handleExecuteReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/reset-password', { 
        token: token, 
        novaSenha: newPassword,
        confirmacaoSenha: confirmPassword
      });

      alert('Senha alterada com sucesso! Faça login com a nova senha.');
      navigate('/login');
      
    } catch (err: any) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Token inválido ou expirado.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-950 font-sans overflow-hidden">
      
      {/* Lado Esquerdo: Formulário */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-950">
        <div className="w-full max-w-md space-y-8 animate-fadeIn">
          
          {/* Cabeçalho */}
          <div className="text-center lg:text-left">
            <Link to="/login" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 mb-6 transition-colors">
              <ArrowLeft size={16} /> Voltar para Login
            </Link>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">
              {step === 'REQUEST' ? 'Recuperar Senha' : 'Redefinir Senha'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
              {step === 'REQUEST' 
                ? 'Informe seu e-mail para receber o código de recuperação.' 
                : 'Insira o código recebido e crie sua nova senha.'}
            </p>
          </div>

          {/* Feedback de Sucesso */}
          {successMsg && step === 'RESET' && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-start gap-3">
              <CheckCircle2 className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" size={18} />
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 leading-tight">
                {successMsg}
              </p>
            </div>
          )}

          {/* Feedback de Erro */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl flex items-start gap-3">
              <AlertCircle className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" size={18} />
              <p className="text-sm font-bold text-red-600 dark:text-red-400 leading-tight">
                {error}
              </p>
            </div>
          )}

          {/* --- FORMULÁRIO 1: SOLICITAR (EMAIL) --- */}
          {step === 'REQUEST' && (
            <form onSubmit={handleRequestReset} className="space-y-6">
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Seu e-mail cadastrado" 
                  className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white font-medium shadow-sm transition-all"
                  required
                  autoComplete="email" // Ajuda o navegador a saber que é email
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl hover:bg-indigo-700 transition-all transform hover:scale-[1.01] active:scale-95 shadow-xl shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Enviar Instruções'}
              </button>
            </form>
          )}

          {/* --- FORMULÁRIO 2: EXECUTAR --- */}
          {step === 'RESET' && (
            <form onSubmit={handleExecuteReset} className="space-y-6" autoComplete="off">
              {/* autoComplete="off" no form ajuda a prevenir preenchimento automático geral */}
              
              {/* Token */}
              <div className="relative group">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                <input 
                  type="text" 
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Código (Token)" 
                  className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white font-medium shadow-sm transition-all"
                  required
                  autoComplete="off" // Impede preencher com o email anterior
                  name="reset-token" // Nome único para não confundir com 'username'
                />
              </div>

              {/* Nova Senha */}
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nova Senha (mín 6 caracteres)" 
                  className="w-full pl-12 pr-12 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white font-medium shadow-sm transition-all"
                  required
                  minLength={6}
                  autoComplete="new-password" // Avisa que é uma NOVA senha (não login)
                  name="new-password"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  {showPassword ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>

              {/* Confirmar Senha */}
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirme a Nova Senha" 
                  className={`w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white font-medium shadow-sm transition-all ${
                    confirmPassword && newPassword !== confirmPassword 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                  required
                  autoComplete="new-password" // Também é nova senha
                  name="confirm-password"
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl hover:bg-indigo-700 transition-all transform hover:scale-[1.01] active:scale-95 shadow-xl shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Alterando...
                  </>
                ) : (
                  <>
                    Redefinir Senha
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>
          )}

        </div>
      </div>

      {/* Lado Direito: Visual */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950"></div>
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 max-w-md text-center space-y-6">
          <div className="w-24 h-24 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
            <ShieldAlert className="text-indigo-400" size={48} />
          </div>
          <h2 className="text-3xl font-black text-white">Segurança em primeiro lugar</h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            Nunca compartilhamos sua senha. O processo de recuperação garante que apenas você tenha acesso à sua conta.
          </p>
        </div>
      </div>

    </div>
  );
};

export default RecoverPassword;