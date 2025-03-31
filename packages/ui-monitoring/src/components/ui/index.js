// src/components/ui/index.js
import React from 'react';

// Componente de Card mejorado y reutilizable
export const Card = ({ 
  children, 
  className = '', 
  hover = true,
  animate = false 
}) => {
  return (
    <div className={`
      card ${hover ? 'card-hover' : ''} 
      ${animate ? 'animate-fadeIn' : ''} 
      ${className}
    `}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => {
  return (
    <div className={`card-header ${className}`}>
      {children}
    </div>
  );
};

export const CardBody = ({ children, className = '' }) => {
  return (
    <div className={`card-body ${className}`}>
      {children}
    </div>
  );
};

export const CardFooter = ({ children, className = '' }) => {
  return (
    <div className={`card-footer ${className}`}>
      {children}
    </div>
  );
};

// Componente de botón reutilizable
export const Button = ({ 
  children, 
  className = '', 
  variant = 'primary', 
  size = 'md',
  onClick,
  disabled = false,
  type = 'button',
  icon,
  ...props 
}) => {
  const getButtonClass = () => {
    let btnClass = 'btn';
    
    // Variante
    if (variant === 'primary') btnClass += ' btn-primary';
    else if (variant === 'secondary') btnClass += ' btn-secondary';
    else if (variant === 'outline') btnClass += ' btn-outline';
    
    // Tamaño
    if (size === 'sm') btnClass += ' btn-sm';
    else if (size === 'lg') btnClass += ' btn-lg';
    
    // Disabled
    if (disabled) btnClass += ' opacity-50 cursor-not-allowed';
    
    return btnClass;
  };
  
  return (
    <button
      className={`${getButtonClass()} ${className}`}
      onClick={onClick}
      disabled={disabled}
      type={type}
      {...props}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};

// Componente Badge reutilizable
export const Badge = ({ 
  children, 
  className = '', 
  color = 'green' 
}) => {
  return (
    <span className={`badge badge-${color} ${className}`}>
      {children}
    </span>
  );
};

// Componente de Alerta reutilizable
export const Alert = ({ 
  children, 
  className = '', 
  type = 'info',
  title
}) => {
  return (
    <div className={`alert alert-${type} ${className}`} role="alert">
      {title && <p className="font-bold">{title}</p>}
      <p>{children}</p>
    </div>
  );
};

// Componente de estado de carga
export const LoadingState = ({ text = 'Cargando datos...' }) => {
  return (
    <div className="text-center py-10">
      <p className="text-gray-600 mb-4">{text}</p>
      <div className="flex justify-center">
        <div className="loading-spinner"></div>
      </div>
    </div>
  );
};

// Componente de estado vacío
export const EmptyState = ({ 
  icon = '📊', 
  title = 'No hay datos disponibles', 
  description = 'Los datos se mostrarán aquí cuando estén disponibles.'
}) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <div className="empty-state-text">{title}</div>
      <div className="empty-state-subtext">{description}</div>
    </div>
  );
};

// Componente indicador de AQI
export const AQIIndicator = ({ aqi, size = 'md', className = '' }) => {
  // Determine AQI level and corresponding class
  const getAqiLevel = () => {
    if (aqi <= 50) return { level: 'Buena', className: 'aqi-good' };
    if (aqi <= 100) return { level: 'Moderada', className: 'aqi-moderate' };
    if (aqi <= 150) return { level: 'Insalubre para grupos sensibles', className: 'aqi-sensitive' };
    if (aqi <= 200) return { level: 'Insalubre', className: 'aqi-unhealthy' };
    if (aqi <= 300) return { level: 'Muy insalubre', className: 'aqi-very' };
    return { level: 'Peligrosa', className: 'aqi-hazardous' };
  };
  
  const { level, className: aqiClass } = getAqiLevel();
  
  const sizeClass = {
    'sm': 'w-16 h-16 text-sm',
    'md': 'w-24 h-24',
    'lg': 'w-32 h-32 text-xl'
  }[size] || 'w-24 h-24';
  
  return (
    <div className={`aqi-indicator ${aqiClass} ${sizeClass} ${className}`}>
      <span className="text-3xl font-bold">{Math.round(aqi)}</span>
      <span className="text-xs mt-1">AQI</span>
    </div>
  );
};

// Componente de contenedor de datos
export const DataItem = ({ label, value, className = '' }) => {
  return (
    <div className={`data-container ${className}`}>
      <p className="data-label">{label}</p>
      <p className="data-value">{value}</p>
    </div>
  );
};

// Exportar todos los componentes
export default {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Badge,
  Alert,
  LoadingState,
  EmptyState,
  AQIIndicator,
  DataItem
};