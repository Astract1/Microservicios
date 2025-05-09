import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';

// Componentes Layout
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy loading de páginas
const RiskEvaluation = lazy(() => import('./components/RiskEvaluation'));
const HistoricalData = lazy(() => import('./pages/HistoricalData'));
const Settings = lazy(() => import('./pages/Settings'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Componente de carga
const LoadingFallback = () => (
  <div className="loading-container">
    <div className="loading-spinner"></div>
    <p>Cargando...</p>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <div className="app">
        <Navbar />
        <div className="main-container">
          <Sidebar />
          <main className="content">
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={<RiskEvaluation />} />
                <Route path="/risk-evaluation" element={<RiskEvaluation />} />
                <Route path="/historical" element={<HistoricalData />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </main>
        </div>
        <Footer />
      </div>
    </ErrorBoundary>
  );
}

export default App;