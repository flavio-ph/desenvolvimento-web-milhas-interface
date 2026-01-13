
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import api from '../services/api';

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState(''); // Mudei de password para senha para alinhar com DTO
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Chama o Backend
      const response = await api.post('/auth/login', { email, senha });
      
      // 2. Pega o Token da resposta
      const { token } = response.data;
      
      // 3. Salva no navegador
      localStorage.setItem('token', token);
      
      // 4. Redireciona
      navigate('/');
    } catch (err) {
      setError('Email ou senha inválidos.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-slate-200 overflow-hidden flex flex-col">
        <div className="p-8 pt-12 text-center">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl mx-auto mb-6 shadow-xl shadow-indigo-100">M</div>
          <h1 className="text-2xl font-bold text-slate-900">Bem-vindo de volta!</h1>
          <p className="text-slate-500 mt-2">Acesse sua conta para gerenciar seus pontos.</p>
        </div>

        <form onSubmit={handleLogin} className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-mail" 
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 font-medium"
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type={showPassword ? 'text' : 'password'} 
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Senha" 
                className="w-full pl-12 pr-12 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 font-medium"
                required
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between px-2">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
              <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">Lembrar de mim</span>
            </label>
            <Link to="/recover" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">Esqueci a senha</Link>
          </div>

          <button 
            type="submit"
            className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-700 transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
          >
            Entrar
            <ArrowRight size={20} />
          </button>
        </form>

        <div className="p-8 bg-slate-50 text-center border-t border-slate-100 mt-auto">
          <p className="text-slate-600 text-sm">
            Não tem uma conta? <Link to="/register" className="font-bold text-indigo-600 hover:underline">Cadastre-se</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
