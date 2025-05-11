import React from 'react';
import '../../styles/monitoring/Monitoring.css';

const AlertsPanel = ({ alerts = [] }) => {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="alerts-panel empty">
        <p className="no-alerts">No hay alertas activas en este momento</p>
      </div>
    );
  }

  // Función para obtener ícono según tipo de alerta
  const getAlertIcon = (type) => {
    switch (type?.toUpperCase()) {
      case 'AIR':
        return '🌫️';
      case 'WEATHER':
        return '⚡';
      case 'RAIN':
        return '🌧️';
      case 'TEMPERATURE':
        return '🌡️';
      case 'WIND':
        return '💨';
      default:
        return '⚠️';
    }
  };

  // Función para obtener clase CSS según severidad
  const getAlertClass = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'low':
        return 'alert-low';
      case 'medium':
        return 'alert-medium';
      case 'high':
        return 'alert-high';
      case 'critical':
        return 'alert-critical';
      default:
        return 'alert-default';
    }
  };

  return (
    <div className="alerts-panel">
      <div className="alert-count">
        {alerts.length} {alerts.length === 1 ? 'alerta activa' : 'alertas activas'}
      </div>
      <div className="alerts-list">
        {alerts.map((alert, index) => (
          <div 
            key={index} 
            className={`alert-item ${getAlertClass(alert.severity)}`}
          >
            <div className="alert-icon">{getAlertIcon(alert.type)}</div>
            <div className="alert-content">
              <div className="alert-message">{alert.message}</div>
              {alert.timestamp && (
                <div className="alert-timestamp">
                  {new Date(alert.timestamp).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertsPanel; 