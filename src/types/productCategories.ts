// Tipos para categorias e séries de produtos

export type ProductCategory =
    | "Accessory"
    | "Aviation plug"
    | "HVC"
    | "Connector"
    | "Fuse and relay box"
    | "Terminal"
    | "Rubber Parts"
    | "Backshell"
    | "Manifolds"
    | "Wire harness"
    | "PCB connector";

// Séries para Conectores
export type ConnectorSeries =
    | "0.64mm"
    | "1.0mm"
    | "1.0+1.5mm"
    | "1.2mm"
    | "1.2+2.2mm"
    | "1.3mm"
    | "1.5mm"
    | "1.5+2.5mm"
    | "1.5+4.8mm"
    | "1.6mm"
    | "1.6+2.8mm"
    | "1.8mm"
    | "2.0mm"
    | "2.2mm"
    | "2.3mm"
    | "2.5mm"
    | "2.8mm"
    | "3.0mm"
    | "3.5mm"
    | "4.8mm"
    | "6.3mm"
    | "7.8mm"
    | "9.5mm";

// Séries para Terminais
export type TerminalSeries =
    | "NA"
    | "0.64mm"
    | "1.0mm"
    | "1.2mm"
    | "1.3mm"
    | "1.5mm"
    | "1.6mm"
    | "1.8mm"
    | "2.0mm"
    | "2.2mm"
    | "2.5mm"
    | "2.8mm"
    | "3.0mm"
    | "3.5mm"
    | "4.8mm"
    | "5.0mm"
    | "5.8mm"
    | "6.3mm"
    | "7.8mm"
    | "9.5mm";

// Séries para Rubber Parts
export type RubberPartsSeries =
    | "NA"
    | "EPDM"
    | "Seal"
    | "Gasket"
    | "Rubber valve"
    | "Single wire seal"
    | "Single cavity plug"
    | "O-ring"
    | "Multihole wire seal";

// Tipo união para todas as séries
export type ProductSeries = ConnectorSeriesExtended | TerminalSeries | RubberPartsSeries;

export type MaterialType =
    | "pa66"
    | "pa6"
    | "pbt"
    | "abs"
    | "pc"
    | "peek"
    | "other";

export type SealingType =
    | "Sealed"
    | "Unsealed"
    | "N/A";

export type MaleFemaleType =
    | "Male"
    | "Female"
    | "N/A";

export type ConnectorSeriesExtended =
    | "XTM Series"
    | "DTM Series"
    | "0.64mm"
    | "1.0mm"
    | "1.0+1.5mm"
    | "1.2mm"
    | "1.2+2.2mm"
    | "1.3mm"
    | "1.5mm"
    | "1.5+2.5mm"
    | "1.5+4.8mm"
    | "1.6mm"
    | "1.6+2.8mm"
    | "1.8mm"
    | "2.0mm"
    | "2.2mm"
    | "2.3mm"
    | "2.5mm"
    | "2.8mm"
    | "3.0mm"
    | "3.5mm"
    | "4.8mm"
    | "6.3mm"
    | "7.8mm"
    | "9.5mm";

export interface ProductCategoryInfo {
    id: ProductCategory;
    name: string;
    description?: string;
    hasSeries?: boolean;
    series?: ProductSeries[];
}

export interface ProductItem {
    id: string;
    name: string;
    category: ProductCategory;
    series?: ProductSeries;
    material?: MaterialType;
    sealing?: SealingType;
    maleFemale?: MaleFemaleType;
    numberOfPositions?: number;
    partNumber?: string;
    description?: string;
    specifications?: {
        voltage?: string;
        current?: string;
        temperature?: string;
        certification?: string;
    };
    additionalInfo?: {
        manufacturer?: string;
        warranty?: string;
        createdAt?: string;
        updatedAt?: string;
        createdBy?: string;
    };
}

export interface ProductFormData {
    name: string;
    category: ProductCategory;
    series?: ProductSeries;
    material?: MaterialType;
    sealing?: SealingType;
    partNumber?: string;
    description?: string;
    specifications?: {
        voltage?: string;
        current?: string;
        temperature?: string;
        certification?: string;
    };
}
