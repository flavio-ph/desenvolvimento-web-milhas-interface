import api from './api';

export interface BandeiraPayload {
    nome: string;
    ativa?: boolean;
}

export interface BandeiraResponse {
    id: number;
    nome: string;
    ativa?: boolean;
}

export const bandeiraService = {
    listarTodas: async (): Promise<BandeiraResponse[]> => {
        const response = await api.get<BandeiraResponse[]>('/bandeiras');
        return response.data;
    },

    listarAtivas: async (): Promise<BandeiraResponse[]> => {
        const response = await api.get<BandeiraResponse[]>('/bandeiras/ativas');
        return response.data;
    },

    criarBandeira: async (data: BandeiraPayload): Promise<BandeiraResponse> => {
        const response = await api.post<BandeiraResponse>('/bandeiras', data);
        return response.data;
    },

    atualizarBandeira: async (id: number, data: BandeiraPayload): Promise<BandeiraResponse> => {
        const response = await api.put<BandeiraResponse>(`/bandeiras/${id}`, data);
        return response.data;
    },

    deletarBandeira: async (id: number): Promise<void> => {
        await api.delete(`/bandeiras/${id}`);
    }
};
