import React from 'react';
import './Widgets.css';

const AlertsWidget = ({ alerts }) => {
  // Si no hay datos, mostrar un mensaje de carga
  if (!alerts) {
    return (
      <div className="widget alerts-widget">
        <h2>Alertas Ambientales</h2>
        <div className="widget-content loading">
          <p>Cargando alertas...</p>
        </div>
      </div>
    );
  }

  // Datos de ejemplo
  const alertsData = alerts.length > 0 ? alerts : [
    {
      id: 1,
      title: 'Peligro de inundación',
      message: 'Se esperan lluvias intensas en las próximas 24 horas.',
      severity: 'critical',
      timestamp: '2023-06-24T14:30:00'
    },
    {
      id: 2,
      title: 'Mala calidad del aire',
      message: 'Niveles de partículas PM2.5 por encima del umbral recomendado.',
      severity: 'warning',
      timestamp: '2023-06-24T10:15:00'
    },
    {
      id: 3,
      title: 'Mantenimiento de estación',
      message: 'La estación #3 estará en mantenimiento mañana.',
      severity: 'info',
      timestamp: '2023-06-23T16:45:00'
    }
  ];

  // Función para formatear la fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="widget alerts-widget">
      <h2>Alertas Ambientales</h2>
      <div className="widget-content">
        {alertsData.length === 0 ? (
          <p className="no-alerts">No hay alertas activas en este momento.</p>
        ) : (
          <ul className="alerts-list">
            {alertsData.map(alert => (
              <li key={alert.id} className={`alert-item ${alert.severity}`}>
                <div className="alert-title">{alert.title}</div>
                <div className="alert-message">{alert.message}</div>
                <div className="alert-time">{formatDate(alert.timestamp)}</div>
              </li>
            ))}
          </ul>
        )}
        <div className="widget-footer">
          <a href="/alerts" className="widget-link">Ver todas las alertas</a>
        </div>
      </div>
    </div>
  );
};

export default AlertsWidget; 