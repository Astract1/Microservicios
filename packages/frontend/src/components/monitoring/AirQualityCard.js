import React from 'react';
import '../../styles/monitoring/Monitoring.css';

const AirQualityCard = ({ airQuality }) => {
  if (!airQuality) {
    return <div className="air-quality-card loading">Cargando datos de calidad del aire...</div>;
  }

  // Determinar color basado en el índice AQI
  const getAQIColor = (aqi) => {
    if (aqi <= 50) return '#00E400'; // Bueno - Verde
    if (aqi <= 100) return '#FFFF00'; // Moderado - Amarillo
    if (aqi <= 150) return '#FF7E00'; // Insalubre para grupos sensibles - Naranja
    if (aqi <= 200) return '#FF0000'; // Insalubre - Rojo
    if (aqi <= 300) return '#99004C'; // Muy insalubre - Púrpura
    return '#7E0023'; // Peligroso - Marrón
  };

  // Determinar categoría de calidad del aire
  const getAQICategory = (aqi) => {
    if (aqi <= 50) return 'Buena';
    if (aqi <= 100) return 'Moderada';
    if (aqi <= 150) return 'Insalubre para grupos sensibles';
    if (aqi <= 200) return 'Insalubre';
    if (aqi <= 300) return 'Muy insalubre';
    return 'Peligrosa';
  };

  const aqiColor = getAQIColor(airQuality.aqi);

  return (
    <div className="air-quality-card">
      <h3>Calidad del Aire en {airQuality.city}</h3>
      <div className="aqi-display" style={{ borderColor: aqiColor }}>
        <div className="aqi-value" style={{ color: aqiColor }}>
          {airQuality.aqi}
        </div>
        <div className="aqi-label">AQI</div>
      </div>
      <div className="aqi-category" style={{ backgroundColor: aqiColor }}>
        {getAQICategory(airQuality.aqi)}
      </div>
      <div className="air-quality-details">
        <div className="detail-item">
          <span className="detail-label">Temperatura:</span>
          <span className="detail-value">{airQuality.temperature}°C</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Humedad:</span>
          <span className="detail-value">{airQuality.humidity}%</span>
        </div>
        {airQuality.source && (
          <div className="data-source">
            Fuente: {airQuality.source}
            {airQuality.simulated && " (Simulado)"}
          </div>
        )}
      </div>
    </div>
  );
};

export default AirQualityCard; 