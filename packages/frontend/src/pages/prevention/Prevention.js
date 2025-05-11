import React, { useState } from 'react';
import './Prevention.css';

const Prevention = () => {
  const [activeTab, setActiveTab] = useState('actions');

  // Datos de ejemplo para prevención
  const preventiveActions = [
    {
      id: 1,
      title: 'Monitoreo continuo de calidad del aire',
      description: 'Implementación de un sistema de monitoreo continuo para detectar cambios en la calidad del aire y tomar acciones preventivas.',
      impact: 'Alto',
      category: 'Monitoreo'
    },
    {
      id: 2,
      title: 'Alertas tempranas por eventos climáticos',
      description: 'Sistema de notificaciones para alertar sobre posibles eventos climáticos adversos con tiempo suficiente para tomar medidas preventivas.',
      impact: 'Alto',
      category: 'Alertas'
    },
    {
      id: 3,
      title: 'Plan de reducción de emisiones',
      description: 'Implementación de estrategias para reducir emisiones contaminantes en áreas urbanas.',
      impact: 'Medio',
      category: 'Reducción'
    }
  ];

  const recommendations = [
    {
      id: 1,
      title: 'Uso de transporte público',
      description: 'Fomentar el uso de transporte público o compartido para reducir emisiones de vehículos particulares.',
      category: 'Transporte'
    },
    {
      id: 2,
      title: 'Eficiencia energética',
      description: 'Implementar medidas de eficiencia energética en edificios y hogares para reducir el consumo y las emisiones.',
      category: 'Energía'
    },
    {
      id: 3,
      title: 'Zonas verdes urbanas',
      description: 'Desarrollar y mantener zonas verdes urbanas que actúen como pulmones de la ciudad y mejoren la calidad del aire.',
      category: 'Urbanismo'
    }
  ];

  return (
    <div className="prevention-container">
      <header className="prevention-header">
        <h1>Prevención Ambiental</h1>
        <p>Estrategias y acciones para prevenir impactos ambientales negativos</p>
      </header>

      <div className="prevention-tabs">
        <button 
          className={`tab-button ${activeTab === 'actions' ? 'active' : ''}`}
          onClick={() => setActiveTab('actions')}
        >
          Acciones Preventivas
        </button>
        <button 
          className={`tab-button ${activeTab === 'recommendations' ? 'active' : ''}`}
          onClick={() => setActiveTab('recommendations')}
        >
          Recomendaciones
        </button>
      </div>

      <div className="prevention-content">
        {activeTab === 'actions' && (
          <div className="preventive-actions">
            <h2>Acciones Preventivas</h2>
            <div className="actions-list">
              {preventiveActions.map(action => (
                <div key={action.id} className="action-card">
                  <h3>{action.title}</h3>
                  <p>{action.description}</p>
                  <div className="action-footer">
                    <span className="impact-badge">Impacto: {action.impact}</span>
                    <span className="category-badge">{action.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="recommendations">
            <h2>Recomendaciones Ambientales</h2>
            <div className="recommendations-list">
              {recommendations.map(rec => (
                <div key={rec.id} className="recommendation-card">
                  <h3>{rec.title}</h3>
                  <p>{rec.description}</p>
                  <div className="recommendation-footer">
                    <span className="category-badge">{rec.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Prevention; 