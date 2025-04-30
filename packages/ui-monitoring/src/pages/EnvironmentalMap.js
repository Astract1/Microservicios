import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import './EnvironmentalMap.css';
import MillerLawToggle from '../components/layout/MillerLawToggle';

// Servicios
import { fetchMapData } from '../services/monitoringService';

const EnvironmentalMap = () => {
  const [mapData, setMapData] = useState({
    monitoringStations: [],
    pollutantAreas: [],
    weatherAlerts: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapCenter, setMapCenter] = useState([19.4326, -99.1332]); // Default: Ciudad de México
  const [mapZoom, setMapZoom] = useState(12);
  const [isMillerLawApplied, setIsMillerLawApplied] = useState(false);

  const toggleMillerLaw = () => {
    setIsMillerLawApplied(!isMillerLawApplied);
  };

  useEffect(() => {
    const loadMapData = async () => {
      try {
        setLoading(true);
        const data = await fetchMapData();
        setMapData(data);
        
        // Si hay estaciones de monitoreo, centrar el mapa en la primera
        if (data.monitoringStations.length > 0) {
          setMapCenter([
            data.monitoringStations[0].latitude,
            data.monitoringStations[0].longitude
          ]);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error al cargar datos del mapa:', err);
        setError('Error al cargar datos del mapa. Por favor, intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    loadMapData();
  }, []);

  // Función para determinar el color del círculo según el nivel de contaminación
  const getPollutantColor = (level) => {
    if (level < 50) return '#2ecc71';  // Verde - Bueno
    if (level < 100) return '#f1c40f'; // Amarillo - Moderado
    if (level < 150) return '#e67e22'; // Naranja - Insalubre para grupos sensibles
    if (level < 200) return '#e74c3c'; // Rojo - Insalubre
    if (level < 300) return '#9b59b6'; // Púrpura - Muy insalubre
    return '#800000';                  // Marrón - Peligroso
  };

  if (loading) {
    return <div className="loading-container">Cargando mapa ambiental...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  // Aplicar Ley de Miller a los datos del mapa
  const displayStations = isMillerLawApplied 
    ? mapData.monitoringStations.slice(0, 3) // Mostrar solo 3 estaciones principales
    : mapData.monitoringStations;
    
  const displayAreas = isMillerLawApplied
    ? mapData.pollutantAreas.slice(0, 2) // Mostrar solo 2 áreas principales
    : mapData.pollutantAreas;

  return (
    <div className="environmental-map-container">
      <div className="map-header">
        <h1>Mapa de Monitoreo Ambiental</h1>
        <div className="miller-law-container">
          <MillerLawToggle 
            onToggle={toggleMillerLaw}
            isMillerLawApplied={isMillerLawApplied}
          />
        </div>
      </div>
      
      <div className={`map-filters ${isMillerLawApplied ? 'miller-law-applied' : ''}`}>
        <div className="filter-group">
          <h3>Capas</h3>
          <div className="filter-options">
            <label>
              <input type="checkbox" defaultChecked /> Estaciones de monitoreo
            </label>
            <label>
              <input type="checkbox" defaultChecked /> Áreas de contaminación
            </label>
            {!isMillerLawApplied && (
              <label>
                <input type="checkbox" defaultChecked /> Alertas meteorológicas
              </label>
            )}
          </div>
        </div>
        
        <div className="filter-group">
          <h3>Tipo de contaminantes</h3>
          <div className="filter-options">
            <label>
              <input type="checkbox" defaultChecked /> PM2.5
            </label>
            <label>
              <input type="checkbox" defaultChecked /> PM10
            </label>
            {!isMillerLawApplied && (
              <>
                <label>
                  <input type="checkbox" defaultChecked /> Ozono (O₃)
                </label>
                <label>
                  <input type="checkbox" defaultChecked /> Dióxido de nitrógeno (NO₂)
                </label>
              </>
            )}
          </div>
        </div>
      </div>
      
      <div className={`map-legend ${isMillerLawApplied ? 'miller-law-applied' : ''}`}>
        <h3>Leyenda</h3>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#2ecc71' }}></span>
          <span className="legend-label">Buena (0-50)</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#f1c40f' }}></span>
          <span className="legend-label">Moderada (51-100)</span>
        </div>
        {!isMillerLawApplied && (
          <>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#e67e22' }}></span>
              <span className="legend-label">Insalubre para grupos sensibles (101-150)</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#e74c3c' }}></span>
              <span className="legend-label">Insalubre (151-200)</span>
            </div>
          </>
        )}
        {!isMillerLawApplied && (
          <>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#9b59b6' }}></span>
              <span className="legend-label">Muy insalubre (201-300)</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#800000' }}></span>
              <span className="legend-label">Peligrosa (301+)</span>
            </div>
          </>
        )}
      </div>
      
      <div className="map-wrapper">
        <MapContainer center={mapCenter} zoom={mapZoom} scrollWheelZoom={true}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Estaciones de monitoreo */}
          {displayStations.map((station) => (
            <Marker
              key={station.id}
              position={[station.latitude, station.longitude]}
            >
              <Popup>
                <div className="station-popup">
                  <h3>{station.name}</h3>
                  <p><strong>Tipo:</strong> {station.type}</p>
                  <p><strong>AQI:</strong> {station.aqi}</p>
                  <p><strong>Último reporte:</strong> {station.lastUpdate}</p>
                  <div className="pollutant-list">
                    {station.pollutants.map((pollutant) => (
                      <div key={pollutant.name} className="pollutant-item">
                        <span>{pollutant.name}: </span>
                        <span className={`pollutant-value ${pollutant.level}`}>
                          {pollutant.value} {pollutant.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
          
          {/* Áreas de contaminación */}
          {displayAreas.map((area) => (
            <Circle
              key={area.id}
              center={[area.latitude, area.longitude]}
              pathOptions={{ fillColor: getPollutantColor(area.level), color: getPollutantColor(area.level) }}
              radius={area.radius}
              fillOpacity={0.3}
            >
              <Popup>
                <div className="pollutant-popup">
                  <h3>{area.name}</h3>
                  <p><strong>Nivel AQI:</strong> {area.level}</p>
                  <p><strong>Principal contaminante:</strong> {area.mainPollutant}</p>
                  <p><strong>Radio afectado:</strong> {area.radius / 1000} km</p>
                  <p><strong>Último reporte:</strong> {area.lastUpdate}</p>
                </div>
              </Popup>
            </Circle>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default EnvironmentalMap; 