import { useCallback } from 'react';
import type { OperationalRouteFormData } from './useOperationalRouteForm';

interface ValidationResult {
	isValid: boolean;
	errors: Record<string, string>;
}

export function useOperationalRouteValidation() {
	const validateForm = useCallback(async (formData: OperationalRouteFormData, editingRoute: any = null): Promise<ValidationResult> => {
		const errors: Record<string, string> = {};

		// Validar nome do produto
		if (!formData.productName.trim()) {
			errors.productName = 'Nome do produto é obrigatório';
		} else if (formData.productName.trim().length < 2) {
			errors.productName = 'Nome do produto deve ter pelo menos 2 caracteres';
		}

		// Validar código do produto
		if (!formData.productCode.trim()) {
			errors.productCode = 'Código do produto é obrigatório';
		} else if (formData.productCode.trim().length < 2) {
			errors.productCode = 'Código do produto deve ter pelo menos 2 caracteres';
		}

		// Validar versão
		if (!formData.version.trim()) {
			errors.version = 'Versão é obrigatória';
		} else if (formData.version.trim().length < 1) {
			errors.version = 'Versão deve ter pelo menos 1 caractere';
		}

		// Validar status
		if (!formData.status) {
			errors.status = 'Status é obrigatório';
		}

		// Validar descrição (opcional, mas se preenchida deve ter pelo menos 10 caracteres)
		if (formData.description && formData.description.trim().length > 0 && formData.description.trim().length < 10) {
			errors.description = 'Descrição deve ter pelo menos 10 caracteres';
		}

		// Validar etapas
		if (!formData.steps || formData.steps.length === 0) {
			errors.steps = 'Pelo menos uma etapa é obrigatória';
		} else {
			// Validar cada etapa
			formData.steps.forEach((step, index) => {
				if (!step.name.trim()) {
					errors[`step_${index}_name`] = `Nome da etapa ${index + 1} é obrigatório`;
				}
				if (!step.description.trim()) {
					errors[`step_${index}_description`] = `Descrição da etapa ${index + 1} é obrigatória`;
				}
				if (step.standardTime <= 0) {
					errors[`step_${index}_standardTime`] = `Tempo padrão da etapa ${index + 1} deve ser maior que 0`;
				}
				if (step.setupTime < 0) {
					errors[`step_${index}_setupTime`] = `Tempo de setup da etapa ${index + 1} não pode ser negativo`;
				}
			});
		}

		return {
			isValid: Object.keys(errors).length === 0,
			errors,
		};
	}, []);

	// Validação em tempo real com debounce
	const validateField = useCallback(async (
		field: string, 
		value: string, 
		formData: OperationalRouteFormData,
		editingRoute: any = null
	): Promise<string> => {
		switch (field) {
			case 'productName':
				if (!value.trim()) return 'Nome do produto é obrigatório';
				if (value.trim().length < 2) return 'Nome do produto deve ter pelo menos 2 caracteres';
				return '';
			case 'productCode':
				if (!value.trim()) return 'Código do produto é obrigatório';
				if (value.trim().length < 2) return 'Código do produto deve ter pelo menos 2 caracteres';
				return '';
			case 'version':
				if (!value.trim()) return 'Versão é obrigatória';
				if (value.trim().length < 1) return 'Versão deve ter pelo menos 1 caractere';
				return '';
			case 'status':
				if (!value) return 'Status é obrigatório';
				return '';
			case 'description':
				if (value && value.trim().length > 0 && value.trim().length < 10) {
					return 'Descrição deve ter pelo menos 10 caracteres';
				}
				return '';
			default:
				return '';
		}
	}, []);

	return {
		validateForm,
		validateField,
	};
}
