import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Componentes de página
import Dashboard from './components/Dashboard/Dashboard';
import AirQualityPage from './components/AirQuality/AirQualityPage';
import WeatherPage from './components/Weather/WeatherPage';
import RainfallPage from './components/Rainfall/RainfallPage';
import AlertsPage from './components/Alerts/AlertsPage';
import MapView from './components/Map/MapView'; // Importamos el nuevo componente
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

// Sistema de temas
import { ThemeProvider } from './styles/theme';

// Estilos
import './styles/index.css';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors duration-300">
          <Navbar />
          <main className="flex-grow container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/calidad-aire" element={<AirQualityPage />} />
              <Route path="/clima" element={<WeatherPage />} />
              <Route path="/precipitaciones" element={<RainfallPage />} />
              <Route path="/alertas" element={<AlertsPage />} />
              <Route path="/mapa" element={<MapView />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;