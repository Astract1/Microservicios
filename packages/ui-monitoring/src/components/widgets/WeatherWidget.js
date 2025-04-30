import React from 'react';
import './Widgets.css';

const WeatherWidget = ({ data }) => {
  // Si no hay datos, mostrar un mensaje de carga
  if (!data) {
    return (
      <div className="widget weather-widget">
        <h2>Clima Actual</h2>
        <div className="widget-content loading">
          <p>Cargando datos meteorológicos...</p>
        </div>
      </div>
    );
  }

  // Datos de ejemplo (en una implementación real, estos vendrían de la prop data)
  const weatherData = data || {
    location: 'Ciudad de México',
    temperature: 23,
    humidity: 65,
    windSpeed: 10,
    windDirection: 'NE',
    conditions: 'Parcialmente nublado',
    icon: 'partly-cloudy'
  };

  // Función para determinar el ícono basado en las condiciones
  const getWeatherIcon = (condition) => {
    const conditionMap = {
      'soleado': '☀️',
      'parcialmente nublado': '⛅',
      'nublado': '☁️',
      'lluvia': '🌧️',
      'tormenta': '⛈️',
      'nieve': '❄️',
      'niebla': '🌫️'
    };

    // Convertir a minúsculas para la comparación
    const conditionLower = condition.toLowerCase();
    return conditionMap[conditionLower] || '🌡️';
  };

  return (
    <div className="widget weather-widget">
      <h2>Clima Actual</h2>
      <div className="widget-content">
        <div className="weather-location">
          <span>{weatherData.location}</span>
        </div>
        
        <div className="weather-main">
          <div className="weather-icon">
            {getWeatherIcon(weatherData.conditions)}
          </div>
          <div className="weather-temp">
            <span className="temp-value">{weatherData.temperature}°C</span>
            <span className="temp-condition">{weatherData.conditions}</span>
          </div>
        </div>
        
        <div className="weather-details">
          <div className="weather-detail">
            <span className="detail-label">Humedad:</span>
            <span className="detail-value">{weatherData.humidity}%</span>
          </div>
          <div className="weather-detail">
            <span className="detail-label">Viento:</span>
            <span className="detail-value">{weatherData.windSpeed} km/h {weatherData.windDirection}</span>
          </div>
        </div>
        
        <div className="widget-footer">
          <a href="/weather-monitoring" className="widget-link">Ver detalles completos</a>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget; 