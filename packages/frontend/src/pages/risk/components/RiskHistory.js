// packages/frontend/src/pages/risk/components/RiskHistory.js

import React, { useEffect, useState } from 'react';
import { useSpring, animated, useTrail } from 'react-spring';
import { riskApi } from '../services/riskApi';

const RiskHistory = ({ userId }) => {
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Animación para el contenedor principal
  const containerAnimation = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: { tension: 280, friction: 20 },
  });

  // Animación para los elementos de historial (trail)
  const trail = useTrail(history.length, {
    from: { opacity: 0, transform: 'translateX(-20px)' },
    to: { opacity: 1, transform: 'translateX(0)' },
    config: { tension: 280, friction: 20 },
  });

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const data = await riskApi.getEvaluationHistory(userId);
        setHistory(data);
      } catch (err) {
        setError('Error al cargar el historial. Por favor, intente más tarde.');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchHistory();
    }
  }, [userId]);

  // Función para determinar la clase CSS según el nivel de riesgo
  const getRiskLevelClass = (level) => {
    if (!level) return '';
    level = level.toLowerCase();
    if (level.includes('bajo')) return 'low';
    if (level.includes('medio')) return 'medium';
    if (level.includes('alto')) return 'high';
    return '';
  };

  // Función para formatear la fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="risk-history-loading">
        <div className="spinner"></div>
        <p>Cargando historial...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="risk-history-error">
        <i className="fas fa-exclamation-triangle"></i>
        <p>{error}</p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <animated.div style={containerAnimation} className="risk-history-empty">
        <i className="fas fa-history"></i>
        <p>No hay evaluaciones previas registradas</p>
        <span>Las evaluaciones que realice se mostrarán aquí</span>
      </animated.div>
    );
  }

  return (
    <animated.div style={containerAnimation} className="risk-history">
      <div className="risk-history-header">
        <i className="fas fa-history"></i>
        <h3>Historial de Evaluaciones</h3>
      </div>
      
      <div className="risk-history-list">
        {trail.map((props, index) => (
          <animated.div 
            key={history[index].id || index}
            className="risk-history-entry"
            style={props}
          >
            <div className="history-date">{formatDate(history[index].evaluationDate)}</div>
            <div className={`history-risk-level ${getRiskLevelClass(history[index].riskLevel)}`}>
              {history[index].riskLevel}
            </div>
          </animated.div>
        ))}
      </div>
      
      <div className="risk-history-footer">
        <button className="btn btn-secondary btn-icon btn-sm">
          <i className="fas fa-download"></i>
          <span>Exportar historial</span>
        </button>
      </div>
    </animated.div>
  );
};

export default RiskHistory;