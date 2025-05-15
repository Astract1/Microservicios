import React, { useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';

const ContentBarChart = () => {
  const chartRef = useRef(null);

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

  useEffect(() => {
    // Solo procedemos si chartRef.current existe
    if (!chartRef.current) return;
    
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
    };

    const config = {
      responsive: true,
      displayModeBar: true,
      displaylogo: false,
      modeBarButtonsToRemove: ['sendDataToCloud', 'select2d', 'lasso2d'],
      scrollZoom: true,
    };

    Plotly.newPlot(chartRef.current, data, layout, config);

    // Limpieza al desmontar con verificación de que chartRef.current todavía existe
    return () => {
      if (chartRef.current) {
        Plotly.purge(chartRef.current);
      }
    };
  }, []);

  return (
    <div style={{ width: '100%', maxWidth: 900, margin: '2rem auto' }}>
      <div ref={chartRef} style={{ width: '100%', height: 400 }} />
    </div>
  );
};

export default ContentBarChart; 