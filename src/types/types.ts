
export enum CardBrand {
  VISA = 'Visa',
  MASTERCARD = 'MasterCard',
  ELO = 'Elo',
  AMEX = 'American Express'
}

export interface LoyaltyProgram {
  id: number; 
  nome: string; 
  points?: number; 
  color?: string;
}

export interface CreditCard {
  id: string;
  name: string;
  brand: CardBrand;
  lastFour: string;
  programId: string;
  multiplier: number; // points per dollar/real
}

export interface Transaction {
  id: number; // No Java é Long/number
  descricao: string;
  quantidadePontos: number;
  dataMovimentacao: string;
  // Alinhando os Enums com o Java (Maiúsculas e nomes exatos)
  tipo: 'ACUMULO' | 'USO' | 'BONUS' | 'EXPIRACAO' | 'AJUSTE' | 'TRANSFERENCIA_ENTRADA' | 'TRANSFERENCIA_SAIDA';
  status: 'PENDENTE' | 'CREDITADO' | 'EXPIRADO'; 
  nomePrograma: string;
}

export interface Promotion  {
  id: number;
  titulo: string;
  descricao: string;
  urlPromocao: string;
  bonusPorcentagem: number;
  dataInicio: string; 
  dataFim: string;
  nnomeProgramaPontos: string; 
  programaPontosId: number;
}

export interface User {
  id: number;
  nome: string;
  email: string;
  fotoPerfil?: string; 
  role: 'USER' | 'ADMIN';
}

export interface UserUpdateData {
  nome?: string;
  telefone?: string;
  cpf?: string;
  fotoPerfil?: string; s
}

export interface Notificacao {
  id: number;
  mensagem: string;
  lida: boolean;
  tipo: 'COMPRA' | 'TRANSFERENCIA' | 'PROMOCAO' | 'EXPIRACAO' | 'GERAL' | 'AVISO_EXPIRACAO' | 'PONTOS_EXPIRADOS' | 'CREDITO_REALIZADO'; // Ajuste conforme seu Enum no Java
  dataEnvio: string;
}