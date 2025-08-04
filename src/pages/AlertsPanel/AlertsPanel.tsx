"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import type { ProductionAlert, AlertStats } from "../../types";
import {
  AlertsHeader,
  AlertsStats,
  AlertsFilters,
  AlertsList,
  AlertDetailsModal,
} from "./components";

import "./AlertsPanel.css";

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
        type: "production_stop",
        severity: "critical",
        title: "PRODUÇÃO PARADA - Não Conformidade Crítica",
        message:
          "Produção interrompida devido a não conformidade crítica no setor de Corte",
        description:
          "Peças com dimensão fora do padrão detectadas. Produção foi interrompida conforme procedimento. Aguardando análise da qualidade para liberação.",
        source: {
          type: "operator",
          id: "op-001",
          name: "João Silva",
        },
        location: {
          sector: "Corte",
          station: "Estação 02",
          equipment: "Serra CNC-001",
        },
        relatedEntity: {
          type: "order",
          id: "OP-2024-001",
          name: "Produto A - Modelo X",
        },
        recipients: [
          {
            id: "coord-001",
            name: "Pedro Costa",
            role: "coordinator",
            department: "Produção",
            notificationMethods: ["push", "sms", "email"],
            acknowledged: true,
            acknowledgedAt: "2024-01-20T10:45:00",
          },
          {
            id: "qc-001",
            name: "Maria Santos",
            role: "quality",
            department: "Qualidade",
            notificationMethods: ["push", "email"],
            acknowledged: true,
            acknowledgedAt: "2024-01-20T10:47:00",
          },
          {
            id: "eng-001",
            name: "Carlos Oliveira",
            role: "engineering",
            department: "Engenharia",
            notificationMethods: ["push", "email"],
            acknowledged: false,
          },
        ],
        status: "in_progress",
        priority: "urgent",
        createdAt: "2024-01-20T10:30:00",
        updatedAt: "2024-01-20T11:15:00",
        acknowledgedAt: "2024-01-20T10:45:00",
        acknowledgedBy: "Pedro Costa",
        escalationLevel: 1,
        autoEscalation: true,
        tags: ["produção", "qualidade", "crítico"],
        attachments: ["foto_peca_defeituosa.jpg", "medicao_dimensional.pdf"],
        comments: [
          {
            id: "comment-001",
            userId: "op-001",
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
        type: "priority_change",
        severity: "high",
        title: "Mudança de Prioridade - Pedido Urgente",
        message: "Pedido OP-2024-005 alterado para prioridade URGENTE",
        description:
          "Cliente solicitou antecipação do prazo de entrega. Pedido deve ser priorizado na programação de produção.",
        source: {
          type: "system",
          id: "system",
          name: "Sistema ERP",
        },
        location: {
          sector: "Planejamento",
        },
        relatedEntity: {
          type: "order",
          id: "OP-2024-005",
          name: "Produto E - Modelo V",
        },
        recipients: [
          {
            id: "coord-001",
            name: "Pedro Costa",
            role: "coordinator",
            department: "Produção",
            notificationMethods: ["push", "email"],
            acknowledged: true,
            acknowledgedAt: "2024-01-20T14:20:00",
          },
          {
            id: "plan-001",
            name: "Ana Oliveira",
            role: "admin",
            department: "Planejamento",
            notificationMethods: ["push", "email"],
            acknowledged: false,
          },
        ],
        status: "acknowledged",
        priority: "high",
        createdAt: "2024-01-20T14:15:00",
        updatedAt: "2024-01-20T14:20:00",
        acknowledgedAt: "2024-01-20T14:20:00",
        acknowledgedBy: "Pedro Costa",
        escalationLevel: 0,
        autoEscalation: false,
        tags: ["prioridade", "planejamento"],
        attachments: [],
        comments: [
          {
            id: "comment-004",
            userId: "plan-001",
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
        type: "delay",
        severity: "medium",
        title: "Atraso na Produção",
        message: "Tarefa de montagem está 30 minutos atrasada",
        description:
          "A tarefa de montagem do OP-2024-002 está com atraso de 30 minutos em relação ao planejado. Pode impactar o prazo final do pedido.",
        source: {
          type: "system",
          id: "system",
          name: "Sistema de Monitoramento",
        },
        location: {
          sector: "Montagem",
          station: "Linha 03",
        },
        relatedEntity: {
          type: "task",
          id: "task-002",
          name: "Montagem Principal",
        },
        recipients: [
          {
            id: "coord-001",
            name: "Pedro Costa",
            role: "coordinator",
            department: "Produção",
            notificationMethods: ["push"],
            acknowledged: false,
          },
        ],
        status: "active",
        priority: "medium",
        createdAt: "2024-01-20T15:30:00",
        updatedAt: "2024-01-20T15:30:00",
        escalationLevel: 0,
        autoEscalation: true,
        tags: ["atraso", "montagem"],
        attachments: [],
        comments: [],
      },
      {
        id: "alert-004",
        type: "material",
        severity: "high",
        title: "Material em Falta",
        message: "Estoque baixo de componente crítico",
        description:
          "Componente XYZ-123 está com estoque abaixo do mínimo. Pode impactar a produção dos próximos pedidos se não for reposto.",
        source: {
          type: "system",
          id: "system",
          name: "Sistema de Estoque",
        },
        location: {
          sector: "Almoxarifado",
        },
        relatedEntity: {
          type: "material",
          id: "mat-123",
          name: "Componente XYZ-123",
        },
        recipients: [
          {
            id: "wh-001",
            name: "Roberto Lima",
            role: "warehouse",
            department: "Almoxarifado",
            notificationMethods: ["push", "email"],
            acknowledged: true,
            acknowledgedAt: "2024-01-20T09:15:00",
          },
          {
            id: "coord-001",
            name: "Pedro Costa",
            role: "coordinator",
            department: "Produção",
            notificationMethods: ["push"],
            acknowledged: false,
          },
        ],
        status: "acknowledged",
        priority: "high",
        createdAt: "2024-01-20T09:00:00",
        updatedAt: "2024-01-20T09:15:00",
        acknowledgedAt: "2024-01-20T09:15:00",
        acknowledgedBy: "Roberto Lima",
        escalationLevel: 0,
        autoEscalation: true,
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
        type: "maintenance",
        severity: "medium",
        title: "Manutenção Preventiva Agendada",
        message: "Equipamento CNC-002 agendado para manutenção",
        description:
          "Manutenção preventiva do equipamento CNC-002 agendada para amanhã às 08:00. Produção deve ser reprogramada.",
        source: {
          type: "system",
          id: "system",
          name: "Sistema de Manutenção",
        },
        location: {
          sector: "Corte",
          equipment: "CNC-002",
        },
        relatedEntity: {
          type: "equipment",
          id: "eq-002",
          name: "Serra CNC-002",
        },
        recipients: [
          {
            id: "coord-001",
            name: "Pedro Costa",
            role: "coordinator",
            department: "Produção",
            notificationMethods: ["push", "email"],
            acknowledged: false,
          },
          {
            id: "maint-001",
            name: "José Santos",
            role: "engineering",
            department: "Manutenção",
            notificationMethods: ["push", "email"],
            acknowledged: true,
            acknowledgedAt: "2024-01-20T16:00:00",
          },
        ],
        status: "acknowledged",
        priority: "medium",
        createdAt: "2024-01-20T16:00:00",
        updatedAt: "2024-01-20T16:00:00",
        acknowledgedAt: "2024-01-20T16:00:00",
        acknowledgedBy: "José Santos",
        escalationLevel: 0,
        autoEscalation: false,
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
      filtered = filtered.filter((alert) => alert.type === filterType);
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
          alert.recipients.some((recipient) => recipient.id === user.uid) ||
          alert.source.id === user.uid
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
              updatedAt: new Date().toISOString(),
              recipients: alert.recipients.map((recipient) =>
                recipient.id === user?.uid
                  ? {
                      ...recipient,
                      acknowledged: true,
                      acknowledgedAt: new Date().toISOString(),
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
              updatedAt: new Date().toISOString(),
              comments: [
                ...alert.comments,
                {
                  id: `comment-${Date.now()}`,
                  userId: user?.uid || "current-user",
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
              updatedAt: new Date().toISOString(),
              comments: [
                ...alert.comments,
                {
                  id: `comment-${Date.now()}`,
                  userId: user?.uid || "current-user",
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
    const active = alerts.filter((a) => a.status === "active").length;
    const critical = alerts.filter((a) => a.severity === "critical").length;
    const urgent = alerts.filter((a) => a.priority === "urgent").length;
    const unacknowledged = alerts.filter(
      (a) =>
        a.status === "active" &&
        a.recipients.some((r) => r.id === user?.uid && !r.acknowledged)
    ).length;

    return { active, critical, urgent, unacknowledged, total: alerts.length };
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
          currentUserId={user?.uid}
        />

        <AlertDetailsModal
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
          onAcknowledge={handleAcknowledgeAlert}
          onResolve={handleResolveAlert}
          onAddComment={handleAddComment}
          currentUserId={user?.uid}
        />
      </div>
    </div>
  );
}
