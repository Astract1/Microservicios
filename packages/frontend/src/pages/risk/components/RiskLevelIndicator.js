// packages/frontend/src/pages/risk/components/RiskLevelIndicator.js

import React from 'react';

const RiskLevelIndicator = ({ level }) => {
  const getColor = () => {
    switch (level) {
      case 'Bajo':
        return 'green';
      case 'Medio':
        return 'orange';
      case 'Alto':
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <div className="risk-level-indicator" style={{ color: getColor() }}>
      <h3>Nivel de Riesgo: {level}</h3>
    </div>
  );
};

export default RiskLevelIndicator;