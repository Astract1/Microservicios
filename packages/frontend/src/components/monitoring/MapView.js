import React, { useEffect, useRef } from 'react';
import '../../styles/monitoring/Monitoring.css';

const MapView = ({ 
  airQualityData,
  center,
  zoom = 13,
  height = '400px'
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  // Obtener los datos de la nueva estructura
  const data = airQualityData?.data || {};
  
  // Determinar el centro del mapa basado en los datos de calidad del aire o usar un valor predeterminado
  const mapCenter = center || (data && data.coordinates ? 
    [data.coordinates.lat, data.coordinates.lon] : 
    [4.710989, -74.072092]); // Bogotá por defecto

  useEffect(() => {
    // Verificar si Leaflet está disponible globalmente
    if (window.L && mapRef.current && !mapInstanceRef.current) {
      // Inicializar el mapa
      mapInstanceRef.current = window.L.map(mapRef.current).setView(mapCenter, zoom);

      // Añadir capa de mapa base (OpenStreetMap)
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstanceRef.current);

      // Siempre mostrar un marcador con datos, ya sean reales o simulados
      if (data && data.coordinates) {
        // Asegurarnos de tener valores simulados si no hay datos reales
        const aqiValue = data.aqi !== undefined ? data.aqi : 45;
        const cityValue = data.city || 'Bogotá';
        const tempValue = data.temperature !== undefined ? data.temperature : 20;
        const humidityValue = data.humidity !== undefined ? data.humidity : 65;
        const aqiColor = getAQIColor(aqiValue);
        
        // Crear icono personalizado con color basado en AQI
        const markerIcon = window.L.divIcon({
          className: 'custom-div-icon',
          html: `<div style="background-color:${aqiColor}; width:30px; height:30px; border-radius:50%; border:2px solid white; display:flex; justify-content:center; align-items:center; color:white; font-weight:bold;">${aqiValue}</div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        });
        
        // Añadir marcador con popup
        window.L.marker(mapCenter, { icon: markerIcon })
          .addTo(mapInstanceRef.current)
          .bindPopup(`
            <div class="map-popup">
              <h3>Calidad del Aire en ${cityValue}</h3>
              <p><strong>AQI:</strong> ${aqiValue} (${getAQICategory(aqiValue)})</p>
              <p><strong>Temperatura:</strong> ${tempValue}°C</p>
              <p><strong>Humedad:</strong> ${humidityValue}%</p>
              ${airQualityData.simulated ? "<p><em>Datos simulados</em></p>" : ""}
            </div>
          `);
      }
    }

    // Función de limpieza
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mapCenter, zoom, airQualityData, data]);

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

  return (
    <div className="map-container" style={{ height }}>
      {window.L ? (
        <div ref={mapRef} className="map" style={{ height: '100%' }}></div>
      ) : (
        <div className="map-fallback">
          <p>Cargando mapa...</p>
          <p className="map-fallback-note">
            Para visualizar el mapa, asegúrate de incluir la biblioteca Leaflet en tu proyecto.
          </p>
        </div>
      )}
    </div>
  );
};

export default MapView; 