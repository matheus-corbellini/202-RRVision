import { useState, useEffect } from "react";
import "./NotificationPanel.css";
import {
  FaExclamationCircle,
  FaExclamationTriangle,
  FaCheckCircle,
  FaInfoCircle,
  FaBell,
  FaChartLine,
  FaChartBar,
  FaTimes,
} from "react-icons/fa";

interface Notification {
  id: string;
  type: "warning" | "info" | "success" | "error";
  title: string;
  message: string;
  timestamp: Date;
  priority: "low" | "medium" | "high";
  autoClose?: boolean;
  duration?: number;
}

interface Task {
  id: string;
  orderId: string;
  productName: string;
  activity: string;
  sector: string;
  description: string;
  estimatedTime: number;
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

interface NotificationPanelProps {
  currentTask: Task | null;
  activeBreak: Break | null;
  tasks: Task[];
  currentTime: Date;
}

export default function NotificationPanel({
  currentTask,
  activeBreak,
  tasks,
  currentTime,
}: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);

  // Função para adicionar notificação
  const addNotification = (
    notification: Omit<Notification, "id" | "timestamp">
  ) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
    };

    setNotifications((prev) => [newNotification, ...prev.slice(0, 4)]); // Máximo 5 notificações

    // Auto-remove notificações se especificado
    if (notification.autoClose) {
      setTimeout(() => {
        removeNotification(newNotification.id);
      }, notification.duration || 5000);
    }
  };

  // Função para remover notificação
  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Monitorar alertas em tempo real
  useEffect(() => {
    const checkAlerts = () => {
      const now = new Date();

      // Verificar se tarefa está atrasada
      if (currentTask?.status === "in_progress") {
        const [endHour, endMin] = currentTask.endTime.split(":").map(Number);
        const taskEndTime = new Date();
        taskEndTime.setHours(endHour, endMin, 0, 0);

        if (now > taskEndTime) {
          addNotification({
            type: "error",
            title: "Tarefa Atrasada",
            message: `${currentTask.activity} deveria ter sido concluída às ${currentTask.endTime}`,
            priority: "high",
            autoClose: false,
          });
        }
        // Alerta 15 minutos antes do prazo
        else if (now > new Date(taskEndTime.getTime() - 15 * 60 * 1000)) {
          addNotification({
            type: "warning",
            title: "Prazo Próximo",
            message: `${currentTask.activity} deve ser concluída em 15 minutos`,
            priority: "medium",
            autoClose: true,
            duration: 8000,
          });
        }
      }

      // Verificar pausa longa
      if (activeBreak) {
        const breakStart = new Date();
        const [startHour, startMin] = activeBreak.startTime
          .split(":")
          .map(Number);
        breakStart.setHours(startHour, startMin, 0, 0);

        const breakDuration =
          (now.getTime() - breakStart.getTime()) / (1000 * 60);

        if (breakDuration > 30) {
          addNotification({
            type: "warning",
            title: "Pausa Longa",
            message: `Pausa ativa há ${Math.round(breakDuration)} minutos`,
            priority: "medium",
            autoClose: true,
            duration: 6000,
          });
        }
      }

      // Verificar próxima tarefa
      const nextTask = tasks.find((t) => t.status === "pending");
      if (nextTask && !currentTask) {
        const [startHour, startMin] = nextTask.startTime.split(":").map(Number);
        const taskStartTime = new Date();
        taskStartTime.setHours(startHour, startMin, 0, 0);

        const minutesUntilStart =
          (taskStartTime.getTime() - now.getTime()) / (1000 * 60);

        if (minutesUntilStart <= 5 && minutesUntilStart > 0) {
          addNotification({
            type: "info",
            title: "Próxima Tarefa",
            message: `${nextTask.activity} deve iniciar em ${Math.round(
              minutesUntilStart
            )} minutos`,
            priority: "medium",
            autoClose: true,
            duration: 10000,
          });
        }
      }

      // Verificar metas diárias
      const completedTasks = tasks.filter(
        (t) => t.status === "completed"
      ).length;
      const totalTasks = tasks.length;
      const progress = (completedTasks / totalTasks) * 100;

      if (progress >= 50 && progress < 75 && completedTasks > 0) {
        addNotification({
          type: "success",
          title: "Boa Performance",
          message: `${completedTasks} de ${totalTasks} tarefas concluídas (${Math.round(
            progress
          )}%)`,
          priority: "low",
          autoClose: true,
          duration: 5000,
        });
      }
    };

    // Verificar alertas a cada 30 segundos
    const interval = setInterval(checkAlerts, 30000);
    checkAlerts(); // Verificação inicial

    return () => clearInterval(interval);
  }, [currentTask, activeBreak, tasks, currentTime]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "error":
        return <FaExclamationCircle />;
      case "warning":
        return <FaExclamationTriangle />;
      case "success":
        return <FaCheckCircle />;
      case "info":
        return <FaInfoCircle />;
      default:
        return <FaBell />;
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (notifications.length === 0) return null;

  return (
    <div className={`notification-panel ${isMinimized ? "minimized" : ""}`}>
      <div className="notification-header">
        <div className="notification-title">
          <span className="notification-icon">
            <FaBell />
          </span>
          <span>Notificações ({notifications.length})</span>
        </div>
        <button
          className="minimize-btn"
          onClick={() => setIsMinimized(!isMinimized)}
        >
          {isMinimized ? <FaChartLine /> : <FaChartBar />}
        </button>
      </div>

      {!isMinimized && (
        <div className="notifications-list">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-item ${notification.type} priority-${notification.priority}`}
            >
              <div className="notification-content">
                <div className="notification-main">
                  <span className="notification-type-icon">
                    {getNotificationIcon(notification.type)}
                  </span>
                  <div className="notification-text">
                    <h4>{notification.title}</h4>
                    <p>{notification.message}</p>
                  </div>
                </div>
                <div className="notification-meta">
                  <span className="notification-time">
                    {formatTime(notification.timestamp)}
                  </span>
                  <button
                    className="close-btn"
                    onClick={() => removeNotification(notification.id)}
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
