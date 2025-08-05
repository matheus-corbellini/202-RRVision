export interface NonConformity {
  id: string;
  title: string;
  description: string;
  category: "quality" | "safety" | "process" | "equipment" | "material";
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "in_progress" | "resolved" | "closed";
  stopProduction: boolean;
  location: {
    sector: string;
    station: string;
    equipment?: string;
  };
  reporter: {
    id: string;
    name: string;
    role: string;
  };
  assignedTo?: {
    id: string;
    name: string;
    role: string;
  };
  relatedTask?: {
    taskId: string;
    taskName: string;
    orderId: string;
  };
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  attachments: Attachment[];
  actions: NonConformityAction[];
  alerts: NonConformityAlert[];
}

export interface Attachment {
  id: string;
  name: string;
  type: "image" | "document" | "video";
  url: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface NonConformityAction {
  id: string;
  type:
    | "comment"
    | "status_change"
    | "assignment"
    | "attachment"
    | "resolution";
  description: string;
  performedBy: {
    id: string;
    name: string;
    role: string;
  };
  timestamp: string;
  details?: Record<string, unknown>;
}

export interface NonConformityAlert {
  id: string;
  type: "coordinator" | "quality" | "warehouse" | "engineering" | "admin";
  recipient: string;
  message: string;
  sentAt: string;
  acknowledged: boolean;
}

export interface NonConformityStats {
  open: number;
  inProgress: number;
  resolved: number;
  critical: number;
  total: number;
}

export interface NonConformityFilters {
  filterStatus: string;
  filterCategory: string;
  filterSeverity: string;
  filterLocation: string;
  showOnlyMyNCs: boolean;
  showOnlyCritical: boolean;
}
