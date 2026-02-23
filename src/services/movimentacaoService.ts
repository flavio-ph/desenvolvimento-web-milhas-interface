import api from './api';

export interface MovimentacaoParams {
    mes?: number;
    ano?: number;
    programa?: string;
    tipo?: string;
    cartaoId?: string;
    page?: number;
    size?: number;
}

export interface MovimentacaoResponse {
    id: number;
    tipo: 'ACUMULO' | 'USO' | 'BONUS' | 'EXPIRACAO' | 'AJUSTE' | 'TRANSFERENCIA_ENTRADA' | 'TRANSFERENCIA_SAIDA';
    quantidadePontos: number;
    dataMovimentacao: string;
    descricao: string;
    nomePrograma: string;
    nomeCartao?: string;
    nomePersonalizado?: string;
    status?: string;
}

export interface MovimentacaoPageResponse {
    content: MovimentacaoResponse[];
    totalElements?: number;
    totalPages?: number;
    size?: number;
    number?: number;
}

export const movimentacaoService = {
    listarMovimentacoes: async (params: MovimentacaoParams): Promise<MovimentacaoResponse[]> => {
        const response = await api.get('/movimentacoes', { params });
        // Handle both cases: Spring Data Page<T> (response.data.content) or List<T> (response.data)
        return response.data?.content || (Array.isArray(response.data) ? response.data : []);
    },

    exportarPdf: async (): Promise<Blob> => {
        const response = await api.get('/relatorios/movimentacoes/pdf', { responseType: 'blob' });
        return response.data;
    },

    exportarCsv: async (): Promise<Blob> => {
        const response = await api.get('/relatorios/movimentacoes/csv', { responseType: 'blob' });
        return response.data;
    }
};
