import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User,
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Loader2,
  CheckCircle2,
  Phone,
  FileText
} from 'lucide-react';
import api from '../services/api';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    cpf: '',
    telefone: ''
  });
  
  const [loading, setLoading] = useState(false);

  // Máscara de CPF (000.000.000-00)
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    setFormData({ ...formData, cpf: value });
  };

  // Máscara de Telefone ((99) 99999-9999)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
    value = value.replace(/(\d)(\d{4})$/, '$1-$2');
    setFormData({ ...formData, telefone: value });
  };

  // Função para validar formato de e-mail (exige @ e ponto)
  const validateEmail = (email: string) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validação do E-mail
    if (!validateEmail(formData.email)) {
      alert("Por favor, insira um e-mail válido (ex: nome@dominio.com)");
      return;
    }

    // 2. Validação básica do CPF (verifica se tem 11 números)
    const cpfLimpo = formData.cpf.replace(/\D/g, '');
    if (cpfLimpo.length !== 11) {
      alert("O CPF deve conter 11 dígitos.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        nome: formData.nome,
        email: formData.email,
        senha: formData.senha,
        cpf: cpfLimpo,
        telefone: formData.telefone.replace(/\D/g, ''),
        role: 'USER'
      };

      await api.post('/auth/register', payload);

      alert('Conta criada com sucesso! Faça login para continuar.');
      navigate('/login');
      
    } catch (error: any) {
      console.error('Erro no registro:', error);
      const msg = error.response?.data?.message || 'Erro ao criar conta. Verifique os dados.';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-950 p-4 font-sans transition-colors duration-300">
      
      {/* Card Flutuante */}
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl shadow-slate-200 dark:shadow-slate-900/50 overflow-hidden border border-slate-200 dark:border-slate-800 animate-scaleIn">
        
        {/* Cabeçalho */}
        <div className="p-8 pb-4 text-center">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-lg shadow-indigo-200 dark:shadow-none">
            M
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Crie sua conta</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium text-sm">
            Preencha seus dados para começar a gerenciar suas milhas.
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleRegister} className="px-8 pb-8 space-y-4">
          
          {/* Nome */}
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Nome Completo" 
              value={formData.nome}
              onChange={(e) => setFormData({...formData, nome: e.target.value})}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white font-medium placeholder-slate-400 transition-all"
              required
            />
          </div>

          {/* Email */}
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="email" 
              placeholder="Seu E-mail" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white font-medium placeholder-slate-400 transition-all"
              required
            />
          </div>

          {/* CPF e Telefone */}
          <div className="grid grid-cols-2 gap-4">
            <div className="relative group">
              <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="CPF" 
                value={formData.cpf}
                onChange={handleCpfChange}
                maxLength={14}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white font-medium placeholder-slate-400 transition-all"
                required
              />
            </div>
            <div className="relative group">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Telefone" 
                value={formData.telefone}
                onChange={handlePhoneChange}
                maxLength={15}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white font-medium placeholder-slate-400 transition-all"
                required
              />
            </div>
          </div>

          {/* Senha */}
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type={showPassword ? 'text' : 'password'} 
              placeholder="Senha (mín 6 caracteres)" 
              value={formData.senha}
              onChange={(e) => setFormData({...formData, senha: e.target.value})}
              className="w-full pl-11 pr-11 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white font-medium placeholder-slate-400 transition-all"
              required
              minLength={6}
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors p-1"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Checkbox */}
          <div className="pt-2">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative flex items-center mt-0.5">
                <input type="checkbox" className="peer sr-only" required />
                <div className="w-4 h-4 border-2 border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 peer-checked:bg-indigo-600 peer-checked:border-indigo-600 transition-all"></div>
                <CheckCircle2 size={10} className="absolute left-0.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 leading-tight">
                Li e aceito os <Link to="#" className="text-indigo-600 font-bold hover:underline">Termos de Uso</Link> e <Link to="#" className="text-indigo-600 font-bold hover:underline">Política de Privacidade</Link>.
              </span>
            </label>
          </div>

          {/* Botão */}
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 transition-all transform active:scale-[0.98] shadow-lg shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Criando conta...
              </>
            ) : (
              <>
                Criar minha conta
                <ArrowRight size={20} />
              </>
            )}
          </button>

          {/* Link Login */}
          <p className="text-center text-slate-500 dark:text-slate-400 text-sm mt-4">
            Já possui uma conta? <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-700 transition-colors">Fazer Login</Link>
          </p>
        </form>
      </div>

      {/* Footer com Créditos do Site */}
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

export default Register;