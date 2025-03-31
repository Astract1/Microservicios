import React, { useState, useEffect } from 'react';
import { weatherService } from '../../services/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

const WeatherPage = () => {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [forecastDays, setForecastDays] = useState(5);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Obtener clima actual
        const currentResponse = await weatherService.getCurrent();
        setCurrentWeather(currentResponse.data.data);
        
        // Obtener pronóstico
        const forecastResponse = await weatherService.getForecast(forecastDays);
        setForecast(forecastResponse.data.data.forecast || []);
        
        // Obtener datos históricos
        const historicalResponse = await weatherService.getHistorical(7);
        // Formatear datos para el gráfico
        const formattedData = historicalResponse.data.data.map(item => ({
          ...item,
          date: format(new Date(item.timestamp), 'dd/MM HH:mm', { locale: es }),
          temp: item.temperature,
        }));
        setHistoricalData(formattedData);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching weather data:', err);
        setError('No se pudieron cargar los datos meteorológicos');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [forecastDays]);

  // Función para obtener icono del clima basado en la descripción o icon code
  const getWeatherIcon = (description, icon) => {
    // Si usamos React Icons podemos mostrar íconos basados en la descripción
    // Por ahora, dejamos un placeholder que menciona que aquí iría un ícono
    return "☁️"; // Placeholder - aquí se puede usar un componente de ícono real
  };

  // Agrupar pronóstico por día
  const getDailyForecast = () => {
    if (!forecast || forecast.length === 0) return [];

    const dailyData = {};
    forecast.forEach(item => {
      const date = new Date(item.date);
      const day = format(date, 'yyyy-MM-dd');
      
      if (!dailyData[day]) {
        dailyData[day] = {
          date: format(date, 'EEEE d', { locale: es }),
          minTemp: item.temperature,
          maxTemp: item.temperature,
          icon: item.icon,
          humidity: [],
          description: item.description,
          precipitation: item.precipitation || 0,
          pop: item.pop || 0
        };
      } else {
        dailyData[day].minTemp = Math.min(dailyData[day].minTemp, item.temperature);
        dailyData[day].maxTemp = Math.max(dailyData[day].maxTemp, item.temperature);
        dailyData[day].humidity.push(item.humidity);
        dailyData[day].precipitation += (item.precipitation || 0);
        // Si hay probabilidad de precipitación, tomamos la más alta
        if (item.pop > dailyData[day].pop) {
          dailyData[day].pop = item.pop;
        }
      }
    });
    
    // Convertir objeto a array y calcular promedio de humedad
    return Object.values(dailyData).map(day => ({
      ...day,
      humidity: Math.round(day.humidity.reduce((acc, h) => acc + h, 0) / day.humidity.length)
    }));
  };

  // Función para formatear la dirección del viento
  const getWindDirection = (degrees) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
    const index = Math.round((degrees % 360) / 45) % 8;
    return directions[index];
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-6">Condiciones Meteorológicas</h1>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-10">
          <p className="text-gray-600">Cargando datos meteorológicos...</p>
          <div className="mt-4 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna izquierda - Clima actual */}
          <div>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Clima Actual</h2>
              
              {currentWeather && (
                <div className="text-center">
                  <div className="mb-4">
                    <div className="text-5xl mb-2">
                      {getWeatherIcon(currentWeather.weatherDescription, currentWeather.weatherIcon)}
                    </div>
                    <div className="text-4xl font-bold mb-1">{Math.round(currentWeather.temperature)}°C</div>
                    <div className="text-gray-600 capitalize">{currentWeather.weatherDescription}</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-sm text-gray-500">Humedad</div>
                      <div className="font-medium">{currentWeather.humidity}%</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-sm text-gray-500">Presión</div>
                      <div className="font-medium">{currentWeather.pressure} hPa</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-sm text-gray-500">Viento</div>
                      <div className="font-medium">{currentWeather.windSpeed} km/h</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-sm text-gray-500">Dirección</div>
                      <div className="font-medium">{getWindDirection(currentWeather.windDirection)}</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <div>
                      <div className="font-medium">{currentWeather.city}</div>
                    </div>
                    <div>
                      <div>
                        {format(new Date(currentWeather.timestamp), 'dd MMMM, HH:mm', { locale: es })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Información de precipitaciones */}
            <div className="bg-white rounded-lg shadow p-6 mt-6">
              <h2 className="text-xl font-semibold mb-4">Precipitaciones</h2>
              
              {currentWeather && (
                <div>
                  <div className="flex items-center justify-center mb-4">
                    <div className="text-4xl mr-3">💧</div>
                    <div>
                      <div className="text-3xl font-bold">
                        {currentWeather.precipitation} mm
                      </div>
                      <div className="text-sm text-gray-600">Última hora</div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Probabilidad de lluvia hoy</h3>
                    
                    {forecast && forecast.length > 0 ? (
                      <div className="flex justify-between mb-2">
                        {forecast.slice(0, 4).map((item, idx) => (
                          <div key={idx} className="text-center">
                            <div className="text-sm">
                              {format(new Date(item.date), 'HH:mm')}
                            </div>
                            <div className="text-lg font-medium">
                              {Math.round(item.pop || 0)}%
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Datos no disponibles</p>
                    )}
                    
                    {forecast && forecast.length > 0 && forecast[0].pop > 30 && (
                      <div className="mt-2 text-sm text-blue-800">
                        <p className="font-medium">Recomendación:</p>
                        <p>Lleve un paraguas si sale hoy</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Columna central - Pronóstico */}
          <div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Pronóstico</h2>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setForecastDays(3)} 
                    className={`px-3 py-1 rounded text-sm ${forecastDays === 3 ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}
                  >
                    3 días
                  </button>
                  <button 
                    onClick={() => setForecastDays(5)} 
                    className={`px-3 py-1 rounded text-sm ${forecastDays === 5 ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}
                  >
                    5 días
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                {getDailyForecast().map((day, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg flex items-center">
                    <div className="w-1/4">
                      <div className="font-medium capitalize">{day.date}</div>
                    </div>
                    <div className="w-1/4 text-center">
                      <div className="text-2xl">{getWeatherIcon('', day.icon)}</div>
                    </div>
                    <div className="w-1/4 text-center">
                      <div className="text-sm text-gray-500">Máx / Mín</div>
                      <div className="font-medium">{Math.round(day.maxTemp)}° / {Math.round(day.minTemp)}°</div>
                    </div>
                    <div className="w-1/4 text-right">
                      <div className="text-sm text-gray-500">Prob. lluvia</div>
                      <div className="font-medium">{Math.round(day.pop)}%</div>
                    </div>
                  </div>
                ))}
              </div>
              
              {forecast.length === 0 && (
                <p className="text-center py-10 text-gray-500">No hay datos de pronóstico disponibles</p>
              )}
            </div>
            
            {/* Tabla horaria */}
            <div className="bg-white rounded-lg shadow p-6 mt-6">
              <h2 className="text-xl font-semibold mb-4">Pronóstico por Horas</h2>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Temperatura</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condición</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prob. Lluvia</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {forecast.slice(0, 8).map((item, index) => (
                      <tr key={index}>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                          {format(new Date(item.date), 'HH:mm')}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                          {Math.round(item.temperature)}°C
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <span className="mr-2">{getWeatherIcon('', item.icon)}</span>
                            <span>{item.description}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                          {Math.round(item.pop || 0)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          {/* Columna derecha - Gráficos */}
          <div>
            {/* Gráfico histórico de temperatura */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Temperatura Histórica</h2>
              
              {historicalData.length > 0 ? (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={historicalData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="temp" name="Temperatura (°C)" stroke="#2196F3" fill="#2196F3" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-center py-10 text-gray-500">No hay datos históricos disponibles</p>
              )}
            </div>
            
            {/* Gráfico histórico de humedad */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Humedad Histórica</h2>
              
              {historicalData.length > 0 ? (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={historicalData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="humidity" name="Humedad (%)" stroke="#4338ca" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-center py-10 text-gray-500">No hay datos históricos disponibles</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherPage;