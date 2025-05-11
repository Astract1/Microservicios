import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSpring, animated } from 'react-spring';
import Plot from 'react-plotly.js';
import '../../styles/monitoring/HistoricalData.css';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const HistoricalData = () => {
  // Estados
  const [airQualityHistory, setAirQualityHistory] = useState(null);
  const [weatherHistory, setWeatherHistory] = useState(null);
  const [rainfallHistory, setRainfallHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState(7); // 7 días por defecto

  // Animación con react-spring
  const fadeIn = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: { duration: 500 }
  });

  // Efecto para cargar datos históricos
  useEffect(() => {
    const fetchHistoricalData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Datos históricos de calidad del aire
        const airQualityResponse = await axios.get(`${API_BASE_URL}/api/air-quality/historical`, {
          params: { days: timeRange }
        });
        
        // Datos históricos meteorológicos
        const weatherResponse = await axios.get(`${API_BASE_URL}/api/weather/historical`, {
          params: { days: timeRange }
        });
        
        // Datos históricos de precipitaciones
        const rainfallResponse = await axios.get(`${API_BASE_URL}/api/weather/rainfall`, {
          params: { days: timeRange }
        });
        
        setAirQualityHistory(airQualityResponse.data);
        setWeatherHistory(weatherResponse.data);
        setRainfallHistory(rainfallResponse.data);
      } catch (err) {
        console.error('Error al obtener datos históricos:', err);
        setError('Error al cargar los datos históricos. Por favor, intente nuevamente más tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchHistoricalData();
  }, [timeRange]);

  // Función para cambiar el rango de tiempo
  const handleTimeRangeChange = (days) => {
    setTimeRange(days);
  };

  // Si está cargando, mostrar spinner
  if (loading && !airQualityHistory) {
    return (
      <div className="loading-container">
        <LoadingSpinner />
        <p>Cargando datos históricos...</p>
      </div>
    );
  }

  // Si hay error, mostrar mensaje
  if (error && !airQualityHistory) {
    return (
      <div className="error-container">
        <h2>Error de conexión</h2>
        <p>{error}</p>
        <button onClick={() => handleTimeRangeChange(timeRange)} className="retry-button">
          Intentar nuevamente
        </button>
      </div>
    );
  }

  // Preparar datos para los gráficos
  const prepareAirQualityData = () => {
    if (!airQualityHistory || !airQualityHistory.data) return [];
    
    // Formatear datos para Plotly
    const dates = airQualityHistory.data.map(item => new Date(item.timestamp));
    const aqiValues = airQualityHistory.data.map(item => item.aqi);
    const pm25Values = airQualityHistory.data.map(item => item.pm25);
    const pm10Values = airQualityHistory.data.map(item => item.pm10);
    
    return [
      {
        x: dates,
        y: aqiValues,
        type: 'scatter',
        mode: 'lines+markers',
        name: 'AQI',
        marker: { color: '#FF5733' }
      },
      {
        x: dates,
        y: pm25Values,
        type: 'scatter',
        mode: 'lines+markers',
        name: 'PM2.5',
        marker: { color: '#3498DB' }
      },
      {
        x: dates,
        y: pm10Values,
        type: 'scatter',
        mode: 'lines+markers',
        name: 'PM10',
        marker: { color: '#2ECC71' }
      }
    ];
  };

  const prepareWeatherData = () => {
    if (!weatherHistory || !weatherHistory.data) return [];
    
    // Formatear datos para Plotly
    const dates = weatherHistory.data.map(item => new Date(item.timestamp));
    const temperatures = weatherHistory.data.map(item => item.temperature);
    const humidity = weatherHistory.data.map(item => item.humidity);
    
    return [
      {
        x: dates,
        y: temperatures,
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Temperatura (°C)',
        marker: { color: '#FF5733' }
      },
      {
        x: dates,
        y: humidity,
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Humedad (%)',
        marker: { color: '#3498DB' }
      }
    ];
  };

  const prepareRainfallData = () => {
    if (!rainfallHistory || !rainfallHistory.data) return [];
    
    // Formatear datos para Plotly
    const dates = rainfallHistory.data.map(item => new Date(item.date));
    const precipitation = rainfallHistory.data.map(item => item.precipitation);
    
    return [
      {
        x: dates,
        y: precipitation,
        type: 'bar',
        name: 'Precipitación (mm)',
        marker: { color: '#3498DB' }
      }
    ];
  };

  return (
    <animated.div style={fadeIn} className="historical-data-container">
      <header className="historical-header">
        <h1>Datos Históricos Ambientales</h1>
        <div className="time-range-selector">
          <span>Período: </span>
          <button 
            className={timeRange === 7 ? 'active' : ''} 
            onClick={() => handleTimeRangeChange(7)}
          >
            7 días
          </button>
          <button 
            className={timeRange === 14 ? 'active' : ''} 
            onClick={() => handleTimeRangeChange(14)}
          >
            14 días
          </button>
          <button 
            className={timeRange === 30 ? 'active' : ''} 
            onClick={() => handleTimeRangeChange(30)}
          >
            30 días
          </button>
        </div>
      </header>

      <div className="historical-charts">
        {/* Gráfico de calidad del aire */}
        <section className="chart-section">
          <h2>Calidad del Aire</h2>
          <div className="chart-container">
            <Plot
              data={prepareAirQualityData()}
              layout={{
                autosize: true,
                height: 400,
                margin: { l: 50, r: 20, t: 30, b: 50 },
                title: 'Evolución de la Calidad del Aire',
                xaxis: { title: 'Fecha' },
                yaxis: { title: 'Valores' },
                legend: { orientation: 'h', y: -0.2 }
              }}
              config={{ responsive: true }}
              className="plotly-chart"
            />
          </div>
        </section>

        {/* Gráfico de temperatura y humedad */}
        <section className="chart-section">
          <h2>Temperatura y Humedad</h2>
          <div className="chart-container">
            <Plot
              data={prepareWeatherData()}
              layout={{
                autosize: true,
                height: 400,
                margin: { l: 50, r: 20, t: 30, b: 50 },
                title: 'Evolución de Temperatura y Humedad',
                xaxis: { title: 'Fecha' },
                yaxis: { title: 'Valores' },
                legend: { orientation: 'h', y: -0.2 }
              }}
              config={{ responsive: true }}
              className="plotly-chart"
            />
          </div>
        </section>

        {/* Gráfico de precipitaciones */}
        <section className="chart-section">
          <h2>Precipitaciones</h2>
          <div className="chart-container">
            <Plot
              data={prepareRainfallData()}
              layout={{
                autosize: true,
                height: 400,
                margin: { l: 50, r: 20, t: 30, b: 50 },
                title: 'Historial de Precipitaciones',
                xaxis: { title: 'Fecha' },
                yaxis: { title: 'Precipitación (mm)' }
              }}
              config={{ responsive: true }}
              className="plotly-chart"
            />
          </div>
        </section>
      </div>

      <div className="data-summary">
        <h2>Estadísticas del Período</h2>
        <div className="summary-cards">
          {airQualityHistory && airQualityHistory.data && (
            <div className="summary-card">
              <h3>Calidad del Aire</h3>
              <ul>
                <li>
                  <strong>AQI Promedio:</strong> {
                    Math.round(airQualityHistory.data.reduce((acc, item) => acc + item.aqi, 0) / airQualityHistory.data.length)
                  }
                </li>
                <li>
                  <strong>Máximo AQI:</strong> {
                    Math.max(...airQualityHistory.data.map(item => item.aqi))
                  }
                </li>
                <li>
                  <strong>PM2.5 Promedio:</strong> {
                    Math.round(airQualityHistory.data.reduce((acc, item) => acc + item.pm25, 0) / airQualityHistory.data.length * 10) / 10
                  } μg/m³
                </li>
              </ul>
            </div>
          )}
          
          {weatherHistory && weatherHistory.data && (
            <div className="summary-card">
              <h3>Clima</h3>
              <ul>
                <li>
                  <strong>Temperatura Promedio:</strong> {
                    Math.round(weatherHistory.data.reduce((acc, item) => acc + item.temperature, 0) / weatherHistory.data.length * 10) / 10
                  } °C
                </li>
                <li>
                  <strong>Temperatura Máxima:</strong> {
                    Math.max(...weatherHistory.data.map(item => item.temperature))
                  } °C
                </li>
                <li>
                  <strong>Humedad Promedio:</strong> {
                    Math.round(weatherHistory.data.reduce((acc, item) => acc + item.humidity, 0) / weatherHistory.data.length)
                  }%
                </li>
              </ul>
            </div>
          )}
          
          {rainfallHistory && rainfallHistory.data && (
            <div className="summary-card">
              <h3>Precipitaciones</h3>
              <ul>
                <li>
                  <strong>Total de Precipitaciones:</strong> {
                    Math.round(rainfallHistory.data.reduce((acc, item) => acc + item.precipitation, 0) * 10) / 10
                  } mm
                </li>
                <li>
                  <strong>Día con Mayor Precipitación:</strong> {
                    rainfallHistory.data.length > 0 
                      ? new Date(rainfallHistory.data.reduce((prev, current) => 
                          (prev.precipitation > current.precipitation) ? prev : current
                        ).date).toLocaleDateString('es-ES')
                      : 'Sin datos'
                  }
                </li>
                <li>
                  <strong>Días con Lluvia:</strong> {
                    rainfallHistory.data.filter(item => item.precipitation > 0).length
                  } de {rainfallHistory.data.length}
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </animated.div>
  );
};

export default HistoricalData; 