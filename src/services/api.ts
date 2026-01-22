import axios from 'axios';
import { UserUpdateData } from '../types/types';

const api = axios.create({
  baseURL: 'http://localhost:8080', // Endereço do seu Backend Spring Boot
});

// Interceptador para adicionar o Token automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

export const uploadFile = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  // Ajuste '/compras/upload' para o endpoint de upload genérico que você criar no backend
  // Se não tiver um genérico, pode usar o de compras ou criar '/uploads' no backend
  const response = await api.post<{ fileUrl: string }>('/uploads', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.fileUrl; // O backend deve retornar a URL do arquivo salvo
};

// Certifique-se que a função de update perfil aceita a foto
export const updateProfile = async (data: UserUpdateData) => {
  const response = await api.put('/usuarios/me', data);
  return response.data;
};