import { useState, useCallback } from 'react';
import { BlingToOperationalRoutesMapper } from '../services/blingToOperationalRoutesMapper';
import type { OperationalRoute } from '../types/operationalRoutes';

export interface BlingIntegrationState {
	isLoading: boolean;
	error: string | null;
	success: boolean;
	message: string;
	routes: OperationalRoute[];
	hasBlingToken: boolean;
}

export interface BlingIntegrationActions {
	syncWithBling: () => Promise<void>;
	clearError: () => void;
	clearSuccess: () => void;
}

export const useBlingIntegration = (): BlingIntegrationState & BlingIntegrationActions => {
	const [state, setState] = useState<BlingIntegrationState>({
		isLoading: false,
		error: null,
		success: false,
		message: '',
		routes: [],
		hasBlingToken: !!localStorage.getItem('bling_access_token')
	});

	const syncWithBling = useCallback(async () => {
		setState(prev => ({ ...prev, isLoading: true, error: null, success: false }));

		try {
			const result = await BlingToOperationalRoutesMapper.syncWithBling();
			
			setState(prev => ({
				...prev,
				isLoading: false,
				success: result.success,
				error: result.success ? null : result.errors.join(', '),
				message: result.message,
				routes: result.routes,
				hasBlingToken: !!localStorage.getItem('bling_access_token')
			}));

			// Auto-clear success message after 5 seconds
			if (result.success) {
				setTimeout(() => {
					setState(prev => ({ ...prev, success: false, message: '' }));
				}, 5000);
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
			setState(prev => ({
				...prev,
				isLoading: false,
				success: false,
				error: errorMessage,
				message: `Erro na sincronização: ${errorMessage}`
			}));
		}
	}, []);

	const clearError = useCallback(() => {
		setState(prev => ({ ...prev, error: null }));
	}, []);

	const clearSuccess = useCallback(() => {
		setState(prev => ({ ...prev, success: false, message: '' }));
	}, []);

	return {
		...state,
		syncWithBling,
		clearError,
		clearSuccess
	};
};


