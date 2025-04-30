import React, { useState, useEffect } from 'react';
import './Dashboard.css';

// Componentes
import WeatherWidget from '../components/widgets/WeatherWidget';
import AirQualityWidget from '../components/widgets/AirQualityWidget';
import AlertsWidget from '../components/widgets/AlertsWidget';
import StatisticsWidget from '../components/widgets/StatisticsWidget';
import MillerLawToggle from '../components/layout/MillerLawToggle';

// Servicios
import { fetchDashboardData } from '../services/monitoringService';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    weather: null,
    airQuality: null,
    alerts: [],
    statistics: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMillerLawApplied, setIsMillerLawApplied] = useState(false);

  const toggleMillerLaw = () => {
    setIsMillerLawApplied(!isMillerLawApplied);
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const data = await fetchDashboardData();
        setDashboardData(data);
        setError(null);
      } catch (err) {
        console.error('Error al cargar datos del dashboard:', err);
        setError('Error al cargar los datos. Por favor, intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();

    // Actualizar cada 5 minutos
    const intervalId = setInterval(loadDashboardData, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return <div className="loading-container">Cargando datos del sistema de monitoreo...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Panel de Control - Sistema de Monitoreo Ambiental</h1>
        <div className="miller-law-container">
          <MillerLawToggle 
            onToggle={toggleMillerLaw}
            isMillerLawApplied={isMillerLawApplied}
          />
        </div>
      </div>
      
      {!isMillerLawApplied && (
        <div className="dashboard-summary">
          <div className="summary-card good">
            <h3>Estado General</h3>
            <p>Óptimo</p>
          </div>
          <div className="summary-card">
            <h3>Sensores Activos</h3>
            <p>24/26</p>
          </div>
          <div className="summary-card">
            <h3>Alertas Activas</h3>
            <p>{dashboardData.alerts.length}</p>
          </div>
          <div className="summary-card">
            <h3>Última Actualización</h3>
            <p>{new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      )}
      
      {isMillerLawApplied && (
        <div className="dashboard-summary-miller">
          <div className="summary-card good">
            <h3>Estado General</h3>
            <p>Óptimo</p>
          </div>
          <div className="summary-card">
            <h3>Alertas Activas</h3>
            <p>{dashboardData.alerts.length}</p>
          </div>
        </div>
      )}
      
      <div className={`dashboard-grid ${isMillerLawApplied ? 'miller-law-applied' : ''}`}>
        <WeatherWidget data={dashboardData.weather} />
        <AirQualityWidget data={dashboardData.airQuality} />
        {!isMillerLawApplied && <StatisticsWidget statistics={dashboardData.statistics} />}
        <AlertsWidget alerts={dashboardData.alerts} />
      </div>
    </div>
  );
};

export default Dashboard; 