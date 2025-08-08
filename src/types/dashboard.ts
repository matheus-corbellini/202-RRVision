export interface OrderSector {
  name: string;
  activity: string;
  estimatedTime: number;
  actualTime?: number;
  setupTime: number;
  status: "pending" | "active" | "completed" | "blocked";
}

export interface Order {
  id: string;
  product: string;
  quantity: number;
  status: "pending" | "production" | "completed" | "urgent";
  progress: number;
  startDate: string;
  expectedEnd: string;
  actualEnd?: string;
  isOverdue: boolean;
  isUrgent: boolean;
  sectors: OrderSector[];
}

export interface DashboardAlert {
  id: string;
  type: "critical" | "warning" | "info";
  title: string;
  message: string;
  timestamp: string;
}
export type Alert = DashboardAlert;

export interface Sector {
  name: string;
  status: "active" | "idle" | "blocked";
  efficiency: number;
  activeOrders: number;
}

export interface DashboardStats {
  activeOrders: number;
  averageEfficiency: number;
  urgentOrders: number;
  activeSectors: number;
}

export interface ImportData {
  ordersImported: number;
  routesLoaded: number;
  pendingRoutes: number;
  timesCalculated: string;
}

export interface StatusSemaphoreData {
  status: "green" | "yellow" | "red";
  activeOrders: number;
  urgentOrders: number;
  blockedOrders: number;
}

export interface ControlPanelData {
  generalStatus: "green" | "yellow" | "red";
  activeOrders: number;
  urgentOrders: number;
  blockedOrders: number;
  pendencies: Array<{
    id: string;
    type: "urgent" | "warning" | "info";
    title: string;
    description: string;
    sector: string;
    timestamp: string;
    status: "open" | "inProgress" | "resolved";
    priority: "low" | "medium" | "high" | "urgent";
    category:
      | "maintenance"
      | "quality"
      | "safety"
      | "process"
      | "material"
      | "equipment";
    location: {
      sector: string;
      station?: string;
      equipment?: string;
    };
    createdAt: string;
    updatedAt: string;
    resolvedAt?: string;
    resolvedBy?: string;
    attachments: Array<{
      id: string;
      name: string;
      type: "image" | "document" | "video";
      url: string;
      uploadedAt: string;
      uploadedBy: string;
    }>;
    comments: Array<{
      id: string;
      userId: string;
      userName: string;
      message: string;
      timestamp: string;
      type: "comment" | "status_change" | "assignment";
    }>;
  }>;
  alerts: Array<{
    id: string;
    type:
      | "production_stop"
      | "non_conformity"
      | "priority_change"
      | "delay"
      | "quality"
      | "maintenance"
      | "material";
    severity: "low" | "medium" | "high" | "critical";
    title: string;
    message: string;
    description: string;
    source: {
      type: "operator" | "system" | "supervisor";
      id: string;
      name: string;
    };
    location: {
      sector: string;
      station?: string;
      equipment?: string;
    };
    relatedEntity: {
      type: "order" | "task" | "equipment" | "material";
      id: string;
      name: string;
    };
    recipients: Array<{
      id: string;
      name: string;
      role:
        | "coordinator"
        | "quality"
        | "warehouse"
        | "engineering"
        | "admin"
        | "operator";
      department: string;
      notificationMethods: ("email" | "sms" | "push" | "dashboard")[];
      acknowledged: boolean;
      acknowledgedAt?: string;
    }>;
    status:
      | "active"
      | "acknowledged"
      | "in_progress"
      | "resolved"
      | "dismissed";
    priority: "low" | "medium" | "high" | "urgent";
    createdAt: string;
    updatedAt: string;
    acknowledgedAt?: string;
    acknowledgedBy?: string;
    resolvedAt?: string;
    resolvedBy?: string;
    escalatedAt?: string;
    escalationLevel: number;
    autoEscalation: boolean;
    tags: string[];
    attachments: string[];
    comments: Array<{
      id: string;
      userId: string;
      userName: string;
      message: string;
      timestamp: string;
      type: "comment" | "status_change" | "escalation";
    }>;
  }>;
  nonConformities: {
    open: number;
    inProgress: number;
    resolved: number;
    critical: number;
    total: number;
  };
}
