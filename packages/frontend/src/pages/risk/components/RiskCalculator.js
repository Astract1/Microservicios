import React, { useState } from 'react';
import { riskApi } from '../services/riskApi';
import RiskLevelIndicator from './RiskLevelIndicator';
import Recommendations from './Recommendations';

const RiskCalculator = ({ userData, environmentalData }) => {
  const [riskEvaluation, setRiskEvaluation] = useState(null);
  const [error, setError] = useState(null);

  const calculateRisk = async () => {
    try {
      const result = await riskApi.evaluateRisk(userData, environmentalData);
      setRiskEvaluation(result);
    } catch (err) {
      setError('Error al calcular el riesgo');
    }
  };

  if (error) return <div className="error">{error}</div>;

  return (
    <div className="risk-calculator">
      <h2>Calculadora de Riesgo</h2>
      <button onClick={calculateRisk}>Calcular Riesgo</button>
      {riskEvaluation && (
        <>
          <RiskLevelIndicator level={riskEvaluation.riskLevel} />
          <Recommendations recommendations={riskEvaluation.recommendations} />
        </>
      )}
    </div>
  );
};

export default RiskCalculator;
