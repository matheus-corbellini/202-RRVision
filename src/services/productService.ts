// Serviço para gerenciamento de produtos - Integrado com Bling
import type { Product } from '../types';
import { blingService } from './blingService';
import { API_CONFIG } from '../config/api';

// Interface para produtos do Bling
interface BlingProduct {
	id: number;
	nome: string;
	codigo?: string;
	preco?: number;
	precoCusto?: number;
	pesoBruto?: number;
	pesoLiquido?: number;
	largura?: number;
	altura?: number;
	profundidade?: number;
	gtin?: string;
	categoria?: string;
	marca?: string;
	modelo?: string;
	descricao?: string;
	situacao?: 'A' | 'I'; // A = Ativo, I = Inativo
	tipo?: 'P' | 'S'; // P = Produto, S = Serviço
	createdAt?: string;
	updatedAt?: string;
}

// Função para converter produto do Bling para formato interno
const convertBlingProductToProduct = (blingProduct: BlingProduct): Product => {
	return {
		id: blingProduct.id.toString(),
		code: blingProduct.codigo || `BLING-${blingProduct.id}`,
		name: blingProduct.nome,
		description: blingProduct.descricao || '',
		category: blingProduct.categoria || 'Sem categoria',
		isActive: blingProduct.situacao === 'A',
		createdAt: blingProduct.createdAt || new Date().toISOString(),
		updatedAt: blingProduct.updatedAt || new Date().toISOString(),
		createdBy: 'bling-api',
		updatedBy: 'bling-api',
		// Campos adicionais do Bling
		price: blingProduct.preco,
		costPrice: blingProduct.precoCusto,
		brand: blingProduct.marca,
		model: blingProduct.modelo,
		weight: blingProduct.pesoBruto,
		dimensions: {
			width: blingProduct.largura,
			height: blingProduct.altura,
			depth: blingProduct.profundidade
		},
		gtin: blingProduct.gtin,
		type: blingProduct.tipo === 'P' ? 'product' : 'service'
	} as Product;
};

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


export const listAllProducts = async (): Promise<Product[]> => {
	try {
		console.log('🔄 Buscando produtos do Bling...');
		
		// Buscar produtos do Bling via proxy do backend
		const result = await blingService.getProducts(1, 200); // Buscar até 200 produtos
		
		if (result.data && Array.isArray(result.data)) {
			console.log(`✅ ${result.data.length} produtos encontrados no Bling`);
			
			// Converter produtos do Bling para formato interno
			const products = result.data.map(convertBlingProductToProduct);
			
			// Ordenar por nome
			products.sort((a, b) => a.name.localeCompare(b.name));
			
			return products;
		} else {
			console.warn('⚠️ Nenhum produto encontrado no Bling');
			return [];
		}
	} catch (error) {
		console.error('❌ Erro ao buscar produtos do Bling:', error);
		
		// Em caso de erro, retornar array vazio ou dados mockados para desenvolvimento
		if (process.env.NODE_ENV === 'development') {
			console.log('🔄 Usando dados mockados para desenvolvimento...');
			return [
				{
					id: "1",
					code: "DEMO001",
					name: "Produto Demo 1",
					description: "Produto de demonstração",
					category: "Demo",
					isActive: true,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
					createdBy: "demo",
					updatedBy: "demo"
				}
			];
		}
		
		throw new Error('Erro ao carregar produtos do Bling. Verifique sua conexão e configuração.');
	}
};

