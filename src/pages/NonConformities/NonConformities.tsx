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
          sectorId: "corte-001",
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
        attachments: [
          {
            id: "att-001",
            fileName: "peca_defeituosa.jpg",
            fileType: "image/jpeg",
            fileSize: 1024000,
            uploadedAt: "2024-01-20T10:30:00",
            uploadedBy: "op-001",
            url: "/attachments/peca_defeituosa.jpg",
            category: "photo"
          },
          {
            id: "att-002",
            fileName: "medicao_dimensional.pdf",
            fileType: "application/pdf",
            fileSize: 512000,
            uploadedAt: "2024-01-20T10:30:00",
            uploadedBy: "op-001",
            url: "/attachments/medicao_dimensional.pdf",
            category: "document"
          },
        ],
        stopProduction: false,
        requiresImmediateAction: true,
        escalationLevel: "supervisor",
        createdAt: "2024-01-20T08:00:00",
        updatedAt: "2024-01-20T08:00:00",
        createdBy: "user-001",
        updatedBy: "user-001",
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
          sectorId: "recebimento-001",
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
        resolvedAt: "2024-01-19T16:45:00",
        attachments: [
          {
            id: "att-003",
            fileName: "material_defeituoso.jpg",
            fileType: "image/jpeg",
            fileSize: 2048000,
            uploadedAt: "2024-01-19T14:20:00",
            uploadedBy: "op-002",
            url: "/attachments/material_defeituoso.jpg",
            category: "photo"
          },
        ],
        stopProduction: false,
        requiresImmediateAction: false,
        escalationLevel: "none",
        createdAt: "2024-01-19T14:00:00",
        updatedAt: "2024-01-19T14:00:00",
        createdBy: "user-002",
        updatedBy: "user-002",
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
          sectorId: "montagem-001",
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
        createdBy: "user-003",
        updatedBy: "user-003",
        attachments: [],
        stopProduction: false,
        requiresImmediateAction: false,
        escalationLevel: "none",
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
        sectorId: "default-sector-id", // TODO: Get actual sector ID
        station: newNC.station,
        equipment: newNC.equipment || undefined,
      },
      reportedBy: {
        id: user?.id || "current-user",
        name: user?.name || user?.displayName || "Usuário Atual",
        role: "Operador",
      },
      attachments: [],
      stopProduction: false,
      requiresImmediateAction: false,
      escalationLevel: "none",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: "current-user",
      updatedBy: "current-user",
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
    byCategory: {
      quality: nonConformities.filter((nc) => nc.category === "quality").length,
      safety: nonConformities.filter((nc) => nc.category === "safety").length,
      process: nonConformities.filter((nc) => nc.category === "process").length,
      equipment: nonConformities.filter((nc) => nc.category === "equipment").length,
      material: nonConformities.filter((nc) => nc.category === "material").length,
    },
    bySector: nonConformities.reduce((acc, nc) => {
      acc[nc.location.sector] = (acc[nc.location.sector] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    productionStopped: nonConformities.filter((nc) => nc.stopProduction).length,
    requiresImmediateAction: nonConformities.filter((nc) => nc.requiresImmediateAction).length,
  };



  return (
    <div className="nc-page">
      <div className="nc-container">
        <NonConformityHeader onNewNCClick={() => setShowNewNCModal(true)} />

        <StatsCards
          stats={stats}
          productionStoppedCount={stats.productionStopped}
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
