import axios from 'axios';
import { UserUpdateData, Promotion, LoyaltyProgram, Notificacao, Transaction, CreditCard } from '../types/types';

const api = axios.create({
  baseURL: 'http://localhost:8080', 
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

// --- Upload ---
export const uploadFile = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post<{ fileUrl: string }>('/uploads', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.fileUrl;
};

// --- Perfil ---
export const updateProfile = async (data: UserUpdateData) => {
  const response = await api.put('/usuarios/me', data);
  return response.data;
};

// --- Promoções (Leitura) ---
export const getPromocoes = async () => {
  const response = await api.get<Promotion[]>('/promocoes');
  return response.data;
};

// --- Promoções (Escrita) ---
export const createPromocao = async (data: any) => {
  const response = await api.post('/promocoes', data);
  return response.data;
};

export const deletePromocao = async (id: number) => {
  await api.delete(`/promocoes/${id}`);
};

// --- Programas ---
export const getProgramas = async () => {
  const response = await api.get<LoyaltyProgram[]>('/programas');
  return response.data;
};

export const createPrograma = async (data: { nome: string; url: string }) => {
  const response = await api.post('/programas', data);
  return response.data;
};

export const deletePrograma = async (id: number) => {
  // CORREÇÃO: Adicionada a barra '/' antes do ID
  await api.delete(`/programas/${id}`);
};

// --- Notificações ---
export const getNotificacoes = async () => {
  const response = await api.get<Notificacao[]>('/notificacoes');
  return response.data;
};

export const marcarNotificacaoComoLida = async (id: number) => {
  await api.put(`/notificacoes/${id}/lida`);
};

// --- Compras ---
export const getCompras = async () => {
  const response = await api.get<Transaction[]>('/compras'); 
  return response.data;
};

// --- Cartões ---
export const getCartoes = async () => {
  const response = await api.get<CreditCard[]>('/cartoes');
  return response.data;
};