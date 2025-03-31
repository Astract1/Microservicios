import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { checkApiStatus } from '../../services/api';
import { ThemeToggle, useTheme } from '../../styles/theme';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [apiStatus, setApiStatus] = useState({ available: true, checking: true });
  const location = useLocation();
  const { theme } = useTheme();

  // Verificar el estado de la API al cargar
  useEffect(() => {
    const checkAPI = async () => {
      try {
        const status = await checkApiStatus();
        setApiStatus({ available: status.available, checking: false });
      } catch (error) {
        setApiStatus({ available: false, checking: false });
      }
    };
    
    checkAPI();
    // Verificar cada 2 minutos
    const interval = setInterval(checkAPI, 2 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Comprobar si una ruta está activa
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Menú de navegación
  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/calidad-aire', label: 'Calidad del Aire', icon: '💨' },
    { path: '/clima', label: 'Clima', icon: '☁️' },
    { path: '/precipitaciones', label: 'Precipitaciones', icon: '💧' },
    { path: '/alertas', label: 'Alertas', icon: '🚨' }
  ];

  // Estilo para enlaces activos
  const activeLinkClass = 'border-primary-500 text-primary-600 dark:text-primary-400 font-medium';
  // Estilo para enlaces inactivos
  const inactiveLinkClass = 'border-transparent text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 hover:border-gray-300 dark:hover:border-gray-700';

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-primary-700 dark:text-primary-400 font-bold text-xl">
                <span className="mr-2">🌿</span>MonitoreoAmbiental
              </Link>
            </div>
            
            {/* Enlaces de navegación - Escritorio */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`inline-flex items-center px-3 py-2 border-b-2 text-sm transition-colors duration-200 ${
                    isActive(item.path) ? activeLinkClass : inactiveLinkClass
                  }`}
                >
                  <span className="mr-1">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {/* Selector de tema */}
            <ThemeToggle className="mr-4 text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400" />
            
            {/* Indicador de estado de API */}
            <div className="mr-4 flex items-center">
              <span className={`inline-block w-2 h-2 rounded-full mr-1 ${
                apiStatus.checking 
                  ? 'bg-yellow-500' 
                  : apiStatus.available 
                    ? 'bg-green-500' 
                    : 'bg-red-500'
              }`}></span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {apiStatus.checking 
                  ? 'Verificando...' 
                  : apiStatus.available 
                    ? 'API Conectada' 
                    : 'API Desconectada'}
              </span>
            </div>
            
            {/* Selector de ciudad (placeholder - se implementaría con datos reales) */}
            <div className="relative">
              <select className="block w-full pl-3 pr-10 py-1 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary-500">
                <option>Bogotá</option>
                <option>Medellín</option>
                <option>Cali</option>
                <option>Barranquilla</option>
              </select>
            </div>
          </div>
          
          {/* Botón de menú móvil */}
          <div className="flex items-center sm:hidden">
            <ThemeToggle className="mr-2 text-gray-500 dark:text-gray-400" />
            
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              <span className="sr-only">Abrir menú principal</span>
              {/* Icono de menú (hamburguesa o X) */}
              {isMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </div>

      {/* Menú móvil */}
      {isMenuOpen && (
        <div className="sm:hidden animate-fadeIn">
          <div className="pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-150 ${
                  isActive(item.path)
                    ? 'bg-primary-50 dark:bg-primary-900 dark:bg-opacity-20 border-primary-500 text-primary-700 dark:text-primary-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
          
          <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center px-4">
              <div className={`w-2 h-2 rounded-full mr-1 ${
                apiStatus.available ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {apiStatus.available ? 'API Conectada' : 'API Desconectada'}
              </div>
            </div>
            <div className="mt-3 px-2 space-y-1">
              <div className="block px-3 py-2 rounded-md text-base font-medium text-gray-500 dark:text-gray-400">
                Ciudad: Bogotá
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;