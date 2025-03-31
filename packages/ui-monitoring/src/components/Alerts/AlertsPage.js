import React, { useState, useEffect } from 'react';
import { alertsService } from '../../services/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const AlertsPage = () => {
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [thresholds, setThresholds] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editingThreshold, setEditingThreshold] = useState(null);
  const [thresholdValues, setThresholdValues] = useState({
    low: 0,
    medium: 0,
    high: 0,
    critical: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Obtener alertas activas
        const alertsResponse = await alertsService.getActive();
        setActiveAlerts(alertsResponse.data || []);
        
        // Obtener umbrales configurados
        const thresholdsResponse = await alertsService.getThresholds();
        setThresholds(thresholdsResponse.data || {});
        
        setError(null);
      } catch (err) {
        console.error('Error fetching alert data:', err);
        setError('No se pudieron cargar los datos de alertas');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Desactivar una alerta
  const handleDeactivateAlert = async (id) => {
    try {
      await alertsService.deactivate(id);
      // Actualizar lista de alertas (eliminar la que se desactivó)
      setActiveAlerts(activeAlerts.filter(alert => alert.id !== id));
    } catch (err) {
      console.error('Error deactivating alert:', err);
      setError('No se pudo desactivar la alerta');
    }
  };

  // Editar umbrales
  const handleEditThreshold = (parameter) => {
    if (thresholds[parameter]) {
      setEditingThreshold(parameter);
      setThresholdValues({
        low: thresholds[parameter].low,
        medium: thresholds[parameter].medium,
        high: thresholds[parameter].high,
        critical: thresholds[parameter].critical
      });
      setEditMode(true);
    }
  };

  // Guardar umbrales editados
  const handleSaveThreshold = async () => {
    try {
      if (!editingThreshold) return;
      
      await alertsService.updateThreshold(editingThreshold, thresholdValues);
      
      // Actualizar los umbrales en el estado
      setThresholds({
        ...thresholds,
        [editingThreshold]: { ...thresholdValues }
      });
      
      setEditMode(false);
      setEditingThreshold(null);
    } catch (err) {
      console.error('Error updating thresholds:', err);
      setError('No se pudieron actualizar los umbrales');
    }
  };

  // Cancelar edición
  const handleCancelEdit = () => {
    setEditMode(false);
    setEditingThreshold(null);
  };

  // Obtener color según la severidad
  const getSeverityColor = (severity) => {
    switch (severity.toUpperCase()) {
      case 'LOW':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Obtener nombre de tipo de alerta
  const getAlertTypeName = (type) => {
    switch (type) {
      case 'AIR_QUALITY':
        return 'Calidad del Aire';
      case 'WEATHER':
        return 'Meteorológica';
      case 'OTHER':
        return 'Otra';
      default:
        return type;
    }
  };

  // Agrupar alertas por tipo para mostrarlas organizadas
  const groupedAlerts = activeAlerts.reduce((groups, alert) => {
    if (!groups[alert.alert_type]) {
      groups[alert.alert_type] = [];
    }
    groups[alert.alert_type].push(alert);
    return groups;
  }, {});

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-6">Alertas Ambientales</h1>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-10">
          <p className="text-gray-600">Cargando datos de alertas...</p>
          <div className="mt-4 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna izquierda - Conteo y resumen */}
          <div>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Resumen de Alertas</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-600 mb-1">Total Alertas</p>
                  <p className="text-3xl font-bold text-primary-700">{activeAlerts.length}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-600 mb-1">Alertas Críticas</p>
                  <p className="text-3xl font-bold text-red-600">
                    {activeAlerts.filter(a => a.severity === 'CRITICAL').length}
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm">Calidad del Aire</span>
                  <span className="font-medium">
                    {activeAlerts.filter(a => a.alert_type === 'AIR_QUALITY').length}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm">Meteorológicas</span>
                  <span className="font-medium">
                    {activeAlerts.filter(a => a.alert_type === 'WEATHER').length}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm">Otras</span>
                  <span className="font-medium">
                    {activeAlerts.filter(a => a.alert_type === 'OTHER').length}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Configuración de umbrales */}
            <div className="bg-white rounded-lg shadow p-6 mt-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Umbrales de Alerta</h2>
                <button 
                  className="px-3 py-1 bg-primary-600 text-white rounded text-sm"
                  onClick={() => setEditMode(!editMode)}
                  disabled={editMode}
                >
                  Editar
                </button>
              </div>
              
              {editMode ? (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Editar Umbral: {editingThreshold}</h3>
                  
                  <div className="space-y-3 mb-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Bajo</label>
                      <input 
                        type="number" 
                        className="w-full p-2 border rounded-md" 
                        value={thresholdValues.low}
                        onChange={(e) => setThresholdValues({...thresholdValues, low: parseFloat(e.target.value)})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Medio</label>
                      <input 
                        type="number" 
                        className="w-full p-2 border rounded-md" 
                        value={thresholdValues.medium}
                        onChange={(e) => setThresholdValues({...thresholdValues, medium: parseFloat(e.target.value)})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Alto</label>
                      <input 
                        type="number" 
                        className="w-full p-2 border rounded-md" 
                        value={thresholdValues.high}
                        onChange={(e) => setThresholdValues({...thresholdValues, high: parseFloat(e.target.value)})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Crítico</label>
                      <input 
                        type="number" 
                        className="w-full p-2 border rounded-md" 
                        value={thresholdValues.critical}
                        onChange={(e) => setThresholdValues({...thresholdValues, critical: parseFloat(e.target.value)})}
                      />
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button 
                      className="px-4 py-2 bg-primary-600 text-white rounded"
                      onClick={handleSaveThreshold}
                    >
                      Guardar
                    </button>
                    <button 
                      className="px-4 py-2 bg-gray-300 text-gray-800 rounded"
                      onClick={handleCancelEdit}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(thresholds).map(([param, values]) => (
                    <div key={param} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{param}</span>
                        <button 
                          className="text-xs text-primary-600 hover:underline"
                          onClick={() => handleEditThreshold(param)}
                        >
                          Editar
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-2 text-xs">
                        <div className="text-center bg-blue-100 p-1 rounded">
                          <span className="block text-gray-500">Bajo</span>
                          <span className="font-medium">{values.low}</span>
                        </div>
                        <div className="text-center bg-yellow-100 p-1 rounded">
                          <span className="block text-gray-500">Medio</span>
                          <span className="font-medium">{values.medium}</span>
                        </div>
                        <div className="text-center bg-orange-100 p-1 rounded">
                          <span className="block text-gray-500">Alto</span>
                          <span className="font-medium">{values.high}</span>
                        </div>
                        <div className="text-center bg-red-100 p-1 rounded">
                          <span className="block text-gray-500">Crítico</span>
                          <span className="font-medium">{values.critical}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Columna derecha - Listado de alertas */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Alertas Activas</h2>
              
              {activeAlerts.length > 0 ? (
                <div className="space-y-6">
                  {Object.entries(groupedAlerts).map(([type, alerts]) => (
                    <div key={type}>
                      <h3 className="text-lg font-medium mb-2">{getAlertTypeName(type)}</h3>
                      <div className="space-y-3">
                        {alerts.map((alert) => (
                          <div 
                            key={alert.id} 
                            className={`border rounded-lg p-4 ${getSeverityColor(alert.severity)}`}
                          >
                            <div className="flex justify-between">
                              <div>
                                <p className="font-semibold">{alert.message}</p>
                                <p className="text-sm mt-1">
                                  Ciudad: {alert.city} | 
                                  Creada: {format(new Date(alert.timestamp), 'dd MMM yyyy, HH:mm', { locale: es })}
                                </p>
                                <p className="text-sm">
                                  Expira: {format(new Date(alert.expires_at), 'dd MMM yyyy, HH:mm', { locale: es })}
                                </p>
                              </div>
                              <div>
                                <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full 
                                  ${
                                    alert.severity === 'CRITICAL' ? 'bg-red-500 text-white' :
                                    alert.severity === 'HIGH' ? 'bg-orange-500 text-white' :
                                    alert.severity === 'MEDIUM' ? 'bg-yellow-500 text-white' :
                                    'bg-blue-500 text-white'
                                  }
                                `}>
                                  {alert.severity}
                                </span>
                                
                                <button 
                                  className="block mt-2 text-xs text-gray-600 hover:text-red-600"
                                  onClick={() => handleDeactivateAlert(alert.id)}
                                >
                                  Desactivar
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-gray-50 rounded-lg">
                  <p className="text-lg text-gray-600">No hay alertas activas</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Las alertas se activarán automáticamente cuando los niveles superen los umbrales establecidos
                  </p>
                </div>
              )}
            </div>
            
            {/* Sistema de notificaciones */}
            <div className="bg-white rounded-lg shadow p-6 mt-6">
              <h2 className="text-xl font-semibold mb-4">Configuración de Notificaciones</h2>
              
              <div className="p-4 bg-gray-50 rounded-lg mb-6">
                <p className="text-sm text-gray-600 italic">
                  Esta funcionalidad está en desarrollo. Próximamente podrá configurar notificaciones por
                  email o SMS para recibir alertas ambientales.
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">Notificaciones por Email</p>
                    <p className="text-sm text-gray-600">Reciba alertas en su correo electrónico</p>
                  </div>
                  <div>
                    <button className="px-3 py-1 bg-gray-200 text-gray-600 rounded text-sm" disabled>
                      Próximamente
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">Notificaciones por SMS</p>
                    <p className="text-sm text-gray-600">Reciba alertas en su teléfono móvil</p>
                  </div>
                  <div>
                    <button className="px-3 py-1 bg-gray-200 text-gray-600 rounded text-sm" disabled>
                      Próximamente
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">Configuración de Alertas</p>
                    <p className="text-sm text-gray-600">Personalice qué alertas desea recibir</p>
                  </div>
                  <div>
                    <button className="px-3 py-1 bg-gray-200 text-gray-600 rounded text-sm" disabled>
                      Próximamente
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertsPage;