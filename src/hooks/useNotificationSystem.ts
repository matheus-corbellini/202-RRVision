import { useNotifications } from '../contexts/NotificationContext';
import type { Alert } from '../types/alerts';

interface CreateNotificationParams {
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  priority?: 'urgent' | 'high' | 'medium' | 'low';
  sector?: string;
  relatedEntity?: {
    id: string;
    name: string;
  };
  source?: {
    id: string;
    name: string;
  };
}

export function useNotificationSystem() {
  const { addNotification, notifications, unreadCount, markAsRead, markAllAsRead, removeNotification } = useNotifications();

  const createNotification = (params: CreateNotificationParams): Alert => {
    const notification: Alert = {
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: params.title,
      description: params.description,
      severity: params.severity,
      priority: params.priority || params.severity,
      status: 'active',
      location: {
        sector: params.sector || 'Sistema',
      },
      relatedEntity: params.relatedEntity || {
        id: 'system',
        name: 'Sistema',
      },
      source: params.source || {
        id: 'system',
        name: 'Sistema',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'system',
      updatedBy: 'system',
      attachments: [],
      recipients: [],
    };

    addNotification(notification);
    return notification;
  };

  const createSystemNotification = (title: string, description: string, severity: 'critical' | 'high' | 'medium' | 'low' = 'medium') => {
    return createNotification({
      title,
      description,
      severity,
      source: {
        id: 'system',
        name: 'Sistema',
      },
    });
  };

  const createBlingNotification = (title: string, description: string, severity: 'critical' | 'high' | 'medium' | 'low' = 'medium') => {
    return createNotification({
      title,
      description,
      severity,
      source: {
        id: 'bling',
        name: 'Integração Bling',
      },
    });
  };

  const createOrderNotification = (
    orderId: string,
    title: string,
    description: string,
    severity: 'critical' | 'high' | 'medium' | 'low' = 'medium'
  ) => {
    return createNotification({
      title,
      description,
      severity,
      relatedEntity: {
        id: orderId,
        name: `Pedido ${orderId}`,
      },
      sector: 'Produção',
    });
  };

  const createSectorNotification = (
    sectorName: string,
    title: string,
    description: string,
    severity: 'critical' | 'high' | 'medium' | 'low' = 'medium'
  ) => {
    return createNotification({
      title,
      description,
      severity,
      sector: sectorName,
      relatedEntity: {
        id: sectorName.toLowerCase(),
        name: `Setor ${sectorName}`,
      },
    });
  };

  return {
    // Estado
    notifications,
    unreadCount,
    
    // Ações básicas
    markAsRead,
    markAllAsRead,
    removeNotification,
    
    // Criadores de notificações
    createNotification,
    createSystemNotification,
    createBlingNotification,
    createOrderNotification,
    createSectorNotification,
  };
}
