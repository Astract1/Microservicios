import React, { useState, useEffect } from 'react';
import './WeatherMonitoring.css';

const WeatherMonitoring = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        // Esta es una función simulada para obtener datos del clima
        // En una implementación real, aquí se conectaría con el servicio de backend
        setTimeout(() => {
          const mockData = {
            location: 'Ciudad de México',
            temperature: 23,
            humidity: 65,
            windSpeed: 10,
            conditions: 'Parcialmente nublado',
            forecast: [
              { day: 'Lunes', high: 24, low: 18, condition: 'Soleado' },
              { day: 'Martes', high: 22, low: 17, condition: 'Lluvia' },
              { day: 'Miércoles', high: 21, low: 16, condition: 'Nublado' },
              { day: 'Jueves', high: 25, low: 19, condition: 'Soleado' },
              { day: 'Viernes', high: 26, low: 20, condition: 'Soleado' }
            ]
          };
          setWeatherData(mockData);
          setLoading(false);
        }, 1500);
      } catch (err) {
        setError('Error al cargar datos meteorológicos');
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, []);

  if (loading) return <div className="loading">Cargando datos meteorológicos...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="weather-monitoring">
      <h1>Monitoreo Meteorológico</h1>

      <div className="weather-current">
        <h2>Condiciones Actuales en {weatherData.location}</h2>
        <div className="weather-card">
          <div className="weather-main">
            <div className="temperature">{weatherData.temperature}°C</div>
            <div className="conditions">{weatherData.conditions}</div>
          </div>
          <div className="weather-details">
            <div className="detail">
              <span className="label">Humedad</span>
              <span className="value">{weatherData.humidity}%</span>
            </div>
            <div className="detail">
              <span className="label">Viento</span>
              <span className="value">{weatherData.windSpeed} km/h</span>
            </div>
          </div>
        </div>
      </div>

      <div className="weather-forecast">
        <h2>Pronóstico para los próximos días</h2>
        <div className="forecast-container">
          {weatherData.forecast.map((day, index) => (
            <div key={index} className="forecast-day">
              <div className="day-name">{day.day}</div>
              <div className="day-temp">
                <span className="high">{day.high}°</span>
                <span className="low">{day.low}°</span>
              </div>
              <div className="day-condition">{day.condition}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeatherMonitoring; 