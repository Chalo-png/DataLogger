import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const CenterButton = ({ center }) => {
  const map = useMap();

  const handleClick = () => {
    map.setView(center, map.getZoom());
  };

  return (
    <button
      onClick={handleClick}
      style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        zIndex: 1000,
        backgroundColor: 'white',
        border: 'none',
        borderRadius: '2px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
        padding: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 'bold',
        color: '#333',
      }}
    >
      Centrar
    </button>
  );
};

const ToggleMarkersButton = ({ showMarkers, toggleMarkers }) => {
  return (
    <button
      onClick={toggleMarkers}
      style={{
        position: 'absolute',
        top: '50px', // Ajusta la posición vertical para que no se superponga con el botón de centrar
        right: '10px',
        zIndex: 1000,
        backgroundColor: 'white',
        border: 'none',
        borderRadius: '2px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
        padding: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 'bold',
        color: '#333',
      }}
    >
      {showMarkers ? 'Ocultar Marcadores' : 'Mostrar Marcadores'}
    </button>
  );
};

const SensorMap = () => {
  const [sensorData, setSensorData] = useState([]);
  const [showMarkers, setShowMarkers] = useState(true);

  useEffect(() => {
    const sensorCollectionRef = collection(db, "datalogger", "2025-2-7", "Sensor_y_GPS");
    
    const unsubscribe = onSnapshot(sensorCollectionRef, (snapshot) => {
      const rawData = snapshot.docs
        .map(doc => doc.data())
        .filter(item => item.latitud !== 0 && item.longitud !== 0);

      const sortedData = [...rawData].sort((a, b) => a.hora.localeCompare(b.hora));
      setSensorData(sortedData);
    });

    return () => unsubscribe();
  }, []);

  const positions = sensorData.map(item => [item.latitud, item.longitud]);
  const polylines = [positions];

  // Calculate center dynamically if data exists
  const mapCenter = sensorData.length > 0 
    ? [sensorData[0].latitud, sensorData[0].longitud]
    : [-33.426327667, -70.591642];

  const lastPosition = sensorData.length > 0 
    ? [sensorData[sensorData.length - 1].latitud, sensorData[sensorData.length - 1].longitud]
    : mapCenter;

  const toggleMarkers = () => {
    setShowMarkers(!showMarkers);
  };

  return (
    <div className="bg-white rounded-xl shadow-2xl p-8 my-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Mapa de Sensores en Tiempo Real</h2>
      <MapContainer 
        center={mapCenter}
        zoom={14} 
        style={{ height: '500px', width: '100%', position: 'relative' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        
        {showMarkers && sensorData.map((point, index) => (
          <Marker key={index} position={[point.latitud, point.longitud]}>
            <Popup className="leaflet-popup-custom">
              <div className="space-y-1">
                <p className="font-semibold">Hora: {point.hora}</p>
                <p className="text-red-600">Temp: {point.temperatura}°C</p>
                <p className="text-blue-600">Humedad: {point.humedad}%</p>
              </div>
            </Popup>
          </Marker>
        ))}
        
        <Polyline positions={polylines} color="blue" />
        <CenterButton center={lastPosition} />
        <ToggleMarkersButton showMarkers={showMarkers} toggleMarkers={toggleMarkers} />
      </MapContainer>
    </div>
  );
};

export default SensorMap;