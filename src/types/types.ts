export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  empty?: boolean;
  first?: boolean;
  last?: boolean;
}

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

export interface ResumoPendentesResponse {
  totalPontos: number;
  diasParaProximoCredito: number | null;
}

export interface CreditCard {
  id: string;
  name: string;
  brand: CardBrand;
  lastFour: string;
  programId: string;
  multiplier: number;
}

export interface Transaction {
  id: number;
  descricao: string;
  quantidadePontos: number;
  dataMovimentacao: string;
  tipo: 'ACUMULO' | 'USO' | 'BONUS' | 'EXPIRACAO' | 'AJUSTE' | 'TRANSFERENCIA_ENTRADA' | 'TRANSFERENCIA_SAIDA';
  status: 'PENDENTE' | 'CREDITADO' | 'EXPIRADO';
  nomePrograma: string;
  nomePersonalizado?: string;
  compraId?: number;
}

export interface Promotion {
  id: number;
  titulo: string;
  descricao: string;
  urlPromocao: string;
  bonusPorcentagem: number;
  dataInicio: string;
  dataFim: string;
  nomeProgramaPontos: string;
  programaPontosId: number;
}

export interface PromotionPayload {
  titulo: string;
  descricao: string;
  urlPromocao?: string;
  bonusPorcentagem: number;
  dataInicio: string;
  dataFim: string;
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
  fotoPerfil?: string;
}

export interface Notificacao {
  id: number;
  mensagem: string;
  lida: boolean;
  tipo: 'COMPRA' | 'TRANSFERENCIA' | 'PROMOCAO' | 'EXPIRACAO' | 'GERAL' | 'AVISO_EXPIRACAO' | 'PONTOS_EXPIRADOS' | 'CREDITO_REALIZADO'; // Ajuste conforme seu Enum no Java
  dataEnvio: string;
}