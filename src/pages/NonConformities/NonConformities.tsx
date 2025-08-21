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
} from "../../components/NonConformitiesComponents/index";
import "./NonConformities.css";
import type {
  NonConformity,
  NonConformityStats,
  NonConformityFilters,
} from "../../types/nonConformities";

export default function NonConformities() {
  const { user } = useAuth();
  const [nonConformities, setNonConformities] = useState<NonConformity[]>([]);
  const [selectedNC, setSelectedNC] = useState<NonConformity | null>(null);
  const [showNewNCModal, setShowNewNCModal] = useState(false);
  const [filters, setFilters] = useState<NonConformityFilters>({
    status: [],
    severity: [],
    priority: [],
    category: [],
    sector: [],
    assignedTo: undefined,
    dateRange: undefined,
  });
  const [newNC, setNewNC] = useState({
    title: "",
    description: "",
    category: "quality" as "quality" | "safety" | "process" | "equipment" | "material",
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
        priority: "high",
        status: "investigating",
        location: {
          sector: "Corte",
          station: "Estação 02",
          equipment: "Serra CNC-001",
        },
        reportedBy: {
          id: "op-001",
          name: "João Silva",
          role: "Operador",
        },
        assignedTo: {
          id: "qc-001",
          name: "Maria Santos",
          role: "Coordenador Qualidade",
        },

        createdAt: "2024-01-20T10:30:00",
        updatedAt: "2024-01-20T11:15:00",
        attachments: [
          "peca_defeituosa.jpg",
          "medicao_dimensional.pdf",
        ],
      },
      {
        id: "NC-2024-002",
        title: "Material com defeito visual",
        description:
          "Identificado risco na matéria-prima recebida. Manchas e riscos visíveis que podem comprometer o acabamento final.",
        category: "material",
        severity: "medium",
        priority: "medium",
        status: "resolved",
        location: {
          sector: "Recebimento",
          station: "Dock 01",
        },
        reportedBy: {
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
          "material_defeituoso.jpg",
        ],
      },
      {
        id: "NC-2024-003",
        title: "Equipamento com ruído anormal",
        description:
          "Compressor apresentando ruído excessivo e vibração. Pode indicar problema mecânico que requer manutenção preventiva.",
        category: "equipment",
        severity: "low",
        priority: "low",
        status: "open",
        location: {
          sector: "Montagem",
          station: "Linha 03",
          equipment: "Compressor CP-005",
        },
        reportedBy: {
          id: "op-003",
          name: "Carlos Mendes",
          role: "Operador",
        },
        createdAt: "2024-01-20T08:15:00",
        updatedAt: "2024-01-20T08:15:00",
        attachments: [],
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
      priority: "medium", // Default priority
      status: "open",
      location: {
        sector: newNC.sector,
        station: newNC.station,
        equipment: newNC.equipment || undefined,
      },
      reportedBy: {
        id: user?.id || "current-user",
        name: user?.name || user?.displayName || "Usuário Atual",
        role: "Operador",
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      attachments: [],
    };

    setNonConformities((prev) => [newNonConformity, ...prev]);
    setShowNewNCModal(false);
    setNewNC({
      title: "",
      description: "",
      category: "quality" as "quality" | "safety" | "process" | "equipment" | "material",
      severity: "medium",
      stopProduction: false,
      sector: "",
      station: "",
      equipment: "",
      relatedTaskId: "",
    });
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
              status: "investigating" as const,
              updatedAt: new Date().toISOString(),
            }
          : nc
      )
    );
  };

  const handleAddComment = (ncId: string, _comment: string) => {
    setNonConformities((prev) =>
      prev.map((nc) =>
        nc.id === ncId
          ? {
              ...nc,
              updatedAt: new Date().toISOString(),
            }
          : nc
      )
    );
  };

  const handleResolveNC = (ncId: string, _resolution: string) => {
    setNonConformities((prev) =>
      prev.map((nc) =>
        nc.id === ncId
          ? {
              ...nc,
              status: "resolved" as const,
              resolvedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
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
      case "investigating":
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
        return "🔍";
      case "safety":
        return "⚠️";
      case "process":
        return "⚙️";
      case "equipment":
        return "🔧";
      case "material":
        return "📦";
      default:
        return "📋";
    }
  };

  const filteredNCs = nonConformities.filter((nc) => {
    if (filters.status && filters.status.length > 0 && !filters.status.includes(nc.status))
      return false;
    if (
      filters.severity && filters.severity.length > 0 &&
      !filters.severity.includes(nc.severity)
    )
      return false;
    if (
      filters.category && filters.category.length > 0 &&
      !filters.category.includes(nc.category)
    )
      return false;
    if (
      filters.sector && filters.sector.length > 0 &&
      !filters.sector.includes(nc.location.sector)
    )
      return false;
    return true;
  });

  // Calcular estatísticas
  const stats: NonConformityStats = {
    total: nonConformities.length,
    open: nonConformities.filter((nc) => nc.status === "open").length,
    investigating: nonConformities.filter((nc) => nc.status === "investigating").length,
    resolved: nonConformities.filter((nc) => nc.status === "resolved").length,
    closed: nonConformities.filter((nc) => nc.status === "closed").length,
    bySeverity: {
      low: nonConformities.filter((nc) => nc.severity === "low").length,
      medium: nonConformities.filter((nc) => nc.severity === "medium").length,
      high: nonConformities.filter((nc) => nc.severity === "high").length,
      critical: nonConformities.filter((nc) => nc.severity === "critical").length,
    },
    byPriority: {
      low: nonConformities.filter((nc) => nc.priority === "low").length,
      medium: nonConformities.filter((nc) => nc.priority === "medium").length,
      high: nonConformities.filter((nc) => nc.priority === "high").length,
      urgent: nonConformities.filter((nc) => nc.priority === "urgent").length,
    },
  };

  const productionStoppedCount = 0; // No stopProduction property in NonConformity type

  return (
    <div className="nc-page">
      <div className="nc-container">
        <NonConformityHeader onNewNCClick={() => setShowNewNCModal(true)} />

        <StatsCards
          stats={stats}
          productionStoppedCount={productionStoppedCount}
        />

        <div className="nc-content">
          <FiltersSection filters={filters} setFilters={setFilters} />

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
