import { httpService, ApiResponse, PaginatedResponse } from './httpService';

// Tipos para produtos
export interface ExternalProduct {
  id: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  sku?: string;
  status: 'active' | 'inactive' | 'draft';
  images?: string[];
  created_at: string;
  updated_at: string;
  stock?: number;
  weight?: number;
  dimensions?: {
    width: number;
    height: number;
    depth: number;
  };
}

export interface ProductFilters {
  category?: string;
  status?: string;
  search?: string;
  min_price?: number;
  max_price?: number;
  page?: number;
  limit?: number;
  sort_by?: 'name' | 'price' | 'created_at';
  sort_order?: 'asc' | 'desc';
}

// Tipos para clientes
export interface ExternalClient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  document?: string; // CPF/CNPJ
  status: 'active' | 'inactive' | 'blocked';
  address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
  };
  created_at: string;
  updated_at: string;
  total_orders?: number;
  total_spent?: number;
}

export interface ClientFilters {
  status?: string;
  search?: string;
  city?: string;
  state?: string;
  page?: number;
  limit?: number;
  sort_by?: 'name' | 'created_at' | 'total_spent';
  sort_order?: 'asc' | 'desc';
}

// Tipos para pedidos
export interface ExternalOrder {
  id: string;
  client_id: string;
  client_name: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: Array<{
    product_id: string;
    product_name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  shipping_address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zip_code: string;
  };
  created_at: string;
  updated_at: string;
  shipped_at?: string;
  delivered_at?: string;
}

export interface OrderFilters {
  status?: string;
  client_id?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
  sort_by?: 'created_at' | 'total' | 'status';
  sort_order?: 'asc' | 'desc';
}

class ExternalApiService {
  private baseUrl: string = '';

  /**
   * Configura a URL base da API externa
   */
  setBaseUrl(url: string) {
    this.baseUrl = url;
    httpService.setBaseUrl(url);
  }

  // ===== PRODUTOS =====

  /**
   * Busca todos os produtos
   */
  async getProducts(filters?: ProductFilters): Promise<ApiResponse<PaginatedResponse<ExternalProduct>>> {
    return httpService.get<PaginatedResponse<ExternalProduct>>('/products', {
      params: filters as Record<string, string | number | boolean>,
    });
  }

  /**
   * Busca produto por ID
   */
  async getProductById(id: string): Promise<ApiResponse<ExternalProduct>> {
    return httpService.get<ExternalProduct>(`/products/${id}`);
  }

