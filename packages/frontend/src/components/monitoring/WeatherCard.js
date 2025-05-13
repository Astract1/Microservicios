import React from 'react';
import '../../styles/monitoring/Monitoring.css';

const WeatherCard = ({ weather }) => {
  // Comprobamos si tenemos datos en cualquiera de los formatos posibles
  const noData = !weather || ((!weather.data) && (!weather.city && !weather.temperature && !weather.humidity));

  // Si no hay datos, mostrar un skeleton loader
  if (noData) {
    return <div className="weather-card loading">Cargando datos meteorológicos...</div>;
  }

  // Determinar si los datos están en weather.data o directamente en weather
  const data = weather.data || weather;

  // Función para determinar el ícono según la descripción del clima
  const getWeatherIcon = (description) => {
    if (!description) return '☀️'; // Soleado por defecto
    
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
    if (!degrees && degrees !== 0) return '↓'; // Norte por defecto
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
    if (precipitation === undefined || precipitation === null) return 'Sin precipitaciones';
    if (precipitation === 0) return 'Sin precipitaciones';
    if (precipitation < 2.5) return 'Lluvia ligera';
    if (precipitation < 7.5) return 'Lluvia moderada';
    if (precipitation < 15) return 'Lluvia fuerte';
    return 'Lluvia intensa';
  };

  // Asegurarnos de tener siempre valores, incluso si son simulados
  const city = data.city || 'Bogotá';
  const tempValue = data.temperature !== undefined ? data.temperature : 21;
  const humidityValue = data.humidity !== undefined ? data.humidity : 70;
  const windSpeedValue = data.windSpeed !== undefined ? data.windSpeed : 2.5;
  const windDirectionValue = data.windDirection !== undefined ? data.windDirection : 180;
  const precipitationValue = data.precipitation !== undefined ? data.precipitation : 0;
  const weatherDescriptionValue = data.weatherDescription || 'Despejado';

  const weatherIcon = getWeatherIcon(weatherDescriptionValue);
  const windDirection = getWindDirectionIcon(windDirectionValue);
  const rainStatus = getRainIndicator(precipitationValue);

  return (
    <div className="weather-card">
      <h3>Clima en {city}</h3>
      <div className="weather-main">
        <div className="weather-icon">{weatherIcon}</div>
        <div className="temperature">{tempValue}°C</div>
      </div>
      <div className="weather-description">
        {weatherDescriptionValue}
      </div>
      <div className="weather-details">
        <div className="detail-item">
          <span className="detail-label">Humedad:</span>
          <span className="detail-value">{humidityValue}%</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Viento:</span>
          <span className="detail-value">
            {windSpeedValue} m/s {windDirection}
          </span>
        </div>
        <div className="detail-item rain-status">
          <span className="detail-label">Precipitación:</span>
          <span className="detail-value">{precipitationValue} mm/h</span>
        </div>
        <div className="rain-indicator">
          {rainStatus}
        </div>
      </div>
      {data.source && (
        <div className="data-source">
          Fuente: {data.source}
          {data.simulated && " (Simulado)"}
        </div>
      )}
    </div>
  );
};

export default WeatherCard; 