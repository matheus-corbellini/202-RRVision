"use client";

import { useState, useEffect } from "react";
import {
  ControlPanelHeader,
  StatusSemaphore,
  PendenciesPanel,
  AlertsOverview,
  NonConformity,
  QuickActions,
} from "../../components/ControlPanelComponents/index";
import "./ControlPanel.css";
import type { ControlPanelData } from "../../types/dashboard";
import type { ProductionAlert } from "../../types/alerts";
import type { Pendency } from "../../types/pendencies";
import type { NonConformityStats } from "../../types/nonConformities";

export default function ControlPanel() {
  const [data, setData] = useState<ControlPanelData>({
    generalStatus: "green",
    activeOrders: 0,
    urgentOrders: 0,
    blockedOrders: 0,
    pendencies: [],
    alerts: [],
    nonConformities: {
      open: 0,
      inProgress: 0,
      resolved: 0,
      critical: 0,
      total: 0,
    },
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento de dados em tempo real
    const loadData = () => {
      const mockData: ControlPanelData = {
        generalStatus:
          Math.random() > 0.7
            ? "red"
            : Math.random() > 0.4
            ? "yellow"
            : "green",
        activeOrders: Math.floor(Math.random() * 50) + 20,
        urgentOrders: Math.floor(Math.random() * 10) + 2,
        blockedOrders: Math.floor(Math.random() * 5),
        pendencies: [
          {
            id: "1",
            type: "urgent",
            title: "Atraso na Produção",
            description: "Pedido #1234 com 2 horas de atraso",
            sector: "Montagem",
            timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
            status: "open",
            priority: "urgent",
            category: "process",
            location: {
              sector: "Montagem",
              station: "Estação 1",
            },
            createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
            updatedAt: new Date(Date.now() - 30 * 60000).toISOString(),
            attachments: [],
            comments: [],
          },
          {
            id: "2",
            type: "warning",
            title: "Manutenção Preventiva",
            description: "Equipamento X precisa de manutenção em 2 dias",
            sector: "Usinagem",
            timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
            status: "inProgress",
            priority: "high",
            category: "maintenance",
            location: {
              sector: "Usinagem",
              station: "Estação 2",
            },
            createdAt: new Date(Date.now() - 60 * 60000).toISOString(),
            updatedAt: new Date(Date.now() - 60 * 60000).toISOString(),
            attachments: [],
            comments: [],
          },
          {
            id: "3",
            type: "info",
            title: "Novo Pedido Urgente",
            description: "Cliente VIP solicitou prioridade máxima",
            sector: "Planejamento",
            timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
            status: "open",
            priority: "urgent",
            category: "process",
            location: {
              sector: "Planejamento",
            },
            createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
            updatedAt: new Date(Date.now() - 15 * 60000).toISOString(),
            attachments: [],
            comments: [],
          },
        ],
        alerts: [
          {
            id: "1",
            type: "production_stop",
            severity: "critical",
            title: "Sistema de Refrigeração",
            message: "Temperatura acima do limite no setor de usinagem",
            description:
              "Temperatura crítica detectada no sistema de refrigeração",
            source: {
              type: "system",
              id: "sys-001",
              name: "Sistema de Monitoramento",
            },
            location: {
              sector: "Usinagem",
              station: "Estação 1",
            },
            relatedEntity: {
              type: "equipment",
              id: "eq-001",
              name: "Sistema de Refrigeração",
            },
            recipients: [
              {
                id: "user-001",
                name: "João Silva",
                role: "coordinator",
                department: "Produção",
                notificationMethods: ["dashboard", "email"],
                acknowledged: false,
              },
            ],
            status: "active",
            priority: "urgent",
            createdAt: new Date(Date.now() - 10 * 60000).toISOString(),
            updatedAt: new Date(Date.now() - 10 * 60000).toISOString(),
            escalatedAt: undefined,
            escalationLevel: 1,
            autoEscalation: true,
            tags: ["temperatura", "crítico"],
            attachments: [],
            comments: [],
          },
          {
            id: "2",
            type: "material",
            severity: "high",
            title: "Estoque Baixo",
            message: "Material X com apenas 5% do estoque disponível",
            description: "Estoque crítico de material essencial",
            source: {
              type: "system",
              id: "sys-002",
              name: "Sistema de Estoque",
            },
            location: {
              sector: "Almoxarifado",
            },
            relatedEntity: {
              type: "material",
              id: "mat-001",
              name: "Material X",
            },
            recipients: [
              {
                id: "user-002",
                name: "Maria Santos",
                role: "warehouse",
                department: "Almoxarifado",
                notificationMethods: ["dashboard", "email"],
                acknowledged: false,
              },
            ],
            status: "active",
            priority: "high",
            createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
            updatedAt: new Date(Date.now() - 45 * 60000).toISOString(),
            escalatedAt: undefined,
            escalationLevel: 0,
            autoEscalation: false,
            tags: ["estoque", "material"],
            attachments: [],
            comments: [],
          },
          {
            id: "3",
            type: "quality",
            severity: "medium",
            title: "Relatório Gerado",
            message: "Relatório de produtividade semanal disponível",
            description: "Relatório automático de produtividade foi gerado",
            source: {
              type: "system",
              id: "sys-003",
              name: "Sistema de Relatórios",
            },
            location: {
              sector: "Administração",
            },
            relatedEntity: {
              type: "task",
              id: "task-001",
              name: "Relatório Semanal",
            },
            recipients: [
              {
                id: "user-003",
                name: "Pedro Costa",
                role: "admin",
                department: "Administração",
                notificationMethods: ["dashboard", "email"],
                acknowledged: true,
                acknowledgedAt: new Date(Date.now() - 60 * 60000).toISOString(),
              },
            ],
            status: "acknowledged",
            priority: "medium",
            createdAt: new Date(Date.now() - 120 * 60000).toISOString(),
            updatedAt: new Date(Date.now() - 60 * 60000).toISOString(),
            acknowledgedAt: new Date(Date.now() - 60 * 60000).toISOString(),
            acknowledgedBy: "user-003",
            escalatedAt: undefined,
            escalationLevel: 0,
            autoEscalation: false,
            tags: ["relatório", "produtividade"],
            attachments: [],
            comments: [],
          },
        ],
        nonConformities: {
          open: Math.floor(Math.random() * 8) + 2,
          inProgress: Math.floor(Math.random() * 5) + 1,
          resolved: Math.floor(Math.random() * 20) + 10,
          critical: Math.floor(Math.random() * 3),
          total: 0, // Será calculado
        },
      };

      // Calcular total de não conformidades
      mockData.nonConformities.total =
        mockData.nonConformities.open +
        mockData.nonConformities.inProgress +
        mockData.nonConformities.resolved;

      setData(mockData);
      setLoading(false);
    };

    loadData();

    // Atualizar dados a cada 30 segundos
    const interval = setInterval(loadData, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleAcknowledgeAlert = (alertId: string) => {
    setData((prev) => ({
      ...prev,
      alerts: prev.alerts.map((alert) =>
        alert.id === alertId ? { ...alert, status: "acknowledged" } : alert
      ),
    }));
  };

  const handleResolvePendency = (pendencyId: string) => {
    setData((prev) => ({
      ...prev,
      pendencies: prev.pendencies.filter((p) => p.id !== pendencyId),
    }));
  };

  const handleRefresh = () => {
    setLoading(true);
    // Recarregar dados
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="control-panel-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Carregando painel de controle...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="control-panel-container">
      <ControlPanelHeader onRefresh={handleRefresh} />

      <div className="control-panel-grid">
        <div className="semaphore-section">
          <StatusSemaphore
            status={data.generalStatus}
            activeOrders={data.activeOrders}
            urgentOrders={data.urgentOrders}
            blockedOrders={data.blockedOrders}
          />
        </div>

        <div className="alerts-section">
          <AlertsOverview
            alerts={data.alerts as ProductionAlert[]}
            onAcknowledge={handleAcknowledgeAlert}
          />
        </div>

        <div className="pendencies-section">
          <PendenciesPanel
            pendencies={data.pendencies as Pendency[]}
            onResolve={handleResolvePendency}
          />
        </div>

        <div className="nonconformity-section">
          <NonConformity data={data.nonConformities as NonConformityStats} />
        </div>

        <div className="actions-section">
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
