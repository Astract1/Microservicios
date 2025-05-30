// Importar rutas
const airQualityRoutes = require('./routes/airQuality');
const weatherRoutes = require('./routes/weather');
const alertsRoutes = require('./routes/alerts');
const healthRoutes = require('./routes/health');

function App() {
  return (
    <div className="container">
      <h1 className="text-center">Monitoreo Ambiental</h1>
      <div className="card">
        <p>Sistema de monitoreo ambiental funcionando correctamente.</p>
      </div>
    </div>
  );
}

export default App;
