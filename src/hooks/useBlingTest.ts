import { useState, useEffect, useCallback } from 'react';
import { blingService } from '../services/blingService';

export interface TestResult {
    success: boolean;
    data?: any;
    error?: string;
    count?: number;
}

export interface TestResults {
    connection: TestResult | null;
    orders: TestResult | null;
    products: TestResult | null;
    customers: TestResult | null;
    productionOrders: TestResult | null;
    sync: TestResult | null;
    endpoints: TestResult | null;
    apiStructure: TestResult | null;
    apiBaseUrls: TestResult | null;
}

export interface UseBlingTestReturn {
    isLoading: boolean;
    hasToken: boolean;
    testResults: TestResults;
    testConnection: () => Promise<void>;
    testOrders: () => Promise<void>;
    testProducts: () => Promise<void>;
    testCustomers: () => Promise<void>;
    testProductionOrders: () => Promise<void>;
    testSync: () => Promise<void>;
    testEndpoints: () => Promise<void>;
    testApiStructure: () => Promise<void>;
    testApiBaseUrls: () => Promise<void>;
    testProductionOrderSituations: () => Promise<void>;
    runAllTests: () => Promise<void>;
    clearResults: () => void;
}

const initialTestResults: TestResults = {
    connection: null,
    orders: null,
    products: null,
    customers: null,
    productionOrders: null,
    sync: null,
    endpoints: null,
    apiStructure: null,
    apiBaseUrls: null
};

