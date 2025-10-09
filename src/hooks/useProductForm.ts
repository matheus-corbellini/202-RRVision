import { useReducer, useCallback } from 'react';
import type { Product } from '../types';

export interface ProductFormData {
	code: string;
	name: string;
	description: string;
	category: string;
	isActive: boolean;
}

interface ProductFormState {
	formData: ProductFormData;
	formErrors: Record<string, string>;
	formLoading: boolean;
	editingProduct: Product | null;
}

type ProductFormAction =
	| { type: 'SET_FIELD'; field: keyof ProductFormData; value: string | boolean }
	| { type: 'SET_ERROR'; field: string; error: string }
	| { type: 'CLEAR_ERROR'; field: string }
	| { type: 'CLEAR_ALL_ERRORS' }
	| { type: 'SET_LOADING'; loading: boolean }
	| { type: 'SET_EDITING_PRODUCT'; product: Product | null }
	| { type: 'RESET_FORM' };

const initialFormData: ProductFormData = {
	code: "",
	name: "",
	description: "",
	category: "",
	isActive: true,
};

const initialState: ProductFormState = {
	formData: initialFormData,
	formErrors: {},
	formLoading: false,
	editingProduct: null,
};

function productFormReducer(state: ProductFormState, action: ProductFormAction): ProductFormState {
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

		case 'SET_EDITING_PRODUCT':
			return {
				...state,
				editingProduct: action.product,
			};

		case 'RESET_FORM':
			return {
				...state,
				formData: initialFormData,
				formErrors: {},
				editingProduct: null,
			};

		default:
			return state;
	}
}

export function useProductForm() {
	const [state, dispatch] = useReducer(productFormReducer, initialState);

	const setField = useCallback((field: keyof ProductFormData, value: string | boolean) => {
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

	const setEditingProduct = useCallback((product: Product | null) => {
		dispatch({ type: 'SET_EDITING_PRODUCT', product });
	}, []);

	const resetForm = useCallback(() => {
		dispatch({ type: 'RESET_FORM' });
	}, []);

	const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
		const { name, value, type } = e.target;
		const checked = (e.target as HTMLInputElement).checked;
		
		setField(name as keyof ProductFormData, type === 'checkbox' ? checked : value);
		
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
		setEditingProduct,
		resetForm,
		handleChange,
	};
}
