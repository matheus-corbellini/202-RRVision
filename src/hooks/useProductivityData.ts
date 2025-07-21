import { useState, useEffect } from "react";

interface Task {
  id: string;
  orderId: string;
  productName: string;
  activity: string;
  sector: string;
  description: string;
  estimatedTime: number; // em minutos
  setupTime: number;
  startTime: string;
  endTime: string;
  status: "pending" | "in_progress" | "paused" | "completed" | "delayed";
  actualStartTime?: string;
  actualEndTime?: string;
  actualTime?: number;
  priority: "low" | "medium" | "high" | "urgent";
  requiredSkills: string[];
  breaks: Break[];
  nonConformities: string[];
}

interface Break {
  id: string;
  type: "coffee" | "lunch" | "bathroom" | "other";
  startTime: string;
  endTime?: string;
  duration?: number;
}

interface ProductivityData {
  operatorId: string;
  operatorName: string;
  taskId: string;
  taskName: string;
  orderId: string;
  orderName: string;
  sector: string;
  shift: "morning" | "afternoon" | "night";
  date: string;
  plannedTime: number;
  actualTime: number;
  bestHistoricTime: number;
  efficiency: number;
  productivity: number;
  status: "completed" | "in_progress" | "delayed";
}

interface OperatorRanking {
  operatorId: string;
  operatorName: string;
  totalTasks: number;
  averageEfficiency: number;
  totalProductivity: number;
  onTimeCompletion: number;
  rank: number;
  trend: "up" | "down" | "stable";
}

interface PeriodStats {
  period: string;
  tasksCompleted: number;
  averageEfficiency: number;
  totalTime: number;
  productivityScore: number;
  onTimeRate: number;
}

