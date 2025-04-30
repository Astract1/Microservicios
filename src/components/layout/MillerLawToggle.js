import React from 'react';
import './MillerLawToggle.css';

const MillerLawToggle = ({ onToggle, isMillerLawApplied }) => {
  return (
    <div className="miller-law-toggle">
      <div className="toggle-container">
        <span className={!isMillerLawApplied ? 'active' : ''}>Sin Ley de Miller</span>
        <label className="switch">
          <input 
            type="checkbox" 
            checked={isMillerLawApplied} 
            onChange={onToggle}
          />
          <span className="slider round"></span>
        </label>
        <span className={isMillerLawApplied ? 'active' : ''}>Con Ley de Miller</span>
      </div>
      <div className="info-tooltip">
        <i className="fas fa-info-circle"></i>
        <div className="tooltip-content">
          <p><strong>Ley de Miller (7±2):</strong> Establece que una persona puede recordar aproximadamente 7 (±2) elementos de información simultáneamente en su memoria de trabajo.</p>
          <p>Esta aplicación muestra cómo implementarla en interfaces de usuario para mejorar la usabilidad.</p>
        </div>
      </div>
    </div>
  );
};

export default MillerLawToggle; 