import React, { useState } from 'react';
import axios from 'axios';

const Settings = () => {
  const [settings, setSettings] = useState({
    defaultLocation: '',
    notifications: false,
    theme: 'light'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/settings', settings);
      alert('Configuración guardada exitosamente');
    } catch (error) {
      console.error('Error al guardar la configuración:', error);
      alert('Error al guardar la configuración');
    }
  };

  return (
    <div className="settings-page">
      <h2>Configuración</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="defaultLocation">Ubicación Predeterminada</label>
          <input
            id="defaultLocation"
            type="text"
            value={settings.defaultLocation}
            onChange={(e) => setSettings({...settings, defaultLocation: e.target.value})}
          />
        </div>
        
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={settings.notifications}
              onChange={(e) => setSettings({...settings, notifications: e.target.checked})}
            />
            Activar Notificaciones
          </label>
        </div>

        <button type="submit">Guardar Configuración</button>
      </form>
    </div>
  );
};

export default Settings;