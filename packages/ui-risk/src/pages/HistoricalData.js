import React, { useState, useEffect } from 'react';
import axios from 'axios';

const HistoricalData = () => {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/risk/historical');
        setEvaluations(response.data);
      } catch (err) {
        setError('Error al cargar el historial de evaluaciones');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="historical-page">
      <h2>Historial de Evaluaciones</h2>
      <div className="evaluations-grid">
        {evaluations.map((evaluation, index) => (
          <div key={index} className="evaluation-card">
            <h3>Evaluación {evaluation.id}</h3>
            <p>Fecha: {new Date(evaluation.timestamp).toLocaleDateString()}</p>
            <p>Nivel de Riesgo: {evaluation.riskLevel}</p>
            <p>Ubicación: {evaluation.location}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoricalData;