
import React from 'react';
import { 
  LayoutDashboard, 
  CreditCard, 
  PlusCircle, 
  History, 
  Tag, 
  User, 
  Bell, 
  Settings, 
  ShieldCheck, 
  Globe,
  LogOut
} from 'lucide-react';
import { CardBrand, LoyaltyProgram, CreditCard as CreditCardType, Transaction, Promotion } from '../types/types';

export const MENU_ITEMS = [
  { label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
  { label: 'Meus Cartões', icon: <CreditCard size={20} />, path: '/cards' },
  { label: 'Registrar Compra', icon: <PlusCircle size={20} />, path: '/new-purchase' },
  { label: 'Extrato de Pontos', icon: <History size={20} />, path: '/history' },
  { label: 'Promoções', icon: <Tag size={20} />, path: '/promotions' },
  { label: 'Perfil', icon: <User size={20} />, path: '/profile' },
  { label: 'Notificações', icon: <Bell size={20} />, path: '/notifications' },
];

export const ADMIN_MENU_ITEMS = [
  { label: 'Gestão de Bandeiras', icon: <ShieldCheck size={20} />, path: '/admin/brands' },
  { label: 'Programas Fidelidade', icon: <Globe size={20} />, path: '/admin/programs' },
  { label: 'Cadastrar Promoção', icon: <Tag size={20} />, path: '/admin/new-promotion' },
];

export const MOCK_PROGRAMS: LoyaltyProgram[] = [
  { id: 1, nome: 'Smiles', points: 125400, color: 'orange' },
  { id: 2, nome: 'Azul', points: 45000, color: 'blue' },
  { id: 3, nome: 'Latam Pass', points: 78200, color: 'pink' },
  { id: 4, nome: 'Livelo', points: 12000, color: 'red' },
];

export const MOCK_CARDS: CreditCardType[] = [
  { id: 'c1', name: 'Ourocard Infinite', brand: CardBrand.VISA, lastFour: '4582', programId: '4', multiplier: 2.2 },
  { id: 'c2', name: 'C6 Carbon', brand: CardBrand.MASTERCARD, lastFour: '1122', programId: '4', multiplier: 2.5 },
  { id: 'c3', name: 'Azul Itaú', brand: CardBrand.VISA, lastFour: '9001', programId: '2', multiplier: 3.0 },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 't1', description: 'Amazon.com.br', amount: 450.00, points: 990, date: '2023-10-25', status: 'CREDITED', expectedCreditDate: '2023-11-01' },
  { id: 't2', description: 'Posto Shell', amount: 220.50, points: 485, date: '2023-10-24', status: 'PENDING', expectedCreditDate: '2023-11-10' },
  { id: 't3', description: 'Restaurante Coco Bambu', amount: 350.00, points: 770, date: '2023-10-22', status: 'CREDITED', expectedCreditDate: '2023-10-29' },
  { id: 't4', description: 'Apple Store', amount: 7500.00, points: 16500, date: '2023-10-20', status: 'EXPIRED', expectedCreditDate: '2023-10-25' },
];

export const MOCK_PROMOTIONS: Promotion[] = [
  { 
    id: 1, 
    titulo: '100% de Bônus Smiles', 
    descricao: 'Transfira seus pontos Livelo e ganhe 100% de bônus.', 
    dataFim: '2023-11-15', 
    dataInicio: '2023-11-01',
    urlPromocao: 'https://smiles.com.br',
    nomePrograma: 'Smiles'
  },
  { 
    id: 2, 
    titulo: '80% de Bônus TudoAzul', 
    descricao: 'Válido para portadores de cartões Itaú.', 
    dataFim: '2023-11-20', 
    dataInicio: '2023-11-05',
    urlPromocao: 'https://tudoazul.com.br',
    nomePrograma: 'Azul'
  },
];
