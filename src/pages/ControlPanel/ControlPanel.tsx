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
    alerts: [],
    pendencies: [],
    nonConformities: {
      total: 0,
      open: 0,
      investigating: 0,
      resolved: 0,
      closed: 0,
      bySeverity: {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0,
      },
      byPriority: {
        low: 0,
        medium: 0,
        high: 0,
        urgent: 0,
      },
      byCategory: {
        quality: 0,
        safety: 0,
        process: 0,
        equipment: 0,
        material: 0,
      },
      bySector: {},
      productionStopped: 0,
      requiresImmediateAction: 0,
    },
    stats: {
      totalAlerts: 0,
      activeAlerts: 0,
      totalPendencies: 0,
      totalNonConformities: 0,
    },
    generalStatus: "green",
    activeOrders: 0,
    urgentOrders: 0,
    blockedOrders: 0,
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
            id: "alert-001",
            title: "Alerta de Qualidade",
            description: "5 peças com dimensões fora do padrão detectadas na linha de produção",
            severity: "high",
            priority: "urgent",
            status: "active",
            location: {
              sector: "Produção",
              station: "Linha 01",
              equipment: "Máquina CNC-001",
            },
            relatedEntity: {
              id: "order-123",
              name: "Pedido #123 - Peças Mecânicas",
            },
            source: {
              id: "qc-system",
              name: "Sistema de Qualidade",
            },
            createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
            attachments: ["relatorio_qualidade.pdf"],
            tags: ["qualidade", "produção"],
            recipients: [
              {
                id: "user-001",
                name: "João Silva",
                role: "Coordenador Qualidade",
                department: "Qualidade",
                acknowledged: false,
              },
              {
                id: "user-002",
                name: "Maria Santos",
                role: "Supervisor Produção",
                department: "Produção",
                acknowledged: true,
              },
            ],
            comments: [],
          },
          {
            id: "alert-002",
            title: "Alerta de Equipamento",
            description: "Compressor apresentando ruído excessivo e vibração anormal",
            severity: "medium",
            priority: "high",
            status: "acknowledged",
            location: {
              sector: "Manutenção",
              station: "Área Técnica",
              equipment: "Compressor CP-005",
            },
            relatedEntity: {
              id: "equipment-005",
              name: "Compressor CP-005",
            },
            source: {
              id: "maintenance-system",
              name: "Sistema de Manutenção",
            },
            createdAt: new Date(Date.now() - 60 * 60000).toISOString(),
            acknowledgedAt: new Date(Date.now() - 30 * 60000).toISOString(),
            acknowledgedBy: "user-003",
            attachments: ["relatorio_vibracao.pdf"],
            tags: ["manutenção", "equipamento"],
            recipients: [
              {
                id: "user-003",
                name: "Pedro Costa",
                role: "Técnico Manutenção",
                department: "Manutenção",
                acknowledged: true,
              },
            ],
            comments: [],
          },
          {
            id: "alert-003",
            title: "Alerta de Material",
            description: "Material com defeito visual identificado no recebimento",
            severity: "low",
            priority: "medium",
            status: "resolved",
            location: {
              sector: "Recebimento",
              station: "Dock 01",
            },
            relatedEntity: {
              id: "material-456",
              name: "Lote de Materiais #456",
            },
            source: {
              id: "warehouse-system",
              name: "Sistema de Almoxarifado",
            },
            createdAt: new Date(Date.now() - 120 * 60000).toISOString(),
            resolvedAt: new Date(Date.now() - 60 * 60000).toISOString(),
            resolvedBy: "user-004",
            attachments: ["fotos_material.jpg"],
            tags: ["material", "recebimento"],
            recipients: [
              {
                id: "user-004",
                name: "Ana Oliveira",
                role: "Supervisor Almoxarifado",
                department: "Almoxarifado",
                acknowledged: true,
              },
            ],
            comments: [],
          },
          {
            id: "alert-004",
            title: "Alerta de Sistema",
            description: "Relatório semanal de produtividade disponível para análise",
            severity: "low",
            priority: "low",
            status: "acknowledged",
            location: {
              sector: "Administração",
            },
            relatedEntity: {
              id: "task-001",
              name: "Relatório Semanal",
            },
            source: {
              id: "report-system",
              name: "Sistema de Relatórios",
            },
            createdAt: new Date(Date.now() - 120 * 60000).toISOString(),
            acknowledgedAt: new Date(Date.now() - 60 * 60000).toISOString(),
            acknowledgedBy: "user-003",
            attachments: ["relatorio_semanal.pdf"],
            tags: ["relatório", "produtividade"],
            recipients: [
              {
                id: "user-003",
                name: "Pedro Costa",
                role: "admin",
                department: "Administração",
                acknowledged: true,
              },
            ],
            comments: [],
          },
        ],
        nonConformities: {
          total: 0, // Será calculado
          open: Math.floor(Math.random() * 8) + 2,
          investigating: Math.floor(Math.random() * 5) + 1,
          resolved: Math.floor(Math.random() * 20) + 10,
          closed: Math.floor(Math.random() * 3),
          bySeverity: {
            low: Math.floor(Math.random() * 5) + 1,
            medium: Math.floor(Math.random() * 8) + 2,
            high: Math.floor(Math.random() * 3) + 1,
            critical: Math.floor(Math.random() * 2),
          },
          byPriority: {
            low: Math.floor(Math.random() * 4) + 1,
            medium: Math.floor(Math.random() * 6) + 2,
            high: Math.floor(Math.random() * 3) + 1,
            urgent: Math.floor(Math.random() * 2),
          },
          byCategory: {
            quality: Math.floor(Math.random() * 5) + 1,
            safety: Math.floor(Math.random() * 3) + 1,
            process: Math.floor(Math.random() * 8) + 2,
            equipment: Math.floor(Math.random() * 4) + 1,
            material: Math.floor(Math.random() * 6) + 2,
          },
          bySector: {
            "Montagem": Math.floor(Math.random() * 5) + 1,
            "Usinagem": Math.floor(Math.random() * 3) + 1,
            "Planejamento": Math.floor(Math.random() * 2) + 1,
            "Recebimento": Math.floor(Math.random() * 4) + 1,
            "Administração": Math.floor(Math.random() * 3) + 1,
          },
          productionStopped: Math.floor(Math.random() * 3),
          requiresImmediateAction: Math.floor(Math.random() * 2),
        },
        stats: {
          totalAlerts: 0, // Será calculado
          activeAlerts: 0, // Será calculado
          totalPendencies: 0, // Será calculado
          totalNonConformities: 0, // Será calculado
        },
      };

      // Calcular estatísticas
      mockData.stats.totalAlerts = mockData.alerts.length;
      mockData.stats.activeAlerts = mockData.alerts.filter(a => a.status === 'active').length;
      mockData.stats.totalPendencies = mockData.pendencies.length;
      
      // Calcular total de não conformidades
      mockData.nonConformities.total =
        mockData.nonConformities.open +
        mockData.nonConformities.investigating +
        mockData.nonConformities.resolved +
        mockData.nonConformities.closed;
      
      mockData.stats.totalNonConformities = mockData.nonConformities.total;

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
