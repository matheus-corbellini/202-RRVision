import { useState, useEffect } from 'react';
import { FaSearch, FaBox, FaCog, FaFolderOpen, FaTag, FaBolt as FaLightning, FaChartBar as FaStats } from 'react-icons/fa';
import { ProductDetailsModal, ProductEditModal } from '../../components/ProductModals';
import './Products.css';

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

interface ProductsProps {
    category?: string;
}

export default function Products({ category }: ProductsProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedSeries, setSelectedSeries] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [loading, setLoading] = useState(true);

    // Estados dos modais
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Aplicar filtro de categoria automaticamente quando a prop category for fornecida
    useEffect(() => {
        if (category) {
            setSelectedCategory(category);
        }
    }, [category]);

    // Dados de demonstração
    useEffect(() => {
        const demoProducts: Product[] = [
            {
                id: '1',
                name: 'Conector Elétrico Premium',
                category: 'Conectores',
                series: 'Premium',
                description: 'Conector elétrico de alta qualidade para aplicações industriais',
                image: '/api/placeholder/200/150',
                status: 'active',
                specifications: {
                    voltage: '220V',
                    current: '16A',
                    material: 'Plástico ABS',
                    dimensions: '25x15x10mm',
                    weight: '15g',
                    temperature: '-40°C a +85°C',
                    certification: 'CE, RoHS'
                },
                additionalInfo: {
                    manufacturer: 'RR Vision',
                    partNumber: 'RR-CON-001',
                    warranty: '2 anos',
                    createdAt: '2024-01-15',
                    updatedAt: '2024-01-20',
                    createdBy: 'Admin'
                }
            },
            {
                id: '2',
                name: 'Terminal de Montagem',
                category: 'Terminais',
                series: 'Standard',
                description: 'Terminal de montagem para conexões elétricas',
                image: '/api/placeholder/200/150',
                status: 'active',
                specifications: {
                    voltage: '110V',
                    current: '10A',
                    material: 'Metal',
                    dimensions: '20x10x5mm'
                }
            },
            {
                id: '3',
                name: 'Plug Industrial',
                category: 'Conectores',
                series: 'Industrial',
                description: 'Plug industrial para ambientes pesados',
                image: '/api/placeholder/200/150',
                status: 'active',
                specifications: {
                    voltage: '380V',
                    current: '32A',
                    material: 'Metal + Plástico',
                    dimensions: '40x25x15mm'
                }
            },
            {
                id: '4',
                name: 'Fusível Automotivo',
                category: 'Proteção',
                series: 'Automotive',
                description: 'Fusível automotivo para proteção elétrica',
                image: '/api/placeholder/200/150',
                status: 'active',
                specifications: {
                    voltage: '12V',
                    current: '15A',
                    material: 'Metal',
                    dimensions: '15x8x3mm'
                }
            },
            {
                id: '5',
                name: 'Cabo de Alta Tensão',
                category: 'Cabos',
                series: 'High Voltage',
                description: 'Cabo de alta tensão para aplicações industriais',
                image: '/api/placeholder/200/150',
                status: 'maintenance',
                specifications: {
                    voltage: '1000V',
                    current: '50A',
                    material: 'Cobre + PVC',
                    dimensions: '1000x10x10mm'
                }
            },
            {
                id: '6',
                name: 'Relé de Controle',
                category: 'Controle',
                series: 'Control',
                description: 'Relé de controle para automação industrial',
                image: '/api/placeholder/200/150',
                status: 'active',
                specifications: {
                    voltage: '24V',
                    current: '5A',
                    material: 'Plástico + Metal',
                    dimensions: '30x20x15mm'
                }
            },
            {
                id: '7',
                name: 'Acessório de Montagem',
                category: 'Acessórios',
                series: 'Accessory',
                description: 'Acessório para montagem de conectores',
                image: '/api/placeholder/200/150',
                status: 'active',
                specifications: {
                    voltage: 'N/A',
                    current: 'N/A',
                    material: 'Plástico',
                    dimensions: '10x5x3mm'
                }
            },
            {
                id: '8',
                name: 'Plug de Aviação',
                category: 'Aviação',
                series: 'Aviation',
                description: 'Plug especializado para aplicações aeronáuticas',
                image: '/api/placeholder/200/150',
                status: 'active',
                specifications: {
                    voltage: '115V',
                    current: '20A',
                    material: 'Metal + Cerâmica',
                    dimensions: '35x20x12mm'
                }
            },
            {
                id: '9',
                name: 'Conector HVC',
                category: 'HVC',
                series: 'High Voltage',
                description: 'Conector de alta voltagem para aplicações especiais',
                image: '/api/placeholder/200/150',
                status: 'active',
                specifications: {
                    voltage: '1500V',
                    current: '100A',
                    material: 'Cerâmica + Metal',
                    dimensions: '50x30x20mm',
                    weight: '120g',
                    temperature: '-55°C a +125°C',
                    certification: 'UL, CSA'
                },
                additionalInfo: {
                    manufacturer: 'RR Vision',
                    partNumber: 'RR-HVC-001',
                    warranty: '3 anos',
                    createdAt: '2024-01-10',
                    updatedAt: '2024-01-18',
                    createdBy: 'Admin'
                }
            },
            {
                id: '10',
                name: 'Caixa de Fusíveis',
                category: 'Proteção',
                series: 'Fuse Box',
                description: 'Caixa de fusíveis e relés para proteção elétrica',
                image: '/api/placeholder/200/150',
                status: 'active',
                specifications: {
                    voltage: '220V',
                    current: '63A',
                    material: 'Plástico ABS',
                    dimensions: '200x150x80mm'
                }
            },
            {
                id: '11',
                name: 'Terminal de Borracha',
                category: 'Borracha',
                series: 'Rubber',
                description: 'Terminal com isolamento de borracha',
                image: '/api/placeholder/200/150',
                status: 'active',
                specifications: {
                    voltage: '110V',
                    current: '16A',
                    material: 'Borracha + Metal',
                    dimensions: '25x12x8mm'
                }
            },
            {
                id: '12',
                name: 'Backshell Protetor',
                category: 'Backshell',
                series: 'Protection',
                description: 'Proteção traseira para conectores',
                image: '/api/placeholder/200/150',
                status: 'active',
                specifications: {
                    voltage: 'N/A',
                    current: 'N/A',
                    material: 'Metal',
                    dimensions: '40x25x15mm'
                }
            }
        ];

        setProducts(demoProducts);
        setFilteredProducts(demoProducts);
        setLoading(false);
    }, []);

    // Filtros
    useEffect(() => {
        let filtered = products;

        if (searchTerm) {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (selectedCategory) {
            filtered = filtered.filter(product => product.category === selectedCategory);
        }

        if (selectedSeries) {
            filtered = filtered.filter(product => product.series === selectedSeries);
        }

        if (selectedStatus) {
            filtered = filtered.filter(product => product.status === selectedStatus);
        }

        setFilteredProducts(filtered);
    }, [searchTerm, selectedCategory, selectedSeries, selectedStatus, products]);

    // Funções para controlar os modais
    const handleViewDetails = (product: Product) => {
        setSelectedProduct(product);
        setIsDetailsModalOpen(true);
    };

    const handleEditProduct = (product: Product) => {
        setSelectedProduct(product);
        setIsEditModalOpen(true);
    };

    const handleProductClick = (product: Product) => {
        // Criar uma nova aba com as especificações técnicas
        const newWindow = window.open('', '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');

        if (newWindow) {
            newWindow.document.write(`
                <!DOCTYPE html>
                <html lang="pt-BR">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>${product.name} - Especificações Técnicas</title>
                    <style>
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                        }
                        
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                            background: #f8fafc;
                            color: #2d3748;
                            line-height: 1.6;
                        }
                        
                        .container {
                            max-width: 1000px;
                            margin: 0 auto;
                            padding: 20px;
                        }
                        
                        .header {
                            background: white;
                            border-radius: 12px;
                            padding: 30px;
                            margin-bottom: 20px;
                            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                            border-left: 4px solid #4299e1;
                        }
                        
                        .product-title {
                            font-size: 2rem;
                            font-weight: 700;
                            color: #1a202c;
                            margin-bottom: 10px;
                        }
                        
                        .product-category {
                            display: inline-block;
                            background: #4299e1;
                            color: white;
                            padding: 6px 12px;
                            border-radius: 20px;
                            font-size: 0.875rem;
                            font-weight: 600;
                            text-transform: uppercase;
                            letter-spacing: 0.5px;
                            margin-bottom: 15px;
                        }
                        
                        .product-description {
                            font-size: 1.1rem;
                            color: #4a5568;
                            margin-bottom: 20px;
                        }
                        
                        .status-badge {
                            display: inline-block;
                            padding: 8px 16px;
                            border-radius: 20px;
                            font-size: 0.875rem;
                            font-weight: 600;
                            text-transform: uppercase;
                            letter-spacing: 0.5px;
                        }
                        
                        .status-active {
                            background: #c6f6d5;
                            color: #22543d;
                        }
                        
                        .status-inactive {
                            background: #fed7d7;
                            color: #742a2a;
                        }
                        
                        .status-maintenance {
                            background: #fef5e7;
                            color: #7b341e;
                        }
                        
                        .specs-section {
                            background: white;
                            border-radius: 12px;
                            padding: 30px;
                            margin-bottom: 20px;
                            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                        }
                        
                        .section-title {
                            font-size: 1.5rem;
                            font-weight: 600;
                            color: #2d3748;
                            margin-bottom: 20px;
                            padding-bottom: 10px;
                            border-bottom: 2px solid #e2e8f0;
                        }
                        
                        .specs-grid {
                            display: grid;
                            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                            gap: 20px;
                        }
                        
                        .spec-item {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            padding: 15px;
                            background: #f8fafc;
                            border-radius: 8px;
                            border: 1px solid #e2e8f0;
                        }
                        
                        .spec-label {
                            font-weight: 600;
                            color: #4a5568;
                            text-transform: uppercase;
                            font-size: 0.875rem;
                            letter-spacing: 0.5px;
                        }
                        
                        .spec-value {
                            font-weight: 600;
                            color: #2d3748;
                            font-size: 1rem;
                        }
                        
                        .additional-info {
                            background: white;
                            border-radius: 12px;
                            padding: 30px;
                            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                        }
                        
                        .info-grid {
                            display: grid;
                            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                            gap: 15px;
                        }
                        
                        .info-item {
                            display: flex;
                            justify-content: space-between;
                            padding: 10px 0;
                            border-bottom: 1px solid #f1f5f9;
                        }
                        
                        .info-item:last-child {
                            border-bottom: none;
                        }
                        
                        .info-label {
                            font-weight: 500;
                            color: #4a5568;
                        }
                        
                        .info-value {
                            font-weight: 600;
                            color: #2d3748;
                        }
                        
                        .footer {
                            text-align: center;
                            margin-top: 30px;
                            padding: 20px;
                            color: #718096;
                            font-size: 0.875rem;
                        }
                        
                        @media (max-width: 768px) {
                            .container {
                                padding: 10px;
                            }
                            
                            .specs-grid {
                                grid-template-columns: 1fr;
                            }
                            
                            .info-grid {
                                grid-template-columns: 1fr;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1 class="product-title">${product.name}</h1>
                            <div class="product-category">${product.category}</div>
                            <p class="product-description">${product.description}</p>
                            <div class="status-badge status-${product.status}">
                                ${product.status === 'active' ? 'Ativo' : product.status === 'inactive' ? 'Inativo' : 'Em Manutenção'}
                            </div>
                        </div>
                        
                        <div class="specs-section">
                            <h2 class="section-title">Especificações Técnicas</h2>
                            <div class="specs-grid">
                                ${product.specifications.voltage ? `
                                    <div class="spec-item">
                                        <span class="spec-label">Voltagem</span>
                                        <span class="spec-value">${product.specifications.voltage}</span>
                                    </div>
                                ` : ''}
                                ${product.specifications.current ? `
                                    <div class="spec-item">
                                        <span class="spec-label">Corrente</span>
                                        <span class="spec-value">${product.specifications.current}</span>
                                    </div>
                                ` : ''}
                                ${product.specifications.material ? `
                                    <div class="spec-item">
                                        <span class="spec-label">Material</span>
                                        <span class="spec-value">${product.specifications.material}</span>
                                    </div>
                                ` : ''}
                                ${product.specifications.dimensions ? `
                                    <div class="spec-item">
                                        <span class="spec-label">Dimensões</span>
                                        <span class="spec-value">${product.specifications.dimensions}</span>
                                    </div>
                                ` : ''}
                                ${product.specifications.weight ? `
                                    <div class="spec-item">
                                        <span class="spec-label">Peso</span>
                                        <span class="spec-value">${product.specifications.weight}</span>
                                    </div>
                                ` : ''}
                                ${product.specifications.temperature ? `
                                    <div class="spec-item">
                                        <span class="spec-label">Temperatura</span>
                                        <span class="spec-value">${product.specifications.temperature}</span>
                                    </div>
                                ` : ''}
                                ${product.specifications.certification ? `
                                    <div class="spec-item">
                                        <span class="spec-label">Certificação</span>
                                        <span class="spec-value">${product.specifications.certification}</span>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                        
                        ${product.additionalInfo ? `
                            <div class="additional-info">
                                <h2 class="section-title">Informações Adicionais</h2>
                                <div class="info-grid">
                                    ${product.additionalInfo.manufacturer ? `
                                        <div class="info-item">
                                            <span class="info-label">Fabricante:</span>
                                            <span class="info-value">${product.additionalInfo.manufacturer}</span>
                                        </div>
                                    ` : ''}
                                    ${product.additionalInfo.partNumber ? `
                                        <div class="info-item">
                                            <span class="info-label">Número da Peça:</span>
                                            <span class="info-value">${product.additionalInfo.partNumber}</span>
                                        </div>
                                    ` : ''}
                                    ${product.additionalInfo.warranty ? `
                                        <div class="info-item">
                                            <span class="info-label">Garantia:</span>
                                            <span class="info-value">${product.additionalInfo.warranty}</span>
                                        </div>
                                    ` : ''}
                                    ${product.additionalInfo.createdAt ? `
                                        <div class="info-item">
                                            <span class="info-label">Criado em:</span>
                                            <span class="info-value">${product.additionalInfo.createdAt}</span>
                                        </div>
                                    ` : ''}
                                    ${product.additionalInfo.updatedAt ? `
                                        <div class="info-item">
                                            <span class="info-label">Atualizado em:</span>
                                            <span class="info-value">${product.additionalInfo.updatedAt}</span>
                                        </div>
                                    ` : ''}
                                    ${product.additionalInfo.createdBy ? `
                                        <div class="info-item">
                                            <span class="info-label">Criado por:</span>
                                            <span class="info-value">${product.additionalInfo.createdBy}</span>
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        ` : ''}
                        
                        <div class="footer">
                            <p>Especificações técnicas geradas automaticamente - RR Vision Brazil</p>
                            <p>Data: ${new Date().toLocaleDateString('pt-BR')}</p>
                        </div>
                    </div>
                </body>
                </html>
            `);
            newWindow.document.close();
        }
    };

    const handleCloseModals = () => {
        setIsDetailsModalOpen(false);
        setIsEditModalOpen(false);
        setSelectedProduct(null);
    };

    const handleSaveProduct = (updatedProduct: Product) => {
        setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
        setFilteredProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    };

    const handleEditFromDetails = () => {
        setIsDetailsModalOpen(false);
        setIsEditModalOpen(true);
    };

    const categories = [...new Set(products.map(p => p.category))];
    const series = [...new Set(products.map(p => p.series))];

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
            case 'maintenance': return 'Manutenção';
            default: return 'Desconhecido';
        }
    };

    if (loading) {
        return (
            <div className="products-page">
                <div className="products-header">
                    <h1>Produtos</h1>
                    <p>Carregando produtos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="products-page">
            <div className="products-header">
                <h1><FaBox /> {category ? `Produtos - ${category}` : 'Gestão de Produtos'}</h1>
                <p>{category ? `Visualize produtos da categoria ${category}` : 'Visualize e gerencie todos os produtos do sistema'}</p>
            </div>

            <div className="products-content">
                {/* Sidebar de Filtros */}
                <div className="products-sidebar">
                    <div className="sidebar-section">
                        <h3><FaSearch /> Busca</h3>
                        <div className="search-box">
                            <FaSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="Buscar produtos..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="sidebar-section">
                        <h3><FaFolderOpen /> Categorias</h3>
                        <div className="category-dropdown">
                            <div className="category-trigger">
                                <span>{selectedCategory || "Todas as categorias"}</span>
                                <span className="dropdown-arrow">▼</span>
                            </div>
                            <div className="category-menu">
                                <div
                                    className="category-item"
                                    onClick={() => setSelectedCategory('')}
                                >
                                    Todas as categorias
                                </div>
                                {categories.map(category => (
                                    <div
                                        key={category}
                                        className="category-item"
                                        onClick={() => setSelectedCategory(category)}
                                    >
                                        {category}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="sidebar-section">
                        <h3><FaTag /> Séries</h3>
                        <div className="series-dropdown">
                            <div className="series-trigger">
                                <span>{selectedSeries || "Todas as séries"}</span>
                                <span className="dropdown-arrow">▼</span>
                            </div>
                            <div className="series-menu">
                                <div
                                    className="series-item"
                                    onClick={() => setSelectedSeries('')}
                                >
                                    Todas as séries
                                </div>
                                {series.map(serie => (
                                    <div
                                        key={serie}
                                        className="series-item"
                                        onClick={() => setSelectedSeries(serie)}
                                    >
                                        {serie}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="sidebar-section">
                        <h3><FaLightning /> Status</h3>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                        >
                            <option value="">Todos os status</option>
                            <option value="active">Ativo</option>
                            <option value="inactive">Inativo</option>
                            <option value="maintenance">Manutenção</option>
                        </select>
                    </div>

                    <div className="sidebar-section">
                        <h3><FaStats /> Estatísticas</h3>
                        <div className="stats">
                            <div className="stat-item">
                                <span className="stat-label">Total:</span>
                                <span className="stat-value">{products.length}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Ativos:</span>
                                <span className="stat-value">{products.filter(p => p.status === 'active').length}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Manutenção:</span>
                                <span className="stat-value">{products.filter(p => p.status === 'maintenance').length}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Área Principal de Produtos */}
                <div className="products-main">
                    <div className="products-grid">
                        {filteredProducts.map(product => (
                            <div
                                key={product.id}
                                className="product-card"
                                onClick={() => handleProductClick(product)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="product-image">
                                    <img src={product.image} alt={product.name} />
                                    <div
                                        className="product-status"
                                        style={{ backgroundColor: getStatusColor(product.status) }}
                                    >
                                        {getStatusText(product.status)}
                                    </div>
                                </div>

                                <div className="product-info">
                                    <h3>{product.name}</h3>
                                    <div className="product-category-section">
                                        <span className="category-tag">{product.category}</span>
                                        <span className="series-tag">- {product.series}</span>
                                    </div>
                                    <p className="product-description">{product.description}</p>

                                    <div className="product-specs">
                                        {product.specifications.voltage && (
                                            <div className="spec-item">
                                                <span className="spec-label">Voltagem:</span>
                                                <span className="spec-value">{product.specifications.voltage}</span>
                                            </div>
                                        )}
                                        {product.specifications.current && (
                                            <div className="spec-item">
                                                <span className="spec-label">Corrente:</span>
                                                <span className="spec-value">{product.specifications.current}</span>
                                            </div>
                                        )}
                                        {product.specifications.material && (
                                            <div className="spec-item">
                                                <span className="spec-label">Material:</span>
                                                <span className="spec-value">{product.specifications.material}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="product-actions">
                                    <button
                                        className="btn btn-primary"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleViewDetails(product);
                                        }}
                                    >
                                        <FaBox />
                                        Ver Detalhes
                                    </button>
                                    <button
                                        className="btn btn-outline"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditProduct(product);
                                        }}
                                    >
                                        <FaCog />
                                        Editar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredProducts.length === 0 && (
                        <div className="no-products">
                            <FaBox className="no-products-icon" />
                            <h3>Nenhum produto encontrado</h3>
                            <p>Tente ajustar os filtros de busca</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modais */}
            <ProductDetailsModal
                product={selectedProduct}
                isOpen={isDetailsModalOpen}
                onClose={handleCloseModals}
                onEdit={handleEditFromDetails}
            />

            <ProductEditModal
                product={selectedProduct}
                isOpen={isEditModalOpen}
                onClose={handleCloseModals}
                onSave={handleSaveProduct}
            />
        </div>
    );
}
