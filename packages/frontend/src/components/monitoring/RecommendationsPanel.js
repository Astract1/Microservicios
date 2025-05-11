import React from 'react';
import '../../styles/monitoring/Monitoring.css';

const RecommendationsPanel = ({ recommendations = [] }) => {
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="recommendations-panel empty">
        <p className="no-recommendations">No hay recomendaciones disponibles</p>
      </div>
    );
  }

  // Función para asignar íconos relevantes a cada recomendación basado en su contenido
  const getRecommendationIcon = (text) => {
    if (!text) return '💡';
    
    const lowerText = text.toLowerCase();
    if (lowerText.includes('lluvia') || lowerText.includes('paraguas')) return '☂️';
    if (lowerText.includes('calor') || lowerText.includes('temperatura') || lowerText.includes('sol')) return '☀️';
    if (lowerText.includes('frío') || lowerText.includes('abrigu')) return '🧥';
    if (lowerText.includes('aire') || lowerText.includes('calidad')) return '😷';
    if (lowerText.includes('hidrat') || lowerText.includes('agua')) return '💧';
    if (lowerText.includes('evite') || lowerText.includes('limit')) return '⛔';
    if (lowerText.includes('viento') || lowerText.includes('tormenta')) return '🌪️';
    
    return '💡'; // Ícono genérico para otras recomendaciones
  };

  return (
    <div className="recommendations-panel">
      <div className="recommendations-list">
        {recommendations.map((recommendation, index) => (
          <div key={index} className="recommendation-item">
            <div className="recommendation-icon">
              {getRecommendationIcon(recommendation)}
            </div>
            <div className="recommendation-text">
              {recommendation}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendationsPanel; 