
export enum CardBrand {
  VISA = 'Visa',
  MASTERCARD = 'MasterCard',
  ELO = 'Elo',
  AMEX = 'American Express'
}

export interface LoyaltyProgram {
  id: string;
  name: string;
  points: number;
  color: string;
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
  id: string;
  description: string;
  amount: number;
  points: number;
  date: string;
  status: 'PENDING' | 'CREDITED' | 'EXPIRED';
  expectedCreditDate: string;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  expiryDate: string;
  bonusPercentage: number;
}
