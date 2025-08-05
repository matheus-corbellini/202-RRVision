export interface Pendency {
  id: string;
  type: "urgent" | "warning" | "info";
  title: string;
  description: string;
  sector: string;
  timestamp: string;
  status: "open" | "inProgress" | "resolved";
  priority: "low" | "medium" | "high" | "urgent";
  assignedTo?: {
    id: string;
    name: string;
    role: string;
  };
  dueDate?: string;
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
  attachments: PendencyAttachment[];
  comments: PendencyComment[];
}

export interface PendencyAttachment {
  id: string;
  name: string;
  type: "image" | "document" | "video";
  url: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface PendencyComment {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
  type: "comment" | "status_change" | "assignment";
}

export interface PendencyStats {
  urgent: number;
  warning: number;
  info: number;
  open: number;
  inProgress: number;
  resolved: number;
  total: number;
  overdue: number;
}

export interface PendencyFilters {
  filterType: string;
  filterStatus: string;
  filterPriority: string;
  filterCategory: string;
  filterLocation: string;
  showOnlyMyPendencies: boolean;
  showOnlyOverdue: boolean;
}
