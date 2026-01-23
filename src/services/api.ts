import axios from 'axios';
import { UserUpdateData, Promotion, LoyaltyProgram, Notificacao,Transaction, CreditCard} from '../types/types';

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
  // Endpoint ajustado para o genérico ou use '/usuarios/me/foto' se preferir
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

// --- Promoções (NOVO) ---
export const getPromocoes = async () => {
  const response = await api.get<Promotion[]>('/promocoes');
  return response.data;
};

// --- Programas (NOVO) ---
export const getProgramas = async () => {
  const response = await api.get<LoyaltyProgram[]>('/programas-pontos');
  return response.data;
};

export const getNotificacoes = async () => {
  const response = await api.get<Notificacao[]>('/notificacoes');
  return response.data;
};

export const marcarNotificacaoComoLida = async (id: number) => {
  // Ajuste a rota conforme seu Controller (ex: /notificacoes/{id}/lida)
  await api.put(`/notificacoes/${id}/lida`);
};

export const getCompras = async () => {
  // Ajuste a rota para a sua real de listagem de compras
  const response = await api.get<Transaction[]>('/compras'); 
  return response.data;
};

export const getCartoes = async () => {
  const response = await api.get<CreditCard[]>('/cartoes');
  return response.data;
};