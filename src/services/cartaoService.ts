import api from './api';

export interface CartaoPayload {
    nomePersonalizado: string;
    ultimosDigitos: string;
    fatorConversao: number;
    bandeiraId: number;
    programaPontosId: number;
    cor?: string;
}

export interface CartaoResponse {
    id: number;
    nomePersonalizado: string;
    ultimosDigitos: string;
    fatorConversao: number;
    nomeBandeira?: string;
    nomeProgramaPontos?: string;
    cor?: string;
    possuiCompras?: boolean;
}

export const cartaoService = {
    listarCartoes: async (): Promise<CartaoResponse[]> => {
        const response = await api.get<CartaoResponse[]>('/cartoes');
        return response.data;
    },

    criarCartao: async (data: CartaoPayload): Promise<CartaoResponse> => {
        const response = await api.post<CartaoResponse>('/cartoes', data);
        return response.data;
    },

    atualizarCartao: async (id: number, data: CartaoPayload): Promise<CartaoResponse> => {
        const response = await api.put<CartaoResponse>(`/cartoes/${id}`, data);
        return response.data;
    },

    deletarCartao: async (id: number): Promise<void> => {
        await api.delete(`/cartoes/${id}`);
    }
};
