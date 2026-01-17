import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';
import api from '../services/api';

const Login: React.FC = () => {
  const navigate = useNavigate();
  
  // Estados
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(''); // Guarda a mensagem de erro para exibir

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(''); // Limpa erros antigos antes de tentar

    try {
      const response = await api.post('/auth/login', { email, senha });
      
      const { token } = response.data;
      localStorage.setItem('token', token);
      
      navigate('/'); // Redireciona para o Dashboard
    } catch (err: any) {
      console.error(err);
      
      // Tratamento de erros amigável para leigos
      if (err.response) {
        if (err.response.status === 401 || err.response.status === 403) {
          setError('E-mail ou senha incorretos. Verifique e tente novamente.');
        } else if (err.response.status === 404) {
          setError('Usuário não encontrado. Crie uma conta primeiro.');
        } else {
          setError('Ocorreu um erro no sistema. Tente mais tarde.');
        }
      } else {
        setError('Sem conexão com o servidor. Verifique sua internet.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-950 p-4 font-sans transition-colors duration-300">
      
      {/* Card Principal */}
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl shadow-slate-200 dark:shadow-slate-900/50 overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800 animate-scaleIn">
        
        {/* Cabeçalho */}
        <div className="p-8 pt-12 text-center">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl mx-auto mb-6 shadow-xl shadow-indigo-200 dark:shadow-none">
            M
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Bem-vindo de volta!</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-medium">
            Acesse sua conta para gerenciar seus pontos.
          </p>
        </div>

        <form onSubmit={handleLogin} className="p-8 space-y-6">
          
          {/* --- CAIXA DE ERRO (Só aparece se houver erro) --- */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3 animate-pulse">
              <AlertCircle className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" size={18} />
              <p className="text-sm font-bold text-red-600 dark:text-red-400 leading-tight">
                {error}
              </p>
            </div>
          )}

          <div className="space-y-4">
            {/* Campo E-mail */}
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-mail" 
                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white font-medium placeholder-slate-400 transition-all"
                required
              />
            </div>

            {/* Campo Senha */}
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type={showPassword ? 'text' : 'password'} 
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Senha" 
                className="w-full pl-12 pr-12 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white font-medium placeholder-slate-400 transition-all"
                required
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors p-2"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Links Auxiliares */}
          <div className="flex items-center justify-between px-2">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className="relative flex items-center">
                <input type="checkbox" className="peer sr-only" />
                <div className="w-4 h-4 border-2 border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 peer-checked:bg-indigo-600 peer-checked:border-indigo-600 transition-all"></div>
              </div>
              <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 transition-colors">Lembrar de mim</span>
            </label>
            <Link to="/recover" className="text-sm font-bold text-indigo-600 hover:text-indigo-700 hover:underline transition-all">
              Esqueci a senha
            </Link>
          </div>

          {/* Botão de Entrar */}
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-700 transition-all transform active:scale-[0.98] shadow-lg shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Entrando...
              </>
            ) : (
              <>
                Entrar
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        {/* Rodapé do Card */}
        <div className="p-8 bg-slate-50 dark:bg-slate-800/50 text-center border-t border-slate-100 dark:border-slate-800 mt-auto">
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Não tem uma conta? <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline transition-colors">Cadastre-se</Link>
          </p>
        </div>
      </div>

      {/* Footer com Créditos */}
      <div className="mt-8 text-center space-y-1">
        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
          © 2026 MilhasPro. Todos os direitos reservados.
        </p>
        <p className="text-[10px] text-slate-400 dark:text-slate-600">
          Desenvolvido com <span className="text-red-500">♥</span> por <span className="font-bold text-slate-600 dark:text-slate-400">Equipe Renatinho</span>
        </p>
      </div>
    </div>
  );
};

export default Login;