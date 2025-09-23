import { useState } from 'react';
import { FaSearch, FaCheckCircle } from 'react-icons/fa';
import { SEALING_TYPES, MALE_FEMALE_TYPES, getSeriesForCategory, categoryHasSeries } from '../../constants/productCategories';
import type { ProductCategory, ProductSeries, SealingType, MaleFemaleType } from '../../types/productCategories';
import './SpecSearch.css';

interface SpecSearchProps {
    onSearch?: (searchParams: {
        searchTerm: string;
        category: ProductCategory;
        series?: ProductSeries;
        maleFemale?: MaleFemaleType;
        sealing?: SealingType;
        numberOfPositions?: number;
    }) => void;
}

export default function SpecSearch({ onSearch }: SpecSearchProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory] = useState<ProductCategory>('Connector');
    const [selectedSeries, setSelectedSeries] = useState<ProductSeries | null>(null);
    const [selectedMaleFemale, setSelectedMaleFemale] = useState<MaleFemaleType>('Female');
    const [selectedSealing, setSelectedSealing] = useState<SealingType>('Sealed');
    const [numberOfPositions, setNumberOfPositions] = useState<number | null>(null);

    const [showSeriesDropdown, setShowSeriesDropdown] = useState(false);
    const [showPositionsDropdown, setShowPositionsDropdown] = useState(false);

    const availableSeries = getSeriesForCategory(selectedCategory);
    const hasSeries = categoryHasSeries(selectedCategory);

    const handleSearch = () => {
        if (onSearch) {
            onSearch({
                searchTerm,
                category: selectedCategory,
                series: selectedSeries || undefined,
                maleFemale: selectedMaleFemale,
                sealing: selectedSealing,
                numberOfPositions: numberOfPositions || undefined
            });
        }
    };

    const handleSeriesSelect = (series: ProductSeries) => {
        setSelectedSeries(series);
        setShowSeriesDropdown(false);
    };

    const handlePositionSelect = (positions: number) => {
        setNumberOfPositions(positions);
        setShowPositionsDropdown(false);
    };

    // Gerar opções de posições (1-50)
    const positionOptions = Array.from({ length: 50 }, (_, i) => i + 1);

    return (
        <div className="spec-search">
            <div className="spec-search-header">
                <h2>SPEC SEARCH</h2>
            </div>

            <div className="search-form">
                {/* Search Bar */}
                <div className="form-group">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Products Category */}
                <div className="form-group">
                    <label className="form-label">
                        <span className="radio-indicator">●</span>
                        PRODUCTS CATEGORY
                    </label>
                    <div className="category-display">
                        <input
                            type="text"
                            className="category-input"
                            value={selectedCategory}
                            readOnly
                        />
                    </div>
                </div>

                {/* Series */}
                {hasSeries && availableSeries && (
                    <div className="form-group">
                        <label className="form-label">
                            <span className="radio-indicator">●</span>
                            SERIES
                        </label>
                        <div className="dropdown-container">
                            <div
                                className="dropdown-trigger"
                                onClick={() => setShowSeriesDropdown(!showSeriesDropdown)}
                            >
                                {selectedSeries ? (
                                    <span className="selected-value">{selectedSeries}</span>
                                ) : (
                                    <span className="placeholder">Please select Series</span>
                                )}
                                <span className="dropdown-arrow">▼</span>
                            </div>

                            {showSeriesDropdown && (
                                <div className="dropdown-menu">
                                    {availableSeries.map((series) => (
                                        <div
                                            key={series}
                                            className={`dropdown-item ${selectedSeries === series ? 'selected' : ''}`}
                                            onClick={() => handleSeriesSelect(series)}
                                        >
                                            {selectedSeries === series && <FaCheckCircle className="check-icon" />}
                                            {series}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Male/Female */}
                <div className="form-group">
                    <label className="form-label">
                        <span className="radio-indicator">●</span>
                        MALE/FEMALE
                    </label>
                    <div className="radio-group">
                        {MALE_FEMALE_TYPES.map((option) => (
                            <label key={option.value} className="radio-option">
                                <input
                                    type="radio"
                                    name="maleFemale"
                                    value={option.value}
                                    checked={selectedMaleFemale === option.value}
                                    onChange={(e) => setSelectedMaleFemale(e.target.value as MaleFemaleType)}
                                />
                                <span className="radio-label">{option.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Sealed/Unsealed */}
                <div className="form-group">
                    <label className="form-label">
                        <span className="radio-indicator">●</span>
                        SEALED/UNSEALED
                    </label>
                    <div className="radio-group">
                        {SEALING_TYPES.map((option) => (
                            <label key={option.value} className="radio-option">
                                <input
                                    type="radio"
                                    name="sealing"
                                    value={option.value}
                                    checked={selectedSealing === option.value}
                                    onChange={(e) => setSelectedSealing(e.target.value as SealingType)}
                                />
                                <span className="radio-label">{option.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Number of Positions */}
                <div className="form-group">
                    <label className="form-label">NUMBER OF POSITIONS</label>
                    <div className="dropdown-container">
                        <button
                            className="positions-button"
                            onClick={() => setShowPositionsDropdown(!showPositionsDropdown)}
                        >
                            {numberOfPositions ? `${numberOfPositions} positions` : 'Select Positions'}
                            <span className="dropdown-arrow">▼</span>
                        </button>

                        {showPositionsDropdown && (
                            <div className="dropdown-menu positions-menu">
                                {positionOptions.map((position) => (
                                    <div
                                        key={position}
                                        className={`dropdown-item ${numberOfPositions === position ? 'selected' : ''}`}
                                        onClick={() => handlePositionSelect(position)}
                                    >
                                        {numberOfPositions === position && <FaCheckCircle className="check-icon" />}
                                        {position} position{position !== 1 ? 's' : ''}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Search Button */}
                <button className="search-button" onClick={handleSearch}>
                    <FaSearch className="search-icon" />
                    Search
                </button>
            </div>
        </div>
    );
}
