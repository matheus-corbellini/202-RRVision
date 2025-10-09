import { useCallback } from 'react';
import { isCodeAlreadyUsed } from '../services/productService';
import type { ProductFormData } from './useProductForm';

interface ValidationResult {
	isValid: boolean;
	errors: Record<string, string>;
}

export function useProductValidation() {
	const validateCode = useCallback(async (code: string, editingProduct: any = null): Promise<string> => {
		if (!code.trim()) return 'Código é obrigatório';
		if (code.trim().length < 2) return 'Código deve ter pelo menos 2 caracteres';
		
		// Verificar se código já existe (apenas para novos produtos)
		if (!editingProduct) {
			try {
				const codeExists = await isCodeAlreadyUsed(code);
				if (codeExists) {
					return 'Código do produto já está em uso';
				}
			} catch (err) {
				return 'Erro ao verificar disponibilidade do código';
			}
		}
		
		return '';
	}, []);

	const validateForm = useCallback(async (formData: ProductFormData, editingProduct: any = null): Promise<ValidationResult> => {
		const errors: Record<string, string> = {};

		// Validar código
		if (!formData.code.trim()) {
			errors.code = 'Código é obrigatório';
		} else if (formData.code.trim().length < 2) {
			errors.code = 'Código deve ter pelo menos 2 caracteres';
		} else if (!editingProduct) {
			const codeError = await validateCode(formData.code, editingProduct);
			if (codeError) {
				errors.code = codeError;
			}
		}

		// Validar nome
		if (!formData.name.trim()) {
			errors.name = 'Nome é obrigatório';
		} else if (formData.name.trim().length < 2) {
			errors.name = 'Nome deve ter pelo menos 2 caracteres';
		}

		// Validar categoria
		if (!formData.category.trim()) {
			errors.category = 'Categoria é obrigatória';
		} else if (formData.category.trim().length < 2) {
			errors.category = 'Categoria deve ter pelo menos 2 caracteres';
		}

		// Validar descrição (opcional, mas se preenchida deve ter pelo menos 10 caracteres)
		if (formData.description && formData.description.trim().length > 0 && formData.description.trim().length < 10) {
			errors.description = 'Descrição deve ter pelo menos 10 caracteres';
		}

		return {
			isValid: Object.keys(errors).length === 0,
			errors,
		};
	}, [validateCode]);

	// Validação em tempo real com debounce
	const validateField = useCallback(async (
	_field: string, 
	value: string, 
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	_formData: ProductFormData,
		editingProduct: any = null
	): Promise<string> => {
		switch (_field) {
			case 'code':
				return await validateCode(value, editingProduct);
			case 'name':
				if (!value.trim()) return 'Nome é obrigatório';
				if (value.trim().length < 2) return 'Nome deve ter pelo menos 2 caracteres';
				return '';
			case 'category':
				if (!value.trim()) return 'Categoria é obrigatória';
				if (value.trim().length < 2) return 'Categoria deve ter pelo menos 2 caracteres';
				return '';
			case 'description':
				if (value && value.trim().length > 0 && value.trim().length < 10) {
					return 'Descrição deve ter pelo menos 10 caracteres';
				}
				return '';
			default:
				return '';
		}
	}, [validateCode]);

	return {
		validateForm,
		validateField,
		validateCode,
	};
}
