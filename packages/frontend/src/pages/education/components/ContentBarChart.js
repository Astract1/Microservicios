import React, { useEffect, useRef, useState } from 'react';
import Plotly from 'plotly.js-dist-min';

const ContentBarChart = () => {
  const chartRef = useRef(null);
  const [chart, setChart] = useState(null);
  const [dimensions, setDimensions] = useState({ width: '100%', height: 400 });
  const [isRendered, setIsRendered] = useState(false);

  // Datos simulados
  const categories = [
    'Contaminación',
    'Calidad del Aire',
    'Cambio Climático',
    'Gestión Ambiental',
    'Energías Renovables',
    'Biodiversidad'
  ];
  const articles = [5, 2, 3, 4, 6, 2];
  const guides = [2, 4, 1, 3, 2, 5];
  const videos = [1, 2, 4, 1, 2, 1];
  const infographics = [2, 1, 2, 2, 1, 3];

  // Efecto para manejar redimensionamiento
  useEffect(() => {
    const handleResize = () => {
      if (chartRef.current && isRendered) {
        Plotly.Plots.resize(chartRef.current);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isRendered]);

  // Efecto para crear el gráfico
  useEffect(() => {
    // Asegurarse de que el componente esté montado
    let isMounted = true;

    // Función para renderizar el gráfico con seguridad
    const renderChart = () => {
      // Verificar si el componente sigue montado y el DOM está listo
      if (!isMounted || !chartRef.current) {
        return;
      }

      try {
        const data = [
          {
            x: categories,
            y: articles,
            name: 'Artículos',
            type: 'bar',
            marker: { color: '#1976d2' },
            hoverinfo: 'x+y',
          },
          {
            x: categories,
            y: guides,
            name: 'Guías',
            type: 'bar',
            marker: { color: '#43a047' },
            hoverinfo: 'x+y',
          },
          {
            x: categories,
            y: videos,
            name: 'Videos',
            type: 'bar',
            marker: { color: '#fbc02d' },
            hoverinfo: 'x+y',
          },
          {
            x: categories,
            y: infographics,
            name: 'Infografías',
            type: 'bar',
            marker: { color: '#e53935' },
            hoverinfo: 'x+y',
          },
        ];

        const layout = {
          barmode: 'group',
          title: 'Distribución de Contenido Educativo por Categoría',
          plot_bgcolor: '#f8f9fa',
          paper_bgcolor: '#fff',
          font: { family: 'inherit', size: 14 },
          xaxis: {
            title: 'Categoría',
            tickangle: -30,
            showgrid: false,
            zeroline: false,
          },
          yaxis: {
            title: 'Cantidad de Contenidos',
            showgrid: true,
            gridcolor: '#e0e0e0',
            zeroline: false,
          },
          legend: {
            orientation: 'h',
            x: 0.5,
            xanchor: 'center',
            y: -0.2,
          },
          margin: { t: 60, l: 60, r: 30, b: 80 },
          hovermode: 'closest',
          dragmode: 'zoom',
          autosize: true
        };

        const config = {
          responsive: true,
          displayModeBar: true,
          displaylogo: false,
          modeBarButtonsToRemove: ['sendDataToCloud', 'select2d', 'lasso2d'],
          scrollZoom: true,
        };

        // Verificar nuevamente antes de renderizar
        if (chartRef.current) {
          // Limpiar cualquier gráfico existente primero
          Plotly.purge(chartRef.current);
          
          // Crear el nuevo gráfico
          Plotly.newPlot(chartRef.current, data, layout, config);
          setIsRendered(true);
        }
      } catch (error) {
        console.error("Error al crear el gráfico Plotly:", error);
      }
    };

    // Pequeño retraso para asegurar que el DOM esté completamente listo
    const timeoutId = setTimeout(() => {
      renderChart();
    }, 100);

    // Limpieza al desmontar
    return () => {
      clearTimeout(timeoutId);
      isMounted = false;
      try {
        if (chartRef.current) {
          Plotly.purge(chartRef.current);
        }
      } catch (error) {
        // Ignorar errores durante la limpieza
      }
    };
  }, []); // Solo se ejecuta una vez al montar el componente

  // Usamos un div contenedor con ref para el gráfico
  return (
    <div className="content-chart-container" style={{ width: '100%', maxWidth: 900, margin: '2rem auto' }}>
      {/* Usar null check para evitar errores */}
      <div 
        ref={chartRef}
        className="plotly-chart" 
        style={dimensions}
      />
    </div>
  );
};

export default ContentBarChart; 