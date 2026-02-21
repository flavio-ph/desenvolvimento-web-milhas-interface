
import React from 'react';
import {
  LayoutDashboard,
  CreditCard,
  PlusCircle,
  History,
  Tag,
  User,
  Bell,
  ShieldCheck,
  Globe,
} from 'lucide-react';

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
