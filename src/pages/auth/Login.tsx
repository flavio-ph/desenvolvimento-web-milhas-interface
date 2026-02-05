import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Github, 
  Chrome,
  TrendingUp,
  Zap,
  Loader2,      
  AlertCircle   
} from 'lucide-react';
import api from '../../services/api';
import { Logo } from '../../components/Logo';

const Login: React.FC = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState(''); 

  useEffect(() => {
    localStorage.removeItem('token');
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', { email, senha });
      
      const { token } = response.data;
      localStorage.setItem('token', token);
      
      navigate('/');
    } catch (err: any) {
      console.error(err);
      
      if (err.response) {
        if (err.response.status === 401 || err.response.status === 403) {
          setError('E-mail ou senha incorretos.');
        } else if (err.response.status === 404) {
          setError('Usuário não encontrado.');
        } else {
          setError('Erro no sistema. Tente mais tarde.');
        }
      } else {
        setError('Sem conexão com o servidor.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-950 font-sans overflow-hidden">
      
      {/* Visual Side Panel - Hidden on Mobile */}
      <div className="hidden lg:flex lg:w-1/2 bg-indigo-600 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-indigo-600 to-indigo-500"></div>
        
        {/* Abstract Background Shapes */}
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-[-5%] left-[-5%] w-64 h-64 bg-indigo-400/20 rounded-full blur-2xl"></div>

        <div className="relative z-10 max-w-lg text-white space-y-8">
          <div className="space-y-4">
            
            {/* LOGO + NOME */}
            <div className="flex items-center gap-5">
              <div className="w-20 h-auto bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center border border-white/30 shadow-2xl p-2">
                 <Logo className="w-full h-full drop-shadow-lg" />
              </div>
              <span className="text-5xl font-black tracking-tight text-white">MilhasPro</span>
            </div>

            <h1 className="text-4xl font-black leading-tight">Domine suas milhas, conquiste o mundo.</h1>
            <p className="text-xl text-indigo-100 font-medium">A plataforma definitiva para quem leva o acúmulo de pontos a sério.</p>
          </div>

          {/* Floating Feature Cards */}
          <div className="space-y-4 pt-8">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 flex items-center gap-4 transform hover:scale-105 transition-transform cursor-default">
              <div className="w-12 h-12 bg-emerald-400/20 rounded-xl flex items-center justify-center text-emerald-400">
                <TrendingUp size={24} />
              </div>
              <div>
                <p className="font-bold text-sm">Cálculo Automático</p>
                <p className="text-xs text-indigo-100">Saiba exatamente quanto ganhou em cada compra.</p>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 flex items-center gap-4 transform translate-x-8 hover:scale-105 transition-transform cursor-default">
              <div className="w-12 h-12 bg-amber-400/20 rounded-xl flex items-center justify-center text-amber-400">
                <Zap size={24} />
              </div>
              <div>
                <p className="font-bold text-sm">Alertas Premium</p>
                <p className="text-xs text-indigo-100">Notificações de 100% bônus em tempo real.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-950">
        <div className="w-full max-w-md space-y-8 animate-fadeIn">
          <div className="text-center lg:text-left">
            {/* LOGO MOBILE */}
            <div className="lg:hidden w-16 h-auto mx-auto mb-6">
               <Logo className="w-full h-full" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">Bem-vindo de volta</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Insira suas credenciais para acessar sua conta.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            
            {/* Caixa de Erro */}
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl flex items-center gap-3">
                <AlertCircle className="text-red-600 dark:text-red-400 shrink-0" size={20} />
                <p className="text-sm font-bold text-red-600 dark:text-red-400 leading-tight">
                  {error}
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Seu e-mail" 
                  className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white font-medium shadow-sm transition-all"
                  required
                />
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Sua senha" 
                  className="w-full pl-12 pr-12 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white font-medium shadow-sm transition-all"
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500" />
                <span className="text-sm text-slate-500 dark:text-slate-400 font-medium group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">Lembrar de mim</span>
              </label>
              <Link to="/recover" className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline">Esqueceu a senha?</Link>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl hover:bg-indigo-700 transition-all transform hover:scale-[1.01] active:scale-95 shadow-xl shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Entrando...
                </>
              ) : (
                <>
                  Entrar na conta
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-800"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-slate-50 dark:bg-slate-950 px-4 text-slate-400 font-bold tracking-widest">Ou continue com</span></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 py-3 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-bold text-sm dark:text-white">
              <Chrome size={18} /> Google
            </button>
            <button className="flex items-center justify-center gap-2 py-3 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-bold text-sm dark:text-white">
              <Github size={18} /> Github
            </button>
          </div>

          <p className="text-center text-slate-600 dark:text-slate-400 font-medium">
            Ainda não tem conta? <Link to="/register" className="font-black text-indigo-600 dark:text-indigo-400 hover:underline">Criar agora</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;