import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
// ... outros imports (lucide-react, etc)
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, // <--- Verifique se esta linha está aqui
  ShieldCheck, 
  CreditCard, 
  Gift 
} from 'lucide-react';
import api from '../services/api'; // Importe a instância do Axios

const Register: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  // Estados para os inputs
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // O DTO RegisterRequest espera: nome, email, senha e role
      await api.post('/auth/register', {
        nome,
        email,
        senha,
        role: 'USER' // Definindo um padrão, já que o enum existe no back
      });
      
      alert('Conta criada com sucesso!');
      navigate('/login');
    } catch (error) {
      console.error('Erro ao registrar:', error);
      alert('Erro ao criar conta. Verifique os dados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // ... estrutura do JSX mantida ...
    <form onSubmit={handleRegister} className="space-y-4">
      <div className="space-y-4">
        <div className="relative group">
          {/* ... ícone User ... */}
          <input 
            type="text" 
            placeholder="Nome completo" 
            value={nome}
            onChange={(e) => setNome(e.target.value)} // Adicione o onChange
            className="..." // mantenha suas classes
            required
          />
        </div>
        <div className="relative group">
          {/* ... ícone Mail ... */}
          <input 
            type="email" 
            placeholder="Seu melhor e-mail" 
            value={email}
            onChange={(e) => setEmail(e.target.value)} // Adicione o onChange
            className="..." 
            required
          />
        </div>
        <div className="relative group">
          {/* ... ícone Lock ... */}
          <input 
            type={showPassword ? 'text' : 'password'} 
            placeholder="Crie uma senha forte" 
            value={senha}
            onChange={(e) => setSenha(e.target.value)} // Adicione o onChange
            className="..." 
            required
          />
          {/* ... botão eye ... */}
        </div>
      </div>
      
      {/* ... checkbox termos ... */}

      <button 
        type="submit"
        disabled={loading}
        className="..." // suas classes
      >
        {loading ? 'Criando...' : 'Criar minha conta'}
        {!loading && <ArrowRight size={20} />}
      </button>
    </form>
    // ... restante do componente
  );
};

export default Register;  