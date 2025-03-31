import React, { useState, useEffect } from 'react';
import { weatherService } from '../../services/api';
import { format, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';

const RainfallPage = () => {
  const [rainfallData, setRainfallData] = useState([]);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState(30); // días por defecto

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Datos históricos de precipitaciones
        const rainfallResponse = await weatherService.getRainfall(timeRange);
        
        // Formatear datos para el gráfico
        const formattedData = rainfallResponse.data.map(item => ({
          date: format(new Date(item.date), 'dd MMM', { locale: es }),
          rainfall: parseFloat(item.rainfall || 0)
        }));
        setRainfallData(formattedData);
        
        // Obtener pronóstico de lluvia
        const forecastResponse = await weatherService.getForecast(5);
        // Extraer y formatear datos de precipitación del pronóstico
        const forecastData = [];
        if (forecastResponse.data?.data?.forecast) {
          // Agrupar por día
          const dailyData = {};
          forecastResponse.data.data.forecast.forEach(item => {
            const date = new Date(item.date);
            const day = format(date, 'yyyy-MM-dd');
            
            if (!dailyData[day]) {
              dailyData[day] = {
                date: format(date, 'dd MMM', { locale: es }),
                precipitation: item.precipitation || 0,
                probability: item.pop || 0
              };
            } else {
              dailyData[day].precipitation += (item.precipitation || 0);
              // Si hay mayor probabilidad, tomamos la mayor
              if (item.pop > dailyData[day].probability) {
                dailyData[day].probability = item.pop;
              }
            }
          });
          
          // Convertir objeto a array
          Object.values(dailyData).forEach(day => {
            forecastData.push(day);
          });
        }
        setForecast(forecastData);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching rainfall data:', err);
        setError('No se pudieron cargar los datos de precipitaciones');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [timeRange]);

  // Calcular estadísticas de precipitaciones
  const calculateStats = () => {
    if (!rainfallData || rainfallData.length === 0) {
      return { total: 0, average: 0, max: 0, daysWithRain: 0 };
    }
    
    const total = rainfallData.reduce((sum, item) => sum + item.rainfall, 0);
    const average = total / rainfallData.length;
    const max = Math.max(...rainfallData.map(item => item.rainfall));
    const daysWithRain = rainfallData.filter(item => item.rainfall > 0).length;
    
    return { total, average, max, daysWithRain };
  };

  // Obtener color según nivel de precipitación
  const getRainfallColor = (value) => {
    if (value === 0) return 'text-gray-500';
    if (value < 5) return 'text-blue-400';
    if (value < 15) return 'text-blue-500';
    if (value < 30) return 'text-blue-600';
    return 'text-blue-800';
  };

  // Determinar nivel de intensidad de lluvia
  const getRainfallIntensity = (value) => {
    if (value === 0) return 'Sin lluvia';
    if (value < 2) return 'Llovizna';
    if (value < 5) return 'Lluvia débil';
    if (value < 15) return 'Lluvia moderada';
    if (value < 30) return 'Lluvia fuerte';
    if (value < 60) return 'Lluvia muy fuerte';
    return 'Lluvia extrema';
  };

  // Obtener color según probabilidad de lluvia
  const getProbabilityColor = (value) => {
    if (value < 30) return 'bg-blue-100 text-blue-800';
    if (value < 50) return 'bg-blue-200 text-blue-800';
    if (value < 70) return 'bg-blue-300 text-blue-800';
    return 'bg-blue-500 text-white';
  };

  const stats = calculateStats();

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-6">Monitoreo de Precipitaciones</h1>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-10">
          <p className="text-gray-600">Cargando datos de precipitaciones...</p>
          <div className="mt-4 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna izquierda - Tarjetas informativas */}
          <div>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Resumen de Precipitaciones</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-600 mb-1">Total {timeRange} días</p>
                  <p className="text-3xl font-bold text-blue-700">{stats.total.toFixed(1)} mm</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-600 mb-1">Promedio diario</p>
                  <p className="text-3xl font-bold text-blue-700">{stats.average.toFixed(1)} mm</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-600 mb-1">Máxima diaria</p>
                  <p className="text-3xl font-bold text-blue-700">{stats.max.toFixed(1)} mm</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-600 mb-1">Días con lluvia</p>
                  <p className="text-3xl font-bold text-blue-700">{stats.daysWithRain}</p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Interpretación</h3>
                <ul className="text-sm text-gray-700 space-y-2">
                  {stats.total === 0 ? (
                    <li>No se ha registrado lluvia en los últimos {timeRange} días.</li>
                  ) : stats.total < 10 ? (
                    <li>Periodo muy seco con precipitaciones mínimas.</li>
                  ) : stats.total < 50 ? (
                    <li>Precipitaciones moderadas dentro de los rangos normales.</li>
                  ) : stats.total < 100 ? (
                    <li>Periodo húmedo con precipitaciones significativas.</li>
                  ) : (
                    <li>Periodo extremadamente húmedo con precipitaciones muy por encima de lo normal.</li>
                  )}
                  
                  {stats.daysWithRain === 0 ? (
                    <li>No ha llovido en el periodo analizado.</li>
                  ) : stats.daysWithRain < timeRange * 0.2 ? (
                    <li>Lluvias esporádicas con largos periodos secos.</li>
                  ) : stats.daysWithRain < timeRange * 0.5 ? (
                    <li>Alternancia de días de lluvia y días secos.</li>
                  ) : (
                    <li>Lluvia frecuente en la mayoría de los días analizados.</li>
                  )}
                </ul>
              </div>
            </div>
            
            {/* Pronóstico de lluvia */}
            <div className="bg-white rounded-lg shadow p-6 mt-6">
              <h2 className="text-xl font-semibold mb-4">Pronóstico de Lluvia</h2>
              
              {forecast.length > 0 ? (
                <div className="space-y-4">
                  {forecast.map((day, index) => (
                    <div key={index} className="flex items-center p-3 border rounded-lg">
                      <div className="w-1/4 font-medium">{day.date}</div>
                      <div className="w-1/3">
                        <div className="text-sm text-gray-500">Precipitación</div>
                        <div className={`font-medium ${getRainfallColor(day.precipitation)}`}>
                          {day.precipitation.toFixed(1)} mm
                        </div>
                      </div>
                      <div className="w-1/3 text-right">
                        <div className="text-sm text-gray-500">Probabilidad</div>
                        <div>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getProbabilityColor(day.probability)}`}>
                            {Math.round(day.probability)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-4 text-gray-500">No hay datos de pronóstico disponibles</p>
              )}
              
              <div className="mt-4 text-sm text-gray-500">
                <p>Los datos de pronóstico se actualizan cada 6 horas.</p>
              </div>
            </div>
          </div>
          
          {/* Columna central y derecha - Gráficos */}
          <div className="lg:col-span-2">
            {/* Selector de rango de tiempo */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Histórico de Precipitaciones</h2>
                <div className="flex space-x-2">
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
                  <button 
                    onClick={() => setTimeRange(30)} 
                    className={`px-3 py-1 rounded text-sm ${timeRange === 30 ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}
                  >
                    30 días
                  </button>
                </div>
              </div>
            </div>
            
            {/* Gráfico de barras para precipitaciones */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Precipitaciones Diarias (mm)</h2>
              
              {rainfallData.length > 0 ? (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={rainfallData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="rainfall" name="Precipitación (mm)" fill="#2196F3" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-center py-10 text-gray-500">No hay datos históricos disponibles</p>
              )}
            </div>
            
            {/* Gráfico de área para acumulado */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Precipitación Acumulada (mm)</h2>
              
              {rainfallData.length > 0 ? (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={rainfallData.map((item, index, array) => {
                      // Calcular acumulado
                      const accumulated = array
                        .slice(0, index + 1)
                        .reduce((sum, dataPoint) => sum + dataPoint.rainfall, 0);
                      
                      return {
                        ...item,
                        accumulated
                      };
                    })}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="accumulated" 
                        name="Precipitación Acumulada (mm)" 
                        stroke="#3730a3" 
                        fill="#3730a3" 
                        fillOpacity={0.3} 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-center py-10 text-gray-500">No hay datos históricos disponibles</p>
              )}
            </div>
            
            {/* Tabla de datos */}
            <div className="bg-white rounded-lg shadow p-6 mt-6">
              <h2 className="text-xl font-semibold mb-4">Registro Detallado</h2>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precipitación</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Intensidad</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {rainfallData.slice(0, 10).map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.rainfall.toFixed(1)} mm</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getRainfallColor(item.rainfall)}`}>
                            {getRainfallIntensity(item.rainfall)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {rainfallData.length > 10 && (
                <div className="mt-4 text-center text-sm text-gray-500">
                  Mostrando 10 de {rainfallData.length} registros
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RainfallPage;