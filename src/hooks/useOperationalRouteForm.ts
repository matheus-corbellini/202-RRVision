import { useReducer, useCallback } from 'react';
import type { OperationalRoute } from '../../types/operationalRoutes';

export interface OperationalRouteFormData {
	productName: string;
	productCode: string;
	version: string;
	status: 'active' | 'inactive' | 'draft';
	description: string;
	steps: Array<{
		id: string;
		name: string;
		description: string;
		standardTime: number;
		setupTime: number;
		sequence: number;
	}>;
}

interface OperationalRouteFormState {
	formData: OperationalRouteFormData;
	formErrors: Record<string, string>;
	formLoading: boolean;
	editingRoute: OperationalRoute | null;
}

type OperationalRouteFormAction =
	| { type: 'SET_FIELD'; field: keyof OperationalRouteFormData; value: any }
	| { type: 'SET_ERROR'; field: string; error: string }
	| { type: 'CLEAR_ERROR'; field: string }
	| { type: 'CLEAR_ALL_ERRORS' }
	| { type: 'SET_LOADING'; loading: boolean }
	| { type: 'SET_EDITING_ROUTE'; route: OperationalRoute | null }
	| { type: 'RESET_FORM' };

const initialFormData: OperationalRouteFormData = {
	productName: "",
	productCode: "",
	version: "",
	status: "draft",
	description: "",
	steps: [],
};

const initialState: OperationalRouteFormState = {
	formData: initialFormData,
	formErrors: {},
	formLoading: false,
	editingRoute: null,
};

function operationalRouteFormReducer(state: OperationalRouteFormState, action: OperationalRouteFormAction): OperationalRouteFormState {
	switch (action.type) {
		case 'SET_FIELD':
			return {
				...state,
				formData: {
					...state.formData,
					[action.field]: action.value,
				},
			};

		case 'SET_ERROR':
			return {
				...state,
				formErrors: {
					...state.formErrors,
					[action.field]: action.error,
				},
			};

		case 'CLEAR_ERROR':
			const { [action.field]: removed, ...restErrors } = state.formErrors;
			return {
				...state,
				formErrors: restErrors,
			};

		case 'CLEAR_ALL_ERRORS':
			return {
				...state,
				formErrors: {},
			};

		case 'SET_LOADING':
			return {
				...state,
				formLoading: action.loading,
			};

		case 'SET_EDITING_ROUTE':
			return {
				...state,
				editingRoute: action.route,
			};

		case 'RESET_FORM':
			return {
				...state,
				formData: initialFormData,
				formErrors: {},
				editingRoute: null,
			};

		default:
			return state;
	}
}

export function useOperationalRouteForm() {
	const [state, dispatch] = useReducer(operationalRouteFormReducer, initialState);

	const setField = useCallback((field: keyof OperationalRouteFormData, value: any) => {
		dispatch({ type: 'SET_FIELD', field, value });
	}, []);

	const setError = useCallback((field: string, error: string) => {
		dispatch({ type: 'SET_ERROR', field, error });
	}, []);

	const clearError = useCallback((field: string) => {
		dispatch({ type: 'CLEAR_ERROR', field });
	}, []);

	const clearAllErrors = useCallback(() => {
		dispatch({ type: 'CLEAR_ALL_ERRORS' });
	}, []);

	const setLoading = useCallback((loading: boolean) => {
		dispatch({ type: 'SET_LOADING', loading });
	}, []);

	const setEditingRoute = useCallback((route: OperationalRoute | null) => {
		dispatch({ type: 'SET_EDITING_ROUTE', route });
	}, []);

	const resetForm = useCallback(() => {
		dispatch({ type: 'RESET_FORM' });
	}, []);

	const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
		const { name, value, type } = e.target;
		const checked = (e.target as HTMLInputElement).checked;
		
		setField(name as keyof OperationalRouteFormData, type === 'checkbox' ? checked : value);
		
		// Limpar erros específicos do campo
		if (state.formErrors[name]) {
			clearError(name);
		}
	}, [setField, clearError, state.formErrors]);

	return {
		...state,
		setField,
		setError,
		clearError,
		clearAllErrors,
		setLoading,
		setEditingRoute,
		resetForm,
		handleChange,
	};
}
