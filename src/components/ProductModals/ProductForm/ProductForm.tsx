import { memo } from 'react';
import { FaSave, FaTimes } from "react-icons/fa";
import Button from "../../Button/Button";
import Input from "../../Input/Input";
import type { Product } from "../../../types";
import type { ProductFormData } from "../../../hooks/useProductForm";

interface ProductFormProps {
	formData: ProductFormData;
	formErrors: Record<string, string>;
	formLoading: boolean;
	editingProduct: Product | null;
	onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
	onSubmit: (e: React.FormEvent) => void;
	onCancel: () => void;
	onFieldChange?: (field: keyof ProductFormData, value: string | boolean) => void;
}

const ProductForm = memo<ProductFormProps>(({ 
	formData,
	formErrors,
	formLoading,
	editingProduct,
	onChange,
	onSubmit,
	onCancel,
	onFieldChange
}) => {
	const handleFieldChange = (field: keyof ProductFormData, value: string | boolean) => {
		if (onFieldChange) {
			onFieldChange(field, value);
		}
	};

	return (
		<form onSubmit={onSubmit} className="product-form">
			<div className="form-section">
				<h3>Informações do Produto</h3>
				<div className="form-grid">
					<div className="form-group">
						<label>Código *</label>
						<Input
							type="text"
							name="code"
							value={formData.code}
							onChange={onChange}
							placeholder="Ex: PROD001"
							required
							disabled={formLoading || !!editingProduct}
						/>
						{formErrors.code && <span className="error-message">{formErrors.code}</span>}
					</div>

					<div className="form-group">
						<label>Nome *</label>
						<Input
							type="text"
							name="name"
							value={formData.name}
							onChange={onChange}
							placeholder="Nome do produto"
							required
							disabled={formLoading}
						/>
						{formErrors.name && <span className="error-message">{formErrors.name}</span>}
					</div>

					<div className="form-group">
						<label>Categoria *</label>
						<Input
							type="text"
							name="category"
							value={formData.category}
							onChange={onChange}
							placeholder="Categoria do produto"
							required
							disabled={formLoading}
						/>
						{formErrors.category && <span className="error-message">{formErrors.category}</span>}
					</div>

					<div className="form-group">
						<label>Status</label>
						<select
							name="isActive"
							value={formData.isActive ? "true" : "false"}
							onChange={(e) => handleFieldChange('isActive', e.target.value === "true")}
							disabled={formLoading}
						>
							<option value="true">Ativo</option>
							<option value="false">Inativo</option>
						</select>
					</div>
				</div>

				<div className="form-group">
					<label>Descrição</label>
					<textarea
						name="description"
						value={formData.description}
						onChange={onChange}
						placeholder="Descrição detalhada do produto"
						rows={4}
						disabled={formLoading}
					/>
					{formErrors.description && <span className="error-message">{formErrors.description}</span>}
				</div>
			</div>

			<div className="form-actions">
				<Button
					type="button"
					variant="outline"
					onClick={onCancel}
					disabled={formLoading}
				>
					<FaTimes />
					Cancelar
				</Button>
				<Button
					type="submit"
					disabled={formLoading}
				>
					<FaSave />
					{formLoading ? "Salvando..." : editingProduct ? "Salvar" : "Criar Produto"}
				</Button>
			</div>
		</form>
	);
});

ProductForm.displayName = 'ProductForm';

export default ProductForm;
