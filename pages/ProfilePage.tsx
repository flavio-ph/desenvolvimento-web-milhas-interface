import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Bell, 
  CreditCard, 
  Camera, 
  Check,
  Lock,
  Smartphone,
  ChevronRight,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

// Interface atualizada (campos opcionais com ?)
interface UserProfile {
  nome: string;
  email: string;
  telefone?: string;
  cpf?: string;
  role?: string;
}

const ProfilePage: React.FC = () => {
  const { isDarkMode } = useTheme();
  
  // Estados de Dados
  const [user, setUser] = useState<UserProfile | null>(null);
  const [totalPontos, setTotalPontos] = useState(0);
  
  // Estados de UI
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Estado do Formulário
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cpf: ''
  });

  // Estado de Notificações
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    promotions: false,
    expiry: true
  });

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // 1. Carregar dados ao montar a tela
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await api.get('/usuarios/me');
        const userData = userRes.data;
        
        setUser(userData);
        // Preenche o formulário (usa '' se vier null do backend)
        setFormData({
          nome: userData.nome || '',
          email: userData.email || '',
          telefone: userData.telefone || '', 
          cpf: userData.cpf || ''
        });

        // Busca saldo (extra)
        try {
          const dashRes = await api.get('/dashboard');
          if (dashRes.data && dashRes.data.pontosPorCartao) {
             const total = dashRes.data.pontosPorCartao.reduce((acc: number, curr: any) => acc + curr.totalPontos, 0);
             setTotalPontos(total);
          }
        } catch (e) {
          console.warn("Não foi possível carregar saldo");
        }

      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 2. Salvar Alterações
  const handleSave = async () => {
    setSaving(true);
    try {
      // Envia os dados para o backend (mesmo que estejam vazios)
      const payload = {
        nome: formData.nome,
        telefone: formData.telefone,
        cpf: formData.cpf
      };

      const response = await api.put('/usuarios/me', payload);
      
      setUser(response.data); 
      alert('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error("Erro ao atualizar:", error);
      alert("Erro ao salvar alterações.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn pb-12">
      {/* Profile Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center gap-8">
        <div className="relative group">
          <img 
            src="https://github.com/shadcn.png" 
            alt="Profile" 
            className="w-32 h-32 rounded-full object-cover ring-4 ring-indigo-50 dark:ring-indigo-900/30"
          />
          <button className="absolute bottom-0 right-0 p-2 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-transform group-hover:scale-110">
            <Camera size={18} />
          </button>
        </div>
        
        <div className="text-center md:text-left flex-1">
          <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold dark:text-white text-slate-900">
              {user?.nome || 'Usuário'}
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs font-bold rounded-full border border-amber-100 dark:border-amber-900/30 uppercase tracking-wider w-fit mx-auto md:mx-0">
              <Check size={12} />
              {user?.role === 'ADMIN' ? 'Administrador' : 'Membro Premium'}
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400">
            {user?.email} • Membro ativo
          </p>
          
          <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
            <div className="text-center px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold">Total Acumulado</p>
              <p className="text-lg font-bold dark:text-white">{totalPontos.toLocaleString('pt-BR')}</p>
            </div>
            <div className="text-center px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold">Resgates Feitos</p>
              <p className="text-lg font-bold dark:text-white">0</p>
            </div>
          </div>
        </div>
        
        <button 
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none flex items-center gap-2 disabled:opacity-70"
        >
          {saving && <Loader2 className="animate-spin" size={18} />}
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
            <h3 className="text-lg font-bold dark:text-white mb-6 flex items-center gap-2">
              <User size={20} className="text-indigo-600" />
              Informações Pessoais
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* CAMPO NOME */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    value={formData.nome} 
                    onChange={e => setFormData({...formData, nome: e.target.value})}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white transition-all" 
                  />
                </div>
              </div>

              {/* CAMPO EMAIL */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="email" 
                    value={formData.email} 
                    disabled
                    className="w-full pl-11 pr-4 py-3 bg-slate-100 dark:bg-slate-800/50 border-none rounded-xl text-slate-500 cursor-not-allowed" 
                  />
                </div>
              </div>

              {/* CAMPO TELEFONE (Opcional) */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                  Telefone <span className="text-slate-400 font-normal text-xs">(Opcional)</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="(00) 00000-0000"
                    value={formData.telefone}
                    onChange={e => setFormData({...formData, telefone: e.target.value})}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white transition-all" 
                  />
                </div>
              </div>

              {/* CAMPO CPF (Opcional) */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                  CPF <span className="text-slate-400 font-normal text-xs">(Opcional)</span>
                </label>
                <div className="relative">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="000.000.000-00"
                    value={formData.cpf} 
                    onChange={e => setFormData({...formData, cpf: e.target.value})}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white transition-all" 
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Seção Segurança (Mantida) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
            <h3 className="text-lg font-bold dark:text-white mb-6 flex items-center gap-2">
              <Lock size={20} className="text-indigo-600" />
              Segurança
            </h3>
            <div className="space-y-4">
              <button className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white dark:bg-slate-900 rounded-lg">
                    <Smartphone size={20} className="text-indigo-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold dark:text-white text-sm">Autenticação em Dois Fatores</p>
                    <p className="text-xs text-slate-500">Aumente a segurança da sua conta</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-600 uppercase">Ativado</span>
                  <ChevronRight size={18} className="text-slate-400" />
                </div>
              </button>
              
              <button className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white dark:bg-slate-900 rounded-lg">
                    <Lock size={20} className="text-indigo-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold dark:text-white text-sm">Alterar Senha</p>
                    <p className="text-xs text-slate-500">Última alteração há 3 meses</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-slate-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Coluna Direita (Mantida) */}
        <div className="space-y-8">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-xl shadow-slate-200 dark:shadow-none relative overflow-hidden">
            <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <CreditCard size={20} />
              Seu Plano
            </h3>
            <div className="mb-6">
              <p className="text-4xl font-bold">{user?.role === 'ADMIN' ? 'Admin' : 'Premium'}</p>
              <p className="text-sm opacity-70 mt-1">Renovação em 15 Dez, 2025</p>
            </div>
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                Alertas de promoções 24h antes
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                Histórico ilimitado de extrato
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                Suporte prioritário
              </div>
            </div>
            <button className="w-full py-3 bg-white text-slate-900 font-bold rounded-2xl hover:bg-slate-100 transition-colors flex items-center justify-center gap-2">
              Gerenciar Assinatura
              <ExternalLink size={16} />
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
            <h3 className="text-lg font-bold dark:text-white mb-6 flex items-center gap-2">
              <Bell size={20} className="text-indigo-600" />
              Notificações
            </h3>
            <div className="space-y-6">
              {[
                { id: 'email', label: 'E-mails de Alerta', desc: 'Resumos semanais e novidades' },
                { id: 'push', label: 'Notificações Push', desc: 'Alertas em tempo real no app' },
                { id: 'promotions', label: 'Novas Promoções', desc: 'Sempre que surgir 100% bônus' },
                { id: 'expiry', label: 'Vencimento de Pontos', desc: 'Avisar 30 dias antes de expirar' },
              ].map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold dark:text-white">{item.label}</p>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                  <button 
                    onClick={() => toggleNotification(item.id as any)}
                    className={`w-12 h-6 rounded-full relative transition-colors duration-200 ${notifications[item.id as keyof typeof notifications] ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${notifications[item.id as keyof typeof notifications] ? 'left-7' : 'left-1'}`}></div>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;