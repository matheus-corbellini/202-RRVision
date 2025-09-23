import { FaTimes, FaBox, FaCog, FaTag, FaBolt, FaRuler, FaWeight, FaUser } from 'react-icons/fa';
import './ProductDetailsModal.css';

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

interface ProductDetailsModalProps {
    product: Product | null;
    isOpen: boolean;
    onClose: () => void;
    onEdit: () => void;
}

export default function ProductDetailsModal({ product, isOpen, onClose, onEdit }: ProductDetailsModalProps) {
    if (!isOpen || !product) return null;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return '#28a745';
            case 'inactive': return '#6c757d';
            case 'maintenance': return '#ffc107';
            default: return '#6c757d';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'active': return 'Ativo';
            case 'inactive': return 'Inativo';
            case 'maintenance': return 'Em Manutenção';
            default: return 'Desconhecido';
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="product-details-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="modal-title">
                        <FaBox className="title-icon" />
                        <h2>Detalhes do Produto</h2>
                    </div>
                    <button className="close-button" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                <div className="modal-content">
                    <div className="product-header">
                        <div className="product-image-section">
                            <img src={product.image} alt={product.name} className="product-image" />
                            <div
                                className="product-status-badge"
                                style={{ backgroundColor: getStatusColor(product.status) }}
                            >
                                {getStatusText(product.status)}
                            </div>
                        </div>

                        <div className="product-basic-info">
                            <h1 className="product-name">{product.name}</h1>
                            <div className="product-category-info">
                                <span className="category-tag">{product.category}</span>
                                <span className="series-tag">- {product.series}</span>
                            </div>
                            <p className="product-description">{product.description}</p>
                        </div>
                    </div>

                    <div className="product-details-grid">
                        <div className="details-section">
                            <h3><FaCog /> Especificações Técnicas</h3>
                            <div className="specs-grid">
                                {product.specifications.voltage && (
                                    <div className="spec-item">
                                        <FaBolt className="spec-icon" />
                                        <div className="spec-content">
                                            <span className="spec-label">Voltagem</span>
                                            <span className="spec-value">{product.specifications.voltage}</span>
                                        </div>
                                    </div>
                                )}
                                {product.specifications.current && (
                                    <div className="spec-item">
                                        <FaBolt className="spec-icon" />
                                        <div className="spec-content">
                                            <span className="spec-label">Corrente</span>
                                            <span className="spec-value">{product.specifications.current}</span>
                                        </div>
                                    </div>
                                )}
                                {product.specifications.material && (
                                    <div className="spec-item">
                                        <FaBox className="spec-icon" />
                                        <div className="spec-content">
                                            <span className="spec-label">Material</span>
                                            <span className="spec-value">{product.specifications.material}</span>
                                        </div>
                                    </div>
                                )}
                                {product.specifications.dimensions && (
                                    <div className="spec-item">
                                        <FaRuler className="spec-icon" />
                                        <div className="spec-content">
                                            <span className="spec-label">Dimensões</span>
                                            <span className="spec-value">{product.specifications.dimensions}</span>
                                        </div>
                                    </div>
                                )}
                                {product.specifications.weight && (
                                    <div className="spec-item">
                                        <FaWeight className="spec-icon" />
                                        <div className="spec-content">
                                            <span className="spec-label">Peso</span>
                                            <span className="spec-value">{product.specifications.weight}</span>
                                        </div>
                                    </div>
                                )}
                                {product.specifications.temperature && (
                                    <div className="spec-item">
                                        <FaBolt className="spec-icon" />
                                        <div className="spec-content">
                                            <span className="spec-label">Temperatura</span>
                                            <span className="spec-value">{product.specifications.temperature}</span>
                                        </div>
                                    </div>
                                )}
                                {product.specifications.certification && (
                                    <div className="spec-item">
                                        <FaTag className="spec-icon" />
                                        <div className="spec-content">
                                            <span className="spec-label">Certificação</span>
                                            <span className="spec-value">{product.specifications.certification}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {product.additionalInfo && (
                            <div className="details-section">
                                <h3><FaUser /> Informações Adicionais</h3>
                                <div className="info-grid">
                                    {product.additionalInfo.manufacturer && (
                                        <div className="info-item">
                                            <span className="info-label">Fabricante:</span>
                                            <span className="info-value">{product.additionalInfo.manufacturer}</span>
                                        </div>
                                    )}
                                    {product.additionalInfo.partNumber && (
                                        <div className="info-item">
                                            <span className="info-label">Número da Peça:</span>
                                            <span className="info-value">{product.additionalInfo.partNumber}</span>
                                        </div>
                                    )}
                                    {product.additionalInfo.warranty && (
                                        <div className="info-item">
                                            <span className="info-label">Garantia:</span>
                                            <span className="info-value">{product.additionalInfo.warranty}</span>
                                        </div>
                                    )}
                                    {product.additionalInfo.createdAt && (
                                        <div className="info-item">
                                            <span className="info-label">Criado em:</span>
                                            <span className="info-value">{product.additionalInfo.createdAt}</span>
                                        </div>
                                    )}
                                    {product.additionalInfo.updatedAt && (
                                        <div className="info-item">
                                            <span className="info-label">Atualizado em:</span>
                                            <span className="info-value">{product.additionalInfo.updatedAt}</span>
                                        </div>
                                    )}
                                    {product.additionalInfo.createdBy && (
                                        <div className="info-item">
                                            <span className="info-label">Criado por:</span>
                                            <span className="info-value">{product.additionalInfo.createdBy}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>
                        Fechar
                    </button>
                    <button className="btn btn-primary" onClick={onEdit}>
                        <FaCog />
                        Editar Produto
                    </button>
                </div>
            </div>
        </div>
    );
}
