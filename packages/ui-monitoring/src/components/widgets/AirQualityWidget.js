import React from 'react';
import './Widgets.css';

const AirQualityWidget = ({ data }) => {
  // Si no hay datos, mostrar un mensaje de carga
  if (!data) {
    return (
      <div className="widget air-quality-widget">
        <h2>Calidad del Aire</h2>
        <div className="widget-content loading">
          <p>Cargando datos de calidad del aire...</p>
        </div>
      </div>
    );
  }

  // Datos de ejemplo (en una implementación real, estos vendrían de la prop data)
  const airQualityData = data || {
    location: 'Ciudad de México',
    aqi: 55,
    category: 'Moderado',
    mainPollutant: 'PM2.5',
    pm25: 18.2,
    pm10: 40.5,
    o3: 35.8,
    no2: 25.1,
    so2: 10.3,
    co: 0.8,
    timestamp: new Date().toLocaleDateString()
  };

  // Función para determinar el color según la categoría de calidad del aire
  const getAQIColor = (aqi) => {
    if (aqi <= 50) return '#00e400'; // Buena
    if (aqi <= 100) return '#ffff00'; // Moderada
    if (aqi <= 150) return '#ff7e00'; // Insalubre para grupos sensibles
    if (aqi <= 200) return '#ff0000'; // Insalubre
    if (aqi <= 300) return '#99004c'; // Muy insalubre
    return '#7e0023'; // Peligrosa
  };

  // Función para obtener la categoría según el AQI
  const getAQICategory = (aqi) => {
    if (aqi <= 50) return 'Buena';
    if (aqi <= 100) return 'Moderada';
    if (aqi <= 150) return 'Insalubre para grupos sensibles';
    if (aqi <= 200) return 'Insalubre';
    if (aqi <= 300) return 'Muy insalubre';
    return 'Peligrosa';
  };

  // Color de fondo basado en el AQI
  const backgroundColor = getAQIColor(airQualityData.aqi);
  const textColor = airQualityData.aqi > 150 ? '#ffffff' : '#000000';

  return (
    <div className="widget" style={{ background: backgroundColor, color: textColor }}>
      <h2 style={{ borderBottomColor: 'rgba(255, 255, 255, 0.2)' }}>Calidad del Aire</h2>
      <div className="widget-content">
        <div className="weather-location">
          <span>{airQualityData.location}</span>
        </div>
        
        <div className="weather-main" style={{ textAlign: 'center', margin: '20px 0' }}>
          <div style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '5px' }}>
            {airQualityData.aqi}
          </div>
          <div style={{ fontSize: '1.2rem' }}>
            {getAQICategory(airQualityData.aqi)}
          </div>
          <div style={{ marginTop: '10px', fontSize: '0.9rem' }}>
            Principal contaminante: {airQualityData.mainPollutant}
          </div>
        </div>
        
        <div className="weather-details">
          <div className="weather-detail">
            <span className="detail-label">PM2.5:</span>
            <span className="detail-value">{airQualityData.pm25} μg/m³</span>
          </div>
          <div className="weather-detail">
            <span className="detail-label">PM10:</span>
            <span className="detail-value">{airQualityData.pm10} μg/m³</span>
          </div>
          <div className="weather-detail">
            <span className="detail-label">O3:</span>
            <span className="detail-value">{airQualityData.o3} μg/m³</span>
          </div>
        </div>
        
        <div className="widget-footer">
          <a href="/air-quality" className="widget-link" style={{ color: textColor }}>
            Ver detalles completos
          </a>
        </div>
      </div>
    </div>
  );
};

export default AirQualityWidget; 