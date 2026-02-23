import api from './api';

export interface ProgramaPayload {
    nome: string;
    url?: string;
}

export interface ProgramaResponse {
    id: number;
    nome: string;
    url?: string;
    pontos?: number;
    color?: string;
}

export const programaService = {
    listarProgramas: async (): Promise<ProgramaResponse[]> => {
        const response = await api.get<ProgramaResponse[]>('/programas');
        return response.data;
    },

    criarPrograma: async (data: ProgramaPayload): Promise<ProgramaResponse> => {
        const response = await api.post<ProgramaResponse>('/programas', data);
        return response.data;
    },

    atualizarPrograma: async (id: number, data: ProgramaPayload): Promise<ProgramaResponse> => {
        const response = await api.put<ProgramaResponse>(`/programas/${id}`, data);
        return response.data;
    },

    deletarPrograma: async (id: number): Promise<void> => {
        await api.delete(`/programas/${id}`);
    }
};
