import React, { useState, useEffect } from 'react';
import '../../styles/monitoring/UserPreferences.css';

const UserPreferences = ({ onSave, defaultPreferences }) => {
  // Estado para las preferencias del usuario
  const [preferences, setPreferences] = useState({
    refreshInterval: 3, // minutos
    defaultView: 'dashboard',
    visibleWidgets: {
      airQuality: true,
      weather: true,
      alerts: true,
      map: true,
      recommendations: true,
      history: false
    },
    mapConfig: {
      defaultZoom: 12,
      showHeatmap: true,
      showStations: true
    },
    ...defaultPreferences
  });

  // Cargar preferencias guardadas del localStorage al iniciar
  useEffect(() => {
    const savedPreferences = localStorage.getItem('userMonitoringPreferences');
    if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences);
        setPreferences(prev => ({...prev, ...parsed}));
      } catch (e) {
        console.error('Error al cargar preferencias:', e);
      }
    }
  }, []);

  // Manejar cambios en las preferencias
  const handleChange = (section, key, value) => {
    if (section) {
      setPreferences(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [key]: value
        }
      }));
    } else {
      setPreferences(prev => ({
        ...prev,
        [key]: value
      }));
    }
  };

  // Guardar las preferencias
  const savePreferences = () => {
    // Guardar en localStorage
    localStorage.setItem('userMonitoringPreferences', JSON.stringify(preferences));
    // Notificar al componente padre
    if (onSave) onSave(preferences);
  };

  // Restablecer valores predeterminados
  const resetPreferences = () => {
    const defaultValues = {
      refreshInterval: 3,
      defaultView: 'dashboard',
      visibleWidgets: {
        airQuality: true,
        weather: true,
        alerts: true,
        map: true,
        recommendations: true,
        history: false
      },
      mapConfig: {
        defaultZoom: 12,
        showHeatmap: true,
        showStations: true
      }
    };
    
    setPreferences(defaultValues);
    localStorage.setItem('userMonitoringPreferences', JSON.stringify(defaultValues));
    if (onSave) onSave(defaultValues);
  };

  return (
    <div className="user-preferences">
      <h3>Configuración personalizada</h3>
      
      <div className="preference-section">
        <h4>General</h4>
        <div className="preference-item">
          <label>Actualizar datos cada:</label>
          <select 
            value={preferences.refreshInterval} 
            onChange={(e) => handleChange(null, 'refreshInterval', parseInt(e.target.value))}
          >
            <option value={1}>1 minuto</option>
            <option value={3}>3 minutos</option>
            <option value={5}>5 minutos</option>
            <option value={10}>10 minutos</option>
            <option value={15}>15 minutos</option>
          </select>
        </div>
        
        <div className="preference-item">
          <label>Vista predeterminada:</label>
          <select 
            value={preferences.defaultView} 
            onChange={(e) => handleChange(null, 'defaultView', e.target.value)}
          >
            <option value="dashboard">Dashboard</option>
            <option value="map">Mapa</option>
            <option value="history">Datos históricos</option>
          </select>
        </div>
      </div>
      
      <div className="preference-section">
        <h4>Widgets visibles</h4>
        <div className="checkbox-group">
          <div className="preference-checkbox">
            <input 
              type="checkbox" 
              id="show-air-quality" 
              checked={preferences.visibleWidgets.airQuality}
              onChange={(e) => handleChange('visibleWidgets', 'airQuality', e.target.checked)}
            />
            <label htmlFor="show-air-quality">Calidad del aire</label>
          </div>
          
          <div className="preference-checkbox">
            <input 
              type="checkbox" 
              id="show-weather" 
              checked={preferences.visibleWidgets.weather}
              onChange={(e) => handleChange('visibleWidgets', 'weather', e.target.checked)}
            />
            <label htmlFor="show-weather">Clima</label>
          </div>
          
          <div className="preference-checkbox">
            <input 
              type="checkbox" 
              id="show-alerts" 
              checked={preferences.visibleWidgets.alerts}
              onChange={(e) => handleChange('visibleWidgets', 'alerts', e.target.checked)}
            />
            <label htmlFor="show-alerts">Alertas</label>
          </div>
          
          <div className="preference-checkbox">
            <input 
              type="checkbox" 
              id="show-map" 
              checked={preferences.visibleWidgets.map}
              onChange={(e) => handleChange('visibleWidgets', 'map', e.target.checked)}
            />
            <label htmlFor="show-map">Mapa</label>
          </div>
          
          <div className="preference-checkbox">
            <input 
              type="checkbox" 
              id="show-recommendations" 
              checked={preferences.visibleWidgets.recommendations}
              onChange={(e) => handleChange('visibleWidgets', 'recommendations', e.target.checked)}
            />
            <label htmlFor="show-recommendations">Recomendaciones</label>
          </div>
          
          <div className="preference-checkbox">
            <input 
              type="checkbox" 
              id="show-history" 
              checked={preferences.visibleWidgets.history}
              onChange={(e) => handleChange('visibleWidgets', 'history', e.target.checked)}
            />
            <label htmlFor="show-history">Historial</label>
          </div>
        </div>
      </div>
      
      <div className="preference-actions">
        <button 
          className="save-button"
          onClick={savePreferences}
        >
          Guardar preferencias
        </button>
        
        <button 
          className="reset-button"
          onClick={resetPreferences}
        >
          Restablecer valores predeterminados
        </button>
      </div>
      
      <div className="keyboard-shortcuts">
        <h4>Atajos de teclado</h4>
        <ul>
          <li><strong>R</strong>: Actualizar datos</li>
          <li><strong>F</strong>: Alternar vista a pantalla completa</li>
          <li><strong>M</strong>: Cambiar a vista de mapa</li>
          <li><strong>D</strong>: Cambiar a vista de dashboard</li>
          <li><strong>H</strong>: Cambiar a vista de historial</li>
          <li><strong>Esc</strong>: Cerrar diálogos o paneles abiertos</li>
        </ul>
      </div>
    </div>
  );
};

export default UserPreferences; 