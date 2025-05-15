import React from 'react';
import { useSpring, animated, useTrail } from 'react-spring';

const Recommendations = ({ recommendations }) => {
  // Animación para el título
  const headerAnimation = useSpring({
    from: { opacity: 0, transform: 'translateY(-20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: { tension: 280, friction: 20 },
  });
  
  // Animación para las recomendaciones (aparecen secuencialmente)
  const trail = useTrail(recommendations.length, {
    from: { opacity: 0, transform: 'translateX(-20px)' },
    to: { opacity: 1, transform: 'translateX(0)' },
    delay: 300,
    config: { tension: 280, friction: 20 },
  });

  return (
    <div className="recommendations-container">
      <animated.h3 style={headerAnimation}>Recomendaciones Personalizadas</animated.h3>
      <div className="recommendations-list">
        {trail.map((props, index) => (
          <animated.div
            key={index}
            className="recommendation-item"
            style={props}
          >
            <div className="recommendation-icon">
              {index % 3 === 0 && <i className="fas fa-shield-alt"></i>}
              {index % 3 === 1 && <i className="fas fa-first-aid"></i>}
              {index % 3 === 2 && <i className="fas fa-info-circle"></i>}
            </div>
            <div className="recommendation-text">
              {recommendations[index]}
            </div>
          </animated.div>
        ))}
      </div>
    </div>
  );
};

export default Recommendations;
