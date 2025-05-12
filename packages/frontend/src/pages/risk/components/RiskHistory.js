// packages/frontend/src/pages/risk/components/RiskHistory.js

import React, { useEffect, useState } from 'react';
import { riskApi } from '../services/riskApi';

const RiskHistory = ({ userId }) => {
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await riskApi.getEvaluationHistory(userId);
        setHistory(data);
      } catch (err) {
        setError('Error al cargar el historial');
      }
    };

    fetchHistory();
  }, [userId]);

  if (error) return <div className="error">{error}</div>;
  if (history.length === 0) return <div>No hay evaluaciones previas</div>;

  return (
    <div className="risk-history">
      <h2>Historial de Evaluaciones</h2>
      <ul>
        {history.map((evaluation) => (
          <li key={evaluation.id}>
            <p>Fecha: {new Date(evaluation.evaluationDate).toLocaleDateString()}</p>
            <p>Nivel de Riesgo: {evaluation.riskLevel}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RiskHistory;