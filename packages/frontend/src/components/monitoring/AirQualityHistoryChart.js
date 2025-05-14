import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import axios from 'axios';
import { useSpring, animated, config as springConfig } from 'react-spring';
import LoadingSpinner from '../common/LoadingSpinner';
import '../../styles/monitoring/AirQualityHistoryChart.css';

const AirQualityHistoryChart = ({ days = 7 }) => {
  const [historicalData, setHistoricalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('aqi'); // Estado para la pestaña activa: 'aqi', 'temperature', 'humidity'

  // Animaciones con react-spring
  const fadeIn = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: springConfig.gentle,
    delay: 300
  });

  const pulseAnimation = useSpring({
    from: { transform: 'scale(1)' },
    to: { transform: 'scale(1.05)' },
    config: { duration: 1000, tension: 300, friction: 10 },
    loop: { reverse: true }
  });

  // Colores para cada categoría de calidad del aire
  const aqiColors = {
    'Buena': '#00E400',
    'Moderada': '#FFFF00',
    'Poco Saludable para Grupos Sensibles': '#FF7E00',
    'Poco Saludable': '#FF0000',
    'Muy Poco Saludable': '#99004C',
    'Peligrosa': '#7E0023'
  };

  // Obtener los datos históricos de la API
  useEffect(() => {
    const fetchHistoricalData = async () => {
      setLoading(true);
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const response = await axios.get(`/api/dashboard/historical?days=${days}`, {
          signal: controller.signal,
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        clearTimeout(timeoutId);
        console.log('Datos históricos recibidos:', response.data);
        
        if (response.data && response.data.airQualityHistory) {
          setHistoricalData(response.data);
          setError(null);
        } else {
          throw new Error('Formato de datos históricos inválido');
        }
      } catch (err) {
        console.error('Error al obtener datos históricos:', err);
        setError(`No se pudieron cargar los datos históricos: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchHistoricalData();
  }, [days]);

  // Función para obtener el color según el índice de calidad del aire
  const getAQIColor = (aqi) => {
    if (!aqi && aqi !== 0) return '#00E400'; // Verde por defecto
    if (aqi <= 50) return '#00E400'; // Bueno - Verde
    if (aqi <= 100) return '#FFFF00'; // Moderado - Amarillo
    if (aqi <= 150) return '#FF7E00'; // Insalubre para grupos sensibles - Naranja
    if (aqi <= 200) return '#FF0000'; // Insalubre - Rojo
    if (aqi <= 300) return '#99004C'; // Muy insalubre - Púrpura
    return '#7E0023'; // Peligroso - Marrón
  };

  // Preparar los datos para la gráfica
  const prepareChartData = () => {
    if (!historicalData || !historicalData.airQualityHistory || !historicalData.airQualityHistory.data) {
      return null;
    }

    const data = historicalData.airQualityHistory.data;
    
    // Ordenar datos por fecha
    const sortedData = [...data].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    // Extraer datos para la gráfica
    const dates = sortedData.map(item => new Date(item.timestamp).toLocaleDateString('es-ES'));
    const aqiValues = sortedData.map(item => item.aqi);
    const tempValues = sortedData.map(item => item.temperature);
    const humidityValues = sortedData.map(item => item.humidity);
    const colors = sortedData.map(item => getAQIColor(item.aqi));
    
    return {
      dates,
      aqiValues,
      tempValues,
      humidityValues,
      colors
    };
  };

  if (loading) {
    return (
      <animated.div style={fadeIn} className="air-quality-history-loading">
        <animated.div style={pulseAnimation}>
          <LoadingSpinner />
        </animated.div>
        <p>Cargando datos históricos...</p>
      </animated.div>
    );
  }

  if (error) {
    return (
      <animated.div style={fadeIn} className="air-quality-history-error">
        <p>Error: {error}</p>
        <animated.button 
          style={pulseAnimation}
          onClick={() => window.location.reload()} 
          className="retry-button"
        >
          Intentar nuevamente
        </animated.button>
      </animated.div>
    );
  }

  const chartData = prepareChartData();
  
  if (!chartData) {
    return (
      <animated.div style={fadeIn} className="air-quality-history-error">
        <p>No hay datos históricos disponibles.</p>
        <button onClick={() => window.location.reload()}>Reintentar</button>
      </animated.div>
    );
  }

  // Renderizar el gráfico según la pestaña activa
  const renderChart = () => {
    // Configuración común para los gráficos
    const commonLayout = {
      autosize: true,
      height: 300,
      margin: { l: 50, r: 20, t: 30, b: 40 },
      showlegend: false,
      xaxis: {
        title: 'Fecha',
        showgrid: false
      },
      hovermode: 'closest',
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      font: {
        family: 'Arial, sans-serif'
      }
    };

    const commonConfig = {
      responsive: true,
      displayModeBar: false
    };

    // Determinar qué gráfico mostrar según la pestaña activa
    switch (activeTab) {
      case 'temperature':
        return (
          <Plot
            data={[
              {
                x: chartData.dates,
                y: chartData.tempValues,
                type: 'scatter',
                mode: 'lines+markers',
                line: { color: '#e67e22', shape: 'spline', width: 3 },
                marker: { color: '#e67e22', size: 8 },
                name: 'Temperatura'
              }
            ]}
            layout={{
              ...commonLayout,
              title: {
                text: 'Tendencia de Temperatura',
                font: { family: 'Arial, sans-serif', size: 18 }
              },
              yaxis: {
                title: 'Temperatura (°C)',
                showgrid: true,
                gridcolor: '#e0e0e0'
              },
              annotations: chartData.tempValues.length > 0 ? [
                {
                  x: chartData.dates[chartData.dates.length - 1],
                  y: chartData.tempValues[chartData.tempValues.length - 1],
                  text: 'Último valor: ' + chartData.tempValues[chartData.tempValues.length - 1] + '°C',
                  showarrow: true,
                  arrowhead: 3,
                  ax: 40,
                  ay: -40
                }
              ] : []
            }}
            config={commonConfig}
            className="plotly-chart"
          />
        );
      case 'humidity':
        return (
          <Plot
            data={[
              {
                x: chartData.dates,
                y: chartData.humidityValues,
                type: 'scatter',
                mode: 'lines+markers',
                line: { color: '#3498db', shape: 'spline', width: 3 },
                marker: { color: '#3498db', size: 8 },
                name: 'Humedad'
              }
            ]}
            layout={{
              ...commonLayout,
              title: {
                text: 'Tendencia de Humedad',
                font: { family: 'Arial, sans-serif', size: 18 }
              },
              yaxis: {
                title: 'Humedad (%)',
                showgrid: true,
                gridcolor: '#e0e0e0'
              },
              annotations: chartData.humidityValues.length > 0 ? [
                {
                  x: chartData.dates[chartData.dates.length - 1],
                  y: chartData.humidityValues[chartData.humidityValues.length - 1],
                  text: 'Último valor: ' + chartData.humidityValues[chartData.humidityValues.length - 1] + '%',
                  showarrow: true,
                  arrowhead: 3,
                  ax: 40,
                  ay: -40
                }
              ] : []
            }}
            config={commonConfig}
            className="plotly-chart"
          />
        );
      default: // 'aqi'
        return (
          <Plot
            data={[
              {
                x: chartData.dates,
                y: chartData.aqiValues,
                type: 'scatter',
                mode: 'lines+markers',
                line: { shape: 'spline', width: 3 },
                marker: { 
                  color: chartData.colors,
                  size: 8 
                },
                name: 'Índice de Calidad del Aire'
              }
            ]}
            layout={{
              ...commonLayout,
              title: {
                text: 'Tendencia de Calidad del Aire',
                font: { family: 'Arial, sans-serif', size: 18 }
              },
              yaxis: {
                title: 'AQI',
                showgrid: true,
                gridcolor: '#e0e0e0'
              },
              annotations: chartData.aqiValues.length > 0 ? [
                {
                  x: chartData.dates[chartData.dates.length - 1],
                  y: chartData.aqiValues[chartData.aqiValues.length - 1],
                  text: 'Último valor: ' + chartData.aqiValues[chartData.aqiValues.length - 1],
                  showarrow: true,
                  arrowhead: 3,
                  ax: 40,
                  ay: -40
                }
              ] : []
            }}
            config={commonConfig}
            className="plotly-chart"
          />
        );
    }
  };

  return (
    <animated.div style={fadeIn} className="air-quality-history-chart">
      <h3>Histórico de Calidad del Aire</h3>
      <div className="chart-tabs">
        <button 
          className={`tab-button ${activeTab === 'aqi' ? 'active' : ''}`}
          onClick={() => setActiveTab('aqi')}
        >
          Calidad del Aire (AQI)
        </button>
        <button 
          className={`tab-button ${activeTab === 'temperature' ? 'active' : ''}`}
          onClick={() => setActiveTab('temperature')}
        >
          Temperatura
        </button>
        <button 
          className={`tab-button ${activeTab === 'humidity' ? 'active' : ''}`}
          onClick={() => setActiveTab('humidity')}
        >
          Humedad
        </button>
      </div>
      
      {renderChart()}
      
      {activeTab === 'aqi' && (
        <div className="chart-legend">
          <div className="legend-item">
            <span className="color-box" style={{ backgroundColor: '#00E400' }}></span>
            <span>Buena (0-50)</span>
          </div>
          <div className="legend-item">
            <span className="color-box" style={{ backgroundColor: '#FFFF00' }}></span>
            <span>Moderada (51-100)</span>
          </div>
          <div className="legend-item">
            <span className="color-box" style={{ backgroundColor: '#FF7E00' }}></span>
            <span>Poco Saludable (Grupos Sensibles) (101-150)</span>
          </div>
          <div className="legend-item">
            <span className="color-box" style={{ backgroundColor: '#FF0000' }}></span>
            <span>Poco Saludable (151-200)</span>
          </div>
          <div className="legend-item">
            <span className="color-box" style={{ backgroundColor: '#99004C' }}></span>
            <span>Muy Poco Saludable (201-300)</span>
          </div>
        </div>
      )}
    </animated.div>
  );
};

export default AirQualityHistoryChart; 