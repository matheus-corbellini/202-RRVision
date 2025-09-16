import { useState, useEffect } from "react";
import { FaChartBar, FaChartLine, FaChartPie, FaArrowUp, FaArrowDown } from "react-icons/fa";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import "./Analytics.css";

interface AnalyticsData {
    productionTrend: Array<{
        date: string;
        orders: number;
        efficiency: number;
    }>;
    qualityMetrics: Array<{
        category: string;
        value: number;
        color: string;
    }>;
    sectorPerformance: Array<{
        sector: string;
        orders: number;
        efficiency: number;
    }>;
    kpis: {
        totalOrders: number;
        avgEfficiency: number;
        qualityRate: number;
        downtime: number;
    };
}

export default function Analytics() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");
    const [activeChart, setActiveChart] = useState<"production" | "quality" | "sectors">("production");

    useEffect(() => {
        loadAnalyticsData();
    }, [timeRange]);

    const loadAnalyticsData = async () => {
        setLoading(true);

        // Simular carregamento de dados
        setTimeout(() => {
            const mockData: AnalyticsData = {
                productionTrend: Array.from({ length: 30 }, (_, i) => ({
                    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString("pt-BR", { month: "short", day: "numeric" }),
                    orders: Math.floor(Math.random() * 50) + 20,
                    efficiency: Math.floor(Math.random() * 20) + 80,
                })),
                qualityMetrics: [
                    { category: "Aprovados", value: 85, color: "#48bb78" },
                    { category: "Reprovados", value: 10, color: "#e53e3e" },
                    { category: "Em Análise", value: 5, color: "#ed8936" },
                ],
                sectorPerformance: [
                    { sector: "Montagem", orders: 45, efficiency: 92 },
                    { sector: "Usinagem", orders: 38, efficiency: 88 },
                    { sector: "Pintura", orders: 32, efficiency: 85 },
                    { sector: "Embalagem", orders: 28, efficiency: 90 },
                ],
                kpis: {
                    totalOrders: 143,
                    avgEfficiency: 88.75,
                    qualityRate: 85,
                    downtime: 2.3,
                },
            };

            setData(mockData);
            setLoading(false);
        }, 1000);
    };

    // const COLORS = ["#667eea", "#48bb78", "#ed8936", "#e53e3e"];

    if (loading) {
        return (
            <div className="analytics-page">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Carregando analytics...</p>
                </div>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="analytics-page">
            <div className="analytics-container">
                <div className="analytics-header">
                    <h1>
                        <FaChartBar className="header-icon" />
                        Analytics de Produção
                    </h1>
                    <p>Visualize métricas detalhadas e tendências de produção</p>
                </div>

                {/* KPIs */}
                <div className="kpis-grid">
                    <div className="kpi-card">
                        <div className="kpi-icon">
                            <FaChartLine />
                        </div>
                        <div className="kpi-content">
                            <h3>{data.kpis.totalOrders}</h3>
                            <p>Total de Pedidos</p>
                            <span className="kpi-trend positive">
                                <FaArrowUp />
                                +12%
                            </span>
                        </div>
                    </div>

                    <div className="kpi-card">
                        <div className="kpi-icon">
                            <FaChartBar />
                        </div>
                        <div className="kpi-content">
                            <h3>{data.kpis.avgEfficiency}%</h3>
                            <p>Eficiência Média</p>
                            <span className="kpi-trend positive">
                                <FaArrowUp />
                                +3.2%
                            </span>
                        </div>
                    </div>

                    <div className="kpi-card">
                        <div className="kpi-icon">
                            <FaChartPie />
                        </div>
                        <div className="kpi-content">
                            <h3>{data.kpis.qualityRate}%</h3>
                            <p>Taxa de Qualidade</p>
                            <span className="kpi-trend negative">
                                <FaArrowDown />
                                -1.5%
                            </span>
                        </div>
                    </div>

                    <div className="kpi-card">
                        <div className="kpi-icon">
                            <FaChartLine />
                        </div>
                        <div className="kpi-content">
                            <h3>{data.kpis.downtime}h</h3>
                            <p>Tempo de Parada</p>
                            <span className="kpi-trend positive">
                                <FaArrowDown />
                                -0.8h
                            </span>
                        </div>
                    </div>
                </div>

                {/* Controles */}
                <div className="controls-section">
                    <div className="time-range-selector">
                        <label>Período:</label>
                        <div className="range-buttons">
                            {[
                                { value: "7d", label: "7 dias" },
                                { value: "30d", label: "30 dias" },
                                { value: "90d", label: "90 dias" },
                            ].map((range) => (
                                <button
                                    key={range.value}
                                    className={`range-btn ${timeRange === range.value ? "active" : ""}`}
                                    onClick={() => setTimeRange(range.value as any)}
                                >
                                    {range.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="chart-selector">
                        <label>Tipo de Gráfico:</label>
                        <div className="chart-buttons">
                            {[
                                { value: "production", label: "Produção", icon: <FaChartLine /> },
                                { value: "quality", label: "Qualidade", icon: <FaChartPie /> },
                                { value: "sectors", label: "Setores", icon: <FaChartBar /> },
                            ].map((chart) => (
                                <button
                                    key={chart.value}
                                    className={`chart-btn ${activeChart === chart.value ? "active" : ""}`}
                                    onClick={() => setActiveChart(chart.value as any)}
                                >
                                    {chart.icon}
                                    {chart.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Gráficos */}
                <div className="charts-section">
                    <div className="chart-container">
                        <h2>
                            {activeChart === "production" && "Tendência de Produção"}
                            {activeChart === "quality" && "Métricas de Qualidade"}
                            {activeChart === "sectors" && "Performance por Setor"}
                        </h2>

                        <div className="chart-wrapper">
                            {activeChart === "production" && (
                                <ResponsiveContainer width="100%" height={400}>
                                    <LineChart data={data.productionTrend}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="orders" stroke="#667eea" strokeWidth={3} />
                                        <Line type="monotone" dataKey="efficiency" stroke="#48bb78" strokeWidth={3} />
                                    </LineChart>
                                </ResponsiveContainer>
                            )}

                            {activeChart === "quality" && (
                                <ResponsiveContainer width="100%" height={400}>
                                    <PieChart>
                                        <Pie
                                            data={data.qualityMetrics}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ category, percent }) => `${category} ${((percent || 0) * 100).toFixed(0)}%`}
                                            outerRadius={120}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {data.qualityMetrics.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}

                            {activeChart === "sectors" && (
                                <ResponsiveContainer width="100%" height={400}>
                                    <BarChart data={data.sectorPerformance}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="sector" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="orders" fill="#667eea" />
                                        <Bar dataKey="efficiency" fill="#48bb78" />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tabela de Dados */}
                <div className="data-table-section">
                    <h2>Dados Detalhados</h2>
                    <div className="table-container">
                        <table className="analytics-table">
                            <thead>
                                <tr>
                                    <th>Data</th>
                                    <th>Pedidos</th>
                                    <th>Eficiência</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.productionTrend.slice(-10).map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.date}</td>
                                        <td>{item.orders}</td>
                                        <td>{item.efficiency}%</td>
                                        <td>
                                            <span className={`status-badge ${item.efficiency >= 85 ? "good" : item.efficiency >= 70 ? "warning" : "bad"}`}>
                                                {item.efficiency >= 85 ? "Excelente" : item.efficiency >= 70 ? "Bom" : "Atenção"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
