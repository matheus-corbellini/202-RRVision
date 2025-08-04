export type AlertStatus =
  | "active"
  | "acknowledged"
  | "in_progress"
  | "resolved"
  | "dismissed";

export interface ProductionAlert {
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
  recipients: AlertRecipient[];
  status: AlertStatus;
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
  comments: AlertComment[];
}

export interface AlertRecipient {
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
}

export interface AlertComment {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
  type: "comment" | "status_change" | "escalation";
}

export interface AlertStats {
  active: number;
  critical: number;
  urgent: number;
  unacknowledged: number;
  total: number;
}

export interface AlertFilters {
  filterType: string;
  filterStatus: string;
  filterSeverity: string;
  filterPriority: string;
  showOnlyMyAlerts: boolean;
}
