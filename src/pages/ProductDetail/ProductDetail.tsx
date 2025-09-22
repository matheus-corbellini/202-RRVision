import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaSearch, FaDownload, FaArrowLeft } from 'react-icons/fa';
import './ProductDetail.css';

interface ProductSpecification {
    material: string;
    color: string;
    maleFemale: 'Male' | 'Female' | 'N/A';
    sealedUnsealed: 'Sealed' | 'Unsealed' | 'N/A';
    numberOfRows: number;
    numberOfPositions: number;
    flammabilityRating: string;
    operatingTemperature: string;
    qtyPer: string;
    packingType: string;
    remarks: string;
}

interface ApplicablePart {
    type: 'Applicable Housing' | 'Applicable Seal' | 'Mating Locker' | 'Mating Terminal' | 'Assembling Parts';
    partNumber: string;
}

interface ProductDetailData {
    partNumber: string;
    productCategory: string;
    familyName: string;
    dimension: string;
    images: string[];
    specifications: ProductSpecification;
    applicableParts: ApplicablePart[];
    drawings: {
        name: string;
        url: string;
    }[];
}

const ProductDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedSeries, setSelectedSeries] = useState('');
    const [selectedMaleFemale, setSelectedMaleFemale] = useState<'Male' | 'Female' | 'N/A'>('Female');
    const [selectedSealedUnsealed, setSelectedSealedUnsealed] = useState<'Sealed' | 'Unsealed' | 'N/A'>('Sealed');
    const [selectedPositions, setSelectedPositions] = useState('');
    const [activeTab, setActiveTab] = useState<'Applicable Housing' | 'Applicable Seal' | 'Mating Locker' | 'Mating Terminal' | 'Assembling Parts'>('Applicable Housing');

    // Dados de exemplo baseados na imagem
    const productData: ProductDetailData = {
        partNumber: 'xtm06-8sd-cover',
        productCategory: 'Accessory',
        familyName: '',
        dimension: '',
        images: [
            '/api/placeholder/300/200',
            '/api/placeholder/300/200',
            '/api/placeholder/300/200'
        ],
        specifications: {
            material: 'pa66+gf15',
            color: 'brown',
            maleFemale: 'Female',
            sealedUnsealed: 'Sealed',
            numberOfRows: 2,
            numberOfPositions: 8,
            flammabilityRating: 'UL 94 V0',
            operatingTemperature: '-40-125c',
            qtyPer: '200pcs',
            packingType: 'plastick bag',
            remarks: 'mating with 8 pins dtm female housing'
        },
        applicableParts: [
            { type: 'Applicable Housing', partNumber: 'XTM06-08SD' },
            { type: 'Applicable Seal', partNumber: 'XTM06-SEAL-01' },
            { type: 'Mating Locker', partNumber: 'XTM06-LOCK-01' },
            { type: 'Mating Terminal', partNumber: 'XTM06-TERM-01' },
            { type: 'Assembling Parts', partNumber: 'XTM06-ASSY-01' }
        ],
        drawings: [
            { name: 'XTM06-8SD-COVER.pdf', url: '/drawings/XTM06-8SD-COVER.pdf' },
            { name: 'XTM06-8SD-COVER-EN.pdf', url: '/drawings/XTM06-8SD-COVER-EN.pdf' }
        ]
    };

    const handleSearch = () => {
        console.log('Searching with filters:', {
            searchTerm,
            selectedCategory,
            selectedSeries,
            selectedMaleFemale,
            selectedSealedUnsealed,
            selectedPositions
        });
    };

    return (
        <div className="product-detail-page">
            {/* Back Button */}
            <div className="back-button-container">
                <button className="back-button" onClick={() => navigate('/app/products')}>
                    <FaArrowLeft />
                    Voltar para Produtos
                </button>
            </div>

            <div className="product-detail-content">
                {/* Sidebar - SPEC SEARCH */}
                <div className="spec-search-sidebar">
                    <div className="spec-search-box">
                        <h3 className="spec-search-title">SPEC SEARCH</h3>

                        {/* Search Bar */}
                        <div className="search-bar">
                            <FaSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                        </div>

                        {/* Products Category */}
                        <div className="filter-group">
                            <label className="filter-label">
                                <input
                                    type="radio"
                                    name="category"
                                    checked={true}
                                    onChange={() => { }}
                                />
                                Products Category
                            </label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="filter-select"
                            >
                                <option value="">Please select Products</option>
                                <option value="connector">Connector</option>
                                <option value="accessory">Accessory</option>
                                <option value="terminal">Terminal</option>
                            </select>
                        </div>

                        {/* Series */}
                        <div className="filter-group">
                            <label className="filter-label">
                                <input
                                    type="radio"
                                    name="series"
                                    checked={true}
                                    onChange={() => { }}
                                />
                                Series
                            </label>
                            <select
                                value={selectedSeries}
                                onChange={(e) => setSelectedSeries(e.target.value)}
                                className="filter-select"
                            >
                                <option value="">Please select Series</option>
                                <option value="xtm">XTM Series</option>
                                <option value="dtm">DTM Series</option>
                            </select>
                        </div>

                        {/* Male/Female */}
                        <div className="filter-group">
                            <label className="filter-label">Male/Female</label>
                            <div className="radio-group">
                                <label className="radio-option">
                                    <input
                                        type="radio"
                                        name="maleFemale"
                                        value="Male"
                                        checked={selectedMaleFemale === 'Male'}
                                        onChange={(e) => setSelectedMaleFemale(e.target.value as 'Male' | 'Female' | 'N/A')}
                                    />
                                    Male
                                </label>
                                <label className="radio-option">
                                    <input
                                        type="radio"
                                        name="maleFemale"
                                        value="Female"
                                        checked={selectedMaleFemale === 'Female'}
                                        onChange={(e) => setSelectedMaleFemale(e.target.value as 'Male' | 'Female' | 'N/A')}
                                    />
                                    Female
                                </label>
                                <label className="radio-option">
                                    <input
                                        type="radio"
                                        name="maleFemale"
                                        value="N/A"
                                        checked={selectedMaleFemale === 'N/A'}
                                        onChange={(e) => setSelectedMaleFemale(e.target.value as 'Male' | 'Female' | 'N/A')}
                                    />
                                    N/A
                                </label>
                            </div>
                        </div>

                        {/* Sealed/Unsealed */}
                        <div className="filter-group">
                            <label className="filter-label">Sealed/Unsealed</label>
                            <div className="radio-group">
                                <label className="radio-option">
                                    <input
                                        type="radio"
                                        name="sealedUnsealed"
                                        value="Sealed"
                                        checked={selectedSealedUnsealed === 'Sealed'}
                                        onChange={(e) => setSelectedSealedUnsealed(e.target.value as 'Sealed' | 'Unsealed' | 'N/A')}
                                    />
                                    Sealed
                                </label>
                                <label className="radio-option">
                                    <input
                                        type="radio"
                                        name="sealedUnsealed"
                                        value="Unsealed"
                                        checked={selectedSealedUnsealed === 'Unsealed'}
                                        onChange={(e) => setSelectedSealedUnsealed(e.target.value as 'Sealed' | 'Unsealed' | 'N/A')}
                                    />
                                    Unsealed
                                </label>
                                <label className="radio-option">
                                    <input
                                        type="radio"
                                        name="sealedUnsealed"
                                        value="N/A"
                                        checked={selectedSealedUnsealed === 'N/A'}
                                        onChange={(e) => setSelectedSealedUnsealed(e.target.value as 'Sealed' | 'Unsealed' | 'N/A')}
                                    />
                                    N/A
                                </label>
                            </div>
                        </div>

                        {/* Number of Positions */}
                        <div className="filter-group">
                            <label className="filter-label">Number of Positions</label>
                            <select
                                value={selectedPositions}
                                onChange={(e) => setSelectedPositions(e.target.value)}
                                className="filter-select"
                            >
                                <option value="">Select Positions</option>
                                <option value="4">4</option>
                                <option value="6">6</option>
                                <option value="8">8</option>
                                <option value="12">12</option>
                            </select>
                        </div>

                        {/* Search Button */}
                        <button className="search-button" onClick={handleSearch}>
                            Search
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="product-main-content">
                    {/* PRODUCT INTRODUCTION */}
                    <div className="product-introduction">
                        <h2 className="section-title">PRODUCT INTRODUCTION</h2>
                        <div className="product-intro-content">
                            <div className="product-images">
                                {productData.images.map((image, index) => (
                                    <img
                                        key={index}
                                        src={image}
                                        alt={`Product view ${index + 1}`}
                                        className="product-image"
                                    />
                                ))}
                            </div>
                            <div className="product-basic-info">
                                <div className="info-item">
                                    <span className="info-label">Part Number:</span>
                                    <span className="info-value">{productData.partNumber}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Product Category:</span>
                                    <span className="info-value">{productData.productCategory}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Family Name/Series:</span>
                                    <span className="info-value">{productData.familyName || '-'}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Dimension:</span>
                                    <span className="info-value">{productData.dimension || '-'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* PRODUCT SPECIFICATION */}
                    <div className="product-specification">
                        <h2 className="section-title">PRODUCT SPECIFICATION</h2>
                        <div className="specification-table">
                            <div className="spec-row">
                                <span className="spec-label">Material:</span>
                                <span className="spec-value">{productData.specifications.material}</span>
                            </div>
                            <div className="spec-row">
                                <span className="spec-label">Color:</span>
                                <span className="spec-value">{productData.specifications.color}</span>
                            </div>
                            <div className="spec-row">
                                <span className="spec-label">Male/Female:</span>
                                <span className="spec-value">{productData.specifications.maleFemale}</span>
                            </div>
                            <div className="spec-row">
                                <span className="spec-label">Sealed/Unsealed:</span>
                                <span className="spec-value">{productData.specifications.sealedUnsealed}</span>
                            </div>
                            <div className="spec-row">
                                <span className="spec-label">Number of Rows:</span>
                                <span className="spec-value">{productData.specifications.numberOfRows}</span>
                            </div>
                            <div className="spec-row">
                                <span className="spec-label">Number of Positions:</span>
                                <span className="spec-value">{productData.specifications.numberOfPositions}</span>
                            </div>
                            <div className="spec-row">
                                <span className="spec-label">Flammability Rating:</span>
                                <span className="spec-value">{productData.specifications.flammabilityRating}</span>
                            </div>
                            <div className="spec-row">
                                <span className="spec-label">Operating Temperature range:</span>
                                <span className="spec-value">{productData.specifications.operatingTemperature}</span>
                            </div>
                            <div className="spec-row">
                                <span className="spec-label">Qty_per:</span>
                                <span className="spec-value">{productData.specifications.qtyPer}</span>
                            </div>
                            <div className="spec-row">
                                <span className="spec-label">Packing_type:</span>
                                <span className="spec-value">{productData.specifications.packingType}</span>
                            </div>
                            <div className="spec-row">
                                <span className="spec-label">Remarks:</span>
                                <span className="spec-value">{productData.specifications.remarks}</span>
                            </div>
                        </div>
                    </div>

                    {/* APPLICABLE PARTS */}
                    <div className="applicable-parts">
                        <h2 className="section-title">APPLICABLE PARTS</h2>
                        <div className="parts-tabs">
                            {productData.applicableParts.map((part) => (
                                <button
                                    key={part.type}
                                    className={`part-tab ${activeTab === part.type ? 'active' : ''}`}
                                    onClick={() => setActiveTab(part.type)}
                                >
                                    {part.type}
                                </button>
                            ))}
                        </div>
                        <div className="parts-content">
                            {productData.applicableParts
                                .filter(part => part.type === activeTab)
                                .map((part) => (
                                    <div key={part.type} className="part-number">
                                        {part.partNumber}
                                    </div>
                                ))}
                        </div>
                    </div>

                    {/* DRAWING */}
                    <div className="drawing-section">
                        <h2 className="section-title">DRAWING</h2>
                        <div className="drawing-links">
                            {productData.drawings.map((drawing, index) => (
                                <a
                                    key={index}
                                    href={drawing.url}
                                    className="drawing-link"
                                    download
                                >
                                    <FaDownload className="download-icon" />
                                    {drawing.name}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default ProductDetail;
