import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { useSpring, animated } from 'react-spring';
import '../../styles/monitoring/Monitoring.css';
import { MapContainer, TileLayer, Marker, Popup, useMap, LayersControl, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const MapView = ({ 
  airQualityData,
  center,
  zoom = 12,
  height = '400px',
  stations
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [neighborhoodData, setNeighborhoodData] = useState([]);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(null);
  const [loading, setLoading] = useState(true);

  // Obtener los datos de la nueva estructura
  const data = airQualityData?.data || {};
  
  // Determinar el centro del mapa basado en los datos de calidad del aire o usar un valor predeterminado
  const mapCenter = center || (data && data.coordinates ? 
    [data.coordinates.lat, data.coordinates.lon] : 
    [4.6486, -74.0664]); // Chapinero (centro de Bogotá) por defecto

  // Función para obtener datos de barrios - solo se ejecuta una vez al montar
  useEffect(() => {
    const fetchNeighborhoodData = async () => {
      try {
        // Intentamos obtener los datos del endpoint
        const response = await axios.get('/api/air-quality/neighborhoods');
        if (response.data && response.data.data) {
          setNeighborhoodData(response.data.data);
        }
      } catch (error) {
        console.error('Error al obtener datos de barrios:', error);
        // Usar datos de respaldo si no se pueden obtener
        setNeighborhoodData(generateFallbackNeighborhoodData());
      } finally {
        setLoading(false);
      }
    };

    fetchNeighborhoodData();
    
    // Limpieza al desmontar
    return () => {
      if (mapInstanceRef.current) {
        clearMapAndMarkers();
      }
    };
  }, []); // Solo se ejecuta al montar el componente

  // Función para generar datos de respaldo para los barrios
  const generateFallbackNeighborhoodData = () => {
    return [
      { name: 'Centro', lat: 4.5981, lon: -74.0761, description: 'Zona histórica y administrativa', aqi: 65, temperature: 21, humidity: 68 },
      { name: 'Chapinero', lat: 4.6486, lon: -74.0664, description: 'Zona comercial y residencial', aqi: 48, temperature: 20, humidity: 65 },
      { name: 'Usaquén', lat: 4.7062, lon: -74.0308, description: 'Zona residencial de alto nivel', aqi: 42, temperature: 19, humidity: 62 },
      { name: 'Kennedy', lat: 4.6297, lon: -74.1608, description: 'Zona residencial y comercial densamente poblada', aqi: 72, temperature: 22, humidity: 60 },
      { name: 'Suba', lat: 4.7449, lon: -74.0865, description: 'Zona mixta con áreas residenciales y humedales', aqi: 45, temperature: 18, humidity: 75 },
      { name: 'Fontibón', lat: 4.6739, lon: -74.1469, description: 'Zona industrial cercana al aeropuerto', aqi: 78, temperature: 21, humidity: 70 },
      { name: 'Puente Aranda', lat: 4.6269, lon: -74.1002, description: 'Zona industrial', aqi: 85, temperature: 22, humidity: 62 },
      { name: 'La Candelaria', lat: 4.5969, lon: -74.0736, description: 'Centro histórico', aqi: 55, temperature: 19, humidity: 68 },
      { name: 'Bosa', lat: 4.6280, lon: -74.2029, description: 'Zona residencial al sur', aqi: 68, temperature: 20, humidity: 66 },
      { name: 'Ciudad Bolívar', lat: 4.5100, lon: -74.1600, description: 'Zona periférica montañosa', aqi: 62, temperature: 17, humidity: 58 }
    ];
  };

  // Función para limpiar mapa y marcadores
  const clearMapAndMarkers = useCallback(() => {
    // Limpiar todos los marcadores
    if (markersRef.current.length > 0) {
      markersRef.current.forEach(marker => {
        if (marker) {
          try {
            marker.remove();
          } catch (e) {
            console.error("Error al eliminar marcador:", e);
          }
        }
      });
      markersRef.current = [];
    }
    
    // Eliminar el mapa
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      } catch (e) {
        console.error("Error al eliminar mapa:", e);
      }
    }
  }, []);

  // Función para actualizar marcadores
  const updateMarkers = useCallback(() => {
    if (!mapInstanceRef.current || !neighborhoodData.length) return;
    
    // Limpiar marcadores anteriores
    markersRef.current.forEach(marker => {
      if (marker) {
        try {
          marker.remove();
        } catch (e) {
          console.error("Error al eliminar marcador:", e);
        }
      }
    });
    markersRef.current = [];
    
    // Añadir marcador principal
    if (data && data.coordinates) {
      try {
        const aqiValue = data.aqi !== undefined ? data.aqi : 45;
        const cityValue = data.city || 'Bogotá';
        const tempValue = data.temperature !== undefined ? data.temperature : 20;
        const humidityValue = data.humidity !== undefined ? data.humidity : 65;
        const aqiColor = getAQIColor(aqiValue);
        
        const markerIcon = window.L.divIcon({
          className: 'custom-div-icon main-location',
          html: `<div style="background-color:${aqiColor}; width:35px; height:35px; border-radius:50%; border:2px solid white; display:flex; justify-content:center; align-items:center; color:white; font-weight:bold;">${aqiValue}</div>`,
          iconSize: [35, 35],
          iconAnchor: [17, 17]
        });
        
        const mainMarker = window.L.marker(mapCenter, { icon: markerIcon })
          .addTo(mapInstanceRef.current)
          .bindPopup(`
            <div class="map-popup">
              <h3>Calidad del Aire en ${cityValue}</h3>
              <p><strong>AQI:</strong> ${aqiValue} (${getAQICategory(aqiValue)})</p>
              <p><strong>Temperatura:</strong> ${tempValue}°C</p>
              <p><strong>Humedad:</strong> ${humidityValue}%</p>
              ${airQualityData?.simulated ? "<p><em>Datos simulados</em></p>" : ""}
            </div>
          `);
        
        markersRef.current.push(mainMarker);
      } catch (e) {
        console.error("Error al crear marcador principal:", e);
      }
    }
    
    // Añadir marcadores de barrios
    const neighborhoodMarkers = [];
    neighborhoodData.forEach(neighborhood => {
      if (neighborhood.lat && neighborhood.lon) {
        try {
          const aqiValue = neighborhood.aqi !== undefined ? neighborhood.aqi : 45;
          const aqiColor = getAQIColor(aqiValue);
          
          const markerIcon = window.L.divIcon({
            className: 'custom-div-icon neighborhood',
            html: `<div style="background-color:${aqiColor}; width:28px; height:28px; border-radius:50%; border:2px solid white; display:flex; justify-content:center; align-items:center; color:white; font-weight:bold; font-size: 12px;">${aqiValue}</div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 14]
          });
          
          const marker = window.L.marker([neighborhood.lat, neighborhood.lon], { icon: markerIcon, title: neighborhood.name })
            .addTo(mapInstanceRef.current)
            .bindPopup(`
              <div class="map-popup">
                <h3>${neighborhood.name}</h3>
                <p>${neighborhood.description || ''}</p>
                <p><strong>AQI:</strong> ${aqiValue} (${getAQICategory(aqiValue)})</p>
                <p><strong>Temperatura:</strong> ${neighborhood.temperature}°C</p>
                <p><strong>Humedad:</strong> ${neighborhood.humidity}%</p>
                <button class="view-details-btn" data-neighborhood="${neighborhood.name}">Ver más detalles</button>
              </div>
            `);
          
          marker.on('popupopen', () => {
            setTimeout(() => {
              const btn = document.querySelector(`.view-details-btn[data-neighborhood="${neighborhood.name}"]`);
              if (btn) {
                btn.addEventListener('click', () => {
                  setSelectedNeighborhood(neighborhood);
                });
              }
            }, 100);
          });
          
          neighborhoodMarkers.push(marker);
          markersRef.current.push(marker);
        } catch (e) {
          console.error(`Error al crear marcador para barrio ${neighborhood.name}:`, e);
        }
      }
    });
    
    // Ajustar vista a los marcadores de barrios
    if (neighborhoodMarkers.length > 0) {
      try {
        const group = window.L.featureGroup(neighborhoodMarkers);
        mapInstanceRef.current.fitBounds(group.getBounds(), { 
          padding: [50, 50],
          maxZoom: 13
        });
      } catch (e) {
        console.error("Error al ajustar vista del mapa:", e);
        try {
          mapInstanceRef.current.setView(mapCenter, zoom);
        } catch (e) {
          console.error("Error al establecer vista del mapa:", e);
        }
      }
    }
  }, [neighborhoodData, data, airQualityData, mapCenter, zoom]);

  // Efecto para inicializar o actualizar el mapa
  useEffect(() => {
    if (!window.L || !mapContainerRef.current) return;
    
    // Si el mapa ya existe, actualizarlo en lugar de recrearlo
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.setView(mapCenter, zoom);
        updateMarkers();
      } catch (e) {
        console.error("Error al actualizar mapa:", e);
        clearMapAndMarkers(); // Limpiar en caso de error
      }
      return;
    }
    
    // Inicializar el mapa si no existe
    try {
      mapInstanceRef.current = window.L.map(mapContainerRef.current).setView(mapCenter, zoom);
      
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstanceRef.current);
      
      // Añadir marcadores una vez que el mapa está inicializado
      if (neighborhoodData.length > 0) {
        updateMarkers();
      }
    } catch (e) {
      console.error("Error al inicializar mapa:", e);
    }
    
    // No es necesaria una limpieza aquí, se hace cuando el componente se desmonta
  }, [mapCenter, zoom, neighborhoodData.length, clearMapAndMarkers, updateMarkers]);

  // Función para obtener el color basado en AQI
  const getAQIColor = (aqi) => {
    if (!aqi && aqi !== 0) return '#999'; // Gris para datos no disponibles
    if (aqi <= 50) return '#00E400'; // Bueno - Verde
    if (aqi <= 100) return '#FFFF00'; // Moderado - Amarillo
    if (aqi <= 150) return '#FF7E00'; // Insalubre para grupos sensibles - Naranja
    if (aqi <= 200) return '#FF0000'; // Insalubre - Rojo
    if (aqi <= 300) return '#99004C'; // Muy insalubre - Púrpura
    return '#7E0023'; // Peligroso - Marrón
  };

  // Función para obtener la categoría de calidad del aire
  const getAQICategory = (aqi) => {
    if (!aqi && aqi !== 0) return 'No disponible';
    if (aqi <= 50) return 'Buena';
    if (aqi <= 100) return 'Moderada';
    if (aqi <= 150) return 'Insalubre para grupos sensibles';
    if (aqi <= 200) return 'Insalubre';
    if (aqi <= 300) return 'Muy insalubre';
    return 'Peligrosa';
  };

  // Panel de detalles del barrio seleccionado
  const NeighborhoodPanel = () => {
    const slideIn = useSpring({
      from: { transform: 'translateX(100%)', opacity: 0 },
      to: { transform: 'translateX(0)', opacity: 1 },
      config: { tension: 280, friction: 24 }
    });

    if (!selectedNeighborhood) return null;

    return (
      <animated.div style={slideIn} className="neighborhood-panel">
        <div className="panel-header">
          <h3>{selectedNeighborhood.name}</h3>
          <button className="close-btn" onClick={() => setSelectedNeighborhood(null)}>×</button>
        </div>
        <div className="panel-content">
          <p className="description">{selectedNeighborhood.description}</p>
          
          <div className="air-quality-indicator" style={{ backgroundColor: getAQIColor(selectedNeighborhood.aqi) }}>
            <span className="aqi-value">{selectedNeighborhood.aqi}</span>
            <span className="aqi-category">{getAQICategory(selectedNeighborhood.aqi)}</span>
          </div>
          
          <div className="weather-info">
            <div className="info-item">
              <span className="label">Temperatura</span>
              <span className="value">{selectedNeighborhood.temperature}°C</span>
            </div>
            <div className="info-item">
              <span className="label">Humedad</span>
              <span className="value">{selectedNeighborhood.humidity}%</span>
            </div>
          </div>
          
          <div className="recommendations">
            <h4>Recomendaciones</h4>
            <ul>
              {selectedNeighborhood.aqi <= 50 && (
                <li>Condiciones ideales para actividades al aire libre.</li>
              )}
              {selectedNeighborhood.aqi > 50 && selectedNeighborhood.aqi <= 100 && (
                <>
                  <li>Calidad del aire aceptable, pero podría haber riesgos para personas muy sensibles.</li>
                  <li>Personas con afecciones respiratorias deben limitar exposición prolongada.</li>
                </>
              )}
              {selectedNeighborhood.aqi > 100 && selectedNeighborhood.aqi <= 150 && (
                <>
                  <li>Grupos sensibles deben reducir actividad física prolongada al aire libre.</li>
                  <li>Personas con problemas respiratorios deben limitar exposición.</li>
                </>
              )}
              {selectedNeighborhood.aqi > 150 && selectedNeighborhood.aqi <= 200 && (
                <>
                  <li>Evitar actividades extenuantes al aire libre.</li>
                  <li>Adultos mayores y niños deben permanecer en interiores.</li>
                  <li>Usar mascarilla en exteriores si es necesario salir.</li>
                </>
              )}
              {selectedNeighborhood.aqi > 200 && (
                <>
                  <li>Evitar todas las actividades al aire libre.</li>
                  <li>Usar mascarilla con filtro si es imprescindible salir.</li>
                  <li>Mantener ventanas cerradas.</li>
                  <li>Considerar purificadores de aire en interiores.</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </animated.div>
    );
  };

  return (
    <div className="map-container" style={{ height, position: 'relative' }}>      
      {window.L ? (
        <div ref={mapContainerRef} className="map" style={{ height: '100%' }}>
          <MapContainer center={mapCenter} zoom={zoom} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LayersControl position="topright">
              <LayersControl.BaseLayer name="Mapa estándar" checked>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              </LayersControl.BaseLayer>
              <LayersControl.BaseLayer name="Satélite">
                <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
              </LayersControl.BaseLayer>
            </LayersControl>
            <ZoomControl position="bottomright" />
            
            {stations && stations.map((station, index) => (
              <Marker key={index} position={[station.lat, station.lon]}>
                <Popup>
                  {station.name}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      ) : (
        <div className="map-fallback">
          <p>Cargando mapa...</p>
          <p className="map-fallback-note">
            Para visualizar el mapa, asegúrate de incluir la biblioteca Leaflet en tu proyecto.
          </p>
        </div>
      )}
      
      {loading && (
        <div className="map-loading-overlay">
          <div className="spinner"></div>
          <p>Cargando datos de barrios...</p>
        </div>
      )}
      
      <NeighborhoodPanel />
    </div>
  );
};

export default MapView;