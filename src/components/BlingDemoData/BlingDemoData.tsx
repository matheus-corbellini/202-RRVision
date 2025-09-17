import { useState } from 'react';
import { BlingDataMapper } from '../../services/blingDataMapper';
import BlingTestToken from '../BlingTestToken/BlingTestToken';
import { FaEye, FaEyeSlash, FaInfoCircle } from 'react-icons/fa';
import './BlingDemoData.css';

interface BlingDemoDataProps {
    onDataChange?: (orders: any[]) => void;
}

export default function BlingDemoData({ onDataChange }: BlingDemoDataProps) {
    const [showDemoData, setShowDemoData] = useState(true);
    const [showTokenConfig, setShowTokenConfig] = useState(false);

    // Dados de demonstração baseados na estrutura real do Bling
    const demoBlingOrders = [
        {
            id: "1",
            numero: "V001",
            data: "2024-01-15",
            dataSaida: "2024-01-20",
            cliente: {
                nome: "Empresa ABC Ltda",
                email: "contato@empresaabc.com",
                telefone: "(11) 99999-9999"
            },
            itens: [
                {
                    codigo: "PROD001",
                    descricao: "Produto A - Modelo Premium",
                    quantidade: 100,
                    valor: 150.00
                }
            ],
            observacoes: "Pedido urgente - cliente VIP",
            situacao: "em_producao",
            total: 15000.00
        },
        {
            id: "2",
            numero: "V002",
            data: "2024-01-16",
            dataSaida: "2024-01-22",
            cliente: {
                nome: "Comércio XYZ S.A.",
                email: "vendas@comercioxyz.com",
                telefone: "(11) 88888-8888"
            },
            itens: [
                {
                    codigo: "PROD002",
                    descricao: "Produto B - Modelo Standard",
                    quantidade: 50,
                    valor: 200.00
                },
                {
                    codigo: "PROD003",
                    descricao: "Produto C - Modelo Básico",
                    quantidade: 25,
                    valor: 100.00
                }
            ],
            observacoes: "",
            situacao: "em_aberto",
            total: 12500.00
        },
        {
            id: "3",
            numero: "V003",
            data: "2024-01-18",
            dataSaida: "2024-01-25",
            cliente: {
                nome: "Indústria DEF Ltda",
                email: "compras@industriadef.com",
                telefone: "(11) 77777-7777"
            },
            itens: [
                {
                    codigo: "PROD004",
                    descricao: "Produto D - Modelo Industrial",
                    quantidade: 200,
                    valor: 75.00
                }
            ],
            observacoes: "Entrega programada",
            situacao: "aguardando_producao",
            total: 15000.00
        },
        {
            id: "4",
            numero: "V004",
            data: "2024-01-10",
            dataSaida: "2024-01-17",
            cliente: {
                nome: "Distribuidora GHI Ltda",
                email: "pedidos@distribuidoraghi.com",
                telefone: "(11) 66666-6666"
            },
            itens: [
                {
                    codigo: "PROD005",
                    descricao: "Produto E - Modelo Especial",
                    quantidade: 75,
                    valor: 300.00
                }
            ],
            observacoes: "",
            situacao: "concluido",
            total: 22500.00
        }
    ];

    // Converter dados de demonstração para o formato interno
    const demoOrders = BlingDataMapper.mapBlingOrdersToOrders(demoBlingOrders);
    const demoStats = BlingDataMapper.calculateOrderStats(demoOrders);

    const handleToggleDemoData = () => {
        setShowDemoData(!showDemoData);
        if (onDataChange) {
            onDataChange(showDemoData ? [] : demoOrders);
        }
    };

    const handleTokenConfigured = () => {
        setShowTokenConfig(false);
        setShowDemoData(false);
        // Recarregar a página para usar dados reais
        window.location.reload();
    };

    return (
        <div className="bling-demo-data">
            <div className="demo-header">
                <div className="demo-info">
                    <FaInfoCircle className="info-icon" />
                    <div className="info-content">
                        <h3>Dados de Demonstração</h3>
                        <p>Exibindo dados simulados do Bling. Configure um token real para ver seus dados.</p>
                    </div>
                </div>

                <div className="demo-controls">
                    <button
                        className={`btn btn-outline ${showDemoData ? 'active' : ''}`}
                        onClick={handleToggleDemoData}
                    >
                        {showDemoData ? <FaEyeSlash /> : <FaEye />}
                        {showDemoData ? 'Ocultar Demo' : 'Mostrar Demo'}
                    </button>

                    <button
                        className="btn btn-primary"
                        onClick={() => setShowTokenConfig(!showTokenConfig)}
                    >
                        Configurar Token Real
                    </button>
                </div>
            </div>

            {showDemoData && (
                <div className="demo-content">
                    <div className="demo-stats">
                        <h4>Estatísticas dos Dados de Demonstração:</h4>
                        <div className="stats-grid">
                            <div className="stat-card">
                                <span className="stat-number">{demoStats.totalOrders}</span>
                                <span className="stat-label">Total de Pedidos</span>
                            </div>
                            <div className="stat-card">
                                <span className="stat-number">{demoStats.pendingOrders}</span>
                                <span className="stat-label">Pendentes</span>
                            </div>
                            <div className="stat-card">
                                <span className="stat-number">{demoStats.inProgressOrders}</span>
                                <span className="stat-label">Em Produção</span>
                            </div>
                            <div className="stat-card">
                                <span className="stat-number">{demoStats.completedOrders}</span>
                                <span className="stat-label">Concluídos</span>
                            </div>
                            <div className="stat-card">
                                <span className="stat-number">{demoStats.urgentOrders}</span>
                                <span className="stat-label">Urgentes</span>
                            </div>
                        </div>
                    </div>

                    <div className="demo-orders">
                        <h4>Pedidos de Demonstração:</h4>
                        <div className="orders-list">
                            {demoOrders.map((order) => (
                                <div key={order.id} className="order-item">
                                    <div className="order-header">
                                        <span className="order-number">{order.orderNumber}</span>
                                        <span className={`status-badge status-${order.status}`}>
                                            {order.status === 'pending' && 'Pendente'}
                                            {order.status === 'in_progress' && 'Em Produção'}
                                            {order.status === 'completed' && 'Concluído'}
                                            {order.status === 'cancelled' && 'Cancelado'}
                                        </span>
                                        <span className={`priority-badge priority-${order.priority}`}>
                                            {order.priority === 'urgent' && 'Urgente'}
                                            {order.priority === 'high' && 'Alta'}
                                            {order.priority === 'medium' && 'Média'}
                                            {order.priority === 'low' && 'Baixa'}
                                        </span>
                                    </div>
                                    <div className="order-details">
                                        <p><strong>Cliente:</strong> {order.customer}</p>
                                        <p><strong>Produto:</strong> {order.product}</p>
                                        <p><strong>Quantidade:</strong> {order.quantity}</p>
                                        <p><strong>Vencimento:</strong> {new Date(order.dueDate).toLocaleDateString('pt-BR')}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {showTokenConfig && (
                <div className="token-config-section">
                    <BlingTestToken onTokenSet={handleTokenConfigured} />
                </div>
            )}
        </div>
    );
}
