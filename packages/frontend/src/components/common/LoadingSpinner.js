import React from 'react';
import { useSpring, animated } from 'react-spring';
import '../../styles/common/LoadingSpinner.css';

const LoadingSpinner = () => {
  // Animación de rotación continua
  const spin = useSpring({
    from: { rotateZ: 0 },
    to: { rotateZ: 360 },
    config: { duration: 1500 },
    loop: true
  });
  
  // Animación de latido
  const pulse = useSpring({
    from: { scale: 1 },
    to: async (next) => {
      while (true) {
        await next({ scale: 1.1, config: { duration: 600 } });
        await next({ scale: 1, config: { duration: 600 } });
      }
    }
  });
  
  return (
    <div className="loading-spinner-container">
      <animated.div style={spin} className="loading-spinner">
        <animated.div style={pulse} className="spinner-inner"></animated.div>
      </animated.div>
    </div>
  );
};

export default LoadingSpinner; 