  /**
   * Cria novo produto
   */
  async createProduct(product: Omit<ExternalProduct, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<ExternalProduct>> {
    return httpService.post<ExternalProduct>('/products', product);
  }

  /**
   * Atualiza produto
   */
  async updateProduct(id: string, product: Partial<ExternalProduct>): Promise<ApiResponse<ExternalProduct>> {
    return httpService.put<ExternalProduct>(`/products/${id}`, product);
  }

  /**
   * Deleta produto
   */
  async deleteProduct(id: string): Promise<ApiResponse<void>> {
    return httpService.delete<void>(`/products/${id}`);
  }

  /**
   * Busca categorias de produtos
   */
  async getProductCategories(): Promise<ApiResponse<string[]>> {
    return httpService.get<string[]>('/products/categories');
  }

  // ===== CLIENTES =====

  /**
   * Busca todos os clientes
   */
  async getClients(filters?: ClientFilters): Promise<ApiResponse<PaginatedResponse<ExternalClient>>> {
    return httpService.get<PaginatedResponse<ExternalClient>>('/clients', {
      params: filters as Record<string, string | number | boolean>,
    });
  }

  /**
   * Busca cliente por ID
   */
  async getClientById(id: string): Promise<ApiResponse<ExternalClient>> {
    return httpService.get<ExternalClient>(`/clients/${id}`);
  }

  /**
   * Cria novo cliente
   */
  async createClient(client: Omit<ExternalClient, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<ExternalClient>> {
    return httpService.post<ExternalClient>('/clients', client);
  }

  /**
   * Atualiza cliente
   */
  async updateClient(id: string, client: Partial<ExternalClient>): Promise<ApiResponse<ExternalClient>> {
    return httpService.put<ExternalClient>(`/clients/${id}`, client);
  }

  /**
   * Deleta cliente
   */
  async deleteClient(id: string): Promise<ApiResponse<void>> {
    return httpService.delete<void>(`/clients/${id}`);
  }

  /**
   * Busca clientes por documento (CPF/CNPJ)
   */
  async getClientByDocument(document: string): Promise<ApiResponse<ExternalClient | null>> {
    return httpService.get<ExternalClient | null>(`/clients/document/${document}`);
  }

  // ===== PEDIDOS =====

  /**
   * Busca todos os pedidos
   */
  async getOrders(filters?: OrderFilters): Promise<ApiResponse<PaginatedResponse<ExternalOrder>>> {
    return httpService.get<PaginatedResponse<ExternalOrder>>('/orders', {
      params: filters as Record<string, string | number | boolean>,
    });
  }

  /**
   * Busca pedido por ID
   */
  async getOrderById(id: string): Promise<ApiResponse<ExternalOrder>> {
    return httpService.get<ExternalOrder>(`/orders/${id}`);
  }

  /**
   * Cria novo pedido
   */
  async createOrder(order: Omit<ExternalOrder, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<ExternalOrder>> {
    return httpService.post<ExternalOrder>('/orders', order);
  }

  /**
   * Atualiza status do pedido
   */
  async updateOrderStatus(id: string, status: ExternalOrder['status']): Promise<ApiResponse<ExternalOrder>> {
    return httpService.patch<ExternalOrder>(`/orders/${id}/status`, { status });
  }

  // ===== ESTATÍSTICAS =====

  /**
   * Busca estatísticas gerais
   */
  async getStats(): Promise<ApiResponse<{
    total_products: number;
    total_clients: number;
    total_orders: number;
    total_revenue: number;
    active_products: number;
    active_clients: number;
    pending_orders: number;
  }>> {
    return httpService.get('/stats');
  }

  /**
   * Busca estatísticas de vendas por período
   */
  async getSalesStats(dateFrom: string, dateTo: string): Promise<ApiResponse<{
    period: {
      from: string;
      to: string;
    };
    total_sales: number;
    total_orders: number;
    average_order_value: number;
    top_products: Array<{
      product_id: string;
      product_name: string;
      quantity_sold: number;
      revenue: number;
    }>;
    sales_by_day: Array<{
      date: string;
      sales: number;
      orders: number;
    }>;
  }>> {
    return httpService.get('/stats/sales', {
      params: { date_from: dateFrom, date_to: dateTo },
    });
  }

  // ===== SINCRONIZAÇÃO =====

  /**
   * Sincroniza produtos com sistema externo
   */
  async syncProducts(): Promise<ApiResponse<{
    synced: number;
    errors: number;
    details: Array<{
      product_id: string;
      status: 'success' | 'error';
      message?: string;
    }>;
  }>> {
    return httpService.post('/sync/products');
  }

  /**
   * Sincroniza clientes com sistema externo
   */
  async syncClients(): Promise<ApiResponse<{
    synced: number;
    errors: number;
    details: Array<{
      client_id: string;
      status: 'success' | 'error';
      message?: string;
    }>;
  }>> {
    return httpService.post('/sync/clients');
  }

  /**
   * Sincroniza pedidos com sistema externo
   */
  async syncOrders(): Promise<ApiResponse<{
    synced: number;
    errors: number;
    details: Array<{
      order_id: string;
      status: 'success' | 'error';
      message?: string;
    }>;
  }>> {
    return httpService.post('/sync/orders');
  }

  // ===== WEBHOOKS =====

  /**
   * Configura webhook para notificações
   */
  async setupWebhook(url: string, events: string[]): Promise<ApiResponse<{
    webhook_id: string;
    url: string;
    events: string[];
    secret: string;
  }>> {
    return httpService.post('/webhooks', {
      url,
      events,
    });
  }

  /**
   * Lista webhooks configurados
   */
  async getWebhooks(): Promise<ApiResponse<Array<{
    id: string;
    url: string;
    events: string[];
    status: 'active' | 'inactive';
    created_at: string;
  }>>> {
    return httpService.get('/webhooks');
  }

  /**
   * Remove webhook
   */
  async deleteWebhook(id: string): Promise<ApiResponse<void>> {
    return httpService.delete(`/webhooks/${id}`);
  }
}

// Instância singleton
export const externalApiService = new ExternalApiService();
