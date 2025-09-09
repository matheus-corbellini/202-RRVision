// Serviço para gerenciamento de produtos
import type { Product } from '../types';

// Mock data para desenvolvimento
const mockProducts: Product[] = [
	{
		id: "1",
		code: "PROD001",
		name: "Produto A",
		description: "Descrição do Produto A",
		category: "Categoria 1",
		isActive: true,
		createdAt: "2023-01-01T00:00:00Z",
		updatedAt: "2023-01-01T00:00:00Z",
		createdBy: "admin",
		updatedBy: "admin"
	},
	{
		id: "2",
		code: "PROD002",
		name: "Produto B",
		description: "Descrição do Produto B",
		category: "Categoria 2",
		isActive: true,
		createdAt: "2023-01-02T00:00:00Z",
		updatedAt: "2023-01-02T00:00:00Z",
		createdBy: "admin",
		updatedBy: "admin"
	},
	{
		id: "3",
		code: "PROD003",
		name: "Produto C",
		description: "Descrição do Produto C",
		category: "Categoria 1",
		isActive: false,
		createdAt: "2023-01-03T00:00:00Z",
		updatedAt: "2023-01-03T00:00:00Z",
		createdBy: "admin",
		updatedBy: "admin"
	}
];

export interface CreateProductData {
	code: string;
	name: string;
	description: string;
	category: string;
	isActive?: boolean;
}

export interface UpdateProductData {
	name?: string;
	description?: string;
	category?: string;
	isActive?: boolean;
}

export interface ProductResponse {
	success: boolean;
	data?: Product;
	error?: string;
}

export interface ProductsResponse {
	success: boolean;
	data?: Product[];
	error?: string;
}

// Simular delay de API
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const listAllProducts = async (): Promise<Product[]> => {
	await delay(500); // Simular delay de API
	return [...mockProducts];
};

export const getProductById = async (id: string): Promise<Product | null> => {
	await delay(300);
	const product = mockProducts.find(p => p.id === id);
	return product || null;
};

export const createProduct = async (productData: CreateProductData): Promise<ProductResponse> => {
	await delay(800);
	
	// Verificar se código já existe
	const existingProduct = mockProducts.find(p => p.code === productData.code);
	if (existingProduct) {
		return {
			success: false,
			error: "Código do produto já está em uso"
		};
	}

	const newProduct: Product = {
		id: Date.now().toString(),
		code: productData.code,
		name: productData.name,
		description: productData.description,
		category: productData.category,
		isActive: productData.isActive ?? true,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		createdBy: "current-user", // Em produção, pegar do contexto de auth
		updatedBy: "current-user"
	};

	mockProducts.push(newProduct);

	return {
		success: true,
		data: newProduct
	};
};

export const updateProduct = async (id: string, productData: UpdateProductData): Promise<ProductResponse> => {
	await delay(800);
	
	const productIndex = mockProducts.findIndex(p => p.id === id);
	if (productIndex === -1) {
		return {
			success: false,
			error: "Produto não encontrado"
		};
	}

	const updatedProduct: Product = {
		...mockProducts[productIndex],
		...productData,
		updatedAt: new Date().toISOString(),
		updatedBy: "current-user"
	};

	mockProducts[productIndex] = updatedProduct;

	return {
		success: true,
		data: updatedProduct
	};
};

export const deleteProduct = async (id: string): Promise<ProductResponse> => {
	await delay(600);
	
	const productIndex = mockProducts.findIndex(p => p.id === id);
	if (productIndex === -1) {
		return {
			success: false,
			error: "Produto não encontrado"
		};
	}

	mockProducts.splice(productIndex, 1);

	return {
		success: true
	};
};

export const isCodeAlreadyUsed = async (code: string, excludeId?: string): Promise<boolean> => {
	await delay(200);
	return mockProducts.some(p => p.code === code && p.id !== excludeId);
};
