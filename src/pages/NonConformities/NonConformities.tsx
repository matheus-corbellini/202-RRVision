"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import {
  NonConformityHeader,
  StatsCards,
  FiltersSection,
  NonConformityCard,
  NewNCModal,
  NCDetailsModal,
} from "./components";
import "./NonConformities.css";
import {
  FaSearch,
  FaExclamationTriangle,
  FaCog,
  FaWrench,
  FaBox,
  FaClipboardList,
} from "react-icons/fa";

interface NonConformity {
  id: string;
  title: string;
  description: string;
  category: "quality" | "safety" | "process" | "equipment" | "material";
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "in_progress" | "resolved" | "closed";
  stopProduction: boolean;
  location: {
    sector: string;
    station: string;
    equipment?: string;
  };
  reporter: {
    id: string;
    name: string;
    role: string;
  };
  assignedTo?: {
    id: string;
    name: string;
    role: string;
  };
  relatedTask?: {
    taskId: string;
    taskName: string;
    orderId: string;
  };
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  attachments: Attachment[];
  actions: NonConformityAction[];
  alerts: Alert[];
}

interface Attachment {
  id: string;
  name: string;
  type: "image" | "document" | "video";
  url: string;
  uploadedAt: string;
  uploadedBy: string;
}

interface NonConformityAction {
  id: string;
  type:
    | "comment"
    | "status_change"
    | "assignment"
    | "attachment"
    | "resolution";
  description: string;
  performedBy: {
    id: string;
    name: string;
    role: string;
  };
  timestamp: string;
  details?: Record<string, unknown>;
}

interface Alert {
  id: string;
  type: "coordinator" | "quality" | "warehouse" | "engineering" | "admin";
  recipient: string;
  message: string;
  sentAt: string;
  acknowledged: boolean;
}

