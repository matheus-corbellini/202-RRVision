"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import type { ProductionAlert } from "../../types/alerts";
import {
  AlertsHeader,
  AlertsStats,
  AlertsFilters,
  AlertsList,
  AlertDetailsModal,
} from "../../components/AlertsPanelComponents/index";

import "./AlertsPanel.css";

interface AlertStats {
  total: number;
  active: number;
  acknowledged: number;
  resolved: number;
  dismissed: number;
  bySeverity: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  byPriority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
}

export default function AlertsPanel() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<ProductionAlert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<ProductionAlert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<ProductionAlert | null>(
    null
  );
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [showOnlyMyAlerts, setShowOnlyMyAlerts] = useState(false);

  // Mock data - Em produção viria de WebSocket/API em tempo real
  useEffect(() => {
    const mockAlerts: ProductionAlert[] = [
      {
        id: "alert-001",
        title: "PRODUÇÃO PARADA - Não Conformidade Crítica",
        description:
          "Peças com dimensão fora do padrão detectadas. Produção foi interrompida conforme procedimento. Aguardando análise da qualidade para liberação.",
        severity: "critical",
        priority: "urgent",
        location: {
          sector: "Corte",
          station: "Estação 02",
          equipment: "Serra CNC-001",
        },
        relatedEntity: {
          id: "OP-2024-001",
          name: "Produto A - Modelo X",
        },
        source: {
          id: "op-001",
          name: "João Silva",
        },
        recipients: [
          {
            id: "coord-001",
            name: "Pedro Costa",
            role: "coordinator",
            department: "Produção",
            acknowledged: true,
          },
          {
            id: "qc-001",
            name: "Maria Santos",
            role: "quality",
            department: "Qualidade",
            acknowledged: true,
          },
          {
            id: "eng-001",
            name: "Carlos Oliveira",
            role: "engineering",
            department: "Engenharia",
            acknowledged: false,
          },
        ],
        status: "active",
        createdAt: "2024-01-20T10:30:00",
        acknowledgedAt: "2024-01-20T10:45:00",
        acknowledgedBy: "Pedro Costa",
        tags: ["produção", "qualidade", "crítico"],
        attachments: ["foto_peca_defeituosa.jpg", "medicao_dimensional.pdf"],
        comments: [
          {
            id: "comment-001",
            userName: "João Silva",
            message:
              "Produção interrompida. 5 peças com problema identificadas.",
            timestamp: "2024-01-20T10:30:00",
            type: "comment",
          },
          {
            id: "comment-002",
            userId: "coord-001",
            userName: "Pedro Costa",
            message: "Alerta reconhecido. Acionando equipe de qualidade.",
            timestamp: "2024-01-20T10:45:00",
            type: "status_change",
          },
          {
            id: "comment-003",
            userId: "qc-001",
            userName: "Maria Santos",
            message: "Verificando calibração da máquina. Setup será refeito.",
            timestamp: "2024-01-20T11:15:00",
            type: "comment",
          },
        ],
      },
      {
        id: "alert-002",
        title: "Mudança de Prioridade - Pedido Urgente",
        description:
          "Cliente solicitou antecipação do prazo de entrega. Pedido deve ser priorizado na programação de produção.",
        severity: "medium",
        priority: "high",
        status: "acknowledged",
        source: {
          id: "system",
          name: "Sistema ERP",
        },
        location: {
          sector: "Planejamento",
        },
        relatedEntity: {
          id: "OP-2024-005",
          name: "Produto E - Modelo V",
        },
        recipients: [
          {
            id: "coord-001",
            name: "Pedro Costa",
            role: "coordinator",
            department: "Produção",
            acknowledged: true,
          },
          {
            id: "plan-001",
            name: "Ana Oliveira",
            role: "admin",
            department: "Planejamento",
            acknowledged: false,
          },
        ],
        createdAt: "2024-01-20T14:15:00",
        acknowledgedAt: "2024-01-20T14:20:00",
        acknowledgedBy: "Pedro Costa",
        tags: ["prioridade", "planejamento"],
        attachments: [],
        comments: [
          {
            id: "comment-004",

            userName: "Ana Oliveira",
            message:
              "Alteração solicitada pelo cliente. Prazo reduzido em 2 dias.",
            timestamp: "2024-01-20T14:15:00",
            type: "comment",
          },
        ],
      },
      {
        id: "alert-003",
        title: "Atraso na Produção",
        description:
          "A tarefa de montagem do OP-2024-002 está com atraso de 30 minutos em relação ao planejado. Pode impactar o prazo final do pedido.",
        severity: "medium",
        priority: "medium",
        status: "active",
        source: {
          id: "system",
          name: "Sistema de Monitoramento",
        },
        location: {
          sector: "Montagem",
          station: "Linha 03",
        },
        relatedEntity: {
          id: "task-002",
          name: "Montagem Principal",
        },
        recipients: [
          {
            id: "coord-001",
            name: "Pedro Costa",
            role: "coordinator",
            department: "Produção",
            acknowledged: false,
          },
        ],
        createdAt: "2024-01-20T15:30:00",
        tags: ["atraso", "montagem"],
        attachments: [],
        comments: [],
      },
      {
        id: "alert-004",
        title: "Material em Falta",
        description:
          "Componente XYZ-123 está com estoque abaixo do mínimo. Pode impactar a produção dos próximos pedidos se não for reposto.",
        severity: "high",
        priority: "high",
        status: "acknowledged",
        source: {
          id: "system",
          name: "Sistema de Estoque",
        },
        location: {
          sector: "Almoxarifado",
        },
        relatedEntity: {
          id: "mat-123",
          name: "Componente XYZ-123",
        },
        recipients: [
          {
            id: "wh-001",
            name: "Roberto Lima",
            role: "warehouse",
            department: "Almoxarifado",

            acknowledged: true,

          },
          {
            id: "coord-001",
            name: "Pedro Costa",
            role: "coordinator",
            department: "Produção",
            acknowledged: false,
          },
        ],
        createdAt: "2024-01-20T09:00:00",
        acknowledgedAt: "2024-01-20T09:15:00",
        acknowledgedBy: "Roberto Lima",
        tags: ["material", "estoque"],
        attachments: [],
        comments: [
          {
            id: "comment-005",
            userId: "wh-001",
            userName: "Roberto Lima",
            message:
              "Pedido de compra já foi enviado ao fornecedor. Previsão de entrega: 2 dias.",
            timestamp: "2024-01-20T09:15:00",
            type: "comment",
          },
        ],
      },
      {
        id: "alert-005",
        title: "Manutenção Preventiva Agendada",
        description:
          "Manutenção preventiva do equipamento CNC-002 agendada para amanhã às 08:00. Produção deve ser reprogramada.",
        severity: "medium",
        priority: "medium",
        status: "active",
        source: {
          id: "system",
          name: "Sistema de Manutenção",
        },
        location: {
          sector: "Corte",
          equipment: "CNC-002",
        },
        relatedEntity: {
          id: "eq-002",
          name: "Serra CNC-002",
        },
        recipients: [
          {
            id: "coord-001",
            name: "Pedro Costa",
            role: "coordinator",
            department: "Produção",

            acknowledged: false,
          },
          {
            id: "maint-001",
            name: "José Santos",
            role: "engineering",
            department: "Manutenção",

            acknowledged: true,
          },
        ],
        createdAt: "2024-01-20T16:00:00",
        acknowledgedAt: "2024-01-20T16:00:00",
        acknowledgedBy: "José Santos",
        tags: ["manutenção", "preventiva"],
        attachments: [],
        comments: [],
      },
    ];

    setAlerts(mockAlerts);
    setFilteredAlerts(mockAlerts);
  }, []);

  // Filtrar alertas
  useEffect(() => {
    let filtered = [...alerts];

    if (filterType !== "all") {
      filtered = filtered.filter((alert) => alert.severity === filterType);
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((alert) => alert.status === filterStatus);
    }

    if (filterSeverity !== "all") {
      filtered = filtered.filter((alert) => alert.severity === filterSeverity);
    }

    if (filterPriority !== "all") {
      filtered = filtered.filter((alert) => alert.priority === filterPriority);
    }

    if (showOnlyMyAlerts && user) {
      filtered = filtered.filter(
        (alert) =>
          alert.recipients.some((recipient) => recipient.id === user.id) ||
          alert.source.id === user.id
      );
    }

    // Ordenar por prioridade e data
    filtered.sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      const priorityDiff =
        priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    setFilteredAlerts(filtered);
  }, [
    alerts,
    filterType,
    filterStatus,
    filterSeverity,
    filterPriority,
    showOnlyMyAlerts,
    user,
  ]);

  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId
          ? {
              ...alert,
              status: "acknowledged" as const,
              acknowledgedAt: new Date().toISOString(),
              acknowledgedBy:
                user?.name || user?.displayName || "Usuário Atual",
              recipients: alert.recipients.map((recipient) =>
                recipient.id === user?.id
                  ? {
                      ...recipient,
                      acknowledged: true,
                    }
                  : recipient
              ),
            }
          : alert
      )
    );
  };

  const handleResolveAlert = (alertId: string, resolution: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId
          ? {
              ...alert,
              status: "resolved" as const,
              resolvedAt: new Date().toISOString(),
              resolvedBy: user?.name || user?.displayName || "Usuário Atual",
              comments: [
                ...(alert.comments || []),
                {
                  id: `comment-${Date.now()}`,
                  userId: user?.id || "current-user",
                  userName: user?.name || user?.displayName || "Usuário Atual",
                  message: `Alerta resolvido: ${resolution}`,
                  timestamp: new Date().toISOString(),
                  type: "status_change" as const,
                },
              ],
            }
          : alert
      )
    );
  };

  const handleAddComment = (alertId: string, comment: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId
          ? {
              ...alert,
              comments: [
                ...(alert.comments || []),
                {
                  id: `comment-${Date.now()}`,
                  userId: user?.id || "current-user",
                  userName: user?.name || user?.displayName || "Usuário Atual",
                  message: comment,
                  timestamp: new Date().toISOString(),
                  type: "comment" as const,
                },
              ],
            }
          : alert
      )
    );
  };

  const getAlertStats = (): AlertStats => {
    const total = alerts.length;
    const active = alerts.filter((a) => a.status === "active").length;
    const acknowledged = alerts.filter((a) => a.status === "acknowledged").length;
    const resolved = alerts.filter((a) => a.status === "resolved").length;
    const dismissed = alerts.filter((a) => a.status === "dismissed").length;
    
    const bySeverity = {
      low: alerts.filter((a) => a.severity === "low").length,
      medium: alerts.filter((a) => a.severity === "medium").length,
      high: alerts.filter((a) => a.severity === "high").length,
      critical: alerts.filter((a) => a.severity === "critical").length,
    };
    
    const byPriority = {
      low: alerts.filter((a) => a.priority === "low").length,
      medium: alerts.filter((a) => a.priority === "medium").length,
      high: alerts.filter((a) => a.priority === "high").length,
      urgent: alerts.filter((a) => a.priority === "urgent").length,
    };

    return { 
      total, 
      active, 
      acknowledged, 
      resolved, 
      dismissed, 
      bySeverity, 
      byPriority 
    };
  };

  return (
    <div className="alerts-page">
      <div className="alerts-container">
        <AlertsHeader />

        <AlertsStats stats={getAlertStats()} />

        <AlertsFilters
          filterType={filterType}
          setFilterType={setFilterType}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          filterSeverity={filterSeverity}
          setFilterSeverity={setFilterSeverity}
          filterPriority={filterPriority}
          setFilterPriority={setFilterPriority}
          showOnlyMyAlerts={showOnlyMyAlerts}
          setShowOnlyMyAlerts={setShowOnlyMyAlerts}
        />

        <AlertsList
          alerts={filteredAlerts}
          onSelectAlert={setSelectedAlert}
          onAcknowledgeAlert={handleAcknowledgeAlert}
          currentUserId={user?.id}
        />

        <AlertDetailsModal
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
          onAcknowledge={handleAcknowledgeAlert}
          onResolve={handleResolveAlert}
          onAddComment={handleAddComment}
          currentUserId={user?.id}
        />
      </div>
    </div>
  );
}
