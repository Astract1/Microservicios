import React from 'react';
import './Widgets.css';

const StatisticsWidget = ({ statistics }) => {
  // Si no hay datos, mostrar un mensaje de carga
  if (!statistics) {
    return (
      <div className="widget statistics-widget">
        <h2>Estadísticas Ambientales</h2>
        <div className="widget-content loading">
          <p>Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  // Datos de ejemplo
  const statsData = Object.keys(statistics).length > 0 ? statistics : {
    averageTemperature: 22.5,
    maxTemperature: 28.3,
    minTemperature: 16.7,
    averageHumidity: 64,
    averageAQI: 62,
    rainfallLastMonth: 45.8
  };

  return (
    <div className="widget statistics-widget">
      <h2>Estadísticas Ambientales</h2>
      <div className="widget-content">
        <div className="statistics-grid">
          <div className="statistic-item">
            <div className="statistic-value">{statsData.averageTemperature}°C</div>
            <div className="statistic-label">Temperatura Promedio</div>
          </div>
          <div className="statistic-item">
            <div className="statistic-value">{statsData.averageHumidity}%</div>
            <div className="statistic-label">Humedad Promedio</div>
          </div>
          <div className="statistic-item">
            <div className="statistic-value">{statsData.averageAQI}</div>
            <div className="statistic-label">Índice de Calidad del Aire</div>
          </div>
          <div className="statistic-item">
            <div className="statistic-value">{statsData.rainfallLastMonth}mm</div>
            <div className="statistic-label">Lluvia Último Mes</div>
          </div>
        </div>
        <div className="widget-footer">
          <a href="/statistics" className="widget-link">Ver estadísticas detalladas</a>
        </div>
      </div>
    </div>
  );
};

export default StatisticsWidget; 