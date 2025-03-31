// src/styles/chartStyles.js
// Configuraciones de estilo para gráficos Recharts

// Colores para gráficos
export const chartColors = {
    primary: '#49a357', // Verde
    secondary: '#0ea5e9', // Azul
    tertiary: '#b98443', // Tierra
    lightPrimary: '#93d49d',
    lightSecondary: '#7dd3fc',
    
    // Colores para series temporales
    temperature: '#ef4444',
    humidity: '#0ea5e9',
    aqi: '#49a357',
    precipitation: '#3b82f6',
    
    // Degradados
    blueGradient: ['#0ea5e9', '#0284c7', '#075985'],
    greenGradient: ['#67bd74', '#49a357', '#358544'],
    rainGradient: ['#93c5fd', '#3b82f6', '#1d4ed8', '#1e3a8a'],
    
    // Grises para ejes y grillas
    axis: '#9ca3af',
    grid: '#e5e7eb',
  };
  
  // Configuración común para gráficos de líneas
  export const lineChartConfig = {
    // Estilo para líneas
    lineStyle: {
      strokeWidth: 2,
      dot: false,
    },
    
    // Tipos de línea
    aqi: {
      type: 'monotone',
      stroke: chartColors.aqi,
      fill: 'url(#aqiGradient)',
      fillOpacity: 0.1,
      activeDot: { r: 5, strokeWidth: 1 },
      strokeWidth: 2,
    },
    
    temperature: {
      type: 'monotone',
      stroke: chartColors.temperature,
      activeDot: { r: 5, strokeWidth: 1 },
      strokeWidth: 2,
    },
    
    humidity: {
      type: 'monotone',
      stroke: chartColors.humidity,
      strokeDasharray: '4 4',
      activeDot: { r: 4, strokeWidth: 1 },
      strokeWidth: 2,
    },
    
    precipitation: {
      type: 'monotone',
      stroke: chartColors.precipitation,
      fill: 'url(#rainGradient)',
      fillOpacity: 0.2,
      activeDot: { r: 5, strokeWidth: 1 },
      strokeWidth: 2,
    },
  };
  
  // Configuración para gráficos de barras
  export const barChartConfig = {
    bar: {
      aqi: {
        fill: chartColors.aqi,
        radius: [4, 4, 0, 0],
      },
      rainfall: {
        fill: chartColors.precipitation,
        radius: [4, 4, 0, 0],
      },
      temperature: {
        fill: chartColors.temperature,
        radius: [4, 4, 0, 0],
      },
      humidity: {
        fill: chartColors.humidity,
        radius: [4, 4, 0, 0],
      },
    },
  };
  
  // Configuración para gráficos de área
  export const areaChartConfig = {
    area: {
      // Área para gráficos acumulativos
      accumulated: {
        type: 'monotone',
        stroke: chartColors.primary,
        fill: 'url(#accumulatedGradient)',
        fillOpacity: 0.3,
      },
      // Área para precipitaciones
      rainfall: {
        type: 'monotone',
        stroke: chartColors.precipitation,
        fill: 'url(#rainGradient)',
        fillOpacity: 0.3,
      },
    },
  };
  
  // Componente para incluir los gradientes en tus gráficos
  export const ChartGradients = () => (
    <>
      <defs>
        <linearGradient id="aqiGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.8} />
          <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0.1} />
        </linearGradient>
        
        <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={chartColors.precipitation} stopOpacity={0.8} />
          <stop offset="95%" stopColor={chartColors.precipitation} stopOpacity={0.1} />
        </linearGradient>
        
        <linearGradient id="accumulatedGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.8} />
          <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0.1} />
        </linearGradient>
        
        <linearGradient id="temperatureGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={chartColors.temperature} stopOpacity={0.8} />
          <stop offset="95%" stopColor={chartColors.temperature} stopOpacity={0.1} />
        </linearGradient>
      </defs>
    </>
  );
  
  // Configuración para CartesianGrid
  export const gridConfig = {
    strokeDasharray: '3 3',
    stroke: chartColors.grid,
  };
  
  // Configuración para ejes
  export const axisConfig = {
    tick: {
      fontSize: 12,
      fill: chartColors.axis,
    },
    axisLine: {
      stroke: chartColors.grid,
    },
  };
  
  // Configuración para tooltips
  export const tooltipConfig = {
    contentStyle: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      border: `1px solid ${chartColors.grid}`,
      borderRadius: '0.5rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      padding: '0.75rem',
    },
    itemStyle: {
      padding: '2px 0',
    },
    labelStyle: {
      fontWeight: 600,
      marginBottom: '0.25rem',
    },
  };
  
  // Función para obtener color basado en valores (por ejemplo, para AQI)
  export const getAQIColor = (value) => {
    if (value <= 50) return '#4ade80'; // Verde (bueno)
    if (value <= 100) return '#facc15'; // Amarillo (moderado)
    if (value <= 150) return '#fb923c'; // Naranja (insalubre para grupos sensibles)
    if (value <= 200) return '#ef4444'; // Rojo (insalubre)
    if (value <= 300) return '#c026d3'; // Púrpura (muy insalubre)
    return '#881337'; // Rojo oscuro (peligroso)
  };
  
  // Función para obtener color basado en precipitaciones
  export const getRainfallColor = (value) => {
    if (value === 0) return '#e5e7eb'; // Gris (sin lluvia)
    if (value < 2) return '#93c5fd'; // Azul claro (llovizna)
    if (value < 10) return '#3b82f6'; // Azul (moderada)
    if (value < 30) return '#1d4ed8'; // Azul oscuro (fuerte)
    return '#1e3a8a'; // Azul muy oscuro (extrema)
  };
  
  // Exportar configuraciones
  export default {
    chartColors,
    lineChartConfig,
    barChartConfig,
    areaChartConfig,
    ChartGradients,
    gridConfig,
    axisConfig,
    tooltipConfig,
    getAQIColor,
    getRainfallColor,
  };