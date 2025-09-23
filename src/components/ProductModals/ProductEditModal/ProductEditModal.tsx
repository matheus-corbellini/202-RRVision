import { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaBox, FaCog, FaBolt, FaUser } from 'react-icons/fa';
import './ProductEditModal.css';

interface Product {
    id: string;
    name: string;
    category: string;
    series: string;
    description: string;
    image: string;
    status: 'active' | 'inactive' | 'maintenance';
    specifications: {
        voltage?: string;
        current?: string;
        material?: string;
        dimensions?: string;
        weight?: string;
        temperature?: string;
        certification?: string;
    };
    additionalInfo?: {
        manufacturer?: string;
        partNumber?: string;
        warranty?: string;
        createdAt?: string;
        updatedAt?: string;
        createdBy?: string;
    };
}

interface ProductEditModalProps {
    product: Product | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (updatedProduct: Product) => void;
}

export default function ProductEditModal({ product, isOpen, onClose, onSave }: ProductEditModalProps) {
    const [formData, setFormData] = useState<Product | null>(null);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        if (product) {
            setFormData({ ...product });
            setErrors({});
        }
    }, [product]);

    if (!isOpen || !formData) return null;

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => {
            if (!prev) return null;

            if (field.includes('.')) {
                const [parent, child] = field.split('.');
                const parentValue = prev[parent as keyof Product];
                return {
                    ...prev,
                    [parent]: {
                        ...(typeof parentValue === 'object' && parentValue !== null ? parentValue : {}),
                        [child]: value
                    }
                };
            }

            return {
                ...prev,
                [field]: value
            };
        });

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!formData?.name.trim()) {
            newErrors.name = 'Nome do produto é obrigatório';
        }

        if (!formData?.category.trim()) {
            newErrors.category = 'Categoria é obrigatória';
        }

        if (!formData?.series.trim()) {
            newErrors.series = 'Série é obrigatória';
        }

        if (!formData?.description.trim()) {
            newErrors.description = 'Descrição é obrigatória';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        if (validateForm() && formData) {
            onSave(formData);
            onClose();
        }
    };

    const categories = [
        'Acessórios', 'Aviação', 'HVC', 'Conectores', 'Proteção',
        'Terminais', 'Borracha', 'Backshell', 'Manifolds', 'Cabos', 'PCB'
    ];

    const series = [
        'Premium', 'Standard', 'Industrial', 'Automotive', 'High Voltage',
        'Control', 'Accessory', 'Aviation', 'Fuse Box', 'Rubber', 'Protection'
    ];

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="product-edit-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="modal-title">
                        <FaCog className="title-icon" />
                        <h2>Editar Produto</h2>
                    </div>
                    <button className="close-button" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                <div className="modal-content">
                    <form className="edit-form">
                        {/* Informações Básicas */}
                        <div className="form-section">
                            <h3><FaBox /> Informações Básicas</h3>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label htmlFor="name">Nome do Produto *</label>
                                    <input
                                        type="text"
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        className={errors.name ? 'error' : ''}
                                        placeholder="Digite o nome do produto"
                                    />
                                    {errors.name && <span className="error-message">{errors.name}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="category">Categoria *</label>
                                    <select
                                        id="category"
                                        value={formData.category}
                                        onChange={(e) => handleInputChange('category', e.target.value)}
                                        className={errors.category ? 'error' : ''}
                                    >
                                        <option value="">Selecione uma categoria</option>
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                    {errors.category && <span className="error-message">{errors.category}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="series">Série *</label>
                                    <select
                                        id="series"
                                        value={formData.series}
                                        onChange={(e) => handleInputChange('series', e.target.value)}
                                        className={errors.series ? 'error' : ''}
                                    >
                                        <option value="">Selecione uma série</option>
                                        {series.map(serie => (
                                            <option key={serie} value={serie}>{serie}</option>
                                        ))}
                                    </select>
                                    {errors.series && <span className="error-message">{errors.series}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="status">Status</label>
                                    <select
                                        id="status"
                                        value={formData.status}
                                        onChange={(e) => handleInputChange('status', e.target.value)}
                                    >
                                        <option value="active">Ativo</option>
                                        <option value="inactive">Inativo</option>
                                        <option value="maintenance">Manutenção</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group full-width">
                                <label htmlFor="description">Descrição *</label>
                                <textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    className={errors.description ? 'error' : ''}
                                    placeholder="Descreva o produto"
                                    rows={3}
                                />
                                {errors.description && <span className="error-message">{errors.description}</span>}
                            </div>
                        </div>

                        {/* Especificações Técnicas */}
                        <div className="form-section">
                            <h3><FaBolt /> Especificações Técnicas</h3>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label htmlFor="voltage">Voltagem</label>
                                    <input
                                        type="text"
                                        id="voltage"
                                        value={formData.specifications.voltage || ''}
                                        onChange={(e) => handleInputChange('specifications.voltage', e.target.value)}
                                        placeholder="Ex: 220V"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="current">Corrente</label>
                                    <input
                                        type="text"
                                        id="current"
                                        value={formData.specifications.current || ''}
                                        onChange={(e) => handleInputChange('specifications.current', e.target.value)}
                                        placeholder="Ex: 16A"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="material">Material</label>
                                    <input
                                        type="text"
                                        id="material"
                                        value={formData.specifications.material || ''}
                                        onChange={(e) => handleInputChange('specifications.material', e.target.value)}
                                        placeholder="Ex: Plástico ABS"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="dimensions">Dimensões</label>
                                    <input
                                        type="text"
                                        id="dimensions"
                                        value={formData.specifications.dimensions || ''}
                                        onChange={(e) => handleInputChange('specifications.dimensions', e.target.value)}
                                        placeholder="Ex: 25x15x10mm"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="weight">Peso</label>
                                    <input
                                        type="text"
                                        id="weight"
                                        value={formData.specifications.weight || ''}
                                        onChange={(e) => handleInputChange('specifications.weight', e.target.value)}
                                        placeholder="Ex: 50g"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="temperature">Temperatura</label>
                                    <input
                                        type="text"
                                        id="temperature"
                                        value={formData.specifications.temperature || ''}
                                        onChange={(e) => handleInputChange('specifications.temperature', e.target.value)}
                                        placeholder="Ex: -40°C a +85°C"
                                    />
                                </div>
                            </div>

                            <div className="form-group full-width">
                                <label htmlFor="certification">Certificação</label>
                                <input
                                    type="text"
                                    id="certification"
                                    value={formData.specifications.certification || ''}
                                    onChange={(e) => handleInputChange('specifications.certification', e.target.value)}
                                    placeholder="Ex: CE, UL, RoHS"
                                />
                            </div>
                        </div>

                        {/* Informações Adicionais */}
                        <div className="form-section">
                            <h3><FaUser /> Informações Adicionais</h3>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label htmlFor="manufacturer">Fabricante</label>
                                    <input
                                        type="text"
                                        id="manufacturer"
                                        value={formData.additionalInfo?.manufacturer || ''}
                                        onChange={(e) => handleInputChange('additionalInfo.manufacturer', e.target.value)}
                                        placeholder="Nome do fabricante"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="partNumber">Número da Peça</label>
                                    <input
                                        type="text"
                                        id="partNumber"
                                        value={formData.additionalInfo?.partNumber || ''}
                                        onChange={(e) => handleInputChange('additionalInfo.partNumber', e.target.value)}
                                        placeholder="Código da peça"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="warranty">Garantia</label>
                                    <input
                                        type="text"
                                        id="warranty"
                                        value={formData.additionalInfo?.warranty || ''}
                                        onChange={(e) => handleInputChange('additionalInfo.warranty', e.target.value)}
                                        placeholder="Ex: 2 anos"
                                    />
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={onClose}>
                        Cancelar
                    </button>
                    <button type="button" className="btn btn-primary" onClick={handleSave}>
                        <FaSave />
                        Salvar Alterações
                    </button>
                </div>
            </div>
        </div>
    );
}