export default function NonConformities() {
  const { user } = useAuth();
  const [nonConformities, setNonConformities] = useState<NonConformity[]>([]);
  const [selectedNC, setSelectedNC] = useState<NonConformity | null>(null);
  const [showNewNCModal, setShowNewNCModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [newNC, setNewNC] = useState({
    title: "",
    description: "",
    category: "quality" as NonConformity["category"],
    severity: "medium" as NonConformity["severity"],
    stopProduction: false,
    sector: "",
    station: "",
    equipment: "",
    relatedTaskId: "",
  });

  // Mock data
  useEffect(() => {
    const mockNonConformities: NonConformity[] = [
      {
        id: "NC-2024-001",
        title: "Peça com dimensão fora do padrão",
        description:
          "Durante a inspeção de qualidade, foi identificado que 5 peças estão com dimensões 2mm acima do especificado no desenho técnico. Possível problema no setup da máquina de corte.",
        category: "quality",
        severity: "high",
        status: "in_progress",
        stopProduction: true,
        location: {
          sector: "Corte",
          station: "Estação 02",
          equipment: "Serra CNC-001",
        },
        reporter: {
          id: "op-001",
          name: "João Silva",
          role: "Operador",
        },
        assignedTo: {
          id: "qc-001",
          name: "Maria Santos",
          role: "Coordenador Qualidade",
        },
        relatedTask: {
          taskId: "task-001",
          taskName: "Corte de Peças",
          orderId: "OP-2024-001",
        },
        createdAt: "2024-01-20T10:30:00",
        updatedAt: "2024-01-20T11:15:00",
        attachments: [
          {
            id: "att-001",
            name: "peca_defeituosa.jpg",
            type: "image",
            url: "/placeholder.svg?height=200&width=300",
            uploadedAt: "2024-01-20T10:35:00",
            uploadedBy: "João Silva",
          },
          {
            id: "att-002",
            name: "medicao_dimensional.pdf",
            type: "document",
            url: "#",
            uploadedAt: "2024-01-20T10:40:00",
            uploadedBy: "João Silva",
          },
        ],
        actions: [
          {
            id: "act-001",
            type: "comment",
            description:
              "Produção interrompida conforme procedimento. Aguardando análise da qualidade.",
            performedBy: {
              id: "op-001",
              name: "João Silva",
              role: "Operador",
            },
            timestamp: "2024-01-20T10:30:00",
          },
          {
            id: "act-002",
            type: "assignment",
            description: "Não conformidade atribuída para análise",
            performedBy: {
              id: "coord-001",
              name: "Pedro Costa",
              role: "Coordenador Produção",
            },
            timestamp: "2024-01-20T10:45:00",
          },
          {
            id: "act-003",
            type: "comment",
            description:
              "Verificando calibração da máquina. Setup será refeito.",
            performedBy: {
              id: "qc-001",
              name: "Maria Santos",
              role: "Coordenador Qualidade",
            },
            timestamp: "2024-01-20T11:15:00",
          },
        ],
        alerts: [
          {
            id: "alert-001",
            type: "coordinator",
            recipient: "Pedro Costa",
            message: "Nova não conformidade crítica - Produção parada",
            sentAt: "2024-01-20T10:30:00",
            acknowledged: true,
          },
          {
            id: "alert-002",
            type: "quality",
            recipient: "Maria Santos",
            message: "Não conformidade de qualidade requer análise imediata",
            sentAt: "2024-01-20T10:31:00",
            acknowledged: true,
          },
          {
            id: "alert-003",
            type: "engineering",
            recipient: "Carlos Oliveira",
            message: "Possível problema técnico no equipamento CNC-001",
            sentAt: "2024-01-20T10:32:00",
            acknowledged: false,
          },
        ],
      },
      {
        id: "NC-2024-002",
        title: "Material com defeito visual",
        description:
          "Identificado risco na matéria-prima recebida. Manchas e riscos visíveis que podem comprometer o acabamento final.",
        category: "material",
        severity: "medium",
        status: "resolved",
        stopProduction: false,
        location: {
          sector: "Recebimento",
          station: "Dock 01",
        },
        reporter: {
          id: "op-002",
          name: "Ana Oliveira",
          role: "Operador",
        },
        assignedTo: {
          id: "wh-001",
          name: "Roberto Lima",
          role: "Supervisor Almoxarifado",
        },
        createdAt: "2024-01-19T14:20:00",
        updatedAt: "2024-01-19T16:45:00",
        resolvedAt: "2024-01-19T16:45:00",
        attachments: [
          {
            id: "att-003",
            name: "material_defeituoso.jpg",
            type: "image",
            url: "/placeholder.svg?height=200&width=300",
            uploadedAt: "2024-01-19T14:25:00",
            uploadedBy: "Ana Oliveira",
          },
        ],
        actions: [
          {
            id: "act-004",
            type: "comment",
            description:
              "Material segregado para análise. Produção continua com estoque reserva.",
            performedBy: {
              id: "op-002",
              name: "Ana Oliveira",
              role: "Operador",
            },
            timestamp: "2024-01-19T14:20:00",
          },
          {
            id: "act-005",
            type: "resolution",
            description:
              "Material devolvido ao fornecedor. Lote substituto aprovado pela qualidade.",
            performedBy: {
              id: "wh-001",
              name: "Roberto Lima",
              role: "Supervisor Almoxarifado",
            },
            timestamp: "2024-01-19T16:45:00",
          },
        ],
        alerts: [
          {
            id: "alert-004",
            type: "warehouse",
            recipient: "Roberto Lima",
            message: "Material com não conformidade - Verificar fornecedor",
            sentAt: "2024-01-19T14:21:00",
            acknowledged: true,
          },
        ],
      },
      {
        id: "NC-2024-003",
        title: "Equipamento com ruído anormal",
        description:
          "Compressor apresentando ruído excessivo e vibração. Pode indicar problema mecânico que requer manutenção preventiva.",
        category: "equipment",
        severity: "low",
        status: "open",
        stopProduction: false,
        location: {
          sector: "Montagem",
          station: "Linha 03",
          equipment: "Compressor CP-005",
        },
        reporter: {
          id: "op-003",
          name: "Carlos Mendes",
          role: "Operador",
        },
        createdAt: "2024-01-20T08:15:00",
        updatedAt: "2024-01-20T08:15:00",
        attachments: [],
        actions: [
          {
            id: "act-006",
            type: "comment",
            description:
              "Equipamento funcionando mas com ruído anormal. Solicitando verificação da manutenção.",
            performedBy: {
              id: "op-003",
              name: "Carlos Mendes",
              role: "Operador",
            },
            timestamp: "2024-01-20T08:15:00",
          },
        ],
        alerts: [
          {
            id: "alert-005",
            type: "engineering",
            recipient: "Equipe Manutenção",
            message: "Equipamento requer verificação - Ruído anormal",
            sentAt: "2024-01-20T08:16:00",
            acknowledged: false,
          },
        ],
      },
    ];

    setNonConformities(mockNonConformities);
  }, []);

  const handleCreateNC = () => {
    const newNonConformity: NonConformity = {
      id: `NC-2024-${String(nonConformities.length + 1).padStart(3, "0")}`,
      title: newNC.title,
      description: newNC.description,
      category: newNC.category,
      severity: newNC.severity,
      status: "open",
      stopProduction: newNC.stopProduction,
      location: {
        sector: newNC.sector,
        station: newNC.station,
        equipment: newNC.equipment || undefined,
      },
      reporter: {
        id: user?.uid || "current-user",
        name: user?.name || user?.displayName || "Usuário Atual",
        role: "Operador",
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      attachments: [],
      actions: [
        {
          id: `act-${Date.now()}`,
          type: "comment",
          description: `Não conformidade registrada${
            newNC.stopProduction ? " - Produção interrompida" : ""
          }`,
          performedBy: {
            id: user?.uid || "current-user",
            name: user?.name || user?.displayName || "Usuário Atual",
            role: "Operador",
          },
          timestamp: new Date().toISOString(),
        },
      ],
      alerts: generateAlerts(
        newNC.category,
        newNC.severity,
        newNC.stopProduction
      ),
    };

    setNonConformities((prev) => [newNonConformity, ...prev]);
    setShowNewNCModal(false);
    setNewNC({
      title: "",
      description: "",
      category: "quality",
      severity: "medium",
      stopProduction: false,
      sector: "",
      station: "",
      equipment: "",
      relatedTaskId: "",
    });
  };

  const generateAlerts = (
    category: string,
    severity: string,
    stopProduction: boolean
  ): Alert[] => {
    const alerts: Alert[] = [];
    const timestamp = new Date().toISOString();

    // Sempre alerta coordenador de produção
    alerts.push({
      id: `alert-${Date.now()}-1`,
      type: "coordinator",
      recipient: "Coordenador Produção",
      message: `Nova não conformidade ${severity}${
        stopProduction ? " - Produção parada" : ""
      }`,
      sentAt: timestamp,
      acknowledged: false,
    });

    // Alertas específicos por categoria
    switch (category) {
      case "quality":
        alerts.push({
          id: `alert-${Date.now()}-2`,
          type: "quality",
          recipient: "Coordenador Qualidade",
          message: "Não conformidade de qualidade requer análise",
          sentAt: timestamp,
          acknowledged: false,
        });
        break;
      case "material":
        alerts.push({
          id: `alert-${Date.now()}-3`,
          type: "warehouse",
          recipient: "Supervisor Almoxarifado",
          message: "Problema com material - Verificar fornecedor",
          sentAt: timestamp,
          acknowledged: false,
        });
        break;
      case "equipment":
        alerts.push({
          id: `alert-${Date.now()}-4`,
          type: "engineering",
          recipient: "Equipe Manutenção",
          message: "Equipamento com problema - Verificação necessária",
          sentAt: timestamp,
          acknowledged: false,
        });
        break;
    }

    return alerts;
  };

  const handleAssignNC = (
    ncId: string,
    assigneeId: string,
    assigneeName: string,
    assigneeRole: string
  ) => {
    setNonConformities((prev) =>
      prev.map((nc) =>
        nc.id === ncId
          ? {
              ...nc,
              assignedTo: {
                id: assigneeId,
                name: assigneeName,
                role: assigneeRole,
              },
              status: "in_progress" as const,
              updatedAt: new Date().toISOString(),
              actions: [
                ...nc.actions,
                {
                  id: `act-${Date.now()}`,
                  type: "assignment",
                  description: `Atribuído para ${assigneeName}`,
                  performedBy: {
                    id: user?.uid || "current-user",
                    name: user?.name || user?.displayName || "Usuário Atual",
                    role: "Coordenador",
                  },
                  timestamp: new Date().toISOString(),
                },
              ],
            }
          : nc
      )
    );
  };

  const handleAddComment = (ncId: string, comment: string) => {
    setNonConformities((prev) =>
      prev.map((nc) =>
        nc.id === ncId
          ? {
              ...nc,
              updatedAt: new Date().toISOString(),
              actions: [
                ...nc.actions,
                {
                  id: `act-${Date.now()}`,
                  type: "comment",
                  description: comment,
                  performedBy: {
                    id: user?.uid || "current-user",
                    name: user?.name || user?.displayName || "Usuário Atual",
                    role: "Operador",
                  },
                  timestamp: new Date().toISOString(),
                },
              ],
            }
          : nc
      )
    );
  };

  const handleResolveNC = (ncId: string, resolution: string) => {
    setNonConformities((prev) =>
      prev.map((nc) =>
        nc.id === ncId
          ? {
              ...nc,
              status: "resolved" as const,
              resolvedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              actions: [
                ...nc.actions,
                {
                  id: `act-${Date.now()}`,
                  type: "resolution",
                  description: resolution,
                  performedBy: {
                    id: user?.uid || "current-user",
                    name: user?.name || user?.displayName || "Usuário Atual",
                    role: "Responsável",
                  },
                  timestamp: new Date().toISOString(),
                },
              ],
            }
          : nc
      )
    );
  };

  const getSeverityColor = (severity: NonConformity["severity"]) => {
    switch (severity) {
      case "low":
        return "#48bb78";
      case "medium":
        return "#fbb040";
      case "high":
        return "#f56565";
      case "critical":
        return "#e53e3e";
      default:
        return "#4a5568";
    }
  };

  const getStatusColor = (status: NonConformity["status"]) => {
    switch (status) {
      case "open":
        return "#f56565";
      case "in_progress":
        return "#fbb040";
      case "resolved":
        return "#48bb78";
      case "closed":
        return "#4a5568";
      default:
        return "#4a5568";
    }
  };

  const getCategoryIcon = (category: NonConformity["category"]) => {
    switch (category) {
      case "quality":
        return <FaSearch />;
      case "safety":
        return <FaExclamationTriangle />;
      case "process":
        return <FaCog />;
      case "equipment":
        return <FaWrench />;
      case "material":
        return <FaBox />;
      default:
        return <FaClipboardList />;
    }
  };

  const filteredNCs = nonConformities.filter((nc) => {
    if (filterStatus !== "all" && nc.status !== filterStatus) return false;
    if (filterSeverity !== "all" && nc.severity !== filterSeverity)
      return false;
    if (filterCategory !== "all" && nc.category !== filterCategory)
      return false;
    return true;
  });

  const openNCs = nonConformities.filter(
    (nc) => nc.status === "open" || nc.status === "in_progress"
  );
  const criticalNCs = nonConformities.filter(
    (nc) => nc.severity === "critical" || nc.severity === "high"
  );
  const productionStoppedNCs = nonConformities.filter(
    (nc) => nc.stopProduction && nc.status !== "resolved"
  );

  return (
    <div className="nc-page">
      <div className="nc-container">
        <NonConformityHeader onNewNCClick={() => setShowNewNCModal(true)} />

        <StatsCards
          openCount={openNCs.length}
          criticalCount={criticalNCs.length}
          productionStoppedCount={productionStoppedNCs.length}
          totalCount={nonConformities.length}
        />

        <div className="nc-content">
          <FiltersSection
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            filterSeverity={filterSeverity}
            setFilterSeverity={setFilterSeverity}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
          />

          <div className="nc-list">
            {filteredNCs.map((nc) => (
              <NonConformityCard
                key={nc.id}
                nc={nc}
                onViewDetails={(selectedNonConformity) =>
                  setSelectedNC(selectedNonConformity as NonConformity)
                }
                onAssign={handleAssignNC}
                getSeverityColor={getSeverityColor}
                getStatusColor={getStatusColor}
                getCategoryIcon={getCategoryIcon}
              />
            ))}
          </div>
        </div>

        <NewNCModal
          showModal={showNewNCModal}
          onClose={() => setShowNewNCModal(false)}
          onSubmit={handleCreateNC}
          newNC={newNC}
          setNewNC={setNewNC}
        />

        <NCDetailsModal
          selectedNC={selectedNC}
          onClose={() => setSelectedNC(null)}
          onAssign={handleAssignNC}
          onAddComment={handleAddComment}
          onResolve={handleResolveNC}
          getSeverityColor={getSeverityColor}
          getStatusColor={getStatusColor}
        />
      </div>
    </div>
  );
}
