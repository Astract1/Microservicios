import React from 'react';
import '../../styles/monitoring/Monitoring.css';

const WeatherCard = ({ weather }) => {
  if (!weather) {
    return <div className="weather-card loading">Cargando datos meteorológicos...</div>;
  }

  // Función para determinar el ícono según la descripción del clima
  const getWeatherIcon = (description) => {
    if (!description) return '☁️'; // Nublado por defecto
    
    const desc = description.toLowerCase();
    if (desc.includes('lluvia') || desc.includes('rain')) return '🌧️';
    if (desc.includes('tormenta') || desc.includes('storm')) return '⛈️';
    if (desc.includes('nieve') || desc.includes('snow')) return '❄️';
    if (desc.includes('despejado') || desc.includes('clear')) return '☀️';
    if (desc.includes('nubes') || desc.includes('cloud')) return '☁️';
    if (desc.includes('niebla') || desc.includes('fog')) return '🌫️';
    
    return '🌤️'; // Icono genérico
  };

  // Determinar ícono para la dirección del viento
  const getWindDirectionIcon = (degrees) => {
    if (degrees >= 337.5 || degrees < 22.5) return '↓'; // Norte
    if (degrees >= 22.5 && degrees < 67.5) return '↙️'; // Noreste
    if (degrees >= 67.5 && degrees < 112.5) return '←'; // Este
    if (degrees >= 112.5 && degrees < 157.5) return '↖️'; // Sureste
    if (degrees >= 157.5 && degrees < 202.5) return '↑'; // Sur
    if (degrees >= 202.5 && degrees < 247.5) return '↗️'; // Suroeste
    if (degrees >= 247.5 && degrees < 292.5) return '→'; // Oeste
    if (degrees >= 292.5 && degrees < 337.5) return '↘️'; // Noroeste
    return '↓';
  };

  // Generar indicador de precipitación
  const getRainIndicator = (precipitation) => {
    if (precipitation === 0) return 'Sin precipitaciones';
    if (precipitation < 2.5) return 'Lluvia ligera';
    if (precipitation < 7.5) return 'Lluvia moderada';
    if (precipitation < 15) return 'Lluvia fuerte';
    return 'Lluvia intensa';
  };

  const weatherIcon = getWeatherIcon(weather.weatherDescription);
  const windDirection = getWindDirectionIcon(weather.windDirection);
  const rainStatus = getRainIndicator(weather.precipitation);

  return (
    <div className="weather-card">
      <h3>Clima en {weather.city}</h3>
      <div className="weather-main">
        <div className="weather-icon">{weatherIcon}</div>
        <div className="temperature">{weather.temperature}°C</div>
      </div>
      <div className="weather-description">
        {weather.weatherDescription || 'Información climática'}
      </div>
      <div className="weather-details">
        <div className="detail-item">
          <span className="detail-label">Humedad:</span>
          <span className="detail-value">{weather.humidity}%</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Viento:</span>
          <span className="detail-value">
            {weather.windSpeed} m/s {windDirection}
          </span>
        </div>
        <div className="detail-item rain-status">
          <span className="detail-label">Precipitación:</span>
          <span className="detail-value">{weather.precipitation} mm/h</span>
        </div>
        <div className="rain-indicator">
          {rainStatus}
        </div>
      </div>
      {weather.source && (
        <div className="data-source">
          Fuente: {weather.source}
          {weather.simulated && " (Simulado)"}
        </div>
      )}
    </div>
  );
};

export default WeatherCard; 