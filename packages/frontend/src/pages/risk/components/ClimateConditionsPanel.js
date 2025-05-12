// packages/frontend/src/pages/risk/components/ClimateConditionsPanel.js

import React, { useEffect, useState } from 'react';
import { riskApi } from '../services/riskApi';

const ClimateConditionsPanel = () => {
  const [conditions, setConditions] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConditions = async () => {
      try {
        const data = await riskApi.checkConnection();
        setConditions(data);
      } catch (err) {
        setError('Error al cargar las condiciones climáticas');
      }
    };

    fetchConditions();
  }, []);

  if (error) return <div className="error">{error}</div>;
  if (!conditions) return <div>Cargando...</div>;

  return (
    <div className="climate-conditions-panel">
      <h2>Condiciones Climáticas Actuales</h2>
      <div>
        <p>Calidad del Aire: {conditions.airQuality}</p>
        <p>Temperatura: {conditions.temperature}°C</p>
        <p>Humedad: {conditions.humidity}%</p>
      </div>
    </div>
  );
};

export default ClimateConditionsPanel;