export const getProductById = async (id: string): Promise<Product | null> => {
	try {
		// Buscar produto específico do Bling via backend
		const backendUrl = API_CONFIG.BACKEND_URL;
		const token = localStorage.getItem('bling_access_token');
		
		const response = await fetch(`${backendUrl}/api/products/${id}${token ? `?token=${token}` : ''}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				...(token && { 'Authorization': `Bearer ${token}` }),
			},
		});

		if (!response.ok) {
			throw new Error(`Erro ao buscar produto: ${response.status}`);
		}

		const result = await response.json();
		
		if (result.success && result.data) {
			return convertBlingProductToProduct(result.data);
		}
		
		return null;
	} catch (error) {
		console.error('Erro ao buscar produto:', error);
		return null;
	}
};

export const createProduct = async (productData: CreateProductData): Promise<ProductResponse> => {
	try {
		const backendUrl = API_CONFIG.BACKEND_URL;
		const token = localStorage.getItem('bling_access_token');
		
		// Converter dados para formato do Bling
		const blingProductData = {
			nome: productData.name,
			codigo: productData.code,
			descricao: productData.description,
			categoria: productData.category,
			situacao: productData.isActive ? 'A' : 'I',
			tipo: 'P' // Produto
		};

		const response = await fetch(`${backendUrl}/api/products${token ? `?token=${token}` : ''}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				...(token && { 'Authorization': `Bearer ${token}` }),
			},
			body: JSON.stringify(blingProductData)
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			return {
				success: false,
				error: errorData.message || `Erro ao criar produto: ${response.status}`
			};
		}

		const result = await response.json();
		
		if (result.success && result.data) {
			return {
				success: true,
				data: convertBlingProductToProduct(result.data)
			};
		}

		return {
			success: false,
			error: "Erro ao criar produto no Bling"
		};
	} catch (error) {
		console.error('Erro ao criar produto:', error);
		return {
			success: false,
			error: "Erro ao criar produto. Tente novamente."
		};
	}
};

export const updateProduct = async (id: string, productData: UpdateProductData): Promise<ProductResponse> => {
	try {
		const backendUrl = API_CONFIG.BACKEND_URL;
		const token = localStorage.getItem('bling_access_token');
		
		// Converter dados para formato do Bling
		const blingProductData: any = {};
		if (productData.name) blingProductData.nome = productData.name;
		if (productData.description) blingProductData.descricao = productData.description;
		if (productData.category) blingProductData.categoria = productData.category;
		if (productData.isActive !== undefined) blingProductData.situacao = productData.isActive ? 'A' : 'I';

		const response = await fetch(`${backendUrl}/api/products/${id}${token ? `?token=${token}` : ''}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				...(token && { 'Authorization': `Bearer ${token}` }),
			},
			body: JSON.stringify(blingProductData)
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			return {
				success: false,
				error: errorData.message || `Erro ao atualizar produto: ${response.status}`
			};
		}

		const result = await response.json();
		
		if (result.success && result.data) {
			return {
				success: true,
				data: convertBlingProductToProduct(result.data)
			};
		}

		return {
			success: false,
			error: "Erro ao atualizar produto no Bling"
		};
	} catch (error) {
		console.error('Erro ao atualizar produto:', error);
		return {
			success: false,
			error: "Erro ao atualizar produto. Tente novamente."
		};
	}
};

export const deleteProduct = async (id: string): Promise<ProductResponse> => {
	try {
		const backendUrl = API_CONFIG.BACKEND_URL;
		const token = localStorage.getItem('bling_access_token');

		const response = await fetch(`${backendUrl}/api/products/${id}${token ? `?token=${token}` : ''}`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				...(token && { 'Authorization': `Bearer ${token}` }),
			},
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			return {
				success: false,
				error: errorData.message || `Erro ao deletar produto: ${response.status}`
			};
		}

		const result = await response.json();
		
		if (result.success) {
			return {
				success: true
			};
		}

		return {
			success: false,
			error: "Erro ao deletar produto no Bling"
		};
	} catch (error) {
		console.error('Erro ao deletar produto:', error);
		return {
			success: false,
			error: "Erro ao deletar produto. Tente novamente."
		};
	}
};

export const isCodeAlreadyUsed = async (code: string, excludeId?: string): Promise<boolean> => {
	try {
		// Buscar todos os produtos para verificar se o código já existe
		const products = await listAllProducts();
		return products.some(p => p.code === code && p.id !== excludeId);
	} catch (error) {
		console.error('Erro ao verificar código do produto:', error);
		return false;
	}
};
