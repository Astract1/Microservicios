import React, { useState } from 'react';
import '../../styles/monitoring/HelpPanel.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle, faTimes, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

const HelpPanel = ({ isOpen, onClose }) => {
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    airQuality: false,
    weather: false,
    alerts: false,
    map: false,
    data: false,
    metrics: false
  });

  // Alternar una sección de ayuda
  const toggleSection = (section) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section]
    });
  };

  if (!isOpen) return null;

  return (
    <div className="help-panel">
      <div className="help-header">
        <h2>
          <FontAwesomeIcon icon={faQuestionCircle} className="help-icon" />
          Centro de Ayuda - Monitoreo Ambiental
        </h2>
        <button className="close-button" onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>

      <div className="help-content">
        <div className="help-section">
          <div 
            className="section-header" 
            onClick={() => toggleSection('overview')}
          >
            <h3>Introducción al Sistema</h3>
            <FontAwesomeIcon 
              icon={expandedSections.overview ? faChevronUp : faChevronDown} 
              className="toggle-icon"
            />
          </div>
          
          {expandedSections.overview && (
            <div className="section-content">
              <p>
                El Sistema de Monitoreo Ambiental proporciona información en tiempo real sobre 
                la calidad del aire, condiciones climáticas y alertas ambientales en su área.
              </p>
              <p>
                Este panel le permite:
              </p>
              <ul>
                <li>Ver datos actuales de calidad del aire</li>
                <li>Monitorear condiciones climáticas</li>
                <li>Recibir alertas sobre condiciones ambientales peligrosas</li>
                <li>Visualizar datos en mapas interactivos</li>
                <li>Acceder a recomendaciones basadas en las condiciones actuales</li>
              </ul>
            </div>
          )}
        </div>

        <div className="help-section">
          <div 
            className="section-header" 
            onClick={() => toggleSection('airQuality')}
          >
            <h3>Interpretación de la Calidad del Aire</h3>
            <FontAwesomeIcon 
              icon={expandedSections.airQuality ? faChevronUp : faChevronDown} 
              className="toggle-icon"
            />
          </div>
          
          {expandedSections.airQuality && (
            <div className="section-content">
              <p>
                El Índice de Calidad del Aire (AQI) es una medida de cuán contaminado está el aire.
              </p>
              <div className="aqi-scale">
                <div className="aqi-level" style={{ backgroundColor: '#00E400' }}>
                  <span className="aqi-range">0-50</span>
                  <span className="aqi-desc">Buena</span>
                </div>
                <div className="aqi-level" style={{ backgroundColor: '#FFFF00' }}>
                  <span className="aqi-range">51-100</span>
                  <span className="aqi-desc">Moderada</span>
                </div>
                <div className="aqi-level" style={{ backgroundColor: '#FF7E00' }}>
                  <span className="aqi-range">101-150</span>
                  <span className="aqi-desc">Insalubre para grupos sensibles</span>
                </div>
                <div className="aqi-level" style={{ backgroundColor: '#FF0000' }}>
                  <span className="aqi-range">151-200</span>
                  <span className="aqi-desc">Insalubre</span>
                </div>
                <div className="aqi-level" style={{ backgroundColor: '#99004C' }}>
                  <span className="aqi-range">201-300</span>
                  <span className="aqi-desc">Muy insalubre</span>
                </div>
                <div className="aqi-level" style={{ backgroundColor: '#7E0023' }}>
                  <span className="aqi-range">301+</span>
                  <span className="aqi-desc">Peligrosa</span>
                </div>
              </div>
              <p>
                <strong>PM2.5:</strong> Partículas finas con un diámetro menor a 2.5 micrómetros. 
                Pueden penetrar profundamente en los pulmones y el torrente sanguíneo.
              </p>
              <p>
                <strong>PM10:</strong> Partículas inhalables con un diámetro menor a 10 micrómetros.
              </p>
            </div>
          )}
        </div>

        <div className="help-section">
          <div 
            className="section-header" 
            onClick={() => toggleSection('weather')}
          >
            <h3>Información del Clima</h3>
            <FontAwesomeIcon 
              icon={expandedSections.weather ? faChevronUp : faChevronDown} 
              className="toggle-icon"
            />
          </div>
          
          {expandedSections.weather && (
            <div className="section-content">
              <p>
                La sección de clima muestra las condiciones actuales en su ubicación, incluyendo:
              </p>
              <ul>
                <li><strong>Temperatura:</strong> Medida en grados Celsius (°C)</li>
                <li><strong>Humedad:</strong> Porcentaje de vapor de agua en el aire</li>
                <li><strong>Condiciones:</strong> Descripción del estado actual (soleado, nublado, lluvia, etc.)</li>
                <li><strong>Velocidad del viento:</strong> Medida en metros por segundo (m/s)</li>
              </ul>
            </div>
          )}
        </div>

        <div className="help-section">
          <div 
            className="section-header" 
            onClick={() => toggleSection('map')}
          >
            <h3>Uso del Mapa Interactivo</h3>
            <FontAwesomeIcon 
              icon={expandedSections.map ? faChevronUp : faChevronDown} 
              className="toggle-icon"
            />
          </div>
          
          {expandedSections.map && (
            <div className="section-content">
              <p>El mapa interactivo le permite visualizar datos ambientales geográficamente:</p>
              <ul>
                <li><strong>Marcadores de estaciones:</strong> Muestran la ubicación de estaciones de monitoreo</li>
                <li><strong>Mapa de calor:</strong> Visualiza la distribución de la contaminación del aire</li>
                <li><strong>Capas:</strong> Puede activar/desactivar diferentes tipos de información</li>
                <li><strong>Zoom:</strong> Use los controles o la rueda del ratón para acercar/alejar el mapa</li>
              </ul>
              <p>
                <strong>Sugerencia:</strong> Haga clic en los marcadores para ver información detallada sobre cada ubicación.
              </p>
            </div>
          )}
        </div>

        <div className="help-section">
          <div 
            className="section-header" 
            onClick={() => toggleSection('metrics')}
          >
            <h3>Glosario de Métricas</h3>
            <FontAwesomeIcon 
              icon={expandedSections.metrics ? faChevronUp : faChevronDown} 
              className="toggle-icon"
            />
          </div>
          
          {expandedSections.metrics && (
            <div className="section-content">
              <dl className="metrics-glossary">
                <dt>AQI (Índice de Calidad del Aire)</dt>
                <dd>Medida estandarizada de la calidad del aire que considera varios contaminantes.</dd>
                
                <dt>PM2.5</dt>
                <dd>Partículas finas con diámetro menor a 2.5 micrómetros, causantes de problemas respiratorios.</dd>
                
                <dt>PM10</dt>
                <dd>Partículas inhalables con diámetro menor a 10 micrómetros.</dd>
                
                <dt>O3 (Ozono)</dt>
                <dd>Gas que puede causar problemas respiratorios y empeorar condiciones como el asma.</dd>
                
                <dt>NO2 (Dióxido de Nitrógeno)</dt>
                <dd>Gas irritante que proviene principalmente de procesos de combustión.</dd>
                
                <dt>SO2 (Dióxido de Azufre)</dt>
                <dd>Gas producido por la quema de combustibles fósiles, asociado a problemas respiratorios.</dd>
                
                <dt>CO (Monóxido de Carbono)</dt>
                <dd>Gas tóxico que se produce por la combustión incompleta de combustibles.</dd>
              </dl>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HelpPanel; 