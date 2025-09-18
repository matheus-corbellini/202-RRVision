import { useState, useEffect } from 'react';
import { FaSearch, FaBox, FaCog, FaFolderOpen, FaTag, FaBolt as FaLightning, FaChartBar as FaStats } from 'react-icons/fa';
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
    };
}

export default function Products() {
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedSeries, setSelectedSeries] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [loading, setLoading] = useState(true);

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
                    dimensions: '25x15x10mm'
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
                    dimensions: '50x30x20mm'
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
                <h1><FaBox /> Gestão de Produtos</h1>
                <p>Visualize e gerencie todos os produtos do sistema</p>
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
                            <div key={product.id} className="product-card">
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
                                    <button className="btn btn-primary">
                                        <FaBox />
                                        Ver Detalhes
                                    </button>
                                    <button className="btn btn-outline">
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
        </div>
    );
}
