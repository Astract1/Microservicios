import React, { useState, useEffect } from 'react';
import { useSpring, animated } from 'react-spring';
import { riskApi } from '../services/riskApi';

const RiskExposureTest = ({ onSubmit, initialData }) => {
  const [responses, setResponses] = useState({
    outdoorTime: 'Moderado',
    pollutionExposure: 'No',
    transportMethod: 'Carro particular',
    useMask: false,
    airQualityAwareness: 'Medio'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Animación para el formulario
  const formAnimation = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: { tension: 280, friction: 20 },
  });

  // Si hay datos iniciales, usarlos para inicializar el formulario
  useEffect(() => {
    if (initialData) {
      setResponses(prevData => ({
        ...prevData,
        ...initialData
      }));
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setResponses({
      ...responses,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      const result = await riskApi.processInteractiveTest(responses);
      onSubmit(result);
    } catch (err) {
      setError('Error al procesar el test. Intente de nuevo.');
      setIsSubmitting(false);
    }
  };

  return (
    <animated.div className="form-container" style={formAnimation}>
      <form onSubmit={handleSubmit} className="risk-exposure-test">
        <h2>Test de Exposición a Riesgos Ambientales</h2>
        <p className="test-description">
          Este test nos ayudará a determinar su nivel de exposición a factores de riesgo ambientales.
          Por favor, responda cada pregunta con la opción que mejor refleje su situación actual.
        </p>
        
        {error && (
          <div className="error-message-box">
            <i className="fas fa-exclamation-triangle"></i>
            <span>{error}</span>
          </div>
        )}
        
        <div className="exposure-question">
          <label htmlFor="outdoorTime">¿Cuánto tiempo pasa al aire libre diariamente?</label>
          <select 
            id="outdoorTime"
            name="outdoorTime" 
            value={responses.outdoorTime} 
            onChange={handleChange}
            className="form-control form-select"
          >
            <option value="Poco">Menos de 1 hora</option>
            <option value="Moderado">Entre 1 y 3 horas</option>
            <option value="Mucho">Más de 3 horas</option>
          </select>
        </div>
        
        <div className="exposure-question">
          <label htmlFor="pollutionExposure">¿Vive o trabaja cerca de fuentes de contaminación?</label>
          <select 
            id="pollutionExposure"
            name="pollutionExposure" 
            value={responses.pollutionExposure} 
            onChange={handleChange}
            className="form-control form-select"
          >
            <option value="No">No</option>
            <option value="Sí">Sí</option>
          </select>
          <div className="question-hint">
            <i className="fas fa-info-circle"></i>
            <span>Fuentes de contaminación incluyen: zonas industriales, vías de alto tráfico, etc.</span>
          </div>
        </div>
        
        <div className="exposure-question">
          <label htmlFor="transportMethod">¿Qué medio de transporte utiliza principalmente?</label>
          <select 
            id="transportMethod"
            name="transportMethod" 
            value={responses.transportMethod} 
            onChange={handleChange}
            className="form-control form-select"
          >
            <option value="Carro particular">Carro particular</option>
            <option value="Transporte público">Transporte público</option>
            <option value="Bicicleta">Bicicleta</option>
            <option value="Caminar">Caminar</option>
          </select>
        </div>
        
        <div className="exposure-question">
          <label htmlFor="airQualityAwareness">¿Cuánto conocimiento tiene sobre calidad del aire?</label>
          <div className="range-container">
            <input
              type="range"
              id="airQualityAwareness"
              name="airQualityAwareness"
              min="Bajo"
              max="Alto"
              value={responses.airQualityAwareness}
              onChange={handleChange}
              list="awareness-levels"
              className="form-range"
            />
            <datalist id="awareness-levels">
              <option value="Bajo"></option>
              <option value="Medio"></option>
              <option value="Alto"></option>
            </datalist>
            <div className="form-range-labels">
              <span>Bajo</span>
              <span>Medio</span>
              <span>Alto</span>
            </div>
          </div>
        </div>
        
        <div className="exposure-question">
          <label className="form-checkbox">
            <input
              type="checkbox"
              name="useMask"
              checked={responses.useMask}
              onChange={handleChange}
            />
            <span>Uso mascarilla o protección respiratoria en días de alta contaminación</span>
          </label>
        </div>
        
        <div className="form-actions">
          <button 
            type="submit" 
            className="btn btn-primary btn-icon"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="spinner"></div>
                <span>Procesando...</span>
              </>
            ) : (
              <>
                <i className="fas fa-chart-line"></i>
                <span>Evaluar mi exposición</span>
              </>
            )}
          </button>
        </div>
      </form>
    </animated.div>
  );
};

export default RiskExposureTest;
