import React, { useState } from 'react';
import '../styles/PreventiveActions.css'; 

const PreventiveActions = () => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Datos de ejemplo de acciones preventivas
  const actions = [
    {
      id: 1,
      title: 'Sistema de monitoreo de calidad del aire',
      description: 'Instalación de sensores de calidad del aire en puntos estratégicos para detectar contaminantes y emitir alertas tempranas.',
      status: 'active',
      category: 'monitoreo',
      progress: 75,
      lastUpdated: '2023-10-15'
    },
    {
      id: 2,
      title: 'Red de alertas tempranas para inundaciones',
      description: 'Implementación de una red de sensores para detectar niveles de agua y precipitaciones anormales que puedan causar inundaciones.',
      status: 'planning',
      category: 'alerta',
      progress: 30,
      lastUpdated: '2023-09-20'
    },
    {
      id: 3,
      title: 'Campaña de concientización sobre contaminación',
      description: 'Programa educativo dirigido a comunidades locales sobre fuentes de contaminación y cómo reducir su impacto.',
      status: 'completed',
      category: 'educación',
      progress: 100,
      lastUpdated: '2023-08-05'
    },
    {
      id: 4,
      title: 'Plan de reducción de emisiones industriales',
      description: 'Colaboración con industrias locales para implementar tecnologías que reduzcan emisiones contaminantes.',
      status: 'active',
      category: 'reducción',
      progress: 60,
      lastUpdated: '2023-10-01'
    },
    {
      id: 5,
      title: 'Programa de reforestación urbana',
      description: 'Iniciativa para plantar árboles en zonas urbanas para mejorar la calidad del aire y reducir la temperatura.',
      status: 'planning',
      category: 'restauración',
      progress: 15,
      lastUpdated: '2023-10-12'
    }
  ];

  // Filtrar acciones según el estado seleccionado
  const getFilteredActions = () => {
    let filtered = [...actions];
    
    // Aplicar filtro de estado
    if (filter !== 'all') {
      filtered = filtered.filter(action => action.status === filter);
    }
    
    // Aplicar búsqueda
    if (searchTerm.trim() !== '') {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        action => action.title.toLowerCase().includes(search) || 
                 action.description.toLowerCase().includes(search) ||
                 action.category.toLowerCase().includes(search)
      );
    }
    
    return filtered;
  };

  // Función para obtener color según el estado
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#4caf50';
      case 'planning': return '#2196f3';
      case 'completed': return '#9e9e9e';
      default: return '#2196f3';
    }
  };

  // Función para obtener texto según el estado
  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'planning': return 'Planificación';
      case 'completed': return 'Completado';
      default: return status;
    }
  };

  return (
    <div className="preventive-actions-container">
      <header className="actions-header">
        <h1>Acciones Preventivas</h1>
        <p>Gestión y seguimiento de medidas preventivas ambientales</p>
      </header>

      <div className="actions-controls">
        <div className="search-bar">
          <input 
            type="text" 
            placeholder="Buscar acciones..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-buttons">
          <button 
            className={filter === 'all' ? 'active' : ''} 
            onClick={() => setFilter('all')}
          >
            Todas
          </button>
          <button 
            className={filter === 'active' ? 'active' : ''} 
            onClick={() => setFilter('active')}
          >
            Activas
          </button>
          <button 
            className={filter === 'planning' ? 'active' : ''} 
            onClick={() => setFilter('planning')}
          >
            Planificación
          </button>
          <button 
            className={filter === 'completed' ? 'active' : ''} 
            onClick={() => setFilter('completed')}
          >
            Completadas
          </button>
        </div>
      </div>

      <div className="actions-list">
        {getFilteredActions().length === 0 ? (
          <div className="no-results">
            No se encontraron acciones que coincidan con los criterios de búsqueda.
          </div>
        ) : (
          getFilteredActions().map(action => (
            <div key={action.id} className="action-item">
              <div className="action-header">
                <h3>{action.title}</h3>
                <span 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(action.status) }}
                >
                  {getStatusText(action.status)}
                </span>
              </div>
              <p className="action-description">{action.description}</p>
              <div className="action-progress">
                <div className="progress-label">Progreso: {action.progress}%</div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${action.progress}%`, backgroundColor: getStatusColor(action.status) }}
                  ></div>
                </div>
              </div>
              <div className="action-meta">
                <span className="action-category">{action.category}</span>
                <span className="action-date">Actualizado: {action.lastUpdated}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PreventiveActions; 