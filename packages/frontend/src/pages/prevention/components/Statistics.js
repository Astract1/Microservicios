import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import '../styles/Statistics.css';

const Statistics = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Datos simulados
  const monthlyData = [
    { fecha: '2024-01', casos: 120, region: 'Norte' },
    { fecha: '2024-02', casos: 150, region: 'Norte' },
    { fecha: '2024-03', casos: 170, region: 'Norte' },
    { fecha: '2024-04', casos: 160, region: 'Sur' },
    { fecha: '2024-05', casos: 180, region: 'Sur' },
    { fecha: '2024-06', casos: 200, region: 'Sur' },
    { fecha: '2024-07', casos: 220, region: 'Este' },
    { fecha: '2024-08', casos: 210, region: 'Este' },
    { fecha: '2024-09', casos: 190, region: 'Este' },
    { fecha: '2024-10', casos: 230, region: 'Oeste' },
    { fecha: '2024-11', casos: 240, region: 'Oeste' },
    { fecha: '2024-12', casos: 250, region: 'Oeste' },
  ];

  const categoryData = [
    { categoria: 'Monitoreo', cantidad: 40, impacto: 'Alto' },
    { categoria: 'Alerta', cantidad: 30, impacto: 'Medio' },
    { categoria: 'Educación', cantidad: 50, impacto: 'Alto' },
    { categoria: 'Reducción', cantidad: 20, impacto: 'Medio' },
    { categoria: 'Restauración', cantidad: 60, impacto: 'Alto' },
  ];

  // Gráfico de líneas: Tendencia mensual de casos reportados
  const lineTrace = {
    x: monthlyData.map(d => d.fecha),
    y: monthlyData.map(d => d.casos),
    type: 'scatter',
    mode: 'lines+markers',
    marker: { 
      color: '#1f77b4',
      size: 8
    },
    line: {
      width: 3
    },
    name: 'Casos',
    hovertemplate: 'Mes: %{x}<br>Casos: %{y}<br>Región: %{text}<extra></extra>',
    text: monthlyData.map(d => d.region)
  };

  const lineLayout = {
    title: {
      text: 'Tendencia mensual de casos reportados',
      font: { size: 24 }
    },
    xaxis: { 
      title: 'Mes',
      tickangle: -45
    },
    yaxis: { 
      title: 'Número de casos',
      gridcolor: '#e0e0e0'
    },
    hovermode: 'closest',
    plot_bgcolor: '#ffffff',
    paper_bgcolor: '#ffffff',
    margin: { t: 50, r: 50, b: 50, l: 50 }
  };

  const lineConfig = { 
    responsive: true,
    displayModeBar: true,
    modeBarButtonsToAdd: ['zoom2d', 'pan2d', 'resetScale2d']
  };

  // Gráfico de pastel: Distribución por categoría
  const pieTrace = {
    labels: categoryData.map(d => d.categoria),
    values: categoryData.map(d => d.cantidad),
    type: 'pie',
    textinfo: 'label+percent',
    hoverinfo: 'label+value+text',
    text: categoryData.map(d => `Impacto: ${d.impacto}`),
    marker: {
      colors: ['#1f77b4', '#2ca02c', '#ff7f0e', '#d62728', '#9467bd'],
      line: {
        color: '#ffffff',
        width: 2
      }
    },
    hole: 0.4
  };

  const pieLayout = {
    title: {
      text: 'Distribución de acciones por categoría',
      font: { size: 24 }
    },
    annotations: [{
      text: 'Total',
      showarrow: false,
      font: { size: 20 }
    }],
    plot_bgcolor: '#ffffff',
    paper_bgcolor: '#ffffff',
    margin: { t: 50, r: 50, b: 50, l: 50 }
  };

  const pieConfig = { 
    responsive: true,
    displayModeBar: true
  };

  const handlePieClick = (data) => {
    const categoria = data.points[0].label;
    setSelectedCategory(categoria);
  };

  return (
    <div className="statistics-container">
      <div className="statistics-header">
        <h2>Dashboard de Estadísticas</h2>
        <p>Visualización interactiva de datos ambientales y acciones preventivas</p>
      </div>

      <div className="charts-grid">
        <div className="chart-section">
          <Plot
            data={[lineTrace]}
            layout={lineLayout}
            config={lineConfig}
            style={{ width: '100%', height: '400px' }}
          />
          <p className="chart-description">
            Tendencia mensual de casos reportados por región.
            {selectedCategory && ` Filtrado por región: ${selectedCategory}`}
          </p>
        </div>

        <div className="chart-section">
          <Plot
            data={[pieTrace]}
            layout={pieLayout}
            config={pieConfig}
            style={{ width: '100%', height: '400px' }}
            onClick={handlePieClick}
          />
          <p className="chart-description">
            Distribución de acciones preventivas por categoría e impacto.
            Haz clic en una categoría para filtrar los datos.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
