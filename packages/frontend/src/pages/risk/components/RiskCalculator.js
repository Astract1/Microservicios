import React, { useState } from 'react';
import { useSpring, animated } from 'react-spring';
import { riskApi } from '../services/riskApi';
import RiskLevelIndicator from './RiskLevelIndicator';
import Recommendations from './Recommendations';

const RiskCalculator = ({ userData, environmentalData }) => {
  const [riskEvaluation, setRiskEvaluation] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Animación para el contenedor principal
  const containerAnimation = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: { tension: 280, friction: 20 },
  });

  // Animación para el botón
  const buttonAnimation = useSpring({
    from: { transform: 'scale(0.9)' },
    to: { transform: 'scale(1)' },
    config: { tension: 300, friction: 10 },
  });

  // Animación para los resultados
  const resultsAnimation = useSpring({
    opacity: riskEvaluation ? 1 : 0,
    transform: riskEvaluation ? 'translateY(0)' : 'translateY(50px)',
    config: { tension: 280, friction: 20 },
  });

  const calculateRisk = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulamos una pequeña demora para mostrar el estado de carga
      setTimeout(async () => {
        try {
          const result = await riskApi.evaluateRisk(userData, environmentalData);
          setRiskEvaluation(result);
        } catch (err) {
          setError('Error al calcular el riesgo. Por favor, intenta de nuevo.');
        } finally {
          setIsLoading(false);
        }
      }, 1500);
      
    } catch (err) {
      setError('Error inesperado. Por favor, intenta de nuevo.');
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <animated.div className="error-container" style={containerAnimation}>
        <div className="error-icon">
          <i className="fas fa-exclamation-triangle"></i>
        </div>
        <div className="error-message">{error}</div>
        <button 
          className="retry-button"
          onClick={() => setError(null)}
        >
          Intentar de nuevo
        </button>
      </animated.div>
    );
  }

  return (
    <animated.div className="risk-calculator-container" style={containerAnimation}>
      <div className="calculator-header">
        <h2>Calculadora de Riesgo Climático</h2>
        <p className="calculator-description">
          Basado en tus datos personales y las condiciones ambientales actuales, 
          evaluaremos el nivel de riesgo para tu salud.
        </p>
      </div>

      {!riskEvaluation && (
        <animated.button 
          className="calculate-button"
          onClick={calculateRisk}
          disabled={isLoading}
          style={buttonAnimation}
        >
          {isLoading ? (
            <div className="button-loading">
              <div className="spinner"></div>
              <span>Calculando...</span>
            </div>
          ) : (
            <>
              <i className="fas fa-calculator"></i>
              <span>Calcular mi Riesgo</span>
            </>
          )}
        </animated.button>
      )}

      {riskEvaluation && (
        <animated.div className="risk-results" style={resultsAnimation}>
          <RiskLevelIndicator level={riskEvaluation.riskLevel} />
          <Recommendations recommendations={riskEvaluation.recommendations} />
          
          <animated.button 
            className="recalculate-button"
            onClick={() => setRiskEvaluation(null)}
            style={buttonAnimation}
          >
            <i className="fas fa-redo"></i>
            <span>Recalcular</span>
          </animated.button>
        </animated.div>
      )}
    </animated.div>
  );
};

export default RiskCalculator;
