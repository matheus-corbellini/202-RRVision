import { useState, useEffect } from "react";
import { FaUsers, FaUserPlus, FaEdit, FaTrash, FaClock, FaCalendarAlt, FaSearch } from "react-icons/fa";
import Button from "../../components/Button/Button";
import Input from "../../components/Input/Input";
import "./TeamManagement.css";

interface Operator {
    id: string;
    name: string;
    email: string;
    role: string;
    sector: string;
    shift: "morning" | "afternoon" | "night";
    status: "active" | "inactive" | "on_leave";
    skills: string[];
    performance: number;
    lastActivity: string;
}

interface Shift {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    operators: number;
}

export default function TeamManagement() {
    const [operators, setOperators] = useState<Operator[]>([]);
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterSector, setFilterSector] = useState("");
    const [filterShift, setFilterShift] = useState("");
    // const [showAddModal, setShowAddModal] = useState(false);
    // const [editingOperator, setEditingOperator] = useState<Operator | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);

        // Simular carregamento de dados
        setTimeout(() => {
            const mockOperators: Operator[] = [
                {
                    id: "1",
                    name: "João Silva",
                    email: "joao.silva@empresa.com",
                    role: "Operador Senior",
                    sector: "Montagem",
                    shift: "morning",
                    status: "active",
                    skills: ["Soldagem", "Montagem", "Qualidade"],
                    performance: 95,
                    lastActivity: "2 horas atrás",
                },
                {
                    id: "2",
                    name: "Maria Santos",
                    email: "maria.santos@empresa.com",
                    role: "Supervisora",
                    sector: "Usinagem",
                    shift: "afternoon",
                    status: "active",
                    skills: ["CNC", "Supervisão", "Treinamento"],
                    performance: 92,
                    lastActivity: "1 hora atrás",
                },
                {
                    id: "3",
                    name: "Pedro Costa",
                    email: "pedro.costa@empresa.com",
                    role: "Operador",
                    sector: "Pintura",
                    shift: "night",
                    status: "on_leave",
                    skills: ["Pintura", "Preparação"],
                    performance: 88,
                    lastActivity: "1 dia atrás",
                },
            ];

            const mockShifts: Shift[] = [
                { id: "1", name: "Manhã", startTime: "06:00", endTime: "14:00", operators: 12 },
                { id: "2", name: "Tarde", startTime: "14:00", endTime: "22:00", operators: 15 },
                { id: "3", name: "Noite", startTime: "22:00", endTime: "06:00", operators: 8 },
            ];

            setOperators(mockOperators);
            setShifts(mockShifts);
            setLoading(false);
        }, 1000);
    };

    const filteredOperators = operators.filter(operator => {
        const matchesSearch = operator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            operator.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSector = !filterSector || operator.sector === filterSector;
        const matchesShift = !filterShift || operator.shift === filterShift;

        return matchesSearch && matchesSector && matchesShift;
    });

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            active: { label: "Ativo", class: "status-active" },
            inactive: { label: "Inativo", class: "status-inactive" },
            on_leave: { label: "Afastado", class: "status-leave" },
        };

        const config = statusConfig[status as keyof typeof statusConfig] ||
            { label: status, class: "status-default" };

        return (
            <span className={`status-badge ${config.class}`}>
                {config.label}
            </span>
        );
    };

    const getShiftBadge = (shift: string) => {
        const shiftConfig = {
            morning: { label: "Manhã", class: "shift-morning" },
            afternoon: { label: "Tarde", class: "shift-afternoon" },
            night: { label: "Noite", class: "shift-night" },
        };

        const config = shiftConfig[shift as keyof typeof shiftConfig] ||
            { label: shift, class: "shift-default" };

        return (
            <span className={`shift-badge ${config.class}`}>
                {config.label}
            </span>
        );
    };

    const handleDeleteOperator = (id: string) => {
        if (confirm("Tem certeza que deseja remover este operador?")) {
            setOperators(prev => prev.filter(op => op.id !== id));
        }
    };

    if (loading) {
        return (
            <div className="team-management-page">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Carregando dados da equipe...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="team-management-page">
            <div className="team-management-container">
                <div className="team-header">
                    <h1>
                        <FaUsers className="header-icon" />
                        Gestão de Equipe
                    </h1>
                    <p>Gerencie operadores, turnos e habilidades da equipe</p>
                </div>

                {/* Estatísticas */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">
                            <FaUsers />
                        </div>
                        <div className="stat-content">
                            <h3>{operators.length}</h3>
                            <p>Total de Operadores</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">
                            <FaClock />
                        </div>
                        <div className="stat-content">
                            <h3>{operators.filter(op => op.status === "active").length}</h3>
                            <p>Operadores Ativos</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">
                            <FaCalendarAlt />
                        </div>
                        <div className="stat-content">
                            <h3>{shifts.length}</h3>
                            <p>Turnos Configurados</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">
                            <FaUsers />
                        </div>
                        <div className="stat-content">
                            <h3>{Math.round(operators.reduce((acc, op) => acc + op.performance, 0) / operators.length)}%</h3>
                            <p>Performance Média</p>
                        </div>
                    </div>
                </div>

                {/* Controles */}
                <div className="controls-section">
                    <div className="search-filters">
                        <div className="search-input">
                            <FaSearch className="search-icon" />
                            <Input
                                name="search"
                                type="text"
                                placeholder="Buscar operadores..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="filters">
                            <select
                                value={filterSector}
                                onChange={(e) => setFilterSector(e.target.value)}
                            >
                                <option value="">Todos os Setores</option>
                                <option value="Montagem">Montagem</option>
                                <option value="Usinagem">Usinagem</option>
                                <option value="Pintura">Pintura</option>
                                <option value="Embalagem">Embalagem</option>
                            </select>

                            <select
                                value={filterShift}
                                onChange={(e) => setFilterShift(e.target.value)}
                            >
                                <option value="">Todos os Turnos</option>
                                <option value="morning">Manhã</option>
                                <option value="afternoon">Tarde</option>
                                <option value="night">Noite</option>
                            </select>
                        </div>
                    </div>

                    <Button
                        variant="primary"
                        onClick={() => console.log("Add operator modal")}
                        className="add-btn"
                    >
                        <FaUserPlus />
                        Adicionar Operador
                    </Button>
                </div>

                {/* Tabela de Operadores */}
                <div className="operators-section">
                    <h2>Operadores</h2>
                    <div className="table-container">
                        <table className="operators-table">
                            <thead>
                                <tr>
                                    <th>Nome</th>
                                    <th>Email</th>
                                    <th>Cargo</th>
                                    <th>Setor</th>
                                    <th>Turno</th>
                                    <th>Status</th>
                                    <th>Performance</th>
                                    <th>Última Atividade</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOperators.map((operator) => (
                                    <tr key={operator.id}>
                                        <td>
                                            <div className="operator-info">
                                                <div className="operator-avatar">
                                                    {operator.name.split(" ").map(n => n[0]).join("")}
                                                </div>
                                                <span>{operator.name}</span>
                                            </div>
                                        </td>
                                        <td>{operator.email}</td>
                                        <td>{operator.role}</td>
                                        <td>{operator.sector}</td>
                                        <td>{getShiftBadge(operator.shift)}</td>
                                        <td>{getStatusBadge(operator.status)}</td>
                                        <td>
                                            <div className="performance-bar">
                                                <div
                                                    className="performance-fill"
                                                    style={{ width: `${operator.performance}%` }}
                                                ></div>
                                                <span>{operator.performance}%</span>
                                            </div>
                                        </td>
                                        <td>{operator.lastActivity}</td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="action-btn edit"
                                                    onClick={() => console.log("Edit operator", operator.id)}
                                                    title="Editar"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    className="action-btn delete"
                                                    onClick={() => handleDeleteOperator(operator.id)}
                                                    title="Remover"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Turnos */}
                <div className="shifts-section">
                    <h2>Turnos</h2>
                    <div className="shifts-grid">
                        {shifts.map((shift) => (
                            <div key={shift.id} className="shift-card">
                                <div className="shift-header">
                                    <h3>{shift.name}</h3>
                                    <span className="shift-time">{shift.startTime} - {shift.endTime}</span>
                                </div>
                                <div className="shift-info">
                                    <div className="shift-stat">
                                        <FaUsers />
                                        <span>{shift.operators} operadores</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
