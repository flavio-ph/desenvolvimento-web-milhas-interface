import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User,
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck,
  CreditCard,
  Gift,
  Phone,      // Novo ícone
  FileText,   // Novo ícone (para CPF)
  Loader2,    // Para loading
  AlertCircle // Para erro
} from 'lucide-react';
import api from '../../services/api';

const Register: React.FC = () => {
  const navigate = useNavigate();
  
  // Estados
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    // Assim que a tela carrega, joga fora o token velho
    localStorage.removeItem('token');
  }, []);

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    cpf: '',
    telefone: ''
  });

  // --- MÁSCARAS ---
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    setFormData({ ...formData, cpf: value });
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
    value = value.replace(/(\d)(\d{4})$/, '$1-$2');
    setFormData({ ...formData, telefone: value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Limpa pontuação antes de enviar pro Java
      const payload = {
        nome: formData.nome,
        email: formData.email,
        senha: formData.senha,
        cpf: formData.cpf.replace(/\D/g, ''),
        telefone: formData.telefone.replace(/\D/g, ''),
        role: 'USER'
      };

      await api.post('/auth/register', payload);

      alert('Conta criada com sucesso! Faça login para continuar.');
      navigate('/login');
      
    } catch (err: any) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
         setError(err.response.data.message);
      } else {
         setError('Erro ao criar conta. Verifique os dados.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-950 font-sans overflow-hidden">
      
      {/* Form Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-950">
        <div className="w-full max-w-md space-y-8 animate-fadeIn">
          <div className="text-center lg:text-left">
            <div className="lg:hidden w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-6">M</div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">Crie sua conta</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Comece hoje mesmo a gerir suas milhas como um profissional.</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            
            {/* Caixa de Erro (Estilo integrado) */}
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl flex items-start gap-3">
                <AlertCircle className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" size={18} />
                <p className="text-sm font-bold text-red-600 dark:text-red-400 leading-tight">
                  {error}
                </p>
              </div>
            )}

            <div className="space-y-4">
              
              {/* Nome */}
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                <input 
                  type="text" 
                  placeholder="Nome completo" 
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white font-medium shadow-sm transition-all"
                  required
                />
              </div>

              {/* Email */}
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                <input 
                  type="email" 
                  placeholder="Seu melhor e-mail" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white font-medium shadow-sm transition-all"
                  required
                />
              </div>

              {/* CPF e Telefone (Novos Campos) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative group">
                  <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                  <input 
                    type="text" 
                    placeholder="CPF" 
                    value={formData.cpf}
                    onChange={handleCpfChange}
                    maxLength={14}
                    className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white font-medium shadow-sm transition-all"
                    required
                  />
                </div>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                  <input 
                    type="text" 
                    placeholder="Telefone" 
                    value={formData.telefone}
                    onChange={handlePhoneChange}
                    maxLength={15}
                    className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white font-medium shadow-sm transition-all"
                    required
                  />
                </div>
              </div>

              {/* Senha */}
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="Crie uma senha forte" 
                  value={formData.senha}
                  onChange={(e) => setFormData({...formData, senha: e.target.value})}
                  className="w-full pl-12 pr-12 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white font-medium shadow-sm transition-all"
                  required
                  minLength={6}
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

            <div className="px-1 py-2">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input type="checkbox" className="mt-1 w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500" required />
                <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                  Eu concordo com os <Link to="/terms" className="text-indigo-600 font-bold hover:underline">Termos de Serviço</Link> e <Link to="/privacy" className="text-indigo-600 font-bold hover:underline">Política de Privacidade</Link>.
                </span>
              </label>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl hover:bg-indigo-700 transition-all transform hover:scale-[1.01] active:scale-95 shadow-xl shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
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
          </form>

          <p className="text-center text-slate-600 dark:text-slate-400 font-medium">
            Já tem uma conta? <Link to="/login" className="font-black text-indigo-600 dark:text-indigo-400 hover:underline">Fazer login</Link>
          </p>
        </div>
      </div>

      {/* Visual Side Panel (Mantido igual) */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950"></div>
        
        {/* Glow Effects */}
        <div className="absolute top-[20%] left-[-10%] w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[10%] right-[-10%] w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 max-w-md w-full space-y-8">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
            
            <h3 className="text-2xl font-black text-white mb-6">Por que escolher o MilhasPro?</h3>
            
            <div className="space-y-6">
              {[
                { icon: <ShieldCheck size={20} />, title: "Segurança Bancária", text: "Seus dados protegidos com criptografia de ponta." },
                { icon: <CreditCard size={20} />, title: "Multi-Cartões", text: "Gerencie quantos cartões desejar em um só lugar." },
                { icon: <Gift size={20} />, title: "Promoções em Primeira Mão", text: "Receba alertas antes de todo mundo." }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center text-indigo-400 shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">{item.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-white/10">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <img key={i} className="w-8 h-8 rounded-full border-2 border-slate-900" src={`https://i.pravatar.cc/100?u=${i}`} alt="user" />
                  ))}
                </div>
                <p className="text-xs text-slate-300 font-medium">Junte-se a <span className="text-white font-bold">+15.000</span> milheiros satisfeitos.</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-12">
            <div className="text-center">
              <p className="text-2xl font-black text-white">4.9/5</p>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">App Store</p>
            </div>
            <div className="text-center border-x border-white/10 px-12">
              <p className="text-2xl font-black text-white">2M+</p>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Milhas Geridas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-white">99%</p>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Precisão</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;