export const useBlingTest = (): UseBlingTestReturn => {
    const [isLoading, setIsLoading] = useState(false);
    const [hasToken, setHasToken] = useState(false);
    const [testResults, setTestResults] = useState<TestResults>(initialTestResults);

    // Verificar se há token configurado
    useEffect(() => {
        const checkToken = () => {
            const token = localStorage.getItem('bling_access_token');
            setHasToken(!!token);
        };

        checkToken();

        // Escutar mudanças no localStorage
        const handleStorageChange = () => checkToken();
        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('blingTokenChanged', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('blingTokenChanged', handleStorageChange);
        };
    }, []);

    const updateTestResult = useCallback((key: keyof TestResults, result: TestResult) => {
        setTestResults(prev => ({
            ...prev,
            [key]: result
        }));
    }, []);

    const testConnection = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await blingService.testConnection();
            updateTestResult('connection', {
                success: result.success,
                error: result.error
            });
        } catch (error) {
            updateTestResult('connection', {
                success: false,
                error: error instanceof Error ? error.message : "Erro desconhecido"
            });
        } finally {
            setIsLoading(false);
        }
    }, [updateTestResult]);

    const testOrders = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await blingService.getOrders(1, 10);
            updateTestResult('orders', {
                success: true,
                data: result.data,
                count: result.total
            });
        } catch (error) {
            updateTestResult('orders', {
                success: false,
                error: error instanceof Error ? error.message : "Erro desconhecido"
            });
        } finally {
            setIsLoading(false);
        }
    }, [updateTestResult]);

    const testProducts = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await blingService.getProducts(1, 10);
            updateTestResult('products', {
                success: true,
                data: result.data,
                count: result.data?.length || 0
            });
        } catch (error) {
            updateTestResult('products', {
                success: false,
                error: error instanceof Error ? error.message : "Erro desconhecido"
            });
        } finally {
            setIsLoading(false);
        }
    }, [updateTestResult]);

    const testCustomers = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await blingService.getCustomers(1, 10);
            updateTestResult('customers', {
                success: true,
                data: result.data,
                count: result.data?.length || 0
            });
        } catch (error) {
            updateTestResult('customers', {
                success: false,
                error: error instanceof Error ? error.message : "Erro desconhecido"
            });
        } finally {
            setIsLoading(false);
        }
    }, [updateTestResult]);

    const testProductionOrders = useCallback(async () => {
        setIsLoading(true);
        try {
            // Primeiro, vamos testar sem filtros para ver todas as ordens
            console.log('🔍 Testando ordens de produção sem filtros...');
            const result = await blingService.getProductionOrders(1, 100);
            
            console.log('📊 Resultado:', result);
            console.log('📊 Dados recebidos:', result.data);
            console.log('📊 Total encontrado:', result.data?.length || 0);
            
            updateTestResult('productionOrders', {
                success: true,
                data: result.data,
                count: result.data?.length || 0
            });
        } catch (error) {
            console.error('❌ Erro ao buscar ordens de produção:', error);
            updateTestResult('productionOrders', {
                success: false,
                error: error instanceof Error ? error.message : "Erro desconhecido"
            });
        } finally {
            setIsLoading(false);
        }
    }, [updateTestResult]);

    const testProductionOrderSituations = useCallback(async () => {
        setIsLoading(true);
        try {
            console.log('🔍 Testando busca de situações de ordens de produção...');
            const result = await blingService.getProductionOrderSituations();
            
            console.log('📊 Situações encontradas:', result);
            console.log('📊 Dados das situações:', result.data);
            console.log('📊 Total de situações:', result.data?.length || 0);
            
            updateTestResult('productionOrders', {
                success: true,
                data: result.data,
                count: result.data?.length || 0
            });
        } catch (error) {
            console.error('❌ Erro ao buscar situações:', error);
            updateTestResult('productionOrders', {
                success: false,
                error: error instanceof Error ? error.message : "Erro desconhecido"
            });
        } finally {
            setIsLoading(false);
        }
    }, [updateTestResult]);

    const testSync = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await blingService.syncData();
            updateTestResult('sync', {
                success: result.success,
                data: result,
                error: result.errors.length > 0 ? result.errors.join(", ") : undefined
            });
        } catch (error) {
            updateTestResult('sync', {
                success: false,
                error: error instanceof Error ? error.message : "Erro desconhecido"
            });
        } finally {
            setIsLoading(false);
        }
    }, [updateTestResult]);

    const testEndpoints = useCallback(async () => {
        setIsLoading(true);
        try {
            const results = await blingService.testEndpoints();
            const successfulEndpoints = results.filter(r => r.success);

            updateTestResult('endpoints', {
                success: successfulEndpoints.length > 0,
                data: results,
                error: successfulEndpoints.length === 0 ? "Nenhum endpoint de vendas encontrado" : undefined
            });
        } catch (error) {
            updateTestResult('endpoints', {
                success: false,
                error: error instanceof Error ? error.message : "Erro desconhecido"
            });
        } finally {
            setIsLoading(false);
        }
    }, [updateTestResult]);

    const testApiStructure = useCallback(async () => {
        setIsLoading(true);
        try {
            const results = await blingService.testApiStructure();
            const successfulEndpoints = results.filter(r => r.success);

            updateTestResult('apiStructure', {
                success: successfulEndpoints.length > 0,
                data: results,
                error: successfulEndpoints.length === 0 ? "Nenhum endpoint de estrutura encontrado" : undefined
            });
        } catch (error) {
            updateTestResult('apiStructure', {
                success: false,
                error: error instanceof Error ? error.message : "Erro desconhecido"
            });
        } finally {
            setIsLoading(false);
        }
    }, [updateTestResult]);

    const testApiBaseUrls = useCallback(async () => {
        setIsLoading(true);
        try {
            const results = await blingService.testApiBaseUrls();
            const successfulUrls = results.filter(r => r.success);

            updateTestResult('apiBaseUrls', {
                success: successfulUrls.length > 0,
                data: results,
                error: successfulUrls.length === 0 ? "Nenhuma URL base funcionando" : undefined
            });
        } catch (error) {
            updateTestResult('apiBaseUrls', {
                success: false,
                error: error instanceof Error ? error.message : "Erro desconhecido"
            });
        } finally {
            setIsLoading(false);
        }
    }, [updateTestResult]);

    const runAllTests = useCallback(async () => {
        await testConnection();
        await testApiBaseUrls();
        await testApiStructure();
        await testEndpoints();
        await testOrders();
        await testProducts();
        await testCustomers();
        await testProductionOrders();
        await testSync();
    }, [
        testConnection,
        testApiBaseUrls,
        testApiStructure,
        testEndpoints,
        testOrders,
        testProducts,
        testCustomers,
        testProductionOrders,
        testSync
    ]);

    const clearResults = useCallback(() => {
        setTestResults(initialTestResults);
    }, []);

    return {
        isLoading,
        hasToken,
        testResults,
        testConnection,
        testOrders,
        testProducts,
        testCustomers,
        testProductionOrders,
        testSync,
        testEndpoints,
    testApiStructure,
    testApiBaseUrls,
    testProductionOrderSituations,
    runAllTests,
        clearResults
    };
};
