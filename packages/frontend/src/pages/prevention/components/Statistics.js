import React, { useEffect } from 'react';
import Plotly from 'plotly.js-dist';
import '../styles/Statistics.css'; 

const Statistics = () => {
  useEffect(() => {
    // Datos simulados
    const monthlyData = [
      { fecha: '2024-01', casos: 120 },
      { fecha: '2024-02', casos: 150 },
      { fecha: '2024-03', casos: 170 },
      { fecha: '2024-04', casos: 160 },
      { fecha: '2024-05', casos: 180 },
      { fecha: '2024-06', casos: 200 },
      { fecha: '2024-07', casos: 220 },
      { fecha: '2024-08', casos: 210 },
      { fecha: '2024-09', casos: 190 },
      { fecha: '2024-10', casos: 230 },
      { fecha: '2024-11', casos: 240 },
      { fecha: '2024-12', casos: 250 },
    ];

    const categoryData = [
      { categoria: 'Monitoreo', cantidad: 40 },
      { categoria: 'Alerta', cantidad: 30 },
      { categoria: 'Educación', cantidad: 50 },
      { categoria: 'Reducción', cantidad: 20 },
      { categoria: 'Restauración', cantidad: 60 },
    ];

    // Gráfico de líneas: Tendencia mensual de casos reportados
    const lineTrace = {
      x: monthlyData.map(d => d.fecha),
      y: monthlyData.map(d => d.casos),
      type: 'scatter',
      mode: 'lines+markers',
      marker: { color: '#1f77b4' },
      name: 'Casos',
      hovertemplate: 'Mes: %{x}<br>Casos: %{y}<extra></extra>',
    };

    const lineLayout = {
      title: 'Tendencia mensual de casos reportados',
      xaxis: { title: 'Mes' },
      yaxis: { title: 'Número de casos' },
      hovermode: 'closest',
    };

    const lineConfig = { responsive: true };

    Plotly.newPlot('line-chart', [lineTrace], lineLayout, lineConfig);

    // Gráfico de pastel: Distribución por categoría
    const pieTrace = {
      labels: categoryData.map(d => d.categoria),
      values: categoryData.map(d => d.cantidad),
      type: 'pie',
      textinfo: 'label+percent',
      hoverinfo: 'label+value',
      marker: {
        colors: ['#1f77b4', '#2ca02c', '#ff7f0e', '#d62728', '#9467bd'],
      },
    };

    const pieLayout = {
      title: 'Distribución de acciones por categoría',
    };

    const pieConfig = { responsive: true };

    Plotly.newPlot('pie-chart', [pieTrace], pieLayout, pieConfig);

    // Evento de clic en el gráfico de pastel
    const pieChart = document.getElementById('pie-chart');
    pieChart.on('plotly_click', data => {
      const categoria = data.points[0].label;
      alert(`Categoría seleccionada: ${categoria}`);
      // Aquí puedes implementar la lógica para actualizar otros gráficos o datos
    });

  }, []);

  return (
    <div className="statistics-container">
      <h1>Estadísticas</h1>
      <div className="chart-section">
        <div id="line-chart" className="chart"></div>
        <p className="chart-description">Tendencia mensual de casos reportados.</p>
      </div>
      <div className="chart-section">
        <div id="pie-chart" className="chart"></div>
        <p className="chart-description">Distribución de acciones por categoría.</p>
      </div>
    </div>
  );
};

export default Statistics;
