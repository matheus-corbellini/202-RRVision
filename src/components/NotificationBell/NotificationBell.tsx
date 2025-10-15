import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaBell } from 'react-icons/fa';
import { useNotifications } from '../../contexts/NotificationContext';
import './NotificationBell.css';

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora';
    if (diffInMinutes < 60) return `${diffInMinutes}m atrás`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#f56565';
      case 'high': return '#ed8936';
      case 'medium': return '#fbb040';
      case 'low': return '#48bb78';
      default: return '#a0aec0';
    }
  };

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case 'critical': return 'Crítico';
      case 'high': return 'Alto';
      case 'medium': return 'Médio';
      case 'low': return 'Baixo';
      default: return 'Info';
    }
  };

  return (
    <div className="notification-bell" ref={dropdownRef}>
      <button 
        className={`bell-button ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Notificações"
      >
        <FaBell className="bell-icon" />
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && createPortal(
        <div className="notification-dropdown">
          <div className="notification-header">
            <h4>Notificações</h4>
            {unreadCount > 0 && (
              <button 
                className="mark-all-read"
                onClick={markAllAsRead}
              >
                Marcar todas como lidas
              </button>
            )}
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="no-notifications">
                <FaBell className="empty-bell" />
                <p>Nenhuma notificação</p>
              </div>
            ) : (
              notifications.slice(0, 5).map((notification) => (
                <div 
                  key={notification.id}
                  className={`notification-item ${notification.status === 'active' ? 'unread' : 'read'}`}
                  onClick={() => {
                    if (notification.status === 'active') {
                      markAsRead(notification.id);
                    }
                  }}
                >
                  <div className="notification-content">
                    <div className="notification-header-item">
                      <h5 className="notification-title">{notification.title}</h5>
                      <span 
                        className="severity-badge"
                        style={{ backgroundColor: getSeverityColor(notification.severity) }}
                      >
                        {getSeverityText(notification.severity)}
                      </span>
                    </div>
                    <p className="notification-description">{notification.description}</p>
                    <div className="notification-meta">
                      <span className="notification-time">
                        {formatTimestamp(notification.createdAt)}
                      </span>
                      <button 
                        className="remove-notification"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeNotification(notification.id);
                        }}
                        title="Remover notificação"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 5 && (
            <div className="notification-footer">
              <button className="view-all">
                Ver todas as notificações ({notifications.length})
              </button>
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}
