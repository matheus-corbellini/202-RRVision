import { useState, useEffect } from "react";
import { FaCalendarAlt, FaClock, FaPlus, FaEdit, FaTrash, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Button from "../../components/Button/Button";
import "./Scheduling.css";

interface ScheduleItem {
    id: string;
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    date: string;
    type: "production" | "maintenance" | "meeting" | "break";
    status: "scheduled" | "in_progress" | "completed" | "cancelled";
    assignedTo: string[];
    priority: "low" | "medium" | "high" | "urgent";
}

export default function Scheduling() {
    const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<"day" | "week" | "month">("week");
    const [filterType, setFilterType] = useState("");
    const [, setShowAddModal] = useState(false);

    useEffect(() => {
        loadScheduleData();
    }, []);

    const loadScheduleData = async () => {
        setLoading(true);

        // Simular carregamento de dados
        setTimeout(() => {
            const mockSchedule: ScheduleItem[] = [
                {
                    id: "1",
                    title: "Produção Pedido #1234",
                    description: "Montagem de peças mecânicas",
                    startTime: "08:00",
                    endTime: "16:00",
                    date: new Date().toISOString().split('T')[0],
                    type: "production",
                    status: "scheduled",
                    assignedTo: ["João Silva", "Maria Santos"],
                    priority: "high",
                },
                {
                    id: "2",
                    title: "Manutenção Preventiva",
                    description: "Manutenção da máquina CNC-001",
                    startTime: "14:00",
                    endTime: "18:00",
                    date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    type: "maintenance",
                    status: "scheduled",
                    assignedTo: ["Pedro Costa"],
                    priority: "medium",
                },
                {
                    id: "3",
                    title: "Reunião de Equipe",
                    description: "Reunião semanal de produção",
                    startTime: "09:00",
                    endTime: "10:00",
                    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    type: "meeting",
                    status: "scheduled",
                    assignedTo: ["João Silva", "Maria Santos", "Pedro Costa"],
                    priority: "low",
                },
            ];

            setScheduleItems(mockSchedule);
            setLoading(false);
        }, 1000);
    };

    const getTypeIcon = (type: string) => {
        const icons = {
            production: "🏭",
            maintenance: "🔧",
            meeting: "👥",
            break: "☕",
        };
        return icons[type as keyof typeof icons] || "📅";
    };

    const getTypeColor = (type: string) => {
        const colors = {
            production: "#667eea",
            maintenance: "#ed8936",
            meeting: "#48bb78",
            break: "#a0aec0",
        };
        return colors[type as keyof typeof colors] || "#4a5568";
    };

    const getPriorityColor = (priority: string) => {
        const colors = {
            low: "#48bb78",
            medium: "#ed8936",
            high: "#e53e3e",
            urgent: "#9f7aea",
        };
        return colors[priority as keyof typeof colors] || "#4a5568";
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            scheduled: { label: "Agendado", class: "status-scheduled" },
            in_progress: { label: "Em Andamento", class: "status-progress" },
            completed: { label: "Concluído", class: "status-completed" },
            cancelled: { label: "Cancelado", class: "status-cancelled" },
        };

        const config = statusConfig[status as keyof typeof statusConfig] ||
            { label: status, class: "status-default" };

        return (
            <span className={`status-badge ${config.class}`}>
                {config.label}
            </span>
        );
    };

    const filteredItems = scheduleItems.filter(item =>
        !filterType || item.type === filterType
    );

    const navigateDate = (direction: "prev" | "next") => {
        const newDate = new Date(currentDate);
        if (viewMode === "day") {
            newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1));
        } else if (viewMode === "week") {
            newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
        } else if (viewMode === "month") {
            newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1));
        }
        setCurrentDate(newDate);
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString("pt-BR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    if (loading) {
        return (
            <div className="scheduling-page">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Carregando cronograma...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="scheduling-page">
            <div className="scheduling-container">
                <div className="schedule-header">
                    <h1>
                        <FaCalendarAlt className="header-icon" />
                        Cronograma de Produção
                    </h1>
                    <p>Visualize e gerencie o cronograma de produção</p>
                </div>

                {/* Controles */}
                <div className="controls-section">
                    <div className="date-navigation">
                        <button
                            className="nav-btn"
                            onClick={() => navigateDate("prev")}
                        >
                            <FaChevronLeft />
                        </button>
                        <h2>{formatDate(currentDate)}</h2>
                        <button
                            className="nav-btn"
                            onClick={() => navigateDate("next")}
                        >
                            <FaChevronRight />
                        </button>
                    </div>

                    <div className="view-controls">
                        <div className="view-selector">
                            {[
                                { value: "day", label: "Dia" },
                                { value: "week", label: "Semana" },
                                { value: "month", label: "Mês" },
                            ].map((view) => (
                                <button
                                    key={view.value}
                                    className={`view-btn ${viewMode === view.value ? "active" : ""}`}
                                    onClick={() => setViewMode(view.value as any)}
                                >
                                    {view.label}
                                </button>
                            ))}
                        </div>

                        <div className="filter-controls">
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                            >
                                <option value="">Todos os Tipos</option>
                                <option value="production">Produção</option>
                                <option value="maintenance">Manutenção</option>
                                <option value="meeting">Reunião</option>
                                <option value="break">Pausa</option>
                            </select>
                        </div>

                        <Button
                            variant="primary"
                            onClick={() => setShowAddModal(true)}
                            className="add-btn"
                        >
                            <FaPlus />
                            Adicionar
                        </Button>
                    </div>
                </div>

                {/* Cronograma */}
                <div className="schedule-content">
                    {viewMode === "day" && (
                        <div className="day-view">
                            <h3>Agenda do Dia</h3>
                            <div className="timeline">
                                {Array.from({ length: 24 }, (_, hour) => (
                                    <div key={hour} className="time-slot">
                                        <div className="time-label">
                                            {hour.toString().padStart(2, '0')}:00
                                        </div>
                                        <div className="time-content">
                                            {filteredItems
                                                .filter(item => {
                                                    const itemHour = parseInt(item.startTime.split(':')[0]);
                                                    return itemHour === hour;
                                                })
                                                .map(item => (
                                                    <div
                                                        key={item.id}
                                                        className="schedule-item"
                                                        style={{ borderLeftColor: getTypeColor(item.type) }}
                                                    >
                                                        <div className="item-header">
                                                            <span className="item-icon">{getTypeIcon(item.type)}</span>
                                                            <span className="item-title">{item.title}</span>
                                                            <span
                                                                className="priority-dot"
                                                                style={{ backgroundColor: getPriorityColor(item.priority) }}
                                                            ></span>
                                                        </div>
                                                        <div className="item-time">
                                                            {item.startTime} - {item.endTime}
                                                        </div>
                                                        <div className="item-assigned">
                                                            {item.assignedTo.join(", ")}
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {viewMode === "week" && (
                        <div className="week-view">
                            <h3>Agenda da Semana</h3>
                            <div className="week-grid">
                                {filteredItems.map(item => (
                                    <div
                                        key={item.id}
                                        className="week-item"
                                        style={{ borderLeftColor: getTypeColor(item.type) }}
                                    >
                                        <div className="item-header">
                                            <span className="item-icon">{getTypeIcon(item.type)}</span>
                                            <span className="item-title">{item.title}</span>
                                        </div>
                                        <div className="item-details">
                                            <div className="item-time">
                                                <FaClock />
                                                {item.startTime} - {item.endTime}
                                            </div>
                                            <div className="item-status">
                                                {getStatusBadge(item.status)}
                                            </div>
                                        </div>
                                        <div className="item-assigned">
                                            {item.assignedTo.join(", ")}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {viewMode === "month" && (
                        <div className="month-view">
                            <h3>Visão Mensal</h3>
                            <div className="month-grid">
                                {filteredItems.map(item => (
                                    <div
                                        key={item.id}
                                        className="month-item"
                                        style={{ borderLeftColor: getTypeColor(item.type) }}
                                    >
                                        <div className="item-header">
                                            <span className="item-icon">{getTypeIcon(item.type)}</span>
                                            <span className="item-title">{item.title}</span>
                                        </div>
                                        <div className="item-date">
                                            {new Date(item.date).toLocaleDateString("pt-BR")}
                                        </div>
                                        <div className="item-status">
                                            {getStatusBadge(item.status)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Lista de Itens */}
                <div className="items-list-section">
                    <h3>Todos os Itens Agendados</h3>
                    <div className="items-table">
                        <div className="table-header">
                            <div>Tipo</div>
                            <div>Título</div>
                            <div>Data</div>
                            <div>Horário</div>
                            <div>Status</div>
                            <div>Responsáveis</div>
                            <div>Ações</div>
                        </div>
                        {filteredItems.map(item => (
                            <div key={item.id} className="table-row">
                                <div className="item-type">
                                    <span className="type-icon">{getTypeIcon(item.type)}</span>
                                    <span className="type-label">{item.type}</span>
                                </div>
                                <div className="item-title">{item.title}</div>
                                <div className="item-date">
                                    {new Date(item.date).toLocaleDateString("pt-BR")}
                                </div>
                                <div className="item-time">
                                    {item.startTime} - {item.endTime}
                                </div>
                                <div className="item-status">
                                    {getStatusBadge(item.status)}
                                </div>
                                <div className="item-assigned">
                                    {item.assignedTo.join(", ")}
                                </div>
                                <div className="item-actions">
                                    <button className="action-btn edit">
                                        <FaEdit />
                                    </button>
                                    <button className="action-btn delete">
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
