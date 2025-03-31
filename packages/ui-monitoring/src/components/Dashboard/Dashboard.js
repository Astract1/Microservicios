import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService, airQualityService } from '../../services/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';

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
  const [historicalAir, setHistoricalAir] = useState([]);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Obtener datos del dashboard
        const response = await dashboardService.getData();
        setDashboardData(response.data);
        
        // Obtener datos históricos de calidad del aire para el mini-gráfico
        const airHistoryResponse = await airQualityService.getHistorical(3); // Últimos 3 días
        const formattedAirData = airHistoryResponse.data.data.map(item => ({
          date: format(new Date(item.timestamp), 'dd/MM', { locale: es }),
          aqi: parseFloat(item.aqi)
        }));
        setHistoricalAir(formattedAirData);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
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
    if (aqi <= 50) return { bg: 'bg-green-100', text: 'text-green-800', label: 'Buena', fullBg: 'bg-green-500' };
    if (aqi <= 100) return { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Moderada', fullBg: 'bg-yellow-500' };
    if (aqi <= 150) return { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Insalubre para grupos sensibles', fullBg: 'bg-orange-500' };
    if (aqi <= 200) return { bg: 'bg-red-100', text: 'text-red-800', label: 'Insalubre', fullBg: 'bg-red-500' };
    if (aqi <= 300) return { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Muy insalubre', fullBg: 'bg-purple-600' };
    return { bg: 'bg-rose-100', text: 'text-rose-800', label: 'Peligrosa', fullBg: 'bg-rose-700' };
  };

  // Obtener color según la severidad de alerta
  const getAlertSeverityColor = (severity) => {
    switch (severity) {
      case 'HIGH':
      case 'CRITICAL':
        return 'bg-red-100 border-red-500';
      case 'MEDIUM':
        return 'bg-yellow-100 border-yellow-500';
      default:
        return 'bg-blue-100 border-blue-500';
    }
  };

  // Obtener icono para condición climática
  const getWeatherIcon = (description) => {
    // Esta función normalmente devolvería iconos según la descripción
    // Como placeholder, devolvemos emojis simples
    if (description?.toLowerCase().includes('lluvi')) return '🌧️';
    if (description?.toLowerCase().includes('nub')) return '☁️';
    if (description?.toLowerCase().includes('desp')) return '☀️';
    if (description?.toLowerCase().includes('nieve')) return '❄️';
    if (description?.toLowerCase().includes('tormenta')) return '⛈️';
    return '🌤️'; // default
  };

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard de Monitoreo Ambiental</h1>
        
        <div className="flex space-x-2">
          <button 
            onClick={() => setShowMap(!showMap)}
            className="px-3 py-1 bg-primary-600 text-white rounded text-sm flex items-center"
          >
            {showMap ? '🗃️ Ver Tarjetas' : '🗺️ Ver Mapa'}
          </button>
          <button 
            onClick={() => window.location.reload()}
            className="px-3 py-1 bg-gray-200 rounded text-sm"
            title="Actualizar datos"
          >
            🔄
          </button>
        </div>
      </div>
      
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        </div>
      )}
      
      {!loading && !error && (
        <>
          {showMap ? (
            // Vista de mapa (placehodler ya que necesitaríamos integración real con mapas)
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <div className="text-center mb-4">
                <h2 className="text-xl font-semibold">Mapa de Condiciones Ambientales</h2>
                <p className="text-sm text-gray-500">Esta funcionalidad requiere integración con servicios de mapas.</p>
              </div>
              
              <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <p className="text-gray-500 mb-2">Integración de mapas pendiente</p>
                  <p className="text-sm text-gray-500">
                    Se requiere añadir una biblioteca como Google Maps, Mapbox o Leaflet<br/>
                    para mostrar un mapa interactivo con datos ambientales.
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-blue-50 p-3 rounded-lg text-center">
                  <p className="text-sm text-gray-600">Estaciones de monitoreo</p>
                  <p className="font-medium">3 estaciones</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg text-center">
                  <p className="text-sm text-gray-600">Cobertura</p>
                  <p className="font-medium">5 km²</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg text-center">
                  <p className="text-sm text-gray-600">Barrios monitoreados</p>
                  <p className="font-medium">5 barrios</p>
                </div>
              </div>
            </div>
          ) : (
            // Vista de tarjetas
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Tarjeta de Calidad del Aire */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-lg font-semibold">Calidad del Aire</h2>
                  <Link to="/calidad-aire" className="text-primary-600 hover:text-primary-800 text-sm">
                    Ver detalles →
                  </Link>
                </div>
                <div className="p-6">
                  {dashboardData.airQuality ? (
                    <>
                      <div className="flex items-center mb-4">
                        <div className={`${getAQIColor(dashboardData.airQuality.aqi).fullBg} text-white rounded-full w-16 h-16 flex items-center justify-center mr-4`}>
                          <span className="text-xl font-bold">{Math.round(dashboardData.airQuality.aqi)}</span>
                        </div>
                        <div>
                          <p className="font-medium text-lg">{getAQIColor(dashboardData.airQuality.aqi).label}</p>
                          <p className="text-sm text-gray-600">
                            {dashboardData.airQuality.aqi <= 50 ? "Calidad del aire satisfactoria" :
                             dashboardData.airQuality.aqi <= 100 ? "Calidad del aire aceptable" :
                             dashboardData.airQuality.aqi <= 150 ? "Insalubre para grupos sensibles" :
                             "Calidad del aire insalubre"}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-gray-50 p-2 rounded">
                          <div className="text-sm text-gray-500">Temperatura</div>
                          <div className="font-medium">{dashboardData.airQuality.temperature}°C</div>
                        </div>
                        <div className="bg-gray-50 p-2 rounded">
                          <div className="text-sm text-gray-500">Humedad</div>
                          <div className="font-medium">{dashboardData.airQuality.humidity}%</div>
                        </div>
                      </div>
                      
                      {historicalAir.length > 0 && (
                        <div className="mt-2 h-24">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={historicalAir}>
                              <Line type="monotone" dataKey="aqi" stroke="#3730a3" dot={false} />
                              <XAxis dataKey="date" tick={{fontSize: 10}} />
                              <YAxis domain={['dataMin - 10', 'dataMax + 10']} tick={{fontSize: 10}} />
                              <Tooltip />
                            </LineChart>
                          </ResponsiveContainer>
                          <div className="text-xs text-gray-500 text-center mt-1">
                            Tendencia últimos 3 días
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-gray-500">No hay datos disponibles</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Tarjeta de Clima */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-lg font-semibold">Clima Actual</h2>
                  <Link to="/clima" className="text-primary-600 hover:text-primary-800 text-sm">
                    Ver detalles →
                  </Link>
                </div>
                <div className="p-6">
                  {dashboardData.weather ? (
                    <>
                      <div className="text-center mb-4">
                        <div className="text-5xl mb-2">
                          {getWeatherIcon(dashboardData.weather.weatherDescription)}
                        </div>
                        <div className="text-4xl font-bold mb-1">
                          {Math.round(dashboardData.weather.temperature)}°C
                        </div>
                        <div className="text-sm text-gray-600 capitalize">
                          {dashboardData.weather.weatherDescription}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="bg-gray-50 p-2 rounded text-center">
                          <div className="text-xs text-gray-500">Viento</div>
                          <div className="font-medium text-sm">{dashboardData.weather.windSpeed} km/h</div>
                        </div>
                        <div className="bg-gray-50 p-2 rounded text-center">
                          <div className="text-xs text-gray-500">Presión</div>
                          <div className="font-medium text-sm">{dashboardData.weather.pressure} hPa</div>
                        </div>
                      </div>
                      
                      {dashboardData.rainForecast && dashboardData.rainForecast.length > 0 && (
                        <div className="mt-4">
                          <div className="text-sm font-medium mb-2">Pronóstico de lluvia</div>
                          <div className="flex justify-between text-xs">
                            {dashboardData.rainForecast.slice(0, 4).map((item, idx) => (
                              <div key={idx} className="text-center flex-1">
                                <div className="mb-1">{item.hora}</div>
                                <div className={`${item.probabilidad > 30 ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                                  {Math.round(item.probabilidad)}%
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-gray-500">No hay datos disponibles</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Tarjeta de Precipitaciones */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-lg font-semibold">Precipitaciones</h2>
                  <Link to="/precipitaciones" className="text-primary-600 hover:text-primary-800 text-sm">
                    Ver detalles →
                  </Link>
                </div>
                <div className="p-6">
                  {dashboardData.weather ? (
                    <>
                      <div className="flex items-center justify-center mb-4">
                        <div className="text-4xl mr-3">💧</div>
                        <div>
                          <div className="text-3xl font-bold">
                            {dashboardData.weather.precipitation} mm
                          </div>
                          <div className="text-sm text-gray-600">Última hora</div>
                        </div>
                      </div>
                      
                      <div className={`p-3 rounded-lg ${dashboardData.weather.precipitation > 0 ? 'bg-blue-50' : 'bg-gray-50'}`}>
                        <p className="text-sm font-medium mb-1">Estado actual</p>
                        <p className="text-sm">
                          {dashboardData.weather.precipitation === 0 
                            ? "Sin precipitaciones" 
                            : dashboardData.weather.precipitation < 2
                              ? "Llovizna ligera"
                              : dashboardData.weather.precipitation < 10
                                ? "Lluvia moderada"
                                : "Lluvia intensa"}
                        </p>
                      </div>
                      
                      {dashboardData.rainForecast && dashboardData.rainForecast.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm font-medium mb-2">Probabilidad de lluvia</p>
                          <div className="h-24">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={dashboardData.rainForecast.slice(0, 8)}>
                                <Bar dataKey="probabilidad" fill="#3730a3" />
                                <XAxis dataKey="hora" tick={{fontSize: 10}} />
                                <YAxis domain={[0, 100]} tick={{fontSize: 10}} />
                                <Tooltip />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="text-xs text-gray-500 text-center mt-1">
                            Próximas 24 horas
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-gray-500">No hay datos disponibles</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        
          {/* Segunda fila con alertas y recomendaciones */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tarjeta de Alertas */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold">Alertas Ambientales</h2>
                <Link to="/alertas" className="text-primary-600 hover:text-primary-800 text-sm">
                  Ver todas →
                </Link>
              </div>
              <div className="p-6">
                {dashboardData.alerts && dashboardData.alerts.length > 0 ? (
                  <div className="space-y-3">
                    {dashboardData.alerts.slice(0, 3).map((alert, index) => (
                      <div key={index} className={`p-3 rounded-lg border-l-4 ${getAlertSeverityColor(alert.severity)}`}>
                        <div className="flex justify-between">
                          <div>
                            <p className="font-medium">{alert.message}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {format(new Date(alert.timestamp), 'dd MMM, HH:mm', { locale: es })}
                            </p>
                          </div>
                          <div>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full 
                              ${
                                alert.severity === 'CRITICAL' ? 'bg-red-500 text-white' :
                                alert.severity === 'HIGH' ? 'bg-orange-500 text-white' :
                                alert.severity === 'MEDIUM' ? 'bg-yellow-500 text-white' :
                                'bg-blue-500 text-white'
                              }
                            `}>
                              {alert.severity}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {dashboardData.alerts.length > 3 && (
                      <div className="text-center">
                        <Link to="/alertas" className="text-sm text-primary-600 hover:underline">
                          +{dashboardData.alerts.length - 3} alertas más
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <div className="text-3xl mb-2">✓</div>
                    <p className="text-gray-700">No hay alertas activas</p>
                    <p className="text-sm text-gray-500 mt-1">Las condiciones ambientales son favorables</p>
                  </div>
                )}
              </div>
            </div>

            {/* Tarjeta de Recomendaciones */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold">Recomendaciones</h2>
              </div>
              <div className="p-6">
                {dashboardData.recommendations && dashboardData.recommendations.length > 0 ? (
                  <ul className="space-y-3">
                    {dashboardData.recommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-primary-600 mr-2 mt-1">•</span>
                        <span className="text-gray-700">{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-gray-700">No hay recomendaciones disponibles</p>
                  </div>
                )}
                
                <div className="mt-6 bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Recomendación del día:</span> Mantente hidratado y protégete de la exposición directa al sol en las horas de mayor radiación (11am - 3pm).
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Última actualización */}
          <div className="mt-6 text-right text-xs text-gray-500">
            <p>Última actualización: {new Date().toLocaleString()}</p>
            <p>Panel actualizado cada 5 minutos automáticamente.</p>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;