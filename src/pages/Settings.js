import React, { useState, useEffect } from 'react';
import './Settings.css';
import MillerLawToggle from '../components/layout/MillerLawToggle';

const Settings = () => {
  // Estados para configuraciones generales
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(5);
  const [temperatureUnit, setTemperatureUnit] = useState('celsius');
  const [windUnit, setWindUnit] = useState('km/h');
  
  // Estados para umbrales de alertas
  const [thresholds, setThresholds] = useState({
    temperature: { min: 0, max: 35 },
    humidity: { min: 30, max: 70 },
    aqi: { max: 100 },
    wind: { max: 50 },
  });
  
  const [isMillerLawApplied, setIsMillerLawApplied] = useState(false);
  
  // Cargar configuraciones del almacenamiento local al iniciar
  useEffect(() => {
    const savedSettings = localStorage.getItem('monitoringSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setNotifications(parsedSettings.notifications ?? true);
        setDarkMode(parsedSettings.darkMode ?? false);
        setRefreshInterval(parsedSettings.refreshInterval ?? 5);
        setTemperatureUnit(parsedSettings.temperatureUnit ?? 'celsius');
        setWindUnit(parsedSettings.windUnit ?? 'km/h');
        setThresholds(parsedSettings.thresholds ?? thresholds);
      } catch (error) {
        console.error('Error al cargar configuraciones:', error);
      }
    }
    
    // Aplicar tema oscuro si está activado
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode, thresholds]);
  
  // Guardar cambios en el almacenamiento local
  const saveSettings = () => {
    const settings = {
      notifications,
      darkMode,
      refreshInterval,
      temperatureUnit,
      windUnit,
      thresholds
    };
    
    localStorage.setItem('monitoringSettings', JSON.stringify(settings));
    alert('Configuraciones guardadas correctamente');
  };
  
  // Manejar cambios en los umbrales
  const handleThresholdChange = (category, type, value) => {
    setThresholds(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [type]: Number(value)
      }
    }));
  };
  
  // Restablecer valores predeterminados
  const resetToDefaults = () => {
    if (window.confirm('¿Está seguro de que desea restablecer todas las configuraciones a los valores predeterminados?')) {
      setNotifications(true);
      setDarkMode(false);
      setRefreshInterval(5);
      setTemperatureUnit('celsius');
      setWindUnit('km/h');
      setThresholds({
        temperature: { min: 0, max: 35 },
        humidity: { min: 30, max: 70 },
        aqi: { max: 100 },
        wind: { max: 50 },
      });
      
      localStorage.removeItem('monitoringSettings');
      alert('Configuraciones restablecidas a valores predeterminados');
    }
  };
  
  const toggleMillerLaw = () => {
    setIsMillerLawApplied(!isMillerLawApplied);
  };

  // Configuración completa sin aplicar Ley de Miller (15+ opciones)
  const fullSettings = [
    {
      category: 'General',
      options: [
        { id: 'language', name: 'Idioma', type: 'select', value: 'es', choices: ['es', 'en', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja'] },
        { id: 'notifications', name: 'Notificaciones', type: 'toggle', value: true },
        { id: 'theme', name: 'Tema', type: 'select', value: 'light', choices: ['light', 'dark', 'auto'] },
        { id: 'timezone', name: 'Zona horaria', type: 'select', value: 'UTC+1', choices: ['UTC-12', 'UTC-11', 'UTC-10', 'UTC-9', 'UTC-8', 'UTC-7', 'UTC-6', 'UTC-5', 'UTC-4', 'UTC-3', 'UTC-2', 'UTC-1', 'UTC+0', 'UTC+1', 'UTC+2', 'UTC+3', 'UTC+4', 'UTC+5', 'UTC+6', 'UTC+7', 'UTC+8', 'UTC+9', 'UTC+10', 'UTC+11', 'UTC+12'] },
        { id: 'autoRefresh', name: 'Actualización automática', type: 'toggle', value: true },
      ]
    },
    {
      category: 'Monitoreo',
      options: [
        { id: 'displayUnits', name: 'Unidades de medida', type: 'select', value: 'metric', choices: ['metric', 'imperial'] },
        { id: 'updateFrequency', name: 'Frecuencia de actualización', type: 'select', value: '5', choices: ['1', '5', '10', '15', '30', '60'] },
        { id: 'dataRetention', name: 'Retención de datos', type: 'select', value: '90', choices: ['30', '60', '90', '180', '365'] },
        { id: 'sensorPriority', name: 'Prioridad de sensores', type: 'multiselect', value: ['temp', 'humidity', 'air'], choices: ['temp', 'humidity', 'air', 'noise', 'water', 'radiation'] },
        { id: 'chartType', name: 'Tipo de gráficos', type: 'select', value: 'line', choices: ['line', 'bar', 'radar', 'pie'] },
        { id: 'showPredictions', name: 'Mostrar predicciones', type: 'toggle', value: true },
      ]
    },
    {
      category: 'Alertas',
      options: [
        { id: 'alertSound', name: 'Sonido de alerta', type: 'toggle', value: true },
        { id: 'emailAlerts', name: 'Alertas por email', type: 'toggle', value: true },
        { id: 'smsAlerts', name: 'Alertas por SMS', type: 'toggle', value: false },
        { id: 'alertThreshold', name: 'Umbral de alerta', type: 'range', value: 70, min: 0, max: 100 },
        { id: 'criticalAlertColor', name: 'Color de alerta crítica', type: 'color', value: '#FF0000' },
        { id: 'warningAlertColor', name: 'Color de alerta advertencia', type: 'color', value: '#FFCC00' },
        { id: 'infoAlertColor', name: 'Color de alerta informativa', type: 'color', value: '#0066CC' },
      ]
    }
  ];

  // Configuración simplificada con Ley de Miller (7±2 opciones en total)
  const millerLawSettings = [
    {
      category: 'General',
      options: [
        { id: 'language', name: 'Idioma', type: 'select', value: 'es', choices: ['es', 'en', 'fr', 'de'] },
        { id: 'notifications', name: 'Notificaciones', type: 'toggle', value: true },
        { id: 'theme', name: 'Tema', type: 'select', value: 'light', choices: ['light', 'dark', 'auto'] },
      ]
    },
    {
      category: 'Monitoreo',
      options: [
        { id: 'displayUnits', name: 'Unidades de medida', type: 'select', value: 'metric', choices: ['metric', 'imperial'] },
        { id: 'updateFrequency', name: 'Frecuencia de actualización', type: 'select', value: '5', choices: ['1', '5', '15', '30'] },
      ]
    },
    {
      category: 'Alertas',
      options: [
        { id: 'alertSound', name: 'Sonido de alerta', type: 'toggle', value: true },
        { id: 'emailAlerts', name: 'Alertas por email', type: 'toggle', value: true },
      ]
    }
  ];

  const settingsToRender = isMillerLawApplied ? millerLawSettings : fullSettings;

  const renderSettingControl = (option) => {
    switch (option.type) {
      case 'toggle':
        return (
          <label className="toggle-switch">
            <input type="checkbox" checked={option.value} readOnly />
            <span className="toggle-slider"></span>
          </label>
        );
      case 'select':
        return (
          <select defaultValue={option.value}>
            {option.choices.map((choice, idx) => (
              <option key={idx} value={choice}>{choice}</option>
            ))}
          </select>
        );
      case 'range':
        return (
          <div className="range-container">
            <input type="range" min={option.min} max={option.max} defaultValue={option.value} />
            <span className="range-value">{option.value}%</span>
          </div>
        );
      case 'color':
        return (
          <input type="color" defaultValue={option.value} />
        );
      case 'multiselect':
        return (
          <select multiple defaultValue={option.value}>
            {option.choices.map((choice, idx) => (
              <option key={idx} value={choice}>{choice}</option>
            ))}
          </select>
        );
      default:
        return <input type="text" defaultValue={option.value} />;
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Configuración del Sistema</h1>
        <div className="miller-law-container">
          <MillerLawToggle 
            onToggle={toggleMillerLaw}
            isMillerLawApplied={isMillerLawApplied}
          />
        </div>
      </div>

      <div className="miller-law-example">
        <div className="example-header">
          <h2>Demostración de la Ley de Miller</h2>
          <p>
            {isMillerLawApplied 
              ? "Aplicando la Ley de Miller (7±2): Mostrando un número óptimo de opciones para la memoria de trabajo humana." 
              : "Sin aplicar la Ley de Miller: Mostrando todas las opciones disponibles, lo que puede resultar abrumador."}
          </p>
        </div>
      </div>

      <div className={`settings-container ${isMillerLawApplied ? 'miller-law-applied' : ''}`}>
        {settingsToRender.map((section, sectionIndex) => (
          <div key={sectionIndex} className="settings-section">
            <h2>{section.category}</h2>
            <div className="settings-options">
              {section.options.map((option, optionIndex) => (
                <div key={optionIndex} className="setting-item">
                  <div className="setting-label">{option.name}</div>
                  <div className="setting-control">
                    {renderSettingControl(option)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="settings-actions">
          <button className="btn btn-primary" onClick={saveSettings}>Guardar Cambios</button>
          <button className="btn btn-secondary" onClick={resetToDefaults}>Restaurar Valores Predeterminados</button>
        </div>
      </div>

      <div className="settings-description">
        <h3>¿Qué es la Ley de Miller?</h3>
        <p>
          La Ley de Miller, propuesta por el psicólogo George Miller en 1956, establece que la cantidad de información
          que una persona puede procesar y recordar simultáneamente en su memoria de trabajo es de aproximadamente 7±2 elementos.
        </p>
        <h3>Aplicación en Interfaces de Usuario</h3>
        <p>
          Aplicar la Ley de Miller en el diseño de interfaces:
        </p>
        <ul>
          <li>Reduce la carga cognitiva del usuario</li>
          <li>Mejora la usabilidad al limitar las opciones a un número manejable</li>
          <li>Facilita la toma de decisiones al reducir la complejidad visual</li>
          <li>Aumenta la probabilidad de que el usuario recuerde las opciones disponibles</li>
        </ul>
        <p>
          Esta funcionalidad de cambio le permite experimentar directamente cómo afecta la implementación de este principio
          en una interfaz real.
        </p>
      </div>
    </div>
  );
};

export default Settings; 