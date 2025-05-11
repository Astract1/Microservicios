import React, { useState } from 'react';
import './RiskEvaluation.css';

const RiskEvaluation = () => {
  const [activeArea, setActiveArea] = useState('');
  const [showResults, setShowResults] = useState(false);

  // Datos de ejemplo para las áreas de riesgo
  const riskAreas = [
    { id: 'flood', name: 'Inundaciones', icon: '🌊' },
    { id: 'fire', name: 'Incendios', icon: '🔥' },
    { id: 'air', name: 'Contaminación del Aire', icon: '💨' },
    { id: 'landslide', name: 'Deslizamientos', icon: '⛰️' },
    { id: 'drought', name: 'Sequías', icon: '☀️' }
  ];

  // Formulario para evaluación de riesgo
  const [formData, setFormData] = useState({
    location: '',
    area: '',
    history: false,
    infrastructure: '',
    preparedness: '',
    vulnerability: ''
  });

  // Función para manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Función para manejar la selección de área de riesgo
  const handleAreaSelect = (areaId) => {
    setActiveArea(areaId);
    setFormData({
      ...formData,
      area: areaId
    });
    setShowResults(false);
  };

  // Función para manejar el envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    setShowResults(true);
  };

  // Función para calcular nivel de riesgo (simulado)
  const calculateRiskLevel = () => {
    // En una implementación real, esto sería un algoritmo más complejo
    const infrastructure = parseInt(formData.infrastructure) || 0;
    const preparedness = parseInt(formData.preparedness) || 0;
    const vulnerability = parseInt(formData.vulnerability) || 0;
    
    // Factores de peso
    const historyFactor = formData.history ? 2 : 1;
    
    // Cálculo simplificado
    const riskScore = ((infrastructure + vulnerability) * historyFactor - preparedness) / 10;
    
    // Normalizar a una escala de 0-100
    const normalizedScore = Math.min(Math.max(riskScore * 10, 0), 100);
    
    return {
      score: normalizedScore.toFixed(1),
      level: getRiskLevelFromScore(normalizedScore)
    };
  };

  // Función para obtener el nivel de riesgo a partir de la puntuación
  const getRiskLevelFromScore = (score) => {
    if (score < 20) return { text: 'Bajo', color: '#4caf50' };
    if (score < 40) return { text: 'Moderado', color: '#ff9800' };
    if (score < 60) return { text: 'Considerable', color: '#ff5722' };
    if (score < 80) return { text: 'Alto', color: '#f44336' };
    return { text: 'Severo', color: '#b71c1c' };
  };

  // Obtener datos de riesgo calculados
  const riskData = calculateRiskLevel();

  return (
    <div className="risk-evaluation-container">
      <header className="risk-header">
        <h1>Evaluación de Riesgos Ambientales</h1>
        <p>Identifica y evalúa posibles riesgos en tu área</p>
      </header>

      <div className="risk-areas">
        {riskAreas.map(area => (
          <div 
            key={area.id} 
            className={`risk-area-card ${activeArea === area.id ? 'active' : ''}`}
            onClick={() => handleAreaSelect(area.id)}
          >
            <div className="risk-area-icon">{area.icon}</div>
            <div className="risk-area-name">{area.name}</div>
          </div>
        ))}
      </div>

      {activeArea && (
        <div className="risk-assessment-form">
          <h2>Evaluación de Riesgo: {riskAreas.find(area => area.id === activeArea).name}</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="location">Ubicación o Área:</label>
              <input 
                type="text" 
                id="location" 
                name="location" 
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Ej. Nombre de ciudad, barrio o sector"
                required
              />
            </div>

            <div className="form-group checkbox">
              <input 
                type="checkbox" 
                id="history" 
                name="history" 
                checked={formData.history}
                onChange={handleInputChange}
              />
              <label htmlFor="history">¿Ha habido incidentes previos en esta área?</label>
            </div>

            <div className="form-group">
              <label htmlFor="infrastructure">Calidad de infraestructura (1-10):</label>
              <input 
                type="range" 
                id="infrastructure" 
                name="infrastructure" 
                min="1" 
                max="10" 
                value={formData.infrastructure}
                onChange={handleInputChange}
                required
              />
              <div className="range-labels">
                <span>Deficiente</span>
                <span>Excelente</span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="preparedness">Nivel de preparación (1-10):</label>
              <input 
                type="range" 
                id="preparedness" 
                name="preparedness" 
                min="1" 
                max="10" 
                value={formData.preparedness}
                onChange={handleInputChange}
                required
              />
              <div className="range-labels">
                <span>Sin preparación</span>
                <span>Completamente preparado</span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="vulnerability">Vulnerabilidad poblacional (1-10):</label>
              <input 
                type="range" 
                id="vulnerability" 
                name="vulnerability" 
                min="1" 
                max="10" 
                value={formData.vulnerability}
                onChange={handleInputChange}
                required
              />
              <div className="range-labels">
                <span>Baja</span>
                <span>Alta</span>
              </div>
            </div>

            <button type="submit" className="evaluate-button">Evaluar Riesgo</button>
          </form>
        </div>
      )}

      {showResults && (
        <div className="risk-results">
          <h2>Resultados de la Evaluación</h2>
          
          <div className="risk-score-container">
            <div 
              className="risk-score" 
              style={{ backgroundColor: riskData.level.color }}
            >
              {riskData.score}
            </div>
            <div className="risk-level">
              Nivel de Riesgo: <span style={{ color: riskData.level.color }}>{riskData.level.text}</span>
            </div>
          </div>
          
          <div className="risk-recommendations">
            <h3>Recomendaciones</h3>
            <ul>
              <li>Desarrollar un plan de respuesta ante emergencias.</li>
              <li>Revisar y mejorar las medidas de prevención existentes.</li>
              <li>Considerar mejoras en la infraestructura de protección.</li>
              <li>Informar a la comunidad sobre los riesgos potenciales.</li>
              <li>Coordinar con autoridades locales para acciones preventivas.</li>
            </ul>
          </div>
          
          <button 
            className="new-evaluation-button"
            onClick={() => {
              setShowResults(false);
              setFormData({
                ...formData,
                location: '',
                history: false,
                infrastructure: '',
                preparedness: '',
                vulnerability: ''
              });
            }}
          >
            Nueva Evaluación
          </button>
        </div>
      )}
    </div>
  );
};

export default RiskEvaluation; 