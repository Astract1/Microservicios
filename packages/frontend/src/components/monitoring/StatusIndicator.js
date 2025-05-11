import React from 'react';
import '../../styles/monitoring/Monitoring.css';

const StatusIndicator = ({ 
  status = 'normal', 
  message = 'Sistema funcionando correctamente',
  lastUpdate = new Date().toLocaleString(),
  label
}) => {
  // Función para determinar el color y el texto del estado
  const getStatusInfo = (status) => {
    // Manejar el caso booleano primero
    if (typeof status === 'boolean') {
      return status ? 
        { color: '#34c759', text: 'Activo', icon: '✅' } : 
        { color: '#ff3b30', text: 'Inactivo', icon: '⚠️' };
    }
    
    // Luego manejar strings
    const statusLower = String(status).toLowerCase();
    
    switch (statusLower) {
      case 'critical':
      case 'crítico':
        return { 
          color: '#ff3b30',
          text: 'Crítico',
          icon: '⚠️'
        };
      case 'warning':
      case 'advertencia':
        return { 
          color: '#ffcc00',
          text: 'Advertencia',
          icon: '⚠️'
        };
      case 'normal':
      case 'ok':
        return { 
          color: '#34c759',
          text: 'Normal',
          icon: '✅'
        };
      case 'inactive':
      case 'inactivo':
        return { 
          color: '#8e8e93',
          text: 'Inactivo',
          icon: '⏸️'
        };
      case 'loading':
        return {
          color: '#007aff',
          text: 'Cargando',
          icon: '⏳'
        };
      default:
        return { 
          color: '#34c759',
          text: 'Normal',
          icon: '✅'
        };
    }
  };

  const statusInfo = getStatusInfo(status);

  return (
    <div className="status-indicator">
      <div className="status-header">
        <h3>{label || 'Estado del Sistema'}</h3>
        <div 
          className="status-badge"
          style={{ backgroundColor: statusInfo.color }}
        >
          <span className="status-icon">{statusInfo.icon}</span>
          <span className="status-text">{statusInfo.text}</span>
        </div>
      </div>
      
      <div className="status-message">{message}</div>
      
      <div className="status-footer">
        <span className="status-update-time">Última actualización: {lastUpdate}</span>
      </div>
    </div>
  );
};

export default StatusIndicator; 