export const useProductivityData = () => {
  const [productivityData, setProductivityData] = useState<ProductivityData[]>(
    []
  );
  const [operatorRankings, setOperatorRankings] = useState<OperatorRanking[]>(
    []
  );
  const [periodStats, setPeriodStats] = useState<PeriodStats[]>([]);
  const [currentUserStats, setCurrentUserStats] =
    useState<OperatorRanking | null>(null);

  // Função para calcular eficiência baseada em tempo estimado vs real
  const calculateEfficiency = (
    estimatedTime: number,
    actualTime: number
  ): number => {
    if (actualTime === 0) return 0;
    return (estimatedTime / actualTime) * 100;
  };

  // Função para calcular produtividade baseada no melhor tempo histórico
  const calculateProductivity = (
    actualTime: number,
    bestHistoricTime: number
  ): number => {
    if (actualTime === 0) return 0;
    return (bestHistoricTime / actualTime) * 100;
  };

  // Simulação de dados baseados em tarefas reais da agenda
  useEffect(() => {
    // Mock das tarefas da agenda do operador
    const mockScheduleTasks: Task[] = [
      {
        id: "task-001",
        orderId: "OP-2024-001",
        productName: "Produto A - Modelo X",
        activity: "Corte de Peças",
        sector: "Corte",
        description: "Cortar 100 peças conforme especificação técnica.",
        estimatedTime: 120,
        setupTime: 30,
        startTime: "08:00",
        endTime: "10:30",
        status: "completed",
        actualStartTime: "08:05",
        actualEndTime: "10:25",
        actualTime: 140, // 120 + 20 (atraso)
        priority: "high",
        requiredSkills: ["Corte", "Medição"],
        breaks: [],
        nonConformities: [],
      },
      {
        id: "task-002",
        orderId: "OP-2024-001",
        productName: "Produto A - Modelo X",
        activity: "Montagem Principal",
        sector: "Montagem",
        description: "Montar componentes principais seguindo roteiro.",
        estimatedTime: 180,
        setupTime: 45,
        startTime: "10:30",
        endTime: "14:15",
        status: "completed",
        actualStartTime: "10:35",
        actualEndTime: "14:00",
        actualTime: 165, // 15 minutos a menos
        priority: "high",
        requiredSkills: ["Montagem", "Torque"],
        breaks: [
          {
            id: "break-001",
            type: "coffee",
            startTime: "12:00",
            endTime: "12:15",
            duration: 15,
          },
        ],
        nonConformities: [],
      },
      {
        id: "task-003",
        orderId: "OP-2024-002",
        productName: "Produto B - Modelo Y",
        activity: "Acabamento Final",
        sector: "Acabamento",
        description: "Aplicar acabamento final e inspeção de qualidade.",
        estimatedTime: 90,
        setupTime: 15,
        startTime: "14:15",
        endTime: "15:45",
        status: "completed",
        actualStartTime: "14:20",
        actualEndTime: "15:35",
        actualTime: 75, // 15 minutos a menos
        priority: "medium",
        requiredSkills: ["Acabamento", "Inspeção"],
        breaks: [],
        nonConformities: [],
      },
      {
        id: "task-004",
        orderId: "OP-2024-003",
        productName: "Produto C - Modelo Z",
        activity: "Preparação Material",
        sector: "Preparação",
        description: "Separar e preparar materiais para produção.",
        estimatedTime: 60,
        setupTime: 20,
        startTime: "15:45",
        endTime: "17:05",
        status: "delayed",
        actualStartTime: "15:50",
        actualEndTime: "17:20",
        actualTime: 90, // 30 minutos de atraso
        priority: "low",
        requiredSkills: ["Preparação"],
        breaks: [],
        nonConformities: [],
      },
      {
        id: "task-005",
        orderId: "OP-2024-004",
        productName: "Produto D - Modelo W",
        activity: "Inspeção Qualidade",
        sector: "Qualidade",
        description: "Inspeção final de qualidade conforme especificação.",
        estimatedTime: 45,
        setupTime: 10,
        startTime: "08:00",
        endTime: "09:00",
        status: "completed",
        actualStartTime: "08:02",
        actualEndTime: "08:50",
        actualTime: 48, // 3 minutos de atraso
        priority: "urgent",
        requiredSkills: ["Qualidade", "Inspeção"],
        breaks: [],
        nonConformities: [],
      },
    ];

    // Tempos históricos melhores para cada tipo de atividade
    const bestHistoricTimes: Record<string, number> = {
      "Corte de Peças": 105,
      "Montagem Principal": 160,
      "Acabamento Final": 70,
      "Preparação Material": 55,
      "Inspeção Qualidade": 40,
    };

    // Converter tarefas da agenda em dados de produtividade
    const calculatedProductivityData: ProductivityData[] = mockScheduleTasks
      .filter(
        (task) => task.status === "completed" || task.status === "delayed"
      )
      .map((task) => {
        const totalEstimatedTime = task.estimatedTime + task.setupTime;
        const actualTime = task.actualTime || totalEstimatedTime;
        const bestTime =
          bestHistoricTimes[task.activity] || totalEstimatedTime * 0.9;

        const efficiency = calculateEfficiency(totalEstimatedTime, actualTime);
        const productivity = calculateProductivity(actualTime, bestTime);

        return {
          operatorId: "op-001",
          operatorName: "João Silva",
          taskId: task.id,
          taskName: task.activity,
          orderId: task.orderId,
          orderName: task.productName,
          sector: task.sector,
          shift: "morning" as const,
          date: "2024-01-20",
          plannedTime: totalEstimatedTime,
          actualTime: actualTime,
          bestHistoricTime: bestTime,
          efficiency: efficiency,
          productivity: productivity,
          status: task.status === "completed" ? "completed" : "delayed",
        };
      });

    // Calcular estatísticas do operador baseadas nas tarefas reais
    const completedTasks = calculatedProductivityData.filter(
      (t) => t.status === "completed"
    );
    const averageEfficiency =
      completedTasks.reduce((sum, task) => sum + task.efficiency, 0) /
      completedTasks.length;
    const averageProductivity =
      completedTasks.reduce((sum, task) => sum + task.productivity, 0) /
      completedTasks.length;
    const onTimeCompletion =
      (completedTasks.filter((t) => t.efficiency >= 100).length /
        completedTasks.length) *
      100;

    const calculatedOperatorRankings: OperatorRanking[] = [
      {
        operatorId: "op-001",
        operatorName: "João Silva",
        totalTasks: calculatedProductivityData.length,
        averageEfficiency: averageEfficiency,
        totalProductivity: averageProductivity,
        onTimeCompletion: onTimeCompletion,
        rank: 1,
        trend: averageEfficiency > 100 ? "up" : "down",
      },
      // Outros operadores (mock para comparação)
      {
        operatorId: "op-002",
        operatorName: "Maria Santos",
        totalTasks: 18,
        averageEfficiency: 104.7,
        totalProductivity: 98.9,
        onTimeCompletion: 88.9,
        rank: 2,
        trend: "stable",
      },
      {
        operatorId: "op-003",
        operatorName: "Pedro Costa",
        totalTasks: 15,
        averageEfficiency: 89.3,
        totalProductivity: 85.2,
        onTimeCompletion: 73.3,
        rank: 3,
        trend: "down",
      },
    ];

    // Calcular estatísticas do período
    const totalActualTime = calculatedProductivityData.reduce(
      (sum, task) => sum + task.actualTime,
      0
    );
    const calculatedPeriodStats: PeriodStats[] = [
      {
        period: "Hoje",
        tasksCompleted: calculatedProductivityData.length,
        averageEfficiency: averageEfficiency,
        totalTime: totalActualTime,
        productivityScore: averageProductivity,
        onTimeRate: onTimeCompletion,
      },
      {
        period: "Esta Semana",
        tasksCompleted: calculatedProductivityData.length * 5,
        averageEfficiency: averageEfficiency * 0.98,
        totalTime: totalActualTime * 5,
        productivityScore: averageProductivity * 0.96,
        onTimeRate: onTimeCompletion * 0.95,
      },
      {
        period: "Este Mês",
        tasksCompleted: calculatedProductivityData.length * 20,
        averageEfficiency: averageEfficiency * 0.96,
        totalTime: totalActualTime * 20,
        productivityScore: averageProductivity * 0.94,
        onTimeRate: onTimeCompletion * 0.92,
      },
    ];

    setProductivityData(calculatedProductivityData);
    setOperatorRankings(calculatedOperatorRankings);
    setPeriodStats(calculatedPeriodStats);
    setCurrentUserStats(calculatedOperatorRankings[0]);
  }, []);

  return {
    productivityData,
    operatorRankings,
    periodStats,
    currentUserStats,
    calculateEfficiency,
    calculateProductivity,
  };
};
