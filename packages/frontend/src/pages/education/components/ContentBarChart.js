import React, { useEffect, useRef, useState } from 'react';
import Plotly from 'plotly.js-dist-min';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const ContentBarChart = () => {
  const chartRef = useRef(null);
  const [chart, setChart] = useState(null);
  const [dimensions, setDimensions] = useState({ width: '100%', height: 400 });
  const [isRendered, setIsRendered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [contentData, setContentData] = useState({
    categories: [],
    articles: [],
    guides: [],
    videos: [],
    infographics: []
  });
  const [error, setError] = useState(null);

  // Efecto para cargar datos reales de la API
  useEffect(() => {
    const fetchContentData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Obtener datos de contenido educativo de la API
        const response = await axios.get(`${API_BASE_URL}/education/content-stats`);
        
        if (response.data && response.data.success) {
          // Transformar datos para el gráfico
          const categories = response.data.data.map(item => item.category);
          const articles = response.data.data.map(item => item.articles || 0);
          const guides = response.data.data.map(item => item.guides || 0);
          const videos = response.data.data.map(item => item.videos || 0);
          const infographics = response.data.data.map(item => item.infographics || 0);
          
          setContentData({
            categories,
            articles,
            guides,
            videos,
            infographics
          });
        } else {
          // Si la API no devuelve datos o hay un error, usar datos de respaldo
          setContentData({
            categories: [
              'Contaminación',
              'Calidad del Aire',
              'Cambio Climático',
              'Gestión Ambiental',
              'Energías Renovables',
              'Biodiversidad'
            ],
            articles: [5, 2, 3, 4, 6, 2],
            guides: [2, 4, 1, 3, 2, 5],
            videos: [1, 2, 4, 1, 2, 1],
            infographics: [2, 1, 2, 2, 1, 3]
          });
          console.warn('Se están usando datos de respaldo para el gráfico de contenido educativo');
        }
      } catch (err) {
        console.error('Error al obtener datos de contenido:', err);
        setError('No se pudieron cargar los datos de contenido');
        
        // Usar datos de respaldo en caso de error
        setContentData({
          categories: [
            'Contaminación',
            'Calidad del Aire',
            'Cambio Climático',
            'Gestión Ambiental',
            'Energías Renovables',
            'Biodiversidad'
          ],
          articles: [5, 2, 3, 4, 6, 2],
          guides: [2, 4, 1, 3, 2, 5],
          videos: [1, 2, 4, 1, 2, 1],
          infographics: [2, 1, 2, 2, 1, 3]
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchContentData();
  }, []);

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

  // Efecto para crear el gráfico cuando los datos estén disponibles
  useEffect(() => {
    // No renderizar si está cargando o no hay datos
    if (loading || contentData.categories.length === 0) {
      return;
    }
    
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
            x: contentData.categories,
            y: contentData.articles,
            name: 'Artículos',
            type: 'bar',
            marker: { color: '#2196F3' },
            hoverinfo: 'x+y',
          },
          {
            x: contentData.categories,
            y: contentData.guides,
            name: 'Guías',
            type: 'bar',
            marker: { color: '#43a047' },
            hoverinfo: 'x+y',
          },
          {
            x: contentData.categories,
            y: contentData.videos,
            name: 'Videos',
            type: 'bar',
            marker: { color: '#fbc02d' },
            hoverinfo: 'x+y',
          },
          {
            x: contentData.categories,
            y: contentData.infographics,
            name: 'Infografías',
            type: 'bar',
            marker: { color: '#e53935' },
            hoverinfo: 'x+y',
          },
        ];

        const layout = {
          barmode: 'group',
          title: 'Distribución de Contenidos Educativos por Categoría - Datos Reales',
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
  }, [contentData, loading]); // Se ejecuta cuando cambian los datos o el estado de carga

  // Usamos un div contenedor con ref para el gráfico
  return (
    <div className="content-chart-container" style={{ width: '100%', maxWidth: 900, margin: '2rem auto' }}>
      {loading ? (
        <div className="loading-message" style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Cargando datos de contenido...</p>
        </div>
      ) : error ? (
        <div className="error-message" style={{ textAlign: 'center', padding: '2rem', color: '#e53935' }}>
          <p>{error}</p>
        </div>
      ) : (
        <div 
          ref={chartRef}
          className="plotly-chart" 
          style={dimensions}
        />
      )}
    </div>
  );
};

export default ContentBarChart; 