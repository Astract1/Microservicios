// packages/frontend/src/pages/risk/components/RiskLevelIndicator.js

import React from 'react';
import { useSpring, animated } from 'react-spring';

const RiskLevelIndicator = ({ level }) => {
  // Función para obtener el color basado en el nivel de riesgo
  const getColor = () => {
    switch (level) {
      case 'Bajo':
        return '#4caf50'; // Verde más atractivo
      case 'Medio':
        return '#ff9800'; // Naranja más atractivo
      case 'Alto':
        return '#f44336'; // Rojo más atractivo
      default:
        return '#9e9e9e'; // Gris más atractivo
    }
  };

  // Animación para el indicador
  const indicatorAnimation = useSpring({
    from: { scale: 0.5, opacity: 0 },
    to: { scale: 1, opacity: 1 },
    config: { tension: 300, friction: 10 },
  });

  // Animación para el texto
  const textAnimation = useSpring({
    from: { transform: 'translateY(20px)', opacity: 0 },
    to: { transform: 'translateY(0)', opacity: 1 },
    delay: 300,
    config: { tension: 280, friction: 20 },
  });

  const color = getColor();

  return (
    <div className="risk-level-indicator-container">
      <animated.div
        className="risk-level-circle"
        style={{
          ...indicatorAnimation,
          backgroundColor: color,
        }}
      >
        {level}
      </animated.div>
      <animated.h3 style={textAnimation}>
        Nivel de Riesgo
      </animated.h3>
      <animated.div className="risk-level-description" style={textAnimation}>
        {level === 'Bajo' && 'El riesgo para tu salud es bajo en las condiciones actuales.'}
        {level === 'Medio' && 'Hay un nivel moderado de riesgo para tu salud. Toma precauciones.'}
        {level === 'Alto' && '¡Atención! El nivel de riesgo para tu salud es alto. Toma medidas inmediatas.'}
      </animated.div>
    </div>
  );
};

export default RiskLevelIndicator;