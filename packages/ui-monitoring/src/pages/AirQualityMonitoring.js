import React, { useState, useEffect } from 'react';
import './AirQualityMonitoring.css';
import MillerLawToggle from '../components/layout/MillerLawToggle';

function AirQualityMonitoring() {
  const [airQualityData, setAirQualityData] = useState({
    aqi: 45,
    pm25: 12.3,
    pm10: 25.7,
    co: 0.8,
    no2: 15.2,
    so2: 3.1,
    o3: 42.6,
    lastUpdated: new Date().toLocaleString()
  });

  const [isMillerLawApplied, setIsMillerLawApplied] = useState(false);

  const toggleMillerLaw = () => {
    setIsMillerLawApplied(!isMillerLawApplied);
  };

  // Datos simulados para un gráfico
  const [historicalData, setHistoricalData] = useState([
    { date: '01/05', aqi: 42 },
    { date: '02/05', aqi: 38 },
    { date: '03/05', aqi: 47 },
    { date: '04/05', aqi: 51 },
    { date: '05/05', aqi: 45 },
    { date: '06/05', aqi: 39 },
    { date: '07/05', aqi: 35 },
  ]);

  // Función para determinar la categoría de calidad del aire
  const getAirQualityCategory = (aqi) => {
    if (aqi <= 50) return { category: 'Buena', color: '#00e400' };
    if (aqi <= 100) return { category: 'Moderada', color: '#ffff00' };
    if (aqi <= 150) return { category: 'Dañina para grupos sensibles', color: '#ff7e00' };
    if (aqi <= 200) return { category: 'Dañina', color: '#ff0000' };
    if (aqi <= 300) return { category: 'Muy dañina', color: '#99004c' };
    return { category: 'Peligrosa', color: '#7e0023' };
  };

  const airQualityInfo = getAirQualityCategory(airQualityData.aqi);

  // Contaminantes para mostrar según Ley de Miller (solo los 5 más importantes)
  const millerLawPollutants = [
    { name: 'PM2.5', value: airQualityData.pm25, unit: 'µg/m³' },
    { name: 'PM10', value: airQualityData.pm10, unit: 'µg/m³' },
    { name: 'CO', value: airQualityData.co, unit: 'ppm' },
    { name: 'NO₂', value: airQualityData.no2, unit: 'ppb' },
    { name: 'O₃', value: airQualityData.o3, unit: 'ppb' },
  ];

  // Todos los contaminantes
  const allPollutants = [
    ...millerLawPollutants,
    { name: 'SO₂', value: airQualityData.so2, unit: 'ppb' },
  ];

  // Datos históricos según Ley de Miller (5 días en lugar de 7)
  const millerLawHistoricalData = historicalData.slice(2);

  return (
    <div className="air-quality-container">
      <div className="air-quality-header">
        <h1>Monitoreo de Calidad del Aire</h1>
        <div className="miller-law-container">
          <MillerLawToggle 
            onToggle={toggleMillerLaw}
            isMillerLawApplied={isMillerLawApplied}
          />
        </div>
      </div>
      
      <div className="dashboard-cards">
        <div className="card aqi-card">
          <h2>Índice de Calidad del Aire (AQI)</h2>
          <div className="aqi-display" style={{ backgroundColor: airQualityInfo.color }}>
            <span className="aqi-value">{airQualityData.aqi}</span>
            <span className="aqi-category">{airQualityInfo.category}</span>
          </div>
          <p>Última actualización: {airQualityData.lastUpdated}</p>
        </div>
        
        <div className="card pollutants-card">
          <h2>Contaminantes</h2>
          <div className={`pollutants-grid ${isMillerLawApplied ? 'miller-law-applied' : ''}`}>
            {(isMillerLawApplied ? millerLawPollutants : allPollutants).map((pollutant, index) => (
              <div className="pollutant-item" key={index}>
                <h3>{pollutant.name}</h3>
                <p>{pollutant.value} {pollutant.unit}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card history-card">
        <h2>Historial AQI {isMillerLawApplied ? '(5 días)' : '(7 días)'}</h2>
        <div className="chart-container">
          {(isMillerLawApplied ? millerLawHistoricalData : historicalData).map((data, index) => (
            <div 
              key={index} 
              className="chart-bar" 
              style={{ 
                height: `${data.aqi * 2}px`,
                backgroundColor: getAirQualityCategory(data.aqi).color 
              }}
              title={`${data.date}: AQI ${data.aqi}`}
            >
              <span className="bar-value">{data.aqi}</span>
              <span className="bar-date">{data.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AirQualityMonitoring; 