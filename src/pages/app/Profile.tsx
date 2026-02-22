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
  CheckCircle,
  Lock,
  ChevronRight,
  ExternalLink,
  Loader2,
  X,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Download
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import api, { API_BASE_URL } from '../../services/api';
import { useToast } from '../../components/ToastContext';
import { ConfirmModal } from '../../components/ConfirmModal';
import UserAvatar from '../../components/UserAvatar';

interface UserProfile {
  nome: string;
  email: string;
  telefone?: string;
  cpf?: string;
  role?: string;
  dataCadastro?: string;
}

// ── Helpers de máscara ───────────────────────────────────────────────
const maskCPF = (v: string) =>
  v.replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    .slice(0, 14);

const maskPhone = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 10)
    return d.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
  return d.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
};

// ── Indicador de força de senha ───────────────────────────────────
const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: 'Muito fraca', color: 'bg-rose-500' };
  if (score === 2) return { score, label: 'Fraca', color: 'bg-orange-400' };
  if (score === 3) return { score, label: 'Média', color: 'bg-amber-400' };
  if (score === 4) return { score, label: 'Forte', color: 'bg-emerald-500' };
  return { score, label: 'Muito forte', color: 'bg-emerald-600' };
};

interface PlanOption {
  id: string;
  name: string;
  price: string;
  features: string[];
  recommended?: boolean;
}

