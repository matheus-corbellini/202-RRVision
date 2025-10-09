import { useCallback } from 'react';
import { isEmailAlreadyUsed } from '../services/userCreationService';
import { isCodeAlreadyUsed } from '../services/authService';
import type { UserFormData } from './useUserForm';

interface ValidationResult {
	isValid: boolean;
	errors: Record<string, string>;
}

export function useFormValidation() {
	const validateEmail = useCallback(async (email: string, editingUser: any = null): Promise<string> => {
		if (!email) return 'E-mail é obrigatório';
		
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) return 'E-mail inválido';

		// Verificar se email já existe (apenas para novos usuários)
		if (!editingUser) {
			try {
				const emailExists = await isEmailAlreadyUsed(email);
				if (emailExists) return 'E-mail já está em uso';
			} catch (err) {
				return 'Erro ao verificar disponibilidade do email';
			}
		}

		return '';
	}, []);

	const validateCode = useCallback(async (code: string, userType: string, editingUser: any = null): Promise<string> => {
		if (userType === 'operator' && (!code || !code.trim())) {
			return 'Código/Matrícula é obrigatório para operadores';
		}

		// Verificar se código já existe (apenas para novos usuários)
		if (userType === 'operator' && !editingUser && code) {
			try {
				const codeExists = await isCodeAlreadyUsed(code);
				if (codeExists) return 'Código/Matrícula já está em uso';
			} catch (err) {
				return 'Erro ao verificar disponibilidade do código';
			}
		}

		return '';
	}, []);

	const validateForm = useCallback(async (formData: UserFormData, editingUser: any = null): Promise<ValidationResult> => {
		const errors: Record<string, string> = {};

		// Validações básicas
		if (!formData.email) {
			errors.email = 'E-mail é obrigatório';
		} else {
			const emailError = await validateEmail(formData.email, editingUser);
			if (emailError) errors.email = emailError;
		}

		if (!formData.name) {
			errors.name = 'Nome é obrigatório';
		} else if (formData.name.trim().length < 2) {
			errors.name = 'Nome deve ter pelo menos 2 caracteres';
		}

		if (!editingUser && !formData.password) {
			errors.password = 'Senha é obrigatória para novos usuários';
		} else if (formData.password && formData.password.length < 6) {
			errors.password = 'A senha deve ter pelo menos 6 caracteres';
		}

		if (formData.password && formData.password !== formData.confirmPassword) {
			errors.confirmPassword = 'As senhas não coincidem';
		}

		// Validações específicas para operadores
		if (formData.userType === 'operator') {
			const codeError = await validateCode(formData.code || '', formData.userType, editingUser);
			if (codeError) errors.code = codeError;

			if (!formData.primarySectorId) {
				errors.primarySectorId = 'Setor primário é obrigatório para operadores';
			}

			if (!formData.admissionDate) {
				errors.admissionDate = 'Data de admissão é obrigatória para operadores';
			}

			if (!formData.weeklyHours || formData.weeklyHours <= 0) {
				errors.weeklyHours = 'Horas semanais devem ser maiores que 0';
			}
		}

		return {
			isValid: Object.keys(errors).length === 0,
			errors,
		};
	}, [validateEmail, validateCode]);

	// Validação em tempo real com debounce
	const validateField = useCallback(async (
		field: string, 
		value: string, 
		formData: UserFormData, 
		editingUser: any = null
	): Promise<string> => {
		switch (field) {
			case 'email':
				return await validateEmail(value, editingUser);
			case 'code':
				return await validateCode(value, formData.userType, editingUser);
			case 'name':
				if (!value.trim()) return 'Nome é obrigatório';
				if (value.trim().length < 2) return 'Nome deve ter pelo menos 2 caracteres';
				return '';
			case 'password':
				if (!editingUser && !value) return 'Senha é obrigatória';
				if (value && value.length < 6) return 'Senha deve ter pelo menos 6 caracteres';
				return '';
			case 'confirmPassword':
				if (!editingUser && !value) return 'Confirmação de senha é obrigatória';
				if (value && value !== formData.password) return 'As senhas não coincidem';
				return '';
			case 'primarySectorId':
				if (formData.userType === 'operator' && !value) return 'Setor primário é obrigatório para operadores';
				return '';
			case 'admissionDate':
				if (formData.userType === 'operator' && !value) return 'Data de admissão é obrigatória para operadores';
				return '';
			case 'weeklyHours':
				if (formData.userType === 'operator' && (!value || Number(value) <= 0)) return 'Horas semanais devem ser maiores que 0';
				return '';
			default:
				return '';
		}
	}, [validateEmail, validateCode]);

	return {
		validateForm,
		validateField,
		validateEmail,
		validateCode,
	};
}
