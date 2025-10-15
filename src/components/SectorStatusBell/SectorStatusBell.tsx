import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaIndustry } from 'react-icons/fa';
import './SectorStatusBell.css';

interface SectorStatusBellProps {
  sectors: Array<{
    name: string;
    code: string;
    description: string;
    isActive: boolean;
  }>;
}

export default function SectorStatusBell({ sectors }: SectorStatusBellProps) {
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

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Ativo";
      case "inactive":
        return "Inativo";
      case "idle":
        return "Ocioso";
      case "blocked":
        return "Bloqueado";
      default:
        return status;
    }
  };

  const getStatusClass = (isActive: boolean) => {
    return isActive ? "active" : "inactive";
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? "#48bb78" : "#f56565";
  };

  return (
    <div className="sector-status-bell" ref={dropdownRef}>
      <button 
        className={`bell-button ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Status dos Setores"
      >
        <FaIndustry className="bell-icon" />
      </button>

      {isOpen && createPortal(
        <div className="sector-status-dropdown">
          <div className="notification-header">
            <h4>Status dos Setores</h4>
          </div>
          
          <div className="notification-list">
            <div className="sectors-content">
              {sectors.map((sector, index) => (
                <div key={index} className="sector-item">
                  <div className="sector-info">
                    <h5>{sector.name}</h5>
                    <p>
                      Código: {sector.code} | Descrição: {sector.description}
                    </p>
                  </div>
                  <div className="sector-status">
                    <div 
                      className={`status-indicator status-${getStatusClass(sector.isActive)}`}
                      style={{ backgroundColor: getStatusColor(sector.isActive) }}
                    ></div>
                    <span>{getStatusText(sector.isActive ? "active" : "inactive")}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
