import { useState, useEffect, useCallback } from 'react';
import { blingService } from '../services/blingService';
import { BlingDataMapper } from '../services/blingDataMapper';
import type { Order } from '../types/dashboard';

export interface UseBlingOrdersOptions {
    accessToken?: string;
    autoRefresh?: boolean;
    refreshInterval?: number; // em milissegundos
    pageSize?: number;
}

export interface UseBlingOrdersReturn {
    orders: Order[];
    loading: boolean;
    error: string | null;
    stats: {
        totalOrders: number;
        pendingOrders: number;
        inProgressOrders: number;
        completedOrders: number;
        cancelledOrders: number;
        urgentOrders: number;
        highPriorityOrders: number;
        mediumPriorityOrders: number;
        lowPriorityOrders: number;
    };
    lastSync: Date | null;
    refresh: () => Promise<void>;
    filterByStatus: (status: string) => Order[];
    filterByPriority: (priority: string) => Order[];
    sortByPriority: () => Order[];
}

export const useBlingOrders = (options: UseBlingOrdersOptions = {}): UseBlingOrdersReturn => {
    const {
        accessToken,
        autoRefresh = false,
        refreshInterval = 30000, // 30 segundos
        pageSize = 50,
    } = options;

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastSync, setLastSync] = useState<Date | null>(null);
    const [currentPage] = useState(1);

    const loadOrders = useCallback(async () => {
        // Tentar obter token do localStorage se não foi fornecido
        const token = accessToken || localStorage.getItem('bling_access_token');
        
        if (!token) {
            setError('Access token não configurado. Configure a integração com Bling primeiro.');
            setOrders([]); // Limpar pedidos se não há token
            return;
        }

        setLoading(true);
        setError(null);

        try {
            blingService.setAccessToken(token);
            
            // Verificar se o token é válido antes de fazer a requisição
            if (!blingService.hasValidToken()) {
                throw new Error('Token inválido ou expirado. Configure um novo token.');
            }
            
            // Carregar pedidos do Bling
            const result = await blingService.getOrders(currentPage, pageSize);
            
            // Mapear para formato interno
            const mappedOrders = BlingDataMapper.mapBlingOrdersToOrders(result.data);
            
            setOrders(mappedOrders);
            setLastSync(new Date());
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar pedidos do Bling';
            setError(errorMessage);
            setOrders([]); // Limpar pedidos em caso de erro
            console.error('Erro ao carregar pedidos:', err);
        } finally {
            setLoading(false);
        }
    }, [accessToken, currentPage, pageSize]);

    const refresh = useCallback(async () => {
        await loadOrders();
    }, [loadOrders]);

    const filterByStatus = useCallback((status: string) => {
        return BlingDataMapper.filterOrdersByStatus(orders, status);
    }, [orders]);

    const filterByPriority = useCallback((priority: string) => {
        return BlingDataMapper.filterOrdersByPriority(orders, priority as any);
    }, [orders]);

    const sortByPriority = useCallback(() => {
        return BlingDataMapper.sortOrdersByPriority(orders);
    }, [orders]);

    // Calcular estatísticas
    const stats = BlingDataMapper.calculateOrderStats(orders);

    // Carregar dados iniciais
    useEffect(() => {
        if (accessToken) {
            loadOrders();
        }
    }, [loadOrders]);

    // Auto-refresh se habilitado
    useEffect(() => {
        if (!autoRefresh || !accessToken) return;

        const interval = setInterval(() => {
            loadOrders();
        }, refreshInterval);

        return () => clearInterval(interval);
    }, [autoRefresh, accessToken, refreshInterval, loadOrders]);

    return {
        orders,
        loading,
        error,
        stats,
        lastSync,
        refresh,
        filterByStatus,
        filterByPriority,
        sortByPriority,
    };
};
