// Serviço para mapear dados do Bling para tipos internos do sistema
import type { Order } from '../types/dashboard';
import type { BlingOrder } from '../types/blingOrders';
import type { Priority } from '../types/base';

export interface BlingOrderData {
    id: string;
    numero: string;
    data: string;
    dataSaida?: string;
    cliente: {
        nome: string;
        cpf_cnpj?: string;
        email?: string;
        telefone?: string;
    };
    itens: Array<{
        codigo: string;
        descricao: string;
        quantidade: number;
        valor: number;
    }>;
    observacoes?: string;
    situacao: string;
    total: number;
}

export class BlingDataMapper {
    /**
     * Mapeia dados de pedidos do Bling para o formato interno do sistema
     */
    static mapBlingOrderToOrder(blingOrder: BlingOrderData): Order {
        // Mapear situação do Bling para status interno
        const statusMapping: Record<string, Order['status']> = {
            'em_aberto': 'pending',
            'em_producao': 'in_progress',
            'aguardando_producao': 'pending',
            'concluido': 'completed',
            'cancelado': 'cancelled',
        };

        // Determinar prioridade baseada na situação e valor
        const priority = this.determinePriority(blingOrder);

        // Calcular data de vencimento (se não especificada, usar 7 dias após a data do pedido)
        const dueDate = blingOrder.dataSaida || this.addDays(blingOrder.data, 7);

        return {
            id: blingOrder.id,
            orderNumber: blingOrder.numero,
            customer: blingOrder.cliente.nome,
            product: this.getMainProductDescription(blingOrder.itens),
            quantity: this.getTotalQuantity(blingOrder.itens),
            status: statusMapping[blingOrder.situacao] || 'pending',
            priority,
            createdAt: blingOrder.data,
            dueDate,
            completedAt: blingOrder.situacao === 'concluido' ? blingOrder.dataSaida : undefined,
        };
    }

    /**
     * Determina a prioridade baseada na situação e características do pedido
     */
    private static determinePriority(blingOrder: BlingOrderData): Priority {
        // Pedidos com valor alto têm prioridade alta
        if (blingOrder.total > 10000) {
            return 'urgent';
        }

        // Pedidos em produção têm prioridade alta
        if (blingOrder.situacao === 'em_producao') {
            return 'high';
        }

        // Pedidos com muitos itens têm prioridade média
        if (blingOrder.itens.length > 5) {
            return 'medium';
        }

        // Pedidos com observações especiais podem ter prioridade alta
        if (blingOrder.observacoes?.toLowerCase().includes('urgente') ||
            blingOrder.observacoes?.toLowerCase().includes('prioridade')) {
            return 'urgent';
        }

        return 'low';
    }

    /**
     * Obtém a descrição do produto principal (primeiro item)
     */
    private static getMainProductDescription(items: BlingOrderData['itens']): string {
        if (items.length === 0) return 'Sem produtos';

        const mainItem = items[0];
        return `${mainItem.descricao} (${mainItem.codigo})`;
    }

    /**
     * Calcula a quantidade total de itens
     */
    private static getTotalQuantity(items: BlingOrderData['itens']): number {
        return items.reduce((total, item) => total + item.quantidade, 0);
    }

    /**
     * Adiciona dias a uma data
     */
    private static addDays(dateString: string, days: number): string {
        const date = new Date(dateString);
        date.setDate(date.getDate() + days);
        return date.toISOString().split('T')[0];
    }

    /**
     * Mapeia múltiplos pedidos do Bling
     */
    static mapBlingOrdersToOrders(blingOrders: BlingOrderData[]): Order[] {
        return blingOrders.map(order => this.mapBlingOrderToOrder(order));
    }

    /**
     * Calcula estatísticas dos pedidos mapeados
     */
    static calculateOrderStats(orders: Order[]) {
        return {
            totalOrders: orders.length,
            pendingOrders: orders.filter(o => o.status === 'pending').length,
            inProgressOrders: orders.filter(o => o.status === 'in_progress').length,
            completedOrders: orders.filter(o => o.status === 'completed').length,
            cancelledOrders: orders.filter(o => o.status === 'cancelled').length,
            urgentOrders: orders.filter(o => o.priority === 'urgent').length,
            highPriorityOrders: orders.filter(o => o.priority === 'high').length,
            mediumPriorityOrders: orders.filter(o => o.priority === 'medium').length,
            lowPriorityOrders: orders.filter(o => o.priority === 'low').length,
        };
    }

    /**
     * Filtra pedidos por status
     */
    static filterOrdersByStatus(orders: Order[], status: string): Order[] {
        if (status === 'all') return orders;
        return orders.filter(order => order.status === status);
    }

    /**
     * Filtra pedidos por prioridade
     */
    static filterOrdersByPriority(orders: Order[], priority: Priority): Order[] {
        return orders.filter(order => order.priority === priority);
    }

    /**
     * Ordena pedidos por prioridade e data de vencimento
     */
    static sortOrdersByPriority(orders: Order[]): Order[] {
        const priorityOrder: Record<Priority, number> = {
            urgent: 4,
            high: 3,
            medium: 2,
            low: 1,
        };

        return [...orders].sort((a, b) => {
            // Primeiro por prioridade
            const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
            if (priorityDiff !== 0) return priorityDiff;

            // Depois por data de vencimento (mais próximos primeiro)
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        });
    }
}
