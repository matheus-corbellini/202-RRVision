import { useState, useEffect } from "react";
import { blingService } from "../../services/blingService";
import { FaEye, FaDownload, FaSync, FaFilter, FaSearch } from "react-icons/fa";
import "./BlingOrdersList.css";

interface BlingOrder {
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

interface BlingOrdersListProps {
    accessToken: string;
    onOrderSelect?: (order: BlingOrder) => void;
}

export default function BlingOrdersList({ accessToken, onOrderSelect }: BlingOrdersListProps) {
    const [orders, setOrders] = useState<BlingOrder[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const statusOptions = [
        { value: "", label: "Todos os Status" },
        { value: "em_aberto", label: "Em Aberto" },
        { value: "em_producao", label: "Em Produção" },
        { value: "aguardando_producao", label: "Aguardando Produção" },
        { value: "concluido", label: "Concluído" },
        { value: "cancelado", label: "Cancelado" },
    ];

    useEffect(() => {
        if (accessToken) {
            loadOrders();
        }
    }, [accessToken, currentPage, statusFilter]);

    const loadOrders = async () => {
        if (!accessToken) return;

        setLoading(true);
        setError(null);

        try {
            blingService.setAccessToken(accessToken);
            const result = await blingService.getOrders(currentPage, 20, {
                situacao: statusFilter || undefined,
            });

            setOrders(result.data);
            setTotalPages(Math.ceil(result.total / 20));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao carregar pedidos");
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        loadOrders();
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = searchTerm === "" ||
            order.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.itens.some(item =>
                item.descricao.toLowerCase().includes(searchTerm.toLowerCase())
            );

        return matchesSearch;
    });

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            em_aberto: { label: "Em Aberto", class: "status-open" },
            em_producao: { label: "Em Produção", class: "status-production" },
            aguardando_producao: { label: "Aguardando", class: "status-waiting" },
            concluido: { label: "Concluído", class: "status-completed" },
            cancelado: { label: "Cancelado", class: "status-cancelled" },
        };

        const config = statusConfig[status as keyof typeof statusConfig] ||
            { label: status, class: "status-default" };

        return (
            <span className={`status-badge ${config.class}`}>
                {config.label}
            </span>
        );
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(value);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("pt-BR");
    };

    if (!accessToken) {
        return (
            <div className="bling-orders-list">
                <div className="no-access">
                    <h3>Configure a integração com Bling</h3>
                    <p>É necessário configurar o Access Token para visualizar os pedidos.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bling-orders-list">
            <div className="orders-header">
                <h2>Pedidos do Bling</h2>
                <div className="header-actions">
                    <button
                        className="btn btn-outline"
                        onClick={handleRefresh}
                        disabled={loading}
                    >
                        <FaSync className={loading ? "spinning" : ""} />
                        Atualizar
                    </button>
                </div>
            </div>

            {/* Filtros */}
            <div className="orders-filters">
                <div className="filter-group">
                    <div className="search-input">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Buscar por número, cliente ou produto..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="filter-group">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        {statusOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Lista de Pedidos */}
            <div className="orders-content">
                {loading && (
                    <div className="loading-state">
                        <FaSync className="spinning" />
                        <p>Carregando pedidos...</p>
                    </div>
                )}

                {error && (
                    <div className="error-state">
                        <p>{error}</p>
                        <button className="btn btn-primary" onClick={handleRefresh}>
                            Tentar Novamente
                        </button>
                    </div>
                )}

                {!loading && !error && filteredOrders.length === 0 && (
                    <div className="empty-state">
                        <p>Nenhum pedido encontrado</p>
                    </div>
                )}

                {!loading && !error && filteredOrders.length > 0 && (
                    <div className="orders-grid">
                        {filteredOrders.map((order) => (
                            <div key={order.id} className="order-card">
                                <div className="order-header">
                                    <div className="order-number">
                                        <h3>{order.numero}</h3>
                                        {getStatusBadge(order.situacao)}
                                    </div>
                                    <div className="order-date">
                                        {formatDate(order.data)}
                                    </div>
                                </div>

                                <div className="order-customer">
                                    <h4>{order.cliente.nome}</h4>
                                    {order.cliente.email && (
                                        <p className="customer-email">{order.cliente.email}</p>
                                    )}
                                </div>

                                <div className="order-items">
                                    <h5>Itens ({order.itens.length})</h5>
                                    <div className="items-list">
                                        {order.itens.slice(0, 2).map((item, index) => (
                                            <div key={index} className="item">
                                                <span className="item-quantity">{item.quantidade}x</span>
                                                <span className="item-description">{item.descricao}</span>
                                            </div>
                                        ))}
                                        {order.itens.length > 2 && (
                                            <div className="more-items">
                                                +{order.itens.length - 2} itens
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="order-footer">
                                    <div className="order-total">
                                        <strong>{formatCurrency(order.total)}</strong>
                                    </div>
                                    <div className="order-actions">
                                        <button
                                            className="btn btn-sm btn-outline"
                                            onClick={() => onOrderSelect?.(order)}
                                        >
                                            <FaEye />
                                            Ver Detalhes
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Paginação */}
                {totalPages > 1 && (
                    <div className="pagination">
                        <button
                            className="btn btn-outline"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                        >
                            Anterior
                        </button>
                        <span className="page-info">
                            Página {currentPage} de {totalPages}
                        </span>
                        <button
                            className="btn btn-outline"
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                        >
                            Próxima
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
