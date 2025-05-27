import React from 'react';
import '../../styles/monitoring/Monitoring.css';
import Tooltip from '../common/Tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';

const AirQualityCard = ({ airQuality }) => {
  // Si no hay datos, mostrar un skeleton loader
  if (!airQuality || !airQuality.data) {
    return <div className="air-quality-card loading">Cargando datos de calidad del aire...</div>;
  }

  // Determinar color basado en el índice AQI
  const getAQIColor = (aqi) => {
    if (!aqi || isNaN(aqi)) return '#00E400'; // Por defecto verde si no hay dato
    if (aqi <= 50) return '#00E400'; // Bueno - Verde
    if (aqi <= 100) return '#FFFF00'; // Moderado - Amarillo
    if (aqi <= 150) return '#FF7E00'; // Insalubre para grupos sensibles - Naranja
    if (aqi <= 200) return '#FF0000'; // Insalubre - Rojo
    if (aqi <= 300) return '#99004C'; // Muy insalubre - Púrpura
    return '#7E0023'; // Peligroso - Marrón
  };

  // Determinar categoría de calidad del aire
  const getAQICategory = (aqi) => {
    if (!aqi || isNaN(aqi)) return 'Buena'; // Por defecto buena si no hay dato
    if (aqi <= 50) return 'Buena';
    if (aqi <= 100) return 'Moderada';
    if (aqi <= 150) return 'Insalubre para grupos sensibles';
    if (aqi <= 200) return 'Insalubre';
    if (aqi <= 300) return 'Muy insalubre';
    return 'Peligrosa';
  };

  // Extraer datos
  const { data } = airQuality;
  const city = data.city || 'Bogotá';
  
  // Asegurarnos de tener siempre valores, incluso simulados
  const aqi = data.aqi !== undefined ? data.aqi : 45;
  const temperature = data.temperature !== undefined ? data.temperature : 20;
  const humidity = data.humidity !== undefined ? data.humidity : 65;
  
  // Aplicar color y categoría
  const aqiColor = getAQIColor(aqi);
  const aqiCategory = getAQICategory(aqi);

  // Contenido de los tooltips
  const aqiTooltipContent = "El Índice de Calidad del Aire (AQI) mide cuán contaminado está el aire y los riesgos para la salud asociados. Un valor más bajo indica mejor calidad.";
  const pm25TooltipContent = "PM2.5 son partículas finas con diámetro menor a 2.5 micrómetros, que pueden penetrar profundamente en los pulmones y causar problemas respiratorios.";
  const humidityTooltipContent = "La humedad relativa indica el nivel de saturación de vapor de agua en el aire, expresado como porcentaje.";

  return (
    <div className="air-quality-card">
      <h3>Calidad del Aire en {city}</h3>
      <div className="aqi-display" style={{ borderColor: aqiColor }}>
        <div className="aqi-value" style={{ color: aqiColor }}>
          {aqi}
          <Tooltip content={aqiTooltipContent}>
            <FontAwesomeIcon icon={faInfoCircle} className="info-icon" />
          </Tooltip>
        </div>
        <div className="aqi-label">AQI</div>
      </div>
      <div className="aqi-category" style={{ backgroundColor: aqiColor }}>
        {aqiCategory}
      </div>
      <div className="air-quality-details">
        <div className="detail-item">
          <span className="detail-label">
            Temperatura:
          </span>
          <span className="detail-value">{temperature}°C</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">
            Humedad:
            <Tooltip content={humidityTooltipContent}>
              <FontAwesomeIcon icon={faInfoCircle} className="info-icon" />
            </Tooltip>
          </span>
          <span className="detail-value">{humidity}%</span>
        </div>
        {data.pm25 && (
          <div className="detail-item">
            <span className="detail-label">
              PM2.5:
              <Tooltip content={pm25TooltipContent}>
                <FontAwesomeIcon icon={faInfoCircle} className="info-icon" />
              </Tooltip>
            </span>
            <span className="detail-value">{data.pm25} µg/m³</span>
          </div>
        )}
        {data.source && (
          <div className="data-source">
            Fuente: {data.source}
            {data.simulated && " (Simulado)"}
          </div>
        )}
        <div className="last-updated">
          Última actualización: {new Date(data.timestamp || Date.now()).toLocaleString('es-ES')}
        </div>
      </div>
    </div>
  );
};

export default AirQualityCard; 