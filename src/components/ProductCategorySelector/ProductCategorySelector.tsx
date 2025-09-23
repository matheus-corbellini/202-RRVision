import { useState } from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import { PRODUCT_CATEGORIES, MATERIAL_TYPES, SEALING_TYPES, getSeriesForCategory, categoryHasSeries } from '../../constants/productCategories';
import type { ProductCategory, ProductSeries, MaterialType, SealingType } from '../../types/productCategories';
import './ProductCategorySelector.css';

interface ProductCategorySelectorProps {
  onProductSelect?: (product: {
    category: ProductCategory;
    series?: ProductSeries;
    material?: MaterialType;
    sealing?: SealingType;
    partNumber?: string;
  }) => void;
}

export default function ProductCategorySelector({ onProductSelect }: ProductCategorySelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);
  const [selectedSeries, setSelectedSeries] = useState<ProductSeries | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialType | null>(null);
  const [selectedSealing, setSelectedSealing] = useState<SealingType | null>(null);
  const [partNumber, setPartNumber] = useState<string>('');
  const [showSeriesDropdown, setShowSeriesDropdown] = useState(false);
  const [showMaterialDropdown, setShowMaterialDropdown] = useState(false);
  const [showSealingDropdown, setShowSealingDropdown] = useState(false);

  const handleCategorySelect = (category: ProductCategory) => {
    setSelectedCategory(category);
    setSelectedSeries(null); // Reset series when category changes
    setShowSeriesDropdown(false);
    
    if (onProductSelect) {
      onProductSelect({
        category,
        series: selectedSeries || undefined,
        material: selectedMaterial || undefined,
        sealing: selectedSealing || undefined,
        partNumber: partNumber || undefined
      });
    }
  };

  const handleSeriesSelect = (series: ProductSeries) => {
    setSelectedSeries(series);
    setShowSeriesDropdown(false);
    
    if (onProductSelect && selectedCategory) {
      onProductSelect({
        category: selectedCategory,
        series,
        material: selectedMaterial || undefined,
        sealing: selectedSealing || undefined,
        partNumber: partNumber || undefined
      });
    }
  };

  const handleMaterialSelect = (material: MaterialType) => {
    setSelectedMaterial(material);
    setShowMaterialDropdown(false);
    
    if (onProductSelect && selectedCategory) {
      onProductSelect({
        category: selectedCategory,
        series: selectedSeries || undefined,
        material,
        sealing: selectedSealing || undefined,
        partNumber: partNumber || undefined
      });
    }
  };

  const handleSealingSelect = (sealing: SealingType) => {
    setSelectedSealing(sealing);
    setShowSealingDropdown(false);
    
    if (onProductSelect && selectedCategory) {
      onProductSelect({
        category: selectedCategory,
        series: selectedSeries || undefined,
        material: selectedMaterial || undefined,
        sealing,
        partNumber: partNumber || undefined
      });
    }
  };

  const availableSeries = selectedCategory ? getSeriesForCategory(selectedCategory) : null;
  const hasSeries = selectedCategory ? categoryHasSeries(selectedCategory) : false;

  return (
    <div className="product-category-selector">
      <div className="selector-section">
        <label className="selector-label">
          <span className="required-indicator">→</span>
          Products Category
        </label>
        <div className="dropdown-container">
          <div 
            className="dropdown-trigger"
            onClick={() => setShowSeriesDropdown(false)}
          >
            {selectedCategory ? (
              <span className="selected-value">{selectedCategory}</span>
            ) : (
              <span className="placeholder">Please select Products Category</span>
            )}
            <span className="dropdown-arrow">▼</span>
          </div>
          
          <div className="dropdown-menu">
            {PRODUCT_CATEGORIES.map((category) => (
              <div
                key={category.id}
                className={`dropdown-item ${selectedCategory === category.id ? 'selected' : ''}`}
                onClick={() => handleCategorySelect(category.id)}
              >
                {selectedCategory === category.id && <FaCheckCircle className="check-icon" />}
                {category.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {hasSeries && availableSeries && (
        <div className="selector-section">
          <label className="selector-label">Series</label>
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

      <div className="selector-section">
        <label className="selector-label">Material</label>
        <div className="dropdown-container">
          <div 
            className="dropdown-trigger"
            onClick={() => setShowMaterialDropdown(!showMaterialDropdown)}
          >
            {selectedMaterial ? (
              <span className="selected-value">{MATERIAL_TYPES.find(m => m.value === selectedMaterial)?.label}</span>
            ) : (
              <span className="placeholder">Please select Material</span>
            )}
            <span className="dropdown-arrow">▼</span>
          </div>
          
          {showMaterialDropdown && (
            <div className="dropdown-menu">
              {MATERIAL_TYPES.map((material) => (
                <div
                  key={material.value}
                  className={`dropdown-item ${selectedMaterial === material.value ? 'selected' : ''}`}
                  onClick={() => handleMaterialSelect(material.value)}
                >
                  {selectedMaterial === material.value && <FaCheckCircle className="check-icon" />}
                  {material.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="selector-section">
        <label className="selector-label">Sealing</label>
        <div className="dropdown-container">
          <div 
            className="dropdown-trigger"
            onClick={() => setShowSealingDropdown(!showSealingDropdown)}
          >
            {selectedSealing ? (
              <span className="selected-value">{SEALING_TYPES.find(s => s.value === selectedSealing)?.label}</span>
            ) : (
              <span className="placeholder">Please select Sealing</span>
            )}
            <span className="dropdown-arrow">▼</span>
          </div>
          
          {showSealingDropdown && (
            <div className="dropdown-menu">
              {SEALING_TYPES.map((sealing) => (
                <div
                  key={sealing.value}
                  className={`dropdown-item ${selectedSealing === sealing.value ? 'selected' : ''}`}
                  onClick={() => handleSealingSelect(sealing.value)}
                >
                  {selectedSealing === sealing.value && <FaCheckCircle className="check-icon" />}
                  {sealing.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="selector-section">
        <label className="selector-label">Part Number</label>
        <input
          type="text"
          className="part-number-input"
          placeholder="Enter part number"
          value={partNumber}
          onChange={(e) => {
            setPartNumber(e.target.value);
            if (onProductSelect && selectedCategory) {
              onProductSelect({
                category: selectedCategory,
                series: selectedSeries || undefined,
                material: selectedMaterial || undefined,
                sealing: selectedSealing || undefined,
                partNumber: e.target.value || undefined
              });
            }
          }}
        />
      </div>
    </div>
  );
}
