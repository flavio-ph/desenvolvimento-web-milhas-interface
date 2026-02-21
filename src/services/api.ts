import axios from 'axios';
import { UserUpdateData, Promotion, LoyaltyProgram, Notificacao, Transaction, CreditCard, ResumoPendentesResponse } from '../types/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de resposta para lidar com tokens expirados globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

export const API_BASE_URL = API_URL;

export const uploadFile = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post<{ fileUrl: string }>('/uploads', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.fileUrl;
};

export const updateProfile = async (data: UserUpdateData) => {
  const response = await api.put('/usuarios/me', data);
  return response.data;
};

export const getPromocoes = async () => {
  const response = await api.get<Promotion[]>('/promocoes');
  return response.data;
};

export const createPromocao = async (data: any) => {
  const response = await api.post('/promocoes', data);
  return response.data;
};

export const deletePromocao = async (id: number) => {
  await api.delete(`/promocoes/${id}`);
};

export const updatePromocao = async (id: number, data: any) => {
  const response = await api.put(`/promocoes/${id}`, data);
  return response.data;
};

export const getProgramas = async () => {
  const response = await api.get<LoyaltyProgram[]>('/programas');
  return response.data;
};

export const createPrograma = async (data: { nome: string; url: string }) => {
  const response = await api.post('/programas', data);
  return response.data;
};

export const deletePrograma = async (id: number) => {
  await api.delete(`/programas/${id}`);
};

export const getNotificacoes = async () => {
  const response = await api.get<Notificacao[]>('/notificacoes');
  return response.data;
};

export const marcarNotificacaoComoLida = async (id: number) => {
  await api.patch(`/notificacoes/${id}/lida`);
};

export const getCompras = async () => {
  const response = await api.get<Transaction[]>('/compras');
  return response.data;
};

export const getCartoes = async () => {
  const response = await api.get<CreditCard[]>('/cartoes');
  return response.data;
};

export const getPontosPendentes = async (): Promise<ResumoPendentesResponse> => {
  const response = await api.get<ResumoPendentesResponse>('/compras/pendentes/total');
  return response.data;
};

export const getPontosExpirando = async (dias: number = 30): Promise<number> => {
  const response = await api.get<number>('/movimentacoes/expirando', {
    params: { dias }
  });
  return response.data;
};

export const creditarCompra = async (id: number) => {
  await api.put(`/compras/${id}/creditar`);
};

export const participarPromocao = async (id: number) => {
  await api.post(`/promocoes/${id}/participar`);
};
