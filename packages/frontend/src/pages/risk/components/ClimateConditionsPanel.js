// packages/frontend/src/pages/risk

import React, { useEffect, useState } from 'react';
import { useSpring, animated } from 'react-spring';
import { riskApi } from '../services/riskApi';

const ClimateConditionsPanel = ({ onSubmit, initialData }) => {
  const [conditions, setConditions] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState('');

  // Animación para el panel completo
  const panelAnimation = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: { tension: 280, friction: 20 },
  });

  useEffect(() => {
    const fetchConditions = async () => {
      setLoading(true);
      try {
        const data = await riskApi.checkConnection();
        setConditions(data);
        
        // Si hay datos iniciales, los usamos
        if (initialData) {
          setSelectedLocation(initialData.location || '');
        }
      } catch (err) {
        setError('Error al cargar las condiciones climáticas. Por favor, intente de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    fetchConditions();
  }, [initialData]);

  const handleLocationChange = (e) => {
    setSelectedLocation(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (conditions && selectedLocation) {
      onSubmit({
        location: selectedLocation,
        airQuality: conditions.airQuality,
        temperature: conditions.temperature,
        humidity: conditions.humidity
      });
    }
  };

  // Función para obtener el color basado en la calidad del aire
  const getAQIColor = (aqi) => {
    if (!aqi && aqi !== 0) return '#999'; // Gris para datos no disponibles
    if (aqi <= 50) return '#4caf50'; // Bueno - Verde
    if (aqi <= 100) return '#ff9800'; // Moderado - Amarillo/Naranja
    if (aqi <= 150) return '#f44336'; // Insalubre para grupos sensibles - Rojo
    if (aqi <= 200) return '#9c27b0'; // Insalubre - Morado
    return '#7e0023'; // Muy insalubre/Peligroso - Marrón oscuro
  };

  // Función para obtener la categoría de calidad del aire
  const getAQICategory = (aqi) => {
    if (!aqi && aqi !== 0) return 'No disponible';
    if (aqi <= 50) return 'Buena';
    if (aqi <= 100) return 'Moderada';
    if (aqi <= 150) return 'Insalubre para grupos sensibles';
    if (aqi <= 200) return 'Insalubre';
    return 'Muy insalubre';
  };

  if (error) {
    return (
      <animated.div style={panelAnimation} className="climate-error">
        <div className="error-icon">
          <i className="fas fa-cloud-showers-heavy"></i>
        </div>
        <p className="error-message">{error}</p>
        <button 
          className="btn btn-primary" 
          onClick={() => window.location.reload()}
        >
          Intentar de nuevo
        </button>
      </animated.div>
    );
  }

  if (loading) {
    return (
      <div className="climate-loading">
        <div className="spinner"></div>
        <p>Obteniendo datos climáticos...</p>
      </div>
    );
  }

  return (
    <animated.div style={panelAnimation} className="form-container">
      <form onSubmit={handleSubmit} className="climate-conditions-panel">
        <h2>Condiciones Climáticas Actuales</h2>
        
        <p className="climate-description">
          Estos son los datos climáticos actuales. Confirme su ubicación para evaluar sus riesgos.
        </p>
        
        <div className="form-group">
          <label htmlFor="location">Confirme su ubicación</label>
          <input
            type="text"
            id="location"
            name="location"
            value={selectedLocation}
            onChange={handleLocationChange}
            className="form-control"
            placeholder="Ciudad o área específica"
            required
          />
          <div className="location-hint">
            <i className="fas fa-info-circle"></i>
            <span>La ubicación específica nos permite mejorar la precisión de nuestra evaluación</span>
          </div>
        </div>
        
        <div className="conditions-grid">
          <div className="condition-card">
            <div className="condition-icon">
              <i className="fas fa-wind" style={{ color: getAQIColor(conditions?.airQuality) }}></i>
            </div>
            <div className="condition-value">{conditions?.airQuality || 'N/A'}</div>
            <div className="condition-label">
              Calidad del Aire ({getAQICategory(conditions?.airQuality)})
            </div>
          </div>
          
          <div className="condition-card">
            <div className="condition-icon">
              <i className="fas fa-thermometer-half" style={{ color: conditions?.temperature > 30 ? '#f44336' : '#3498db' }}></i>
            </div>
            <div className="condition-value">{conditions?.temperature || 'N/A'}°C</div>
            <div className="condition-label">Temperatura</div>
          </div>
          
          <div className="condition-card">
            <div className="condition-icon">
              <i className="fas fa-tint" style={{ color: '#3498db' }}></i>
            </div>
            <div className="condition-value">{conditions?.humidity || 'N/A'}%</div>
            <div className="condition-label">Humedad</div>
          </div>
        </div>
        
        <div className="climate-source">
          <i className="fas fa-info-circle"></i>
          <span>Datos obtenidos de la estación meteorológica más cercana. Actualizados hace 15 minutos.</span>
        </div>
        
        <div className="form-actions">
          <button type="submit" className="btn btn-primary btn-icon">
            <i className="fas fa-arrow-right"></i>
            <span>Continuar</span>
          </button>
        </div>
      </form>
    </animated.div>
  );
};

export default ClimateConditionsPanel;