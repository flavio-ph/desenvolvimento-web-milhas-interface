import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api, { API_BASE_URL } from '../services/api';

interface UserData {
    nome: string;
    email: string;
    fotoPerfil?: string;
    role?: string;
    telefone?: string;
    cpf?: string;
    dataCadastro?: string;
}

interface UserContextType {
    user: UserData | null;
    loading: boolean;
    refetchUser: () => Promise<void>;
    getAvatarUrl: () => string;
    getUserInitials: () => string;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }
            const response = await api.get('/usuarios/me');
            setUser(response.data);
        } catch (error) {
            console.error('Erro ao carregar perfil do usuário:', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const refetchUser = useCallback(async () => {
        await fetchUser();
    }, [fetchUser]);

    const getAvatarUrl = useCallback((): string => {
        if (user?.fotoPerfil) {
            return `${API_BASE_URL}/uploads/${user.fotoPerfil}`;
        }
        return '';
    }, [user]);

    const getUserInitials = useCallback((): string => {
        if (!user?.nome) return '??';
        const parts = user.nome.trim().split(' ');
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }, [user]);

    return (
        <UserContext.Provider value={{ user, loading, refetchUser, getAvatarUrl, getUserInitials }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
