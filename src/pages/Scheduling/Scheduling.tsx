import { useState, useEffect } from "react";
import { FaCalendarAlt, FaClock, FaPlus, FaEdit, FaTrash, FaChevronLeft, FaChevronRight, FaTimes, FaSave, FaExclamationTriangle } from "react-icons/fa";
import Button from "../../components/Button/Button";
import Input from "../../components/Input/Input";
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

interface ScheduleFormData {
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    date: string;
    type: "production" | "maintenance" | "meeting" | "break";
    status: "scheduled" | "in_progress" | "completed" | "cancelled";
    assignedTo: string[];
    priority: "low" | "medium" | "high" | "urgent";
    newAssignee: string;
}

export default function Scheduling() {
    const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<"day" | "week" | "month">("week");
    const [filterType, setFilterType] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);
    const [formData, setFormData] = useState<ScheduleFormData>({
        title: "",
        description: "",
        startTime: "",
        endTime: "",
        date: "",
        type: "production",
        status: "scheduled",
        assignedTo: [],
        priority: "medium",
        newAssignee: ""
    });
    const [formLoading, setFormLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

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

    // Funções do modal
    const openAddModal = () => {
        setFormData({
            title: "",
            description: "",
            startTime: "",
            endTime: "",
            date: currentDate.toISOString().split('T')[0],
            type: "production",
            status: "scheduled",
            assignedTo: [],
            priority: "medium",
            newAssignee: ""
        });
        setEditingItem(null);
        setShowAddModal(true);
        setError(null);
        setFormErrors({});
    };

    const openEditModal = (item: ScheduleItem) => {
        setFormData({
            title: item.title,
            description: item.description,
            startTime: item.startTime,
            endTime: item.endTime,
            date: item.date,
            type: item.type,
            status: item.status,
            assignedTo: [...item.assignedTo],
            priority: item.priority,
            newAssignee: ""
        });
        setEditingItem(item);
        setShowAddModal(true);
        setError(null);
        setFormErrors({});
    };

    const closeModal = () => {
        setShowAddModal(false);
        setEditingItem(null);
        setError(null);
        setFormErrors({});
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Limpar erros específicos do campo
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: "" }));
        }
        if (error) setError(null);
    };

    const addAssignee = () => {
        if (formData.newAssignee.trim() && !formData.assignedTo.includes(formData.newAssignee.trim())) {
            setFormData(prev => ({
                ...prev,
                assignedTo: [...prev.assignedTo, prev.newAssignee.trim()],
                newAssignee: ""
            }));
        }
    };

    const removeAssignee = (assignee: string) => {
        setFormData(prev => ({
            ...prev,
            assignedTo: prev.assignedTo.filter(a => a !== assignee)
        }));
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.title.trim()) errors.title = "Título é obrigatório";
        if (!formData.startTime) errors.startTime = "Horário de início é obrigatório";
        if (!formData.endTime) errors.endTime = "Horário de fim é obrigatório";
        if (!formData.date) errors.date = "Data é obrigatória";
        if (formData.assignedTo.length === 0) errors.assignedTo = "Pelo menos um responsável deve ser atribuído";

        // Validar se horário de fim é depois do início
        if (formData.startTime && formData.endTime) {
            const start = new Date(`2000-01-01T${formData.startTime}`);
            const end = new Date(`2000-01-01T${formData.endTime}`);
            if (end <= start) {
                errors.endTime = "Horário de fim deve ser depois do início";
            }
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        setFormLoading(true);
        setError(null);

        try {
            const newItem: ScheduleItem = {
                id: editingItem?.id || Date.now().toString(),
                title: formData.title.trim(),
                description: formData.description.trim(),
                startTime: formData.startTime,
                endTime: formData.endTime,
                date: formData.date,
                type: formData.type,
                status: formData.status,
                assignedTo: formData.assignedTo,
                priority: formData.priority
            };

            if (editingItem) {
                // Atualizar item existente
                setScheduleItems(prev => 
                    prev.map(item => item.id === editingItem.id ? newItem : item)
                );
            } else {
                // Adicionar novo item
                setScheduleItems(prev => [...prev, newItem]);
            }

            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
            closeModal();
        } catch (err) {
            console.error("Erro ao salvar item:", err);
            setError("Erro ao salvar item. Tente novamente.");
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = (itemId: string) => {
        if (confirm("Tem certeza que deseja remover este item?")) {
            setScheduleItems(prev => prev.filter(item => item.id !== itemId));
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        }
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
                            onClick={openAddModal}
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
                                    <button 
                                        className="action-btn edit"
                                        onClick={() => openEditModal(item)}
                                        title="Editar item"
                                    >
                                        <FaEdit />
                                    </button>
                                    <button 
                                        className="action-btn delete"
                                        onClick={() => handleDelete(item.id)}
                                        title="Remover item"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Modal de Adicionar/Editar Item */}
                {showAddModal && (
                    <div className="modal-overlay">
                        <div className="modal schedule-modal">
                            <div className="modal-header">
                                <h2>
                                    {editingItem ? "Editar Item" : "Adicionar Novo Item"}
                                </h2>
                                <button className="close-btn" onClick={closeModal}>
                                    <FaTimes />
                                </button>
                            </div>
                            <div className="modal-body">
                                {error && (
                                    <div className="error-message">
                                        <FaExclamationTriangle />
                                        {error}
                                    </div>
                                )}
                                
                                {success && (
                                    <div className="success-message">
                                        <FaSave />
                                        Item salvo com sucesso!
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="schedule-form">
                                    <div className="form-section">
                                        <h3>Informações Básicas</h3>
                                        <div className="form-grid">
                                            <div className="form-group">
                                                <label>Título *</label>
                                                <Input
                                                    type="text"
                                                    name="title"
                                                    value={formData.title}
                                                    onChange={handleFormChange}
                                                    placeholder="Digite o título do item"
                                                    required
                                                    disabled={formLoading}
                                                />
                                                {formErrors.title && (
                                                    <div className="field-error">
                                                        <FaExclamationTriangle />
                                                        {formErrors.title}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="form-group">
                                                <label>Tipo *</label>
                                                <select
                                                    name="type"
                                                    value={formData.type}
                                                    onChange={handleFormChange}
                                                    required
                                                    disabled={formLoading}
                                                >
                                                    <option value="production">Produção</option>
                                                    <option value="maintenance">Manutenção</option>
                                                    <option value="meeting">Reunião</option>
                                                    <option value="break">Pausa</option>
                                                </select>
                                            </div>

                                            <div className="form-group">
                                                <label>Prioridade *</label>
                                                <select
                                                    name="priority"
                                                    value={formData.priority}
                                                    onChange={handleFormChange}
                                                    required
                                                    disabled={formLoading}
                                                >
                                                    <option value="low">Baixa</option>
                                                    <option value="medium">Média</option>
                                                    <option value="high">Alta</option>
                                                    <option value="urgent">Urgente</option>
                                                </select>
                                            </div>

                                            <div className="form-group">
                                                <label>Status *</label>
                                                <select
                                                    name="status"
                                                    value={formData.status}
                                                    onChange={handleFormChange}
                                                    required
                                                    disabled={formLoading}
                                                >
                                                    <option value="scheduled">Agendado</option>
                                                    <option value="in_progress">Em Andamento</option>
                                                    <option value="completed">Concluído</option>
                                                    <option value="cancelled">Cancelado</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label>Descrição</label>
                                            <textarea
                                                name="description"
                                                value={formData.description}
                                                onChange={handleFormChange}
                                                placeholder="Digite uma descrição detalhada"
                                                rows={3}
                                                disabled={formLoading}
                                                className="form-textarea"
                                            />
                                        </div>
                                    </div>

                                    <div className="form-section">
                                        <h3>Data e Horário</h3>
                                        <div className="form-grid">
                                            <div className="form-group">
                                                <label>Data *</label>
                                                <Input
                                                    type="date"
                                                    name="date"
                                                    value={formData.date}
                                                    onChange={handleFormChange}
                                                    required
                                                    disabled={formLoading}
                                                    placeholder="Selecione a data"
                                                />
                                                {formErrors.date && (
                                                    <div className="field-error">
                                                        <FaExclamationTriangle />
                                                        {formErrors.date}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="form-group">
                                                <label>Horário de Início *</label>
                                                <Input
                                                    type="time"
                                                    name="startTime"
                                                    value={formData.startTime}
                                                    onChange={handleFormChange}
                                                    required
                                                    disabled={formLoading}
                                                    placeholder="Selecione o horário de início"
                                                />
                                                {formErrors.startTime && (
                                                    <div className="field-error">
                                                        <FaExclamationTriangle />
                                                        {formErrors.startTime}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="form-group">
                                                <label>Horário de Fim *</label>
                                                <Input
                                                    type="time"
                                                    name="endTime"
                                                    value={formData.endTime}
                                                    onChange={handleFormChange}
                                                    required
                                                    disabled={formLoading}
                                                    placeholder="Selecione o horário de fim"
                                                />
                                                {formErrors.endTime && (
                                                    <div className="field-error">
                                                        <FaExclamationTriangle />
                                                        {formErrors.endTime}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-section">
                                        <h3>Responsáveis</h3>
                                        <div className="form-group">
                                            <label>Adicionar Responsável</label>
                                            <div className="assignee-input">
                                                <Input
                                                    type="text"
                                                    name="newAssignee"
                                                    value={formData.newAssignee}
                                                    onChange={handleFormChange}
                                                    placeholder="Digite o nome do responsável"
                                                    disabled={formLoading}
                                                />
                                                <Button
                                                    type="button"
                                                    onClick={addAssignee}
                                                    disabled={formLoading || !formData.newAssignee.trim()}
                                                >
                                                    <FaPlus />
                                                    Adicionar
                                                </Button>
                                            </div>
                                            {formErrors.assignedTo && (
                                                <div className="field-error">
                                                    <FaExclamationTriangle />
                                                    {formErrors.assignedTo}
                                                </div>
                                            )}
                                        </div>

                                        {formData.assignedTo.length > 0 && (
                                            <div className="assignees-list">
                                                <h4>Responsáveis Atribuídos:</h4>
                                                <div className="assignees-tags">
                                                    {formData.assignedTo.map((assignee, index) => (
                                                        <span key={index} className="assignee-tag">
                                                            {assignee}
                                                            <button
                                                                type="button"
                                                                onClick={() => removeAssignee(assignee)}
                                                                className="remove-assignee"
                                                                disabled={formLoading}
                                                            >
                                                                <FaTimes />
                                                            </button>
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="form-actions">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={closeModal}
                                            disabled={formLoading}
                                        >
                                            <FaTimes />
                                            Cancelar
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={formLoading}
                                        >
                                            <FaSave />
                                            {formLoading ? "Salvando..." : editingItem ? "Salvar" : "Criar Item"}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
