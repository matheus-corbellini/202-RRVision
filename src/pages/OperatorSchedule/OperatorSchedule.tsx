"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import {
  OperatorScheduleHeader,
  OperatorStatsGrid,
  CurrentTaskPanel,
  TasksSection,
} from "./components";
import "./OperatorSchedule.css";
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

interface OperatorStats {
  tasksCompleted: number;
  averageEfficiency: number;
  totalWorkTime: number;
  onTimeCompletion: number;
  ranking: number;
  dailyTarget: number;
}

export default function OperatorSchedule() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"day" | "week">("day");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [activeBreak, setActiveBreak] = useState<Break | null>(null);
  const [stats, setStats] = useState<OperatorStats>({
    tasksCompleted: 0,
    averageEfficiency: 0,
    totalWorkTime: 0,
    onTimeCompletion: 0,
    ranking: 0,
    dailyTarget: 0,
  });
  const [currentTime, setCurrentTime] = useState(new Date());

  // Mock data - Em produção viria da API
  useEffect(() => {
    const mockTasks: Task[] = [
      {
        id: "task-001",
        orderId: "OP-2024-001",
        productName: "Produto A - Modelo X",
        activity: "Corte de Peças",
        sector: "Corte",
        description:
          "Cortar 100 peças conforme especificação técnica. Verificar medidas e qualidade.",
        estimatedTime: 120,
        setupTime: 30,
        startTime: "08:00",
        endTime: "10:30",
        status: "completed",
        actualStartTime: "08:05",
        actualEndTime: "10:25",
        actualTime: 140,
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
        description:
          "Montar componentes principais seguindo roteiro de montagem. Aplicar torque especificado.",
        estimatedTime: 180,
        setupTime: 45,
        startTime: "10:30",
        endTime: "14:15",
        status: "in_progress",
        actualStartTime: "10:35",
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
        description:
          "Aplicar acabamento final e realizar inspeção de qualidade completa.",
        estimatedTime: 90,
        setupTime: 15,
        startTime: "14:15",
        endTime: "15:45",
        status: "pending",
        priority: "medium",
        requiredSkills: ["Acabamento", "Inspeção"],
        breaks: [],
        nonConformities: [],
      },
      {
        id: "task-004",
        orderId: "OP-2024-003",
        productName: "Produto C - Modelo Z",
        activity: "Preparação de Material",
        sector: "Preparação",
        description:
          "Separar e preparar materiais para próxima etapa de produção.",
        estimatedTime: 60,
        setupTime: 20,
        startTime: "15:45",
        endTime: "17:05",
        status: "pending",
        priority: "low",
        requiredSkills: ["Preparação"],
        breaks: [],
        nonConformities: [],
      },
    ];

    const mockStats: OperatorStats = {
      tasksCompleted: 8,
      averageEfficiency: 94.5,
      totalWorkTime: 420, // 7 horas
      onTimeCompletion: 87.5,
      ranking: 3,
      dailyTarget: 10,
    };

    setTasks(mockTasks);
    setStats(mockStats);
    setCurrentTask(mockTasks.find((t) => t.status === "in_progress") || null);
  }, []);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleStartTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: "in_progress" as const,
              actualStartTime: new Date().toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              }),
            }
          : task
      )
    );
    const task = tasks.find((t) => t.id === taskId);
    if (task) setCurrentTask({ ...task, status: "in_progress" });
  };

  const handleCompleteTask = (taskId: string) => {
    const now = new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: "completed" as const,
              actualEndTime: now,
              actualTime: task.actualStartTime
                ? calculateActualTime(task.actualStartTime, now)
                : task.estimatedTime,
            }
          : task
      )
    );
    setCurrentTask(null);
  };

  const handlePauseTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, status: "paused" as const } : task
      )
    );
  };

  const handleStartBreak = (type: Break["type"]) => {
    const breakItem: Break = {
      id: `break-${Date.now()}`,
      type,
      startTime: new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setActiveBreak(breakItem);
  };

  const handleEndBreak = () => {
    if (activeBreak && currentTask) {
      const endTime = new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const duration = calculateActualTime(activeBreak.startTime, endTime);

      const completedBreak = {
        ...activeBreak,
        endTime,
        duration,
      };

      setTasks((prev) =>
        prev.map((task) =>
          task.id === currentTask.id
            ? { ...task, breaks: [...task.breaks, completedBreak] }
            : task
        )
      );
    }
    setActiveBreak(null);
  };

  const calculateActualTime = (startTime: string, endTime: string): number => {
    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);
    return endHour * 60 + endMin - (startHour * 60 + startMin);
  };

  const getTaskStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "pending":
        return "#e2e8f0";
      case "in_progress":
        return "#bee3f8";
      case "paused":
        return "#fbb040";
      case "completed":
        return "#c6f6d5";
      case "delayed":
        return "#fed7d7";
      default:
        return "#e2e8f0";
    }
  };

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "low":
        return "#48bb78";
      case "medium":
        return "#fbb040";
      case "high":
        return "#f56565";
      case "urgent":
        return "#e53e3e";
      default:
        return "#4a5568";
    }
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 95) return "#48bb78";
    if (efficiency >= 85) return "#fbb040";
    return "#f56565";
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const calculateProgress = (task: Task): number => {
    if (task.status === "completed") return 100;
    if (task.status === "pending") return 0;

    const now = new Date();
    const [startHour, startMin] = task.startTime.split(":").map(Number);
    const [endHour, endMin] = task.endTime.split(":").map(Number);

    const startTime = new Date();
    startTime.setHours(startHour, startMin, 0, 0);

    const endTime = new Date();
    endTime.setHours(endHour, endMin, 0, 0);

    const totalTime = endTime.getTime() - startTime.getTime();
    const elapsedTime = now.getTime() - startTime.getTime();

    return Math.min(Math.max((elapsedTime / totalTime) * 100, 0), 100);
  };

  return (
    <div className="schedule-page">
      <div className="schedule-container">
        <OperatorScheduleHeader
          user={user}
          viewMode={viewMode}
          setViewMode={setViewMode}
          currentTime={currentTime}
        />

        <OperatorStatsGrid
          stats={stats}
          getEfficiencyColor={getEfficiencyColor}
          formatTime={formatTime}
        />

        <div className="schedule-content">
          <CurrentTaskPanel
            currentTask={currentTask}
            activeBreak={activeBreak}
            currentTime={currentTime}
            handlePauseTask={handlePauseTask}
            handleCompleteTask={handleCompleteTask}
            handleStartBreak={handleStartBreak}
            handleEndBreak={handleEndBreak}
            calculateProgress={calculateProgress}
            calculateActualTime={calculateActualTime}
          />

          <TasksSection
            tasks={tasks}
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
            handleStartTask={handleStartTask}
            getTaskStatusColor={getTaskStatusColor}
            getPriorityColor={getPriorityColor}
            getEfficiencyColor={getEfficiencyColor}
            formatTime={formatTime}
          />
        </div>
      </div>
    </div>
  );
}
