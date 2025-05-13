import React, { useState } from 'react';
import './Settings.css';

const Settings = () => {
  // Estados para los diferentes tipos de configuración
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: true,
    sms: false,
    frequency: 'immediate'
  });

  const [displaySettings, setDisplaySettings] = useState({
    darkMode: false,
    language: 'es',
    fontSize: 'medium',
    mapProvider: 'openstreetmap'
  });

  const [riskSettings, setRiskSettings] = useState({
    airQualityThreshold: 80,
    weatherAlerts: true,
    riskIndicators: ['air', 'weather', 'flood', 'fire'],
    autoUpdateFrequency: 30
  });

  // Función para manejar cambios en configuraciones de notificación
  const handleNotificationChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNotificationSettings({
      ...notificationSettings,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Función para manejar cambios en configuraciones de visualización
  const handleDisplayChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDisplaySettings({
      ...displaySettings,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Función para manejar cambios en configuraciones de riesgo
  const handleRiskChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'riskIndicators') {
      // Manejar múltiples selecciones para indicadores de riesgo
      const indicator = value;
      
      if (checked) {
        setRiskSettings({
          ...riskSettings,
          riskIndicators: [...riskSettings.riskIndicators, indicator]
        });
      } else {
        setRiskSettings({
          ...riskSettings,
          riskIndicators: riskSettings.riskIndicators.filter(item => item !== indicator)
        });
      }
    } else {
      setRiskSettings({
        ...riskSettings,
        [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value
      });
    }
  };

  // Función para guardar configuraciones (simulada)
  const saveSettings = () => {
    alert('Configuraciones guardadas correctamente.');
    // En una implementación real, aquí se enviarían los datos al backend
  };

  // Función para restablecer configuraciones predeterminadas
  const resetSettings = () => {
    if (window.confirm('¿Está seguro de que desea restablecer todas las configuraciones a sus valores predeterminados?')) {
      setNotificationSettings({
        email: true,
        push: true,
        sms: false,
        frequency: 'immediate'
      });
      
      setDisplaySettings({
        darkMode: false,
        language: 'es',
        fontSize: 'medium',
        mapProvider: 'openstreetmap'
      });
      
      setRiskSettings({
        airQualityThreshold: 80,
        weatherAlerts: true,
        riskIndicators: ['air', 'weather', 'flood', 'fire'],
        autoUpdateFrequency: 30
      });
      
      alert('Configuraciones restablecidas.');
    }
  };

  return (
    <div className="settings-container">
      <header className="settings-header">
        <h1>Configuración</h1>
        <p>Personaliza tu experiencia y preferencias de alertas</p>
      </header>

      <div className="settings-grid">
        {/* Sección de notificaciones */}
        <div className="settings-card">
          <h2>Notificaciones</h2>
          
          <div className="setting-group">
            <div className="setting-item checkbox">
              <input 
                type="checkbox" 
                id="email" 
                name="email" 
                checked={notificationSettings.email}
                onChange={handleNotificationChange}
              />
              <label htmlFor="email">Notificaciones por correo electrónico</label>
            </div>
            
            <div className="setting-item checkbox">
              <input 
                type="checkbox" 
                id="push" 
                name="push" 
                checked={notificationSettings.push}
                onChange={handleNotificationChange}
              />
              <label htmlFor="push">Notificaciones push</label>
            </div>
            
            <div className="setting-item checkbox">
              <input 
                type="checkbox" 
                id="sms" 
                name="sms" 
                checked={notificationSettings.sms}
                onChange={handleNotificationChange}
              />
              <label htmlFor="sms">Notificaciones por SMS</label>
            </div>
          </div>
          
          <div className="setting-group">
            <label className="setting-label">Frecuencia de notificaciones:</label>
            <div className="setting-controls">
              <select 
                name="frequency" 
                value={notificationSettings.frequency}
                onChange={handleNotificationChange}
              >
                <option value="immediate">Inmediatas</option>
                <option value="hourly">Cada hora</option>
                <option value="daily">Diarias</option>
                <option value="weekly">Semanales</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sección de configuración de visualización */}
        <div className="settings-card">
          <h2>Visualización</h2>
          
          <div className="setting-group">
            <div className="setting-item checkbox">
              <input 
                type="checkbox" 
                id="darkMode" 
                name="darkMode" 
                checked={displaySettings.darkMode}
                onChange={handleDisplayChange}
              />
              <label htmlFor="darkMode">Modo oscuro</label>
            </div>
          </div>
          
          <div className="setting-group">
            <label className="setting-label">Idioma:</label>
            <div className="setting-controls">
              <select 
                name="language" 
                value={displaySettings.language}
                onChange={handleDisplayChange}
              >
                <option value="es">Español</option>
                <option value="en">English</option>
                <option value="pt">Português</option>
                <option value="fr">Français</option>
              </select>
            </div>
          </div>
          
          <div className="setting-group">
            <label className="setting-label">Tamaño de fuente:</label>
            <div className="setting-controls">
              <select 
                name="fontSize" 
                value={displaySettings.fontSize}
                onChange={handleDisplayChange}
              >
                <option value="small">Pequeño</option>
                <option value="medium">Mediano</option>
                <option value="large">Grande</option>
              </select>
            </div>
          </div>
          
          <div className="setting-group">
            <label className="setting-label">Proveedor de mapas:</label>
            <div className="setting-controls">
              <select 
                name="mapProvider" 
                value={displaySettings.mapProvider}
                onChange={handleDisplayChange}
              >
                <option value="openstreetmap">OpenStreetMap</option>
                <option value="google">Google Maps</option>
                <option value="mapbox">Mapbox</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sección de configuración de riesgos */}
        <div className="settings-card">
          <h2>Configuración de Riesgos</h2>
          
          <div className="setting-group">
            <label className="setting-label">Umbral de calidad del aire (0-100):</label>
            <div className="setting-controls">
              <input 
                type="range" 
                min="0" 
                max="100" 
                step="1"
                name="airQualityThreshold" 
                value={riskSettings.airQualityThreshold}
                onChange={handleRiskChange}
                className="range-slider"
                aria-label="Umbral de calidad del aire"
              />
              <span className="range-value">{riskSettings.airQualityThreshold}</span>
            </div>
          </div>
          
          <div className="setting-group">
            <div className="setting-item checkbox">
              <input 
                type="checkbox" 
                id="weatherAlerts" 
                name="weatherAlerts" 
                checked={riskSettings.weatherAlerts}
                onChange={handleRiskChange}
              />
              <label htmlFor="weatherAlerts">Alertas meteorológicas</label>
            </div>
          </div>
          
          <div className="setting-group">
            <label className="setting-label">Indicadores de riesgo:</label>
            <div className="setting-controls-multi">
              <div className="multi-checkbox">
                <input 
                  type="checkbox" 
                  id="air" 
                  name="riskIndicators" 
                  value="air"
                  checked={riskSettings.riskIndicators.includes('air')}
                  onChange={handleRiskChange}
                />
                <label htmlFor="air">Calidad del Aire</label>
              </div>
              <div className="multi-checkbox">
                <input 
                  type="checkbox" 
                  id="weather" 
                  name="riskIndicators" 
                  value="weather"
                  checked={riskSettings.riskIndicators.includes('weather')}
                  onChange={handleRiskChange}
                />
                <label htmlFor="weather">Clima</label>
              </div>
              <div className="multi-checkbox">
                <input 
                  type="checkbox" 
                  id="flood" 
                  name="riskIndicators" 
                  value="flood"
                  checked={riskSettings.riskIndicators.includes('flood')}
                  onChange={handleRiskChange}
                />
                <label htmlFor="flood">Inundaciones</label>
              </div>
              <div className="multi-checkbox">
                <input 
                  type="checkbox" 
                  id="fire" 
                  name="riskIndicators" 
                  value="fire"
                  checked={riskSettings.riskIndicators.includes('fire')}
                  onChange={handleRiskChange}
                />
                <label htmlFor="fire">Incendios</label>
              </div>
            </div>
          </div>
          
          <div className="setting-group">
            <label className="setting-label">Frecuencia de actualización (minutos):</label>
            <div className="setting-controls">
              <input 
                type="number" 
                min="5" 
                max="120" 
                name="autoUpdateFrequency" 
                value={riskSettings.autoUpdateFrequency}
                onChange={handleRiskChange}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="settings-actions">
        <button className="save-button" onClick={saveSettings}>Guardar Configuración</button>
        <button className="reset-button" onClick={resetSettings}>Restablecer Valores Predeterminados</button>
      </div>
    </div>
  );
};

export default Settings; 