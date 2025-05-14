import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSpring, animated, config as springConfig } from 'react-spring';
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
import AirQualityHistoryChart from '../../components/monitoring/AirQualityHistoryChart';

// Configuración de la API - Usar directamente la URL base adecuada
const API_BASE_URL = '/api';
const DEFAULT_CITY = process.env.REACT_APP_DEFAULT_CITY || 'Bogotá';

const Monitoring = () => {
  // Estados para almacenar los datos
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [apiStatus, setApiStatus] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  // Animaciones mejoradas con react-spring
  const fadeIn = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: springConfig.gentle,
    delay: 100
  });

  const headerAnimation = useSpring({
    from: { opacity: 0, transform: 'translateY(-20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: springConfig.gentle
  });

  const cardAnimation = useSpring({
    from: { scale: 0.9, opacity: 0 },
    to: { scale: 1, opacity: 1 },
    config: springConfig.wobbly
  });

  const pulseAnimation = useSpring({
    from: { transform: 'scale(1)' },
    to: { transform: 'scale(1.05)' },
    config: { duration: 1000, tension: 300, friction: 10 },
    loop: { reverse: true }
  });

  // Obtener los datos del dashboard
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setRefreshing(true);
      
      // Implementamos un timeout para asegurar que la petición no se quede esperando indefinidamente
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await axios.get(`${API_BASE_URL}/dashboard`, {
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      clearTimeout(timeoutId);
      console.log('Datos recibidos:', response.data);
      
      setDashboardData(response.data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error('Error al obtener datos del dashboard:', err);
      // En caso de error, mantener datos anteriores si existen y mostrar mensaje
      if (!dashboardData) {
        setDashboardData({
          airQuality: {
            error: true,
            errorMessage: err.message,
            data: {
              city: DEFAULT_CITY || 'No disponible',
              aqi: undefined,
              temperature: undefined,
              humidity: undefined,
              timestamp: new Date(),
              source: 'Error',
              error: err.message
            }
          },
          weather: {
            error: true,
            errorMessage: err.message,
            data: {
              temperature: undefined,
              humidity: undefined,
              conditions: undefined,
              source: 'Error',
              error: err.message
            }
          },
          timestamp: new Date().toISOString()
        });
      }
      setError('Error al cargar los datos del dashboard. Reintentando automáticamente...');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Verificar el estado de las APIs con mejor manejo de errores
  const checkApiStatus = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      const response = await axios.get(`${API_BASE_URL}/diagnostics`, {
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      clearTimeout(timeoutId);
      setApiStatus(response.data);
    } catch (err) {
      console.error('Error al verificar estado de APIs:', err);
      // Mantener el estado anterior si ya existe, o marcar todo como error
      if (!apiStatus || Object.keys(apiStatus).length === 0) {
        setApiStatus({
          apis: {
            iqair: { status: 'error', message: err.message, lastUpdate: new Date().toISOString() },
            openweathermap: { status: 'error', message: err.message, lastUpdate: new Date().toISOString() }
          },
          db: { status: 'unknown', message: err.message, lastUpdate: new Date().toISOString() }
        });
      }
    }
  };

  // Efecto para cargar datos iniciales y configurar intervalo de actualización
  useEffect(() => {
    // Cargar datos iniciales
    fetchDashboardData();
    checkApiStatus();
    
    // Configurar intervalo para actualizar cada 3 minutos
    const dataIntervalId = setInterval(() => {
      fetchDashboardData();
    }, 3 * 60 * 1000);
    
    // Verificar estado de APIs cada 5 minutos
    const statusIntervalId = setInterval(() => {
      checkApiStatus();
    }, 5 * 60 * 1000);
    
    // Limpiar intervalos al desmontar
    return () => {
      clearInterval(dataIntervalId);
      clearInterval(statusIntervalId);
    };
  }, []);

  // Si está cargando por primera vez, mostrar spinner
  if (loading && !dashboardData) {
    return (
      <div className="loading-container">
        <animated.div style={pulseAnimation}>
          <LoadingSpinner />
        </animated.div>
        <p>Cargando datos de monitoreo ambiental...</p>
      </div>
    );
  }

  // Si hay error sin datos, mostrar mensaje
  if (error && !dashboardData) {
    return (
      <div className="error-container">
        <h2>Error de conexión</h2>
        <p>{error}</p>
        <animated.button 
          style={pulseAnimation}
          onClick={fetchDashboardData} 
          className="retry-button"
        >
          Intentar nuevamente
        </animated.button>
      </div>
    );
  }

  return (
    <animated.div style={fadeIn} className="monitoring-container">
      <animated.header style={headerAnimation} className="monitoring-header">
        <div className="title-section">
          <h1>Monitoreo Ambiental en Tiempo Real</h1>
          <p className="last-updated">
            Última actualización: {lastUpdated ? new Date(lastUpdated).toLocaleString('es-ES') : 'Cargando...'}
            {refreshing && <span className="refreshing-indicator"> (Actualizando...)</span>}
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
            lastUpdated={apiStatus && apiStatus.apis && apiStatus.apis.iqair ? 
              apiStatus.apis.iqair.lastUpdate : null}
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
            lastUpdated={apiStatus && apiStatus.apis && apiStatus.apis.openweathermap ? 
              apiStatus.apis.openweathermap.lastUpdate : null}
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
            lastUpdated={apiStatus && apiStatus.db ? 
              apiStatus.db.lastUpdate : null}
          />
        </div>
      </animated.header>

      <div className="dashboard-grid">
        {/* Primera fila: Resumen de calidad del aire y clima */}
        <section className="summary-section">
          {dashboardData && (
            <>
              <animated.div style={cardAnimation}>
                <AirQualityCard airQuality={dashboardData.airQuality} />
              </animated.div>
              <animated.div style={{...cardAnimation, delay: 200}}>
                <WeatherCard weather={dashboardData.weather} />
              </animated.div>
            </>
          )}
        </section>

        {/* Segunda fila: Mapa interactivo */}
        <animated.section style={{...fadeIn, delay: 300}} className="map-section">
          <h2>Mapa de Calidad del Aire</h2>
          {dashboardData && <MapView 
            airQualityData={dashboardData.airQuality} 
            weatherData={dashboardData.weather}
          />}
        </animated.section>

        {/* Tercera fila: Gráfica histórica de calidad del aire */}
        <animated.section style={{...fadeIn, delay: 400}} className="chart-section">
          <AirQualityHistoryChart days={7} />
        </animated.section>

        {/* Botón para actualización manual */}
        <div className="refresh-button-container">
          <animated.button 
            className={`refresh-button ${refreshing ? 'refreshing' : ''}`}
            onClick={refreshing ? null : fetchDashboardData}
            style={refreshing ? pulseAnimation : {}}
            disabled={refreshing}
          >
            {refreshing ? 'Actualizando...' : 'Actualizar datos'}
          </animated.button>
        </div>
      </div>
    </animated.div>
  );
};

// Función para determinar el color según el índice de calidad del aire
const getAQIColor = (aqi) => {
  if (!aqi && aqi !== 0) return '#00E400'; // Verde por defecto
  if (aqi <= 50) return '#00E400'; // Bueno - Verde
  if (aqi <= 100) return '#FFFF00'; // Moderado - Amarillo
  if (aqi <= 150) return '#FF7E00'; // Insalubre para grupos sensibles - Naranja
  if (aqi <= 200) return '#FF0000'; // Insalubre - Rojo
  if (aqi <= 300) return '#99004C'; // Muy insalubre - Púrpura
  return '#7E0023'; // Peligroso - Marrón
};

export default Monitoring; 