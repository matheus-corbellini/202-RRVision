// Constantes para categorias e séries de produtos
import type { ProductCategory, ProductSeries, ProductCategoryInfo } from '../types/productCategories';

export const PRODUCT_CATEGORIES: ProductCategoryInfo[] = [
    {
        id: "Accessory",
        name: "Accessory",
        description: "Acessórios para conectores e sistemas",
        hasSeries: false
    },
    {
        id: "Aviation plug",
        name: "Aviation plug",
        description: "Conectores para aplicações aeronáuticas",
        hasSeries: false
    },
    {
        id: "HVC",
        name: "HVC",
        description: "Conectores de alta voltagem",
        hasSeries: false
    },
    {
        id: "Connector",
        name: "Connector",
        description: "Conectores padrão",
        hasSeries: true,
        series: [
            "XTM Series",
            "DTM Series",
            "0.64mm",
            "1.0mm",
            "1.0+1.5mm",
            "1.2mm",
            "1.2+2.2mm",
            "1.3mm",
            "1.5mm",
            "1.5+2.5mm",
            "1.5+4.8mm",
            "1.6mm",
            "1.6+2.8mm",
            "1.8mm",
            "2.0mm",
            "2.2mm",
            "2.3mm",
            "2.5mm",
            "2.8mm",
            "3.0mm",
            "3.5mm",
            "4.8mm",
            "6.3mm",
            "7.8mm",
            "9.5mm"
        ]
    },
    {
        id: "Fuse and relay box",
        name: "Fuse and relay box",
        description: "Caixas de fusíveis e relés",
        hasSeries: false
    },
    {
        id: "Terminal",
        name: "Terminal",
        description: "Terminais elétricos",
        hasSeries: true,
        series: [
            "NA",
            "0.64mm",
            "1.0mm",
            "1.2mm",
            "1.3mm",
            "1.5mm",
            "1.6mm",
            "1.8mm",
            "2.0mm",
            "2.2mm",
            "2.5mm",
            "2.8mm",
            "3.0mm",
            "3.5mm",
            "4.8mm",
            "5.0mm",
            "5.8mm",
            "6.3mm",
            "7.8mm",
            "9.5mm"
        ]
    },
    {
        id: "Rubber Parts",
        name: "Rubber Parts",
        description: "Peças de borracha",
        hasSeries: true,
        series: [
            "NA",
            "EPDM",
            "Seal",
            "Gasket",
            "Rubber valve",
            "Single wire seal",
            "Single cavity plug",
            "O-ring",
            "Multihole wire seal"
        ]
    },
    {
        id: "Backshell",
        name: "Backshell",
        description: "Conectores traseiros",
        hasSeries: false
    },
    {
        id: "Manifolds",
        name: "Manifolds",
        description: "Manifolds e distribuidores",
        hasSeries: false
    },
    {
        id: "Wire harness",
        name: "Wire harness",
        description: "Harnesses de fios",
        hasSeries: false
    },
    {
        id: "PCB connector",
        name: "PCB connector",
        description: "Conectores para PCB",
        hasSeries: false
    }
];

export const MATERIAL_TYPES = [
    { value: "pa66", label: "PA66" },
    { value: "pa6", label: "PA6" },
    { value: "pbt", label: "PBT" },
    { value: "abs", label: "ABS" },
    { value: "pc", label: "PC" },
    { value: "peek", label: "PEEK" },
    { value: "other", label: "Other" }
] as const;

export const SEALING_TYPES = [
    { value: "Sealed", label: "Sealed" },
    { value: "Unsealed", label: "Unsealed" },
    { value: "N/A", label: "N/A" }
] as const;

export const MALE_FEMALE_TYPES = [
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
    { value: "N/A", label: "N/A" }
] as const;

// Função para obter séries de uma categoria específica
export const getSeriesForCategory = (category: ProductCategory): ProductSeries[] | null => {
    const categoryInfo = PRODUCT_CATEGORIES.find(cat => cat.id === category);
    return categoryInfo?.series || null;
};

// Função para verificar se uma categoria tem séries
export const categoryHasSeries = (category: ProductCategory): boolean => {
    const categoryInfo = PRODUCT_CATEGORIES.find(cat => cat.id === category);
    return categoryInfo?.hasSeries || false;
};
