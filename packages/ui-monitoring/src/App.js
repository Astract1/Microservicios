import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Componentes de página
import Dashboard from './components/Dashboard/Dashboard';
import AirQualityPage from './components/AirQuality/AirQualityPage';
import WeatherPage from './components/Weather/WeatherPage';
import RainfallPage from './components/Rainfall/RainfallPage';
import AlertsPage from './components/Alerts/AlertsPage';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

// Estilos
import './styles/index.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/calidad-aire" element={<AirQualityPage />} />
            <Route path="/clima" element={<WeatherPage />} />
            <Route path="/precipitaciones" element={<RainfallPage />} />
            <Route path="/alertas" element={<AlertsPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;