const ProfilePage: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { addToast } = useToast();
  const { user: contextUser, refetchUser, getAvatarUrl, getUserInitials } = useUser();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [totalPontos, setTotalPontos] = useState(0);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Estados para Modal de Confirmação Genérico
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({
    title: '',
    description: '',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    variant: 'primary' as 'primary' | 'danger',
    onConfirm: async () => { }
  });

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cpf: ''
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    promotions: false,
    expiry: true
  });

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ nova: '', confirmacao: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [show2FAModal, setShow2FAModal] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [step2FA, setStep2FA] = useState<'intro' | 'qr' | 'verify'>('intro');
  const [otpCode, setOtpCode] = useState('');
  const [faLoading, setFaLoading] = useState(false);

  const [showSubModal, setShowSubModal] = useState(false);
  const [currentPlan, setCurrentPlan] = useState('premium');
  const [subLoading, setSubLoading] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const availablePlans: PlanOption[] = [
    {
      id: 'free',
      name: 'Básico',
      price: 'Grátis',
      features: ['Acúmulo padrão de milhas', 'Extrato de 30 dias', 'Suporte por e-mail']
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 'R$ 29,90/mês',
      features: ['Bônus de 50% em transferências', 'Extrato ilimitado', 'Suporte prioritário', 'Sem anúncios'],
      recommended: true
    },
    {
      id: 'club',
      name: 'Clube Milhas',
      price: 'R$ 59,90/mês',
      features: ['Bônus de 100% em tudo', 'Pontos nunca expiram', 'Consultoria de viagens', 'Cartão Black isento']
    }
  ];

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Usa dados já carregados pelo UserContext quando disponíveis
        if (contextUser) {
          setUser(contextUser);
          setFormData({
            nome: contextUser.nome || '',
            email: contextUser.email || '',
            telefone: contextUser.telefone || '',
            cpf: contextUser.cpf || ''
          });

          if (contextUser.fotoPerfil) {
            setPreviewUrl(`${API_BASE_URL}/uploads/${contextUser.fotoPerfil}`);
          }
        } else {
          // Fallback: busca direto da API se o contexto ainda não carregou
          const userRes = await api.get('/usuarios/me');
          const userData = userRes.data;
          setUser(userData);
          setFormData({
            nome: userData.nome || '',
            email: userData.email || '',
            telefone: userData.telefone || '',
            cpf: userData.cpf || ''
          });
          if (userData.fotoPerfil) {
            setPreviewUrl(`${API_BASE_URL}/uploads/${userData.fotoPerfil}`);
          }
        }

        // Busca total de pontos separadamente
        try {
          const dashRes = await api.get('/dashboard');
          if (dashRes.data?.pontosPorCartao) {
            const total = dashRes.data.pontosPorCartao.reduce((acc: number, curr: any) => acc + curr.totalPontos, 0);
            setTotalPontos(total);
          }
        } catch {
          // Saldo indisponível — não bloqueia a página
        }

      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [contextUser]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const payload = {
        nome: formData.nome,
        telefone: formData.telefone,
        cpf: formData.cpf
      };
      await api.put('/usuarios/me', payload);

      if (selectedFile) {
        const photoData = new FormData();
        photoData.append('foto', selectedFile);
        await api.post('/usuarios/me/upload-foto', photoData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      // Atualiza o UserContext globalmente após salvar
      await refetchUser();

      addToast({
        type: 'success',
        title: 'Perfil salvo',
        description: 'Suas informações foram atualizadas com sucesso.'
      });

    } catch (error) {
      console.error(error);
      addToast({
        type: 'error',
        title: 'Erro ao salvar',
        description: 'Não foi possível atualizar o perfil.'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!passwordForm.nova || !passwordForm.confirmacao) {
      addToast({
        type: 'warning',
        title: 'Campos vazios',
        description: 'Preencha todos os campos de senha.'
      });
      return;
    }
    if (passwordForm.nova !== passwordForm.confirmacao) {
      addToast({
        type: 'error',
        title: 'Senhas divergentes',
        description: 'A nova senha e a confirmação não conferem.'
      });
      return;
    }
    setPasswordLoading(true);
    try {
      await api.put('/usuarios/me', {
        nome: formData.nome,
        senha: passwordForm.nova
      });

      addToast({
        type: 'success',
        title: 'Senha alterada',
        description: 'Sua senha foi atualizada com sucesso!'
      });

      setShowPasswordModal(false);
      setPasswordForm({ nova: '', confirmacao: '' });
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || "Erro ao alterar senha.";
      addToast({
        type: 'error',
        title: 'Erro na alteração',
        description: msg
      });
    } finally {
      setPasswordLoading(false);
    }
  };
  const handleToggle2FA = () => {
    if (is2FAEnabled) {
      setConfirmConfig({
        title: 'Desativar 2FA?',
        description: 'Tem certeza que deseja desativar a Autenticação de Dois Fatores? Sua conta ficará menos segura.',
        confirmText: 'Sim, desativar',
        cancelText: 'Cancelar',
        variant: 'danger',
        onConfirm: async () => {
          setIs2FAEnabled(false);
          setConfirmModalOpen(false);
          addToast({
            type: 'success',
            title: '2FA Desativado',
            description: 'A autenticação de dois fatores foi removida.'
          });
        }
      });
      setConfirmModalOpen(true);
    } else {
      setStep2FA('intro');
      setShow2FAModal(true);
    }
  };

  const handleVerifyOTP = async () => {
    if (otpCode.length < 6) return;
    setFaLoading(true);

    try {
      await api.post('/usuarios/me/2fa/verify', { code: parseInt(otpCode) });
      setIs2FAEnabled(true);
      setShow2FAModal(false);
      setOtpCode('');

      addToast({
        type: 'success',
        title: '2FA Ativado!',
        description: 'Sua conta agora está protegida com autenticação de dois fatores.'
      });

    } catch (e) {
      addToast({
        type: 'error',
        title: 'Código inválido',
        description: 'O código informado está incorreto ou expirou.'
      });
    } finally {
      setFaLoading(false);
    }
  };

  const handleStartSetup = async () => {
    setFaLoading(true);
    try {
      await api.get('/usuarios/me/2fa/generate');
      setStep2FA('verify');
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Erro no servidor',
        description: 'Não foi possível gerar o código. Tente novamente mais tarde.'
      });
    } finally {
      setFaLoading(false);
    }
  };

  const executeConfirmAction = async () => {
    try {
      setConfirmLoading(true);
      await confirmConfig.onConfirm();
    } catch (error) {
      console.error(error);
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleChangePlan = (planId: string) => {
    if (planId === currentPlan) return;

    setConfirmConfig({
      title: `Mudar para plano ${planId.toUpperCase()}?`,
      description: `Deseja realmente alterar seu plano para ${availablePlans.find(p => p.id === planId)?.name}? Os benefícios serão atualizados imediatamente.`,
      confirmText: 'Confirmar alteração',
      cancelText: 'Cancelar',
      variant: 'primary',
      onConfirm: async () => {
        // Simulação de chamada de API
        await new Promise(resolve => setTimeout(resolve, 1000));
        setCurrentPlan(planId);
        setConfirmModalOpen(false);

        addToast({
          type: 'success',
          title: 'Plano Atualizado',
          description: `Você agora faz parte do plano ${availablePlans.find(p => p.id === planId)?.name}!`
        });
      }
    });
    setConfirmModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
      </div>
    );
  }

  return (
    <>
      {/* Container Principal do Conteúdo */}
      <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn pb-12 relative">
        {/* HEADER */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center gap-8">
          <div className="relative group">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover ring-4 ring-indigo-50 dark:ring-indigo-900/30"
              />
            ) : (
              <UserAvatar
                imageUrl={getAvatarUrl()}
                initials={getUserInitials()}
                size="lg"
                className="ring-4 ring-indigo-50 dark:ring-indigo-900/30 rounded-full"
              />
            )}
            <label
              htmlFor="photo-upload"
              className="absolute bottom-0 right-0 p-2 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-transform group-hover:scale-110 cursor-pointer"
            >
              <Camera size={18} />
              <input
                type="file"
                id="photo-upload"
                className="hidden"
                accept="image/*"
                onChange={handlePhotoChange}
              />
            </label>
          </div>

          <div className="text-center md:text-left flex-1">
            <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold dark:text-white text-slate-900">
                {user?.nome || 'Usuário'}
              </h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs font-bold rounded-full border border-amber-100 dark:border-amber-900/30 uppercase tracking-wider w-fit mx-auto md:mx-0">
                <Check size={12} />
                {currentPlan === 'club' ? 'Clube Milhas' : currentPlan === 'premium' ? 'Membro Premium' : 'Membro Básico'}
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400">
              {user?.email} • Desde {user?.dataCadastro ? new Date(user.dataCadastro).getFullYear() : new Date().getFullYear()}
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
            onClick={handleSaveProfile}
            disabled={saving}
            className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none flex items-center gap-2 disabled:opacity-70"
          >
            {saving && <Loader2 className="animate-spin" size={18} />}
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* COLUNA ESQUERDA do Formulário  */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
              <h3 className="text-lg font-bold dark:text-white mb-6 flex items-center gap-2">
                <User size={20} className="text-indigo-600" />
                Informações Pessoais
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Nome Completo</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="text" value={formData.nome} onChange={e => setFormData({ ...formData, nome: e.target.value })} className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">E-mail</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="email" value={formData.email} disabled className="w-full pl-11 pr-4 py-3 bg-slate-100 dark:bg-slate-800/50 border-none rounded-xl text-slate-500 cursor-not-allowed" />
                  </div>
                </div>
                {/* CAMPO TELEFONE Opcional */}
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
                      onChange={e => setFormData({ ...formData, telefone: maskPhone(e.target.value) })}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white transition-all"
                    />
                  </div>
                </div>
                {/* CAMPO CPF Opcional */}
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
                      onChange={e => setFormData({ ...formData, cpf: maskCPF(e.target.value) })}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>


            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
              <h3 className="text-lg font-bold dark:text-white mb-6 flex items-center gap-2">
                <Lock size={20} className="text-indigo-600" />
                Segurança
              </h3>
              <div className="space-y-4">
                <button onClick={() => setShowPasswordModal(true)} className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white dark:bg-slate-900 rounded-lg"><Lock size={20} className="text-indigo-600" /></div>
                    <div className="text-left">
                      <p className="font-bold dark:text-white text-sm">Alterar Senha</p>
                      <p className="text-xs text-slate-500">****</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-400" />
                </button>
              </div>
            </div>
          </div>

          {/* --- COLUNA DIREITA --- */}
          <div className="space-y-8">

            {/* CARD DO PLANO */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-xl shadow-slate-200 dark:shadow-none relative overflow-hidden">
              <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><CreditCard size={20} /> Seu Plano</h3>
              <div className="mb-6">
                <p className="text-4xl font-bold">
                  {currentPlan === 'club' ? 'Clube' : currentPlan === 'premium' ? 'Premium' : 'Básico'}
                </p>
                <p className="text-sm opacity-70 mt-1">
                  {currentPlan === 'free' ? 'Conta gratuita vitalícia' : 'Renovação em 15 Dez, 2025'}
                </p>
              </div>
              <div className="space-y-3 mb-8">
                {currentPlan !== 'free' && (
                  <>
                    <div className="flex items-center gap-2 text-sm"><div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>Bônus em transferências</div>
                    <div className="flex items-center gap-2 text-sm"><div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>Suporte prioritário</div>
                  </>
                )}
                <div className="flex items-center gap-2 text-sm"><div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>Acesso ao sistema</div>
              </div>

              {/* BOTÃO DO MODAL */}
              <button
                onClick={() => setShowSubModal(true)}
                className="w-full py-3 bg-white text-slate-900 font-bold rounded-2xl hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
              >
                Gerenciar Assinatura
                <ExternalLink size={16} />
              </button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
              <h3 className="text-lg font-bold dark:text-white mb-6 flex items-center gap-2"><Bell size={20} className="text-indigo-600" /> Notificações</h3>
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

      {/* MODAL DE ALTERAR SENHA */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-100 dark:border-slate-800 animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold dark:text-white flex items-center gap-2">
                <Lock className="text-indigo-600" size={24} />
                Alterar Senha
              </h3>
              <button onClick={() => setShowPasswordModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Nova Senha</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={passwordForm.nova}
                    onChange={(e) => setPasswordForm({ ...passwordForm, nova: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                    placeholder="Mínimo de 8 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {/* Indicador de força */}
                {passwordForm.nova && (() => {
                  const strength = getPasswordStrength(passwordForm.nova);
                  return (
                    <div className="space-y-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(i => (
                          <div
                            key={i}
                            className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${i <= strength.score ? strength.color : 'bg-slate-200 dark:bg-slate-700'}`}
                          />
                        ))}
                      </div>
                      <p className={`text-xs font-semibold ${strength.score <= 1 ? 'text-rose-500' :
                          strength.score === 2 ? 'text-orange-400' :
                            strength.score === 3 ? 'text-amber-400' : 'text-emerald-500'
                        }`}>{strength.label}</p>
                    </div>
                  );
                })()}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Confirmar Nova Senha</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={passwordForm.confirmacao}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmacao: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                    placeholder="Repita a nova senha"
                  />
                </div>
              </div>

              <button
                onClick={handleUpdatePassword}
                disabled={passwordLoading}
                className="w-full py-3 mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {passwordLoading && <Loader2 className="animate-spin" size={18} />}
                {passwordLoading ? 'Atualizando...' : 'Atualizar Senha'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/*  MODAL DE 2FA */}
      {show2FAModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setShow2FAModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              ✕
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Autenticação de Dois Fatores
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                Proteja sua conta com uma camada extra de segurança.
              </p>
            </div>

            {step2FA === 'intro' ? (
              <div className="space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-300 text-center">
                  Ao ativar, enviaremos um código de verificação para o seu e-mail cadastrado.
                </p>
                <button
                  onClick={handleStartSetup}
                  disabled={faLoading}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-indigo-500/20"
                >
                  {faLoading ? 'Enviando...' : 'Enviar Código'}
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Caixa de Aviso de Simulação */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 flex items-start gap-3">
                  <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-blue-900 dark:text-blue-100">
                      Código Enviado!
                    </h4>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1 leading-relaxed">
                      Como estamos em ambiente de desenvolvimento, o e-mail foi simulado.
                      <br />
                      <strong>Verifique o Terminal/Console onde o Java está rodando</strong> para ver o código de 6 dígitos.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 text-center">
                    Digite o código recebido
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-center text-2xl tracking-[0.5em] font-mono transition-all"
                    placeholder="000000"
                    autoFocus
                  />
                </div>

                <button
                  onClick={handleVerifyOTP}
                  disabled={otpCode.length < 6 || faLoading}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {faLoading ? 'Verificando...' : 'Confirmar Código'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL DE GERENCIAR ASSINATURA  */}
      {showSubModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-4xl p-0 shadow-2xl border border-slate-100 dark:border-slate-800 animate-fadeIn my-8 overflow-hidden flex flex-col">

            {/* Header do Modal */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 z-10 relative">
              <div>
                <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                  <CreditCard className="text-indigo-600" />
                  Gerenciar Assinatura
                </h2>
                <p className="text-slate-500 text-sm">Controle seu plano, pagamentos e benefícios.</p>
              </div>
              <button onClick={() => setShowSubModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <X size={24} className="text-slate-400" />
              </button>
            </div>

            <div className="flex flex-col md:flex-row flex-1 overflow-hidden">

              {/* Sidebar do Modal */}
              <div className="w-full md:w-1/3 bg-slate-50 dark:bg-slate-800/50 p-6 border-r border-slate-100 dark:border-slate-800 space-y-6 overflow-y-auto">

                {/* Status Atual */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Plano Atual</p>
                  <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 shadow-sm relative overflow-hidden">
                    <div className="absolute right-0 top-0 p-2 opacity-10">
                      <CreditCard size={64} className="text-indigo-600" />
                    </div>
                    <p className="text-xl font-bold text-indigo-600 mb-1">
                      {currentPlan === 'club' ? 'Clube Milhas' : currentPlan === 'premium' ? 'Premium' : 'Básico'}
                    </p>
                    <p className="text-slate-500 text-xs mb-3">
                      {currentPlan === 'free' ? 'Sem custos mensais' : 'Cobrado mensalmente'}
                    </p>
                    {currentPlan !== 'free' && (
                      <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg w-fit">
                        <CheckCircle2 size={12} />
                        Ativo até 15/12
                      </div>
                    )}
                  </div>
                </div>

                {/* Pagamento */}
                {currentPlan !== 'free' && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Método de Pagamento</p>
                    <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div className="w-10 h-6 bg-slate-800 rounded flex items-center justify-center text-white text-[8px] font-bold">VISA</div>
                      <div className="flex-1">
                        <p className="text-sm font-bold dark:text-white">•••• 4242</p>
                        <p className="text-xs text-slate-500">Expira em 12/28</p>
                      </div>
                      <button className="text-indigo-600 text-xs font-bold hover:underline">Alterar</button>
                    </div>
                  </div>
                )}

                {/* Histórico Recente */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Últimas Faturas</p>
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center justify-between p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-50 dark:bg-slate-700 rounded-lg text-indigo-600">
                            <Calendar size={14} />
                          </div>
                          <div>
                            <p className="text-xs font-bold dark:text-white">15 Nov, 2024</p>
                            <p className="text-[10px] text-slate-500">Pagamento efetuado</p>
                          </div>
                        </div>
                        <Download size={14} className="text-slate-300 group-hover:text-indigo-600 transition-colors" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Conteúdo Principal  */}
              <div className="flex-1 p-6 overflow-y-auto max-h-[70vh] md:max-h-[600px] scrollbar-thin scrollbar-thumb-indigo-500 dark:scrollbar-thumb-indigo-600 scrollbar-track-indigo-50 dark:scrollbar-track-slate-800"> <h3 className="text-lg font-bold dark:text-white mb-4">Mudar de Plano</h3>
                <div className="space-y-4">
                  {availablePlans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`relative rounded-2xl border-2 p-5 transition-all cursor-pointer ${currentPlan === plan.id
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/10 dark:border-indigo-500'
                        : 'border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-slate-600'
                        }`}
                      onClick={() => handleChangePlan(plan.id)}
                    >
                      {/* Badge de Atual */}
                      {currentPlan === plan.id && (
                        <span className="absolute -top-3 left-6 px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full shadow-sm">
                          Plano Atual
                        </span>
                      )}

                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-bold text-lg dark:text-white">{plan.name}</h4>
                          <p className="text-slate-500 text-sm">{plan.price}</p>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${currentPlan === plan.id ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'}`}>
                          {currentPlan === plan.id && <Check size={14} className="text-white" />}
                        </div>
                      </div>

                      <div className="space-y-2">
                        {plan.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                            <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                            {feature}
                          </div>
                        ))}
                      </div>

                      {currentPlan !== plan.id && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleChangePlan(plan.id); }}
                          disabled={subLoading}
                          className="mt-4 w-full py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                          {subLoading ? 'Processando...' : plan.id === 'free' ? 'Fazer Downgrade' : 'Selecionar este Plano'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {currentPlan !== 'free' && (
                  <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => alert("Função de cancelamento seria acionada aqui.")}
                      className="flex items-center gap-2 text-red-500 text-sm font-bold hover:text-red-600 transition-colors"
                    >
                      <AlertCircle size={16} />
                      Cancelar Assinatura
                    </button>
                    <p className="text-xs text-slate-400 mt-1 pl-6">
                      Ao cancelar, você perderá acesso aos benefícios premium no final do ciclo atual.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* CONFIRM MODAL (GENÉRICO) */}
      <ConfirmModal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={executeConfirmAction}
        title={confirmConfig.title}
        description={confirmConfig.description}
        confirmText={confirmConfig.confirmText}
        cancelText={confirmConfig.cancelText}
        isLoading={confirmLoading}
        variant={confirmConfig.variant}
      />

    </>
  );
};

export default ProfilePage;