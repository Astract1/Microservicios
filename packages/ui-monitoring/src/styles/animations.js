// src/styles/animations.js
import React, { useState, useEffect } from 'react';

// Hook para animar valor numérico (contador)
export const useCountUp = (endValue, duration = 2000) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    // Si el valor final es 0, no animar
    if (endValue === 0) {
      setCount(0);
      return;
    }
    
    // Calcular incremento por paso
    const steps = 20;
    const increment = endValue / steps;
    const stepDuration = duration / steps;
    
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= endValue) {
        setCount(endValue);
        clearInterval(timer);
      } else {
        setCount(current);
      }
    }, stepDuration);
    
    return () => clearInterval(timer);
  }, [endValue, duration]);
  
  return Math.round(count);
};

// Componente para animar valor numérico
export const AnimatedCounter = ({ 
  value, 
  duration = 2000,
  formatter = (val) => Math.round(val),
  className = '',
}) => {
  const count = useCountUp(value, duration);
  
  return (
    <span className={className}>
      {formatter(count)}
    </span>
  );
};

// Hook para animar la entrada de elementos en la vista
export const useFadeIn = (delay = 0) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [delay]);
  
  return {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
    transition: `opacity 500ms, transform 500ms`,
    transitionDelay: `${delay}ms`,
  };
};

// Componente para texto que se escribe automáticamente
export const TypewriterText = ({ text, speed = 50, className = '' }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  
  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(prevText => prevText + text[currentIndex]);
        setCurrentIndex(prevIndex => prevIndex + 1);
      }, speed);
      
      return () => clearTimeout(timer);
    }
  }, [currentIndex, text, speed]);
  
  return (
    <span className={className}>
      {displayText}
      {currentIndex < text.length && <span className="animate-pulse">|</span>}
    </span>
  );
};

// Componente para mostrar un indicador de carga con estilo
export const AnimatedLoading = ({ text = 'Cargando', dots = 3, className = '' }) => {
  const [dotCount, setDotCount] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setDotCount(prev => (prev + 1) % (dots + 1));
    }, 500);
    
    return () => clearInterval(timer);
  }, [dots]);
  
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <span>{text}</span>
      <span className="inline-block w-8 text-left">
        {'.'.repeat(dotCount)}
      </span>
    </div>
  );
};

// Componente para valor que pulsa cuando cambia
export const PulsingValue = ({ value, className = '' }) => {
  const [isPulsing, setIsPulsing] = useState(false);
  const [displayValue, setDisplayValue] = useState(value);
  
  useEffect(() => {
    if (value !== displayValue) {
      setIsPulsing(true);
      const timer = setTimeout(() => {
        setIsPulsing(false);
        setDisplayValue(value);
      }, 600);
      
      return () => clearTimeout(timer);
    }
  }, [value, displayValue]);
  
  return (
    <span className={`inline-block ${isPulsing ? 'animate-pulse bg-yellow-100 dark:bg-yellow-900 dark:bg-opacity-30 px-1 rounded' : ''} ${className}`}>
      {displayValue}
    </span>
  );
};

// Componente para animación de gráfico de progreso circular
export const CircleProgress = ({ 
  percentage, 
  size = 100, 
  strokeWidth = 8, 
  color = '#49a357',
  backgroundColor = '#e5e7eb',
  className = '',
  showPercentage = true,
  animate = true,
}) => {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    if (animate) {
      // Animar desde 0 hasta el porcentaje indicado
      setProgress(0);
      const timer = setTimeout(() => {
        setProgress(percentage);
      }, 100);
      
      return () => clearTimeout(timer);
    } else {
      setProgress(percentage);
    }
  }, [percentage, animate]);
  
  // Cálculos para el círculo SVG
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const dash = (progress * circumference) / 100;
  
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Círculo de fondo */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
        />
        
        {/* Círculo de progreso */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - dash}
          style={{ transition: animate ? 'stroke-dashoffset 1s ease-in-out' : 'none' }}
        />
      </svg>
      
      {/* Texto del porcentaje */}
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-medium">
            {Math.round(progress)}%
          </span>
        </div>
      )}
    </div>
  );
};

// Exportar componentes y hooks de animación
export default {
  useCountUp,
  AnimatedCounter,
  useFadeIn,
  TypewriterText,
  AnimatedLoading,
  PulsingValue,
  CircleProgress,
};