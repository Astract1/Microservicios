import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/common/Dashboard.css';

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <h1>Bienvenido al Sistema de Monitoreo Ambiental</h1>
      <div className="dashboard-grid">
        <Link to="/monitoring" className="dashboard-card">
          <h2>Monitoreo</h2>
          <p>Monitoreo en tiempo real de la calidad del aire y condiciones climáticas</p>
        </Link>
        <Link to="/risk" className="dashboard-card">
          <h2>Evaluación de Riesgos</h2>
          <p>Análisis y evaluación de riesgos ambientales</p>
        </Link>
        <Link to="/prevention" className="dashboard-card">
          <h2>Prevención</h2>
          <p>Medidas preventivas y recomendaciones</p>
        </Link>
        <Link to="/education" className="dashboard-card">
          <h2>Educación</h2>
          <p>Recursos educativos y materiales de capacitación</p>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard; 