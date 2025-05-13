import React from 'react';
import '../../styles/monitoring/Monitoring.css';

const StatusIndicator = ({ status, label, message, lastUpdated }) => {
  // Determinar el color basado en el estado
  const getStatusColor = () => {
    if (status === true) return '#4CAF50'; // Verde para activo/conectado
    if (status === false) return '#F44336'; // Rojo para inactivo/desconectado
    return '#FFC107'; // Amarillo para estado desconocido o cargando
  };

  // Determinar el ícono basado en el estado
  const getStatusIcon = () => {
    if (status === true) return '✅'; // Checkmark para activo
    if (status === false) return '❌'; // X para inactivo
    return '⏳'; // Reloj de arena para estado desconocido o cargando
  };

  // Formatear la fecha de última actualización
  const formatLastUpdated = (timestamp) => {
    if (!timestamp) return '';
    
    // Si es un string, intentamos convertirlo a Date
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    
    // Validar que sea un objeto Date válido
    if (!(date instanceof Date) || isNaN(date)) return '';
    
    return date.toLocaleString('es-ES');
  };

  return (
    <div className="status-indicator" style={{ borderLeftColor: getStatusColor() }}>
      <div className="status-header">
        <span className="status-icon">{getStatusIcon()}</span>
        <span className="status-label">{label}</span>
      </div>
      <div className="status-message">{message}</div>
      {lastUpdated && (
        <div className="status-time">
          Última actualización: {formatLastUpdated(lastUpdated)}
        </div>
      )}
    </div>
  );
};

export default StatusIndicator; 