import React, { useState, useEffect } from 'react';
import { dashboardService } from '../../services/api';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    airQuality: null,
    weather: null,
    alerts: [],
    rainForecast: [],
    recommendations: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        console.log('Fetching dashboard data...');
        console.log('API URL:', process.env.REACT_APP_API_URL);
        
        const response = await dashboardService.getData();
        console.log('Dashboard data received:', response.data);
        setDashboardData(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        // Mostrar información detallada del error
        if (err.response) {
          console.error('Error response:', err.response.data);
          console.error('Status:', err.response.status);
        } else if (err.request) {
          console.error('No response received:', err.request);
        } else {
          console.error('Error setting up request:', err.message);
        }
        setError('No se pudieron cargar los datos. Error: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    
    // Actualizar datos cada 5 minutos
    const intervalId = setInterval(fetchDashboardData, 5 * 60 * 1000);
    
    // Limpiar intervalo cuando el componente se desmonte
    return () => clearInterval(intervalId);
  }, []);

  // Función para determinar el color según el AQI
  const getAQIColor = (aqi) => {
    if (aqi <= 50) return 'bg-green-100 text-green-800';
    if (aqi <= 100) return 'bg-yellow-100 text-yellow-800';
    if (aqi <= 150) return 'bg-orange-100 text-orange-800';
    if (aqi <= 200) return 'bg-red-100 text-red-800';
    if (aqi <= 300) return 'bg-purple-100 text-purple-800';
    return 'bg-rose-100 text-rose-800';
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-4">Dashboard de Monitoreo Ambiental</h1>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p className="font-bold">Error al cargar datos</p>
          <p>{error}</p>
          <button 
            className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
            onClick={() => window.location.reload()}
          >
            Reintentar
          </button>
        </div>
      )}
      
      {loading && !error && (
        <div className="text-center py-10">
          <p className="text-gray-600">Cargando datos del dashboard...</p>
          <div className="mt-4 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Tarjeta de Calidad del Aire */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Calidad del Aire</h2>
          {loading ? (
            <p>Cargando datos...</p>
          ) : dashboardData.airQuality ? (
            <div>
              <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getAQIColor(dashboardData.airQuality.aqi)} mb-2`}>
                AQI: {dashboardData.airQuality.aqi}
              </div>
              <p className="text-gray-700">Temperatura: {dashboardData.airQuality.temperature}°C</p>
              <p className="text-gray-700">Humedad: {dashboardData.airQuality.humidity}%</p>
              <p className="text-gray-500 text-sm mt-2">Actualizado: {new Date(dashboardData.airQuality.timestamp).toLocaleString()}</p>
              {dashboardData.airQuality.simulated && (
                <p className="text-xs text-blue-600 italic mt-1">Datos simulados para desarrollo</p>
              )}
            </div>
          ) : (
            <p>No hay datos disponibles</p>
          )}
        </div>

        {/* Tarjeta de Clima */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Clima Actual</h2>
          {loading ? (
            <p>Cargando datos...</p>
          ) : dashboardData.weather ? (
            <div>
              <p className="text-gray-700">Temperatura: {dashboardData.weather.temperature}°C</p>
              <p className="text-gray-700">Humedad: {dashboardData.weather.humidity}%</p>
              <p className="text-gray-700">Viento: {dashboardData.weather.windSpeed} km/h</p>
              <p className="text-gray-700">Precipitación: {dashboardData.weather.precipitation} mm</p>
              <p className="text-gray-500 text-sm mt-2">{dashboardData.weather.weatherDescription}</p>
              {dashboardData.weather.simulated && (
                <p className="text-xs text-blue-600 italic mt-1">Datos simulados para desarrollo</p>
              )}
            </div>
          ) : (
            <p>No hay datos disponibles</p>
          )}
        </div>

        {/* Tarjeta de Alertas */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Alertas Activas</h2>
          {loading ? (
            <p>Cargando datos...</p>
          ) : dashboardData.alerts && dashboardData.alerts.length > 0 ? (
            <div>
              <ul className="space-y-2">
                {dashboardData.alerts.slice(0, 3).map((alert, index) => (
                  <li key={index} className={`p-2 rounded ${
                    alert.severity === 'HIGH' || alert.severity === 'CRITICAL' 
                      ? 'bg-red-100' 
                      : alert.severity === 'MEDIUM' 
                        ? 'bg-yellow-100' 
                        : 'bg-blue-100'
                  }`}>
                    <p className="font-medium">{alert.message}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
              {dashboardData.alerts.length > 3 && (
                <p className="text-sm text-blue-600 mt-2">
                  +{dashboardData.alerts.length - 3} alertas más
                </p>
              )}
            </div>
          ) : (
            <p>No hay alertas activas</p>
          )}
        </div>
      </div>

      {/* Recomendaciones */}
      {!loading && dashboardData.recommendations && dashboardData.recommendations.length > 0 && (
        <div className="mt-6 bg-blue-50 p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Recomendaciones</h2>
          <ul className="list-disc pl-5 space-y-1">
            {dashboardData.recommendations.map((recommendation, index) => (
              <li key={index} className="text-gray-700">{recommendation}</li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Información del sistema */}
      <div className="mt-6 text-right text-xs text-gray-500">
        <p>Última actualización: {new Date().toLocaleString()}</p>
        <p>Estado: {error ? 'Error' : loading ? 'Cargando' : 'Datos actualizados'}</p>
      </div>
    </div>
  );
};

export default Dashboard;