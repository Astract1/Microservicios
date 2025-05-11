import React, { useEffect, useRef } from 'react';
import '../../styles/monitoring/Monitoring.css';

const MapView = ({ 
  center = [40.416775, -3.703790], // Madrid por defecto
  zoom = 13,
  markers = [],
  height = '400px'
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  // Datos de marcadores de ejemplo si no se proporcionan
  const defaultMarkers = [
    { id: 1, position: [40.416775, -3.703790], title: 'Estación Centro', type: 'air' },
    { id: 2, position: [40.426775, -3.713790], title: 'Estación Norte', type: 'weather' },
    { id: 3, position: [40.406775, -3.693790], title: 'Estación Sur', type: 'alert' }
  ];

  const displayMarkers = markers.length > 0 ? markers : defaultMarkers;

  useEffect(() => {
    // Verificar si Leaflet está disponible globalmente (asumiendo que se carga desde CDN)
    if (window.L && mapRef.current && !mapInstanceRef.current) {
      // Inicializar el mapa
      mapInstanceRef.current = window.L.map(mapRef.current).setView(center, zoom);

      // Añadir capa de mapa base (OpenStreetMap)
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstanceRef.current);

      // Añadir marcadores
      displayMarkers.forEach(marker => {
        const markerIcon = getMarkerIcon(marker.type);
        
        window.L.marker(marker.position, { icon: markerIcon })
          .addTo(mapInstanceRef.current)
          .bindPopup(marker.title);
      });
    } else {
      // Mostrar un mensaje si Leaflet no está disponible
      console.warn('Leaflet no está disponible. Asegúrate de incluir la biblioteca en tu proyecto.');
    }

    // Función de limpieza
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [center, zoom, displayMarkers]);

  // Función para determinar el icono basado en el tipo de marcador
  const getMarkerIcon = (type) => {
    // Esta función depende de Leaflet, así que solo la usaremos si está disponible
    if (!window.L) return null;

    const iconUrl = getIconUrlByType(type);
    
    // Utilizar un icono personalizado si está disponible Leaflet
    return window.L.icon({
      iconUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34]
    });
  };

  // Función para obtener la URL del icono basado en el tipo
  const getIconUrlByType = (type) => {
    // En una implementación real, estas serían rutas a imágenes de iconos reales
    // Para este ejemplo, usaremos los iconos por defecto de Leaflet
    switch (type) {
      case 'air':
        return 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png';
      case 'weather':
        return 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png';
      case 'alert':
        return 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png';
      default:
        return 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png';
    }
  };

  return (
    <div className="map-container" style={{ height }}>
      {window.L ? (
        <div ref={mapRef} className="map"></div>
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