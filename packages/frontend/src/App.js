import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import './styles/App.css';

// Componentes de Layout
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';
import LoadingSpinner from './components/common/LoadingSpinner';

// Lazy loading de módulos
const Dashboard = lazy(() => import('./pages/Dashboard'));

// Módulo Monitoring
const Monitoring = lazy(() => import('./pages/monitoring/Monitoring'));
const HistoricalData = lazy(() => import('./pages/monitoring/HistoricalData'));

// Módulo Risk
const RiskEvaluation = lazy(() => import('./pages/risk/RiskEvaluation'));
const RiskSettings = lazy(() => import('./pages/risk/Settings'));

// Módulo Education
const Education = lazy(() => import('./pages/education/Education'));
const Courses = lazy(() => import('./pages/education/Courses'));

// Módulo Prevention
const Prevention = lazy(() => import('./pages/prevention/Prevention'));
const PreventiveActions = lazy(() => import('./pages/prevention/PreventiveActions'));

// Página 404
const NotFound = lazy(() => import('./pages/NotFound'));

function App() {
  return (
    <div className="app">
      <Navbar />
      <div className="main-container">
        <Sidebar />
        <main className="content">
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* Ruta principal */}
              <Route path="/" element={<Dashboard />} />
              
              {/* Rutas de Monitoring */}
              <Route path="/monitoring" element={<Monitoring />} />
              <Route path="/monitoring/historical" element={<HistoricalData />} />
              
              {/* Rutas de Risk */}
              <Route path="/risk" element={<RiskEvaluation />} />
              <Route path="/risk/settings" element={<RiskSettings />} />
              
              {/* Rutas de Education */}
              <Route path="/education" element={<Education />} />
              <Route path="/education/courses" element={<Courses />} />
              
              {/* Rutas de Prevention */}
              <Route path="/prevention" element={<Prevention />} />
              <Route path="/prevention/actions" element={<PreventiveActions />} />
              
              {/* Ruta para páginas no encontradas */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default App; 