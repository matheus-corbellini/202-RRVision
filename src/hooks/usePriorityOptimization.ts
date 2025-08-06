import { useState, useEffect, useCallback } from "react";

interface UrgentOrder {
  id: string;
  productName: string;
  quantity: number;
  priority: "urgent" | "critical";
  originalDeadline: string;
  newDeadline: string;
  affectedTasks: number;
  affectedOperators: number;
  estimatedDelay: number;
  status: "pending" | "processing" | "completed" | "failed";
  createdAt: string;
  processedAt?: string;
}

interface ScheduleChange {
  id: string;
  orderId: string;
  taskId: string;
  operatorId: string;
  operatorName: string;
  originalStartTime: string;
  newStartTime: string;
  originalEndTime: string;
  newEndTime: string;
  reason: string;
  impact: "low" | "medium" | "high";
  notified: boolean;
}

interface OptimizationConfig {
  autoRecalculation: boolean;
  recalculateInterval: number;
  notifyOperators: boolean;
  notifyCoordinators: boolean;
  maxDelayAllowed: number;
  priorityThreshold: "high" | "urgent" | "critical";
}

interface OptimizationStats {
  totalUrgentOrders: number;
  processingOrders: number;
  completedOrders: number;
  failedOrders: number;
  totalScheduleChanges: number;
  notifiedChanges: number;
  efficiency: number;
}

export function usePriorityOptimization() {
  const [urgentOrders, setUrgentOrders] = useState<UrgentOrder[]>([]);
  const [scheduleChanges, setScheduleChanges] = useState<ScheduleChange[]>([]);
  const [config, setConfig] = useState<OptimizationConfig>({
    autoRecalculation: true,
    recalculateInterval: 30,
    notifyOperators: true,
    notifyCoordinators: true,
    maxDelayAllowed: 120,
    priorityThreshold: "urgent",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastRecalculation, setLastRecalculation] = useState<Date | null>(null);
  const [nextRecalculation, setNextRecalculation] = useState<Date | null>(null);

  // Simular algoritmo de otimização de agenda
  const optimizeSchedule = useCallback(async (urgentOrder: UrgentOrder) => {
    // Simular processamento de otimização
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Gerar mudanças de agenda simuladas
    const changes: ScheduleChange[] = [];
    const operators = [
      "João Silva",
      "Maria Santos",
      "Pedro Costa",
      "Ana Oliveira",
    ];

    for (let i = 0; i < urgentOrder.affectedOperators; i++) {
      const change: ScheduleChange = {
        id: `SC-${Date.now()}-${i}`,
        orderId: urgentOrder.id,
        taskId: `task-${i + 1}`,
        operatorId: `op-${i + 1}`,
        operatorName: operators[i % operators.length],
        originalStartTime: "08:00",
        newStartTime: "07:30",
        originalEndTime: "17:00",
        newEndTime: "16:30",
        reason: `Pedido ${urgentOrder.priority} ${urgentOrder.id}`,
        impact: urgentOrder.priority === "critical" ? "high" : "medium",
        notified: false,
      };
      changes.push(change);
    }

    return changes;
  }, []);

  // Processar pedido urgente
  const processUrgentOrder = useCallback(
    async (order: UrgentOrder) => {
      setIsProcessing(true);

      try {
        // Simular processamento
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // Otimizar agenda
        const changes = await optimizeSchedule(order);

        // Atualizar estado
        setUrgentOrders((prev) => [
          {
            ...order,
            status: "completed" as const,
            processedAt: new Date().toISOString(),
          },
          ...prev,
        ]);

        setScheduleChanges((prev) => [...changes, ...prev]);

        // Notificar operadores se configurado
        if (config.notifyOperators) {
          await notifyOperators(changes);
        }

        // Notificar coordenadores se configurado
        if (config.notifyCoordinators) {
          await notifyCoordinators(order, changes);
        }

        setLastRecalculation(new Date());
        setNextRecalculation(
          new Date(Date.now() + config.recalculateInterval * 60 * 1000)
        );
      } catch (error) {
        console.error("Erro ao processar pedido urgente:", error);
        setUrgentOrders((prev) => [
          {
            ...order,
            status: "failed" as const,
          },
          ...prev,
        ]);
      } finally {
        setIsProcessing(false);
      }
    },
    [config, optimizeSchedule]
  );

  // Notificar operadores
  const notifyOperators = useCallback(async (changes: ScheduleChange[]) => {
    // Simular notificação
    console.log("Notificando operadores sobre mudanças de agenda:", changes);

    // Marcar como notificado
    setScheduleChanges((prev) =>
      prev.map((change) =>
        changes.some((c) => c.id === change.id)
          ? { ...change, notified: true }
          : change
      )
    );
  }, []);

  // Notificar coordenadores
  const notifyCoordinators = useCallback(
    async (order: UrgentOrder, changes: ScheduleChange[]) => {
      // Simular notificação
      console.log(
        "Notificando coordenadores sobre pedido urgente:",
        order,
        changes
      );
    },
    []
  );

  // Recálculo manual
  const manualRecalculation = useCallback(async () => {
    if (isProcessing) return;

    setIsProcessing(true);

    try {
      // Simular novos pedidos urgentes
      const newUrgentOrder: UrgentOrder = {
        id: `UO-2024-${String(urgentOrders.length + 1).padStart(3, "0")}`,
        productName: "Produto C - Modelo Z",
        quantity: 75,
        priority: "urgent",
        originalDeadline: "2024-01-24T18:00:00",
        newDeadline: "2024-01-22T16:00:00",
        affectedTasks: 6,
        affectedOperators: 2,
        estimatedDelay: 30,
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      await processUrgentOrder(newUrgentOrder);
    } catch (error) {
      console.error("Erro no recálculo manual:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [urgentOrders.length, processUrgentOrder, isProcessing]);

  // Recálculo automático
  useEffect(() => {
    if (!config.autoRecalculation) return;

    const interval = setInterval(() => {
      if (!isProcessing) {
        manualRecalculation();
      }
    }, config.recalculateInterval * 60 * 1000);

    return () => clearInterval(interval);
  }, [
    config.autoRecalculation,
    config.recalculateInterval,
    manualRecalculation,
    isProcessing,
  ]);

  // Calcular estatísticas
  const stats: OptimizationStats = {
    totalUrgentOrders: urgentOrders.length,
    processingOrders: urgentOrders.filter((o) => o.status === "processing")
      .length,
    completedOrders: urgentOrders.filter((o) => o.status === "completed")
      .length,
    failedOrders: urgentOrders.filter((o) => o.status === "failed").length,
    totalScheduleChanges: scheduleChanges.length,
    notifiedChanges: scheduleChanges.filter((c) => c.notified).length,
    efficiency:
      urgentOrders.length > 0
        ? (urgentOrders.filter((o) => o.status === "completed").length /
            urgentOrders.length) *
          100
        : 0,
  };

  // Atualizar configuração
  const updateConfig = useCallback((newConfig: Partial<OptimizationConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
  }, []);

  // Notificar mudança específica
  const notifyChange = useCallback(
    async (changeId: string) => {
      const change = scheduleChanges.find((c) => c.id === changeId);
      if (!change) return;

      try {
        await notifyOperators([change]);
      } catch (error) {
        console.error("Erro ao notificar mudança:", error);
      }
    },
    [scheduleChanges, notifyOperators]
  );

  return {
    urgentOrders,
    scheduleChanges,
    config,
    isProcessing,
    lastRecalculation,
    nextRecalculation,
    stats,
    processUrgentOrder,
    manualRecalculation,
    updateConfig,
    notifyChange,
  };
}
