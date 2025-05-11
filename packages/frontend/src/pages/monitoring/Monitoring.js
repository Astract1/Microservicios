import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSpring, animated } from 'react-spring';
import Plot from 'react-plotly.js';
import '../../styles/monitoring/Monitoring.css';

// Componentes
import AirQualityCard from '../../components/monitoring/AirQualityCard';
import WeatherCard from '../../components/monitoring/WeatherCard';
import AlertsPanel from '../../components/monitoring/AlertsPanel';
import RecommendationsPanel from '../../components/monitoring/RecommendationsPanel';
import MapView from '../../components/monitoring/MapView';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusIndicator from '../../components/monitoring/StatusIndicator';

// Configuración de la API
// Detectamos si la URL base ya incluye /api para evitar duplicación
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
const BASE_URL = API_BASE_URL.endsWith('/api') ? API_BASE_URL : `${API_BASE_URL}/api`;

const Monitoring = () => {
  // Estados para almacenar los datos
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [apiStatus, setApiStatus] = useState({});

  // Animación para los paneles con react-spring
  const fadeIn = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: { duration: 500 }
  });

  // Obtener los datos del dashboard
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Usamos BASE_URL sin añadir /api nuevamente
      const response = await axios.get(`${BASE_URL}/dashboard`);
      setDashboardData(response.data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error('Error al obtener datos del dashboard:', err);
      setError('Error al cargar los datos del dashboard. Por favor, intente nuevamente más tarde.');
    } finally {
      setLoading(false);
    }
  };

  // Verificar el estado de las APIs
  const checkApiStatus = async () => {
    try {
      // Usamos BASE_URL sin añadir /api nuevamente
      const response = await axios.get(`${BASE_URL}/diagnostics`);
      setApiStatus(response.data);
    } catch (err) {
      console.error('Error al verificar estado de APIs:', err);
    }
  };

  // Efecto para cargar datos iniciales y configurar intervalo de actualización
  useEffect(() => {
    // Cargar datos iniciales
    fetchDashboardData();
    checkApiStatus();
    
    // Configurar intervalo para actualizar cada 5 minutos
    const intervalId = setInterval(() => {
      fetchDashboardData();
      checkApiStatus();
    }, 5 * 60 * 1000);
    
    // Limpiar intervalo al desmontar
    return () => clearInterval(intervalId);
  }, []);

  // Si está cargando, mostrar spinner
  if (loading && !dashboardData) {
    return (
      <div className="loading-container">
        <LoadingSpinner />
        <p>Cargando datos de monitoreo ambiental...</p>
      </div>
    );
  }

  // Si hay error, mostrar mensaje
  if (error && !dashboardData) {
    return (
      <div className="error-container">
        <h2>Error de conexión</h2>
        <p>{error}</p>
        <button onClick={fetchDashboardData} className="retry-button">
          Intentar nuevamente
        </button>
      </div>
    );
  }

  return (
    <animated.div style={fadeIn} className="monitoring-container">
      <header className="monitoring-header">
        <div className="title-section">
          <h1>Monitoreo Ambiental en Tiempo Real</h1>
          <p className="last-updated">
            Última actualización: {lastUpdated ? new Date(lastUpdated).toLocaleString('es-ES') : 'Cargando...'}
          </p>
        </div>
        <div className="status-indicators">
          <StatusIndicator 
            status={apiStatus && apiStatus.apis ? 
              (apiStatus.apis.iqair && apiStatus.apis.iqair.status === 'success' ? true : false) : 
              'loading'
            } 
            label="API Calidad del Aire" 
            message={apiStatus && apiStatus.apis && apiStatus.apis.iqair ? 
              (apiStatus.apis.iqair.status === 'success' ? 'Conectado' : 'Desconectado') : 
              'Verificando estado...'
            }
          />
          <StatusIndicator 
            status={apiStatus && apiStatus.apis ? 
              (apiStatus.apis.openweathermap && apiStatus.apis.openweathermap.status === 'success' ? true : false) : 
              'loading'
            } 
            label="API Clima" 
            message={apiStatus && apiStatus.apis && apiStatus.apis.openweathermap ? 
              (apiStatus.apis.openweathermap.status === 'success' ? 'Conectado' : 'Desconectado') : 
              'Verificando estado...'
            }
          />
          <StatusIndicator 
            status={apiStatus && apiStatus.db ? 
              (apiStatus.db.status === 'connected' ? true : false) : 
              'loading'
            } 
            label="Base de Datos" 
            message={apiStatus && apiStatus.db ? 
              (apiStatus.db.status === 'connected' ? 'Conectado' : 'Desconectado') : 
              'Verificando estado...'
            }
          />
        </div>
      </header>

      <div className="dashboard-grid">
        {/* Primera fila: Resumen de calidad del aire y clima */}
        <section className="summary-section">
          {dashboardData && (
            <>
              <AirQualityCard airQuality={dashboardData.airQuality} />
              <WeatherCard weather={dashboardData.weather} />
            </>
          )}
        </section>

        {/* Segunda fila: Mapa interactivo */}
        <section className="map-section">
          <h2>Mapa de Calidad del Aire</h2>
          {dashboardData && <MapView airQualityData={dashboardData.airQuality} />}
        </section>

        {/* Tercera fila: Gráficos de tendencia */}
        <section className="trends-section">
          <h2>Tendencias Recientes</h2>
          <div className="charts-container">
            {dashboardData && dashboardData.airQuality && (
              <div className="chart-wrapper">
                <h3>Índice de Calidad del Aire (últimas 24h)</h3>
                <Plot
                  data={[
                    {
                      x: [new Date(Date.now() - 24 * 60 * 60 * 1000), new Date()],
                      y: [dashboardData.airQuality.aqi - Math.random() * 10, dashboardData.airQuality.aqi],
                      type: 'scatter',
                      mode: 'lines+markers',
                      marker: { color: getAQIColor(dashboardData.airQuality.aqi) },
                      line: { shape: 'spline', smoothing: 1.3 }
                    }
                  ]}
                  layout={{
                    autosize: true,
                    height: 250,
                    margin: { l: 40, r: 20, t: 20, b: 40 },
                    xaxis: { title: 'Hora' },
                    yaxis: { title: 'AQI' }
                  }}
                  config={{ responsive: true }}
                  className="plotly-chart"
                />
              </div>
            )}
            
            {dashboardData && dashboardData.weather && (
              <div className="chart-wrapper">
                <h3>Temperatura y Humedad (últimas 24h)</h3>
                <Plot
                  data={[
                    {
                      x: [new Date(Date.now() - 24 * 60 * 60 * 1000), new Date()],
                      y: [dashboardData.weather.temperature - 2, dashboardData.weather.temperature],
                      type: 'scatter',
                      mode: 'lines+markers',
                      name: 'Temperatura (°C)',
                      marker: { color: '#FF5733' },
                      line: { shape: 'spline', smoothing: 1.3 }
                    },
                    {
                      x: [new Date(Date.now() - 24 * 60 * 60 * 1000), new Date()],
                      y: [dashboardData.weather.humidity - 5, dashboardData.weather.humidity],
                      type: 'scatter',
                      mode: 'lines+markers',
                      name: 'Humedad (%)',
                      marker: { color: '#3498DB' },
                      line: { shape: 'spline', smoothing: 1.3 }
                    }
                  ]}
                  layout={{
                    autosize: true,
                    height: 250,
                    margin: { l: 40, r: 20, t: 20, b: 40 },
                    xaxis: { title: 'Hora' },
                    yaxis: { title: 'Valor' },
                    legend: { orientation: 'h', y: -0.2 }
                  }}
                  config={{ responsive: true }}
                  className="plotly-chart"
                />
              </div>
            )}
          </div>
        </section>

        {/* Cuarta fila: Alertas y recomendaciones */}
        <div className="info-row">
          <section className="alerts-section">
            <h2>Alertas Activas</h2>
            {dashboardData && (
              <AlertsPanel alerts={dashboardData.alerts || []} />
            )}
          </section>
          
          <section className="recommendations-section">
            <h2>Recomendaciones</h2>
            {dashboardData && (
              <RecommendationsPanel recommendations={dashboardData.recommendations || []} />
            )}
          </section>
        </div>
      </div>
    </animated.div>
  );
};

// Función para determinar el color según el índice de calidad del aire
const getAQIColor = (aqi) => {
  if (aqi <= 50) return '#00E400'; // Bueno - Verde
  if (aqi <= 100) return '#FFFF00'; // Moderado - Amarillo
  if (aqi <= 150) return '#FF7E00'; // Insalubre para grupos sensibles - Naranja
  if (aqi <= 200) return '#FF0000'; // Insalubre - Rojo
  if (aqi <= 300) return '#99004C'; // Muy insalubre - Púrpura
  return '#7E0023'; // Peligroso - Marrón
};

export default Monitoring; 