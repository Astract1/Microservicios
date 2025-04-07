import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Importa el marcador de Leaflet para arreglar el ícono
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const SimpleMapView = () => {
  useEffect(() => {
    // Fix para los íconos de Leaflet
    if (typeof window !== 'undefined') {
      const L = require('leaflet');
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: icon,
        iconUrl: icon,
        shadowUrl: iconShadow
      });
    }
  }, []);
  
  // Coordenadas de Bogotá
  const defaultCenter = [4.6097, -74.0817];
  
  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-6">Mapa de Monitoreo Ambiental</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="h-[600px] w-full rounded-lg overflow-hidden">
          <MapContainer 
            center={defaultCenter} 
            zoom={12} 
            style={{ height: '100%', width: '100%' }}
          >
            {/* Mapa base de OpenStreetMap */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Marcador de ejemplo */}
            <Marker position={defaultCenter}>
              <Popup>
                <div className="text-center">
                  <h3 className="font-bold">Centro de Bogotá</h3>
                  <p className="text-sm">Ubicación de ejemplo</p>
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          <p>Mapa básico implementado con OpenStreetMap y Leaflet</p>
        </div>
      </div>
    </div>
  );
};

export default SimpleMapView;