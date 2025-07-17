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

export interface Alert {
  id: string;
  type: "critical" | "warning" | "info";
  title: string;
  message: string;
  timestamp: string;
}

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
