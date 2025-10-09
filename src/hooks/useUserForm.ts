import { useReducer, useCallback } from 'react';
import type { User, UserRole } from '../types';

export interface UserFormData {
	email: string;
	name: string;
	displayName: string;
	company: string;
	phone: string;
	password: string;
	confirmPassword: string;
	userType: string;
	role: UserRole;
	// Campos específicos de operador
	code?: string;
	primarySectorId?: string;
	secondarySectorIds?: string[];
	skills?: string[];
	admissionDate?: string;
	contractType?: string;
	workSchedule?: string;
	weeklyHours?: number;
	supervisorId?: string;
	teamId?: string;
	status?: string;
	lastTrainingDate?: string;
	nextTrainingDate?: string;
	newSkill?: string;
}

interface UserFormState {
	formData: UserFormData;
	formErrors: Record<string, string>;
	formLoading: boolean;
	editingUser: User | null;
}

type UserFormAction =
	| { type: 'SET_FIELD'; field: keyof UserFormData; value: string | number | string[] }
	| { type: 'SET_ERROR'; field: string; error: string }
	| { type: 'CLEAR_ERROR'; field: string }
	| { type: 'CLEAR_ALL_ERRORS' }
	| { type: 'SET_LOADING'; loading: boolean }
	| { type: 'SET_EDITING_USER'; user: User | null }
	| { type: 'RESET_FORM' }
	| { type: 'ADD_SKILL'; skill: string }
	| { type: 'REMOVE_SKILL'; skill: string }
	| { type: 'SET_NEW_SKILL'; skill: string };

const initialFormData: UserFormData = {
	email: "",
	name: "",
	displayName: "",
	company: "",
	phone: "",
	password: "",
	confirmPassword: "",
	userType: "operator",
	role: "operator",
	code: "",
	primarySectorId: "",
	secondarySectorIds: [],
	skills: [],
	admissionDate: "",
	contractType: "clt",
	workSchedule: "day",
	weeklyHours: 40,
	supervisorId: "",
	teamId: "",
	status: "active",
	lastTrainingDate: "",
	nextTrainingDate: "",
	newSkill: "",
};

const initialState: UserFormState = {
	formData: initialFormData,
	formErrors: {},
	formLoading: false,
	editingUser: null,
};

function userFormReducer(state: UserFormState, action: UserFormAction): UserFormState {
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

		case 'SET_EDITING_USER':
			return {
				...state,
				editingUser: action.user,
			};

		case 'RESET_FORM':
			return {
				...state,
				formData: initialFormData,
				formErrors: {},
				editingUser: null,
			};

		case 'ADD_SKILL':
			if (action.skill.trim() && !state.formData.skills?.includes(action.skill.trim())) {
				return {
					...state,
					formData: {
						...state.formData,
						skills: [...(state.formData.skills || []), action.skill.trim()],
						newSkill: "",
					},
				};
			}
			return state;

		case 'REMOVE_SKILL':
			return {
				...state,
				formData: {
					...state.formData,
					skills: (state.formData.skills || []).filter(skill => skill !== action.skill),
				},
			};

		case 'SET_NEW_SKILL':
			return {
				...state,
				formData: {
					...state.formData,
					newSkill: action.skill,
				},
			};

		default:
			return state;
	}
}

export function useUserForm() {
	const [state, dispatch] = useReducer(userFormReducer, initialState);

	const setField = useCallback((field: keyof UserFormData, value: string | number | string[]) => {
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

	const setEditingUser = useCallback((user: User | null) => {
		dispatch({ type: 'SET_EDITING_USER', user });
	}, []);

	const resetForm = useCallback(() => {
		dispatch({ type: 'RESET_FORM' });
	}, []);

	const addSkill = useCallback(() => {
		if (state.formData.newSkill?.trim()) {
			dispatch({ type: 'ADD_SKILL', skill: state.formData.newSkill });
		}
	}, [state.formData.newSkill]);

	const removeSkill = useCallback((skill: string) => {
		dispatch({ type: 'REMOVE_SKILL', skill });
	}, []);

	const setNewSkill = useCallback((skill: string) => {
		dispatch({ type: 'SET_NEW_SKILL', skill });
	}, []);

	const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		const { name, value } = e.target;
		setField(name as keyof UserFormData, value);
		
		// Limpar erros específicos do campo
		if (state.formErrors[name]) {
			clearError(name);
		}
	}, [setField, clearError, state.formErrors]);

	const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const { value } = e.target;
		const formattedPhone = formatPhone(value);
		setField('phone', formattedPhone);
	}, [setField]);

	const formatPhone = (value: string): string => {
		// Remove todos os caracteres não numéricos
		const numbers = value.replace(/\D/g, '');
		
		// Aplica a formatação baseada no tamanho
		if (numbers.length <= 2) {
			return numbers;
		} else if (numbers.length <= 7) {
			return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
		} else if (numbers.length <= 11) {
			return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
		} else {
			// Limita a 11 dígitos
			return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
		}
	};

	return {
		...state,
		setField,
		setError,
		clearError,
		clearAllErrors,
		setLoading,
		setEditingUser,
		resetForm,
		addSkill,
		removeSkill,
		setNewSkill,
		handleChange,
		handlePhoneChange,
	};
}
