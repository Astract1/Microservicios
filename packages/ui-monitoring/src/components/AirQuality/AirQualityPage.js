import React, { useState, useEffect } from 'react';
import { airQualityService } from '../../services/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

const AirQualityPage = () => {
  const [currentData, setCurrentData] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState(7); // días por defecto

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Datos actuales
        const currentResponse = await airQualityService.getCurrent();
        setCurrentData(currentResponse.data.data);
        
        // Datos históricos
        const historicalResponse = await airQualityService.getHistorical(timeRange);
        // Formatear datos para el gráfico
        const formattedData = historicalResponse.data.data.map(item => ({
          ...item,
          date: format(new Date(item.timestamp), 'dd/MM HH:mm', { locale: es }),
          aqi: parseFloat(item.aqi)
        }));
        setHistoricalData(formattedData);
        
        // Datos por barrios
        const neighborhoodsResponse = await airQualityService.getNeighborhoods();
        setNeighborhoods(neighborhoodsResponse.data.data);
        
        // Estaciones
        const stationsResponse = await airQualityService.getStations();
        setStations(stationsResponse.data.data);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching air quality data:', err);
        setError('No se pudieron cargar los datos de calidad del aire');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [timeRange]);

  // Función para determinar el nivel y color según el AQI
  const getAQILevel = (aqi) => {
    if (aqi <= 50) return { level: 'Buena', color: 'bg-green-500', textColor: 'text-green-800', description: 'La calidad del aire es satisfactoria y la contaminación presenta poco o ningún riesgo.' };
    if (aqi <= 100) return { level: 'Moderada', color: 'bg-yellow-400', textColor: 'text-yellow-800', description: 'La calidad del aire es aceptable, pero puede haber un problema para algunas personas sensibles.' };
    if (aqi <= 150) return { level: 'Insalubre para grupos sensibles', color: 'bg-orange-500', textColor: 'text-orange-800', description: 'Los grupos sensibles pueden experimentar efectos en la salud. El público en general no se ve afectado.' };
    if (aqi <= 200) return { level: 'Insalubre', color: 'bg-red-500', textColor: 'text-red-800', description: 'Todos pueden comenzar a experimentar efectos en la salud. Los grupos sensibles pueden experimentar efectos más graves.' };
    if (aqi <= 300) return { level: 'Muy insalubre', color: 'bg-purple-600', textColor: 'text-purple-800', description: 'Advertencias sanitarias de condiciones de emergencia. Es más probable que toda la población se vea afectada.' };
    return { level: 'Peligrosa', color: 'bg-rose-800', textColor: 'text-rose-800', description: 'Alerta sanitaria: todos pueden experimentar efectos de salud más graves.' };
  };

  // Función para renderizar el indicador visual del AQI (círculo de color con nivel)
  const renderAQIIndicator = (aqi) => {
    const { level, color, description } = getAQILevel(aqi);
    
    return (
      <div className="flex flex-col items-center mb-4">
        <div className={`${color} text-white text-center rounded-full w-32 h-32 flex flex-col items-center justify-center mb-2`}>
          <span className="text-3xl font-bold">{Math.round(aqi)}</span>
          <span className="text-sm">AQI</span>
        </div>
        <div className="text-lg font-semibold">{level}</div>
        <p className="text-gray-600 text-sm text-center mt-1">{description}</p>
      </div>
    );
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-6">Monitoreo de Calidad del Aire</h1>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-10">
          <p className="text-gray-600">Cargando datos de calidad del aire...</p>
          <div className="mt-4 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna izquierda - Datos actuales */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Calidad del Aire Actual</h2>
              
              {currentData && (
                <div className="text-center">
                  {renderAQIIndicator(currentData.aqi)}
                  
                  <div className="mt-4 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-sm text-gray-500">Temperatura</p>
                        <p className="text-lg font-medium">{currentData.temperature}°C</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-sm text-gray-500">Humedad</p>
                        <p className="text-lg font-medium">{currentData.humidity}%</p>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600">
                      Ciudad: <span className="font-medium">{currentData.city}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Actualizado: <span className="font-medium">
                        {format(new Date(currentData.timestamp), 'dd MMMM yyyy, HH:mm', { locale: es })}
                      </span>
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Recomendaciones */}
            <div className="bg-white rounded-lg shadow p-6 mt-6">
              <h2 className="text-xl font-semibold mb-4">Recomendaciones</h2>
              {currentData && (
                <div>
                  {currentData.aqi <= 50 ? (
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                      <li>Condiciones ideales para actividades al aire libre</li>
                      <li>Ventile su hogar para renovar el aire interior</li>
                      <li>Disfrute de actividades físicas en exterior</li>
                    </ul>
                  ) : currentData.aqi <= 100 ? (
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                      <li>Las personas sensibles deberían reducir las actividades físicas intensas en exterior</li>
                      <li>Buen momento para la mayoría de actividades al aire libre</li>
                      <li>Considere llevar mascarilla si tiene problemas respiratorios</li>
                    </ul>
                  ) : currentData.aqi <= 150 ? (
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                      <li>Grupos sensibles: reduzca el esfuerzo prolongado al aire libre</li>
                      <li>Considere realizar actividades en espacios interiores</li>
                      <li>Mantenga ventanas cerradas si el aire interior es filtrado</li>
                      <li>Utilice purificadores de aire si dispone de ellos</li>
                    </ul>
                  ) : currentData.aqi <= 200 ? (
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                      <li>Evite actividades físicas intensas al aire libre</li>
                      <li>Niños, ancianos y personas con problemas respiratorios deben permanecer en interiores</li>
                      <li>Use mascarilla adecuada para filtrar partículas (N95 o similar)</li>
                      <li>Mantenga ventanas cerradas y use purificadores de aire</li>
                    </ul>
                  ) : (
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                      <li className="font-semibold text-red-600">¡ALERTA DE SALUD!</li>
                      <li>Permanezca en espacios interiores con aire filtrado</li>
                      <li>Evite cualquier actividad al aire libre</li>
                      <li>Use mascarilla N95 o similar si debe salir</li>
                      <li>Personas con condiciones cardíacas o respiratorias deben consultar a su médico</li>
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Columna derecha - Gráficos e históricos */}
          <div className="lg:col-span-2">
            {/* Datos históricos */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Histórico de Calidad del Aire</h2>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setTimeRange(3)} 
                    className={`px-3 py-1 rounded text-sm ${timeRange === 3 ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}
                  >
                    3 días
                  </button>
                  <button 
                    onClick={() => setTimeRange(7)} 
                    className={`px-3 py-1 rounded text-sm ${timeRange === 7 ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}
                  >
                    7 días
                  </button>
                  <button 
                    onClick={() => setTimeRange(14)} 
                    className={`px-3 py-1 rounded text-sm ${timeRange === 14 ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}
                  >
                    14 días
                  </button>
                </div>
              </div>
              
              {historicalData.length > 0 ? (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={historicalData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="aqi" name="Índice de Calidad del Aire" stroke="#3730a3" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-center py-10 text-gray-500">No hay datos históricos disponibles</p>
              )}
            </div>
            
            {/* Comparativa por barrios */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Calidad del Aire por Zonas</h2>
              
              {neighborhoods.length > 0 ? (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={neighborhoods}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="aqi" name="AQI" fill="#4338ca" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-center py-10 text-gray-500">No hay datos de barrios disponibles</p>
              )}
              
              <div className="mt-4 text-sm text-gray-500 italic">
                {neighborhoods.some(n => n.simulated) && "Algunos datos son simulados para fines de visualización."}
              </div>
            </div>
            
            {/* Estaciones de monitoreo */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Estaciones de Monitoreo</h2>
              
              {stations.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estación</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AQI</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nivel</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distancia</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {stations.map((station, index) => {
                        const { level, color } = getAQILevel(station.aqi);
                        return (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{station.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{station.aqi}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${color} text-white`}>
                                {level}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{station.distance} km</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center py-4 text-gray-500">No hay datos de estaciones disponibles</p>
              )}
              
              <div className="mt-4 text-sm text-gray-500">
                <p>
                  <span className="font-medium">Nota:</span> Los datos de las estaciones se actualizan cada hora.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AirQualityPage;