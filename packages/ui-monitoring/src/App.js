import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Componentes Layout
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';

// Páginas
import Dashboard from './pages/Dashboard';
import WeatherMonitoring from './pages/WeatherMonitoring';
import AirQualityMonitoring from './pages/AirQualityMonitoring';
import EnvironmentalMap from './pages/EnvironmentalMap';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <div className="main-container">
          <Sidebar />
          <main className="content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/weather" element={<WeatherMonitoring />} />
              <Route path="/air-quality" element={<AirQualityMonitoring />} />
              <Route path="/environmental-map" element={<EnvironmentalMap />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App; 