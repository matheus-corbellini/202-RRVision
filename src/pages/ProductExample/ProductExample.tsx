import { useState } from 'react';
import ProductCategorySelector from '../../components/ProductCategorySelector/ProductCategorySelector';
import type { ProductCategory, ProductSeries, MaterialType, SealingType } from '../../types/productCategories';

interface SelectedProduct {
  category: ProductCategory;
  series?: ProductSeries;
  material?: MaterialType;
  sealing?: SealingType;
  partNumber?: string;
}

export default function ProductExample() {
  const [selectedProduct, setSelectedProduct] = useState<SelectedProduct | null>(null);

  const handleProductSelect = (product: SelectedProduct) => {
    setSelectedProduct(product);
    console.log('Produto selecionado:', product);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Sistema de Categorias de Produtos</h1>
      
      <div style={{ marginBottom: '30px' }}>
        <h2>Seletor de Produtos</h2>
        <ProductCategorySelector onProductSelect={handleProductSelect} />
      </div>

      {selectedProduct && (
        <div style={{ 
          background: '#f8f9fa', 
          padding: '20px', 
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <h3>Produto Selecionado:</h3>
          <div style={{ display: 'grid', gap: '10px' }}>
            <div><strong>Categoria:</strong> {selectedProduct.category}</div>
            {selectedProduct.series && (
              <div><strong>Série:</strong> {selectedProduct.series}</div>
            )}
            {selectedProduct.material && (
              <div><strong>Material:</strong> {selectedProduct.material}</div>
            )}
            {selectedProduct.sealing && (
              <div><strong>Vedação:</strong> {selectedProduct.sealing}</div>
            )}
            {selectedProduct.partNumber && (
              <div><strong>Número da Peça:</strong> {selectedProduct.partNumber}</div>
            )}
          </div>
        </div>
      )}

      <div style={{ marginTop: '30px' }}>
        <h3>Categorias Disponíveis:</h3>
        <ul style={{ columns: '2', columnGap: '20px' }}>
          <li>Accessory</li>
          <li>Aviation plug</li>
          <li>HVC</li>
          <li>Connector (com séries em mm)</li>
          <li>Fuse and relay box</li>
          <li>Terminal (com séries em mm)</li>
          <li>Rubber Parts (com séries específicas)</li>
          <li>Backshell</li>
          <li>Manifolds</li>
          <li>Wire harness</li>
          <li>PCB connector</li>
        </ul>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3>Séries por Categoria:</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <div>
            <h4>Conectores:</h4>
            <ul style={{ fontSize: '14px' }}>
              <li>0.64mm, 1.0mm, 1.2mm, 1.3mm</li>
              <li>1.5mm, 1.6mm, 1.8mm, 2.0mm</li>
              <li>2.2mm, 2.3mm, 2.5mm, 2.8mm</li>
              <li>3.0mm, 3.5mm, 4.8mm, 6.3mm</li>
              <li>7.8mm, 9.5mm</li>
              <li>Combinações: 1.0+1.5mm, 1.2+2.2mm, etc.</li>
            </ul>
          </div>
          
          <div>
            <h4>Terminais:</h4>
            <ul style={{ fontSize: '14px' }}>
              <li>NA, 0.64mm, 1.0mm, 1.2mm</li>
              <li>1.3mm, 1.5mm, 1.6mm, 1.8mm</li>
              <li>2.0mm, 2.2mm, 2.5mm, 2.8mm</li>
              <li>3.0mm, 3.5mm, 4.8mm, 5.0mm</li>
              <li>5.8mm, 6.3mm, 7.8mm, 9.5mm</li>
            </ul>
          </div>
          
          <div>
            <h4>Rubber Parts:</h4>
            <ul style={{ fontSize: '14px' }}>
              <li>NA, EPDM, Seal, Gasket</li>
              <li>Rubber valve</li>
              <li>Single wire seal</li>
              <li>Single cavity plug</li>
              <li>O-ring</li>
              <li>Multihole wire seal</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
