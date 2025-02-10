import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const CenterButton = ({ center, selectedMarker, sensorData, selectedPoint }) => {
  const map = useMap();

  const handleClick = () => {
    let newCenter = center;

    if (selectedMarker) {
      // Buscar el punto en el sensorData que coincida con la hora del marcador seleccionado
      const matchingPoint = sensorData.find(point => point.hora === selectedMarker.hora);

      if (matchingPoint) {
        newCenter = [matchingPoint.latitud, matchingPoint.longitud];
      } else {
        console.warn('No se encontraron coordenadas para el marcador seleccionado.');
      }
    }
    if (selectedPoint) {
      // Buscar el punto en el sensorData que coincida con la hora del marcador seleccionado
      const matchingPoint = sensorData.find(point => point.hora === selectedPoint.hora);

      if (matchingPoint) {
        newCenter = [matchingPoint.latitud, matchingPoint.longitud];
      } else {
        console.warn('No se encontraron coordenadas para el marcador seleccionado.');
      }
    }
    // Centrar el mapa en la posición final
    map.setView(newCenter, map.getZoom());
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


const ToggleMarkersButton = ({ showMarkers, toggleMarkers, selectedPoint }) => {
  const buttonText = selectedPoint 
    ? 'Mostrar todos los marcadores'
    : (showMarkers ? 'Ocultar los marcadores' : 'Mostrar todos los marcadores');

  return (
    <button
      onClick={toggleMarkers}
      style={{
        position: 'absolute',
        top: '50px',
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
      {buttonText}
    </button>
  );
};

const SensorMap = ({ selectedDate, setSelectedDate, selectedMarker, setSelectedMarker }) => {
  const [sensorData, setSensorData] = useState([]);
  const [showMarkers, setShowMarkers] = useState(true);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const formatTime = (time) => {
    const [hours, minutes, seconds = '00'] = time.split(":").map(unit => parseInt(unit, 10));
    const pad = (num) => String(num).padStart(2, "0");
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  useEffect(() => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth() + 1;
    const day = selectedDate.getDate();
    const formattedDate = `${year}-${month}-${day}`;
    const sensorCollectionRef = collection(db, "datalogger", formattedDate, "Sensor_y_GPS");

    const unsubscribe = onSnapshot(sensorCollectionRef, (snapshot) => {
      const rawData = snapshot.docs
        .map(doc => doc.data())
        .filter(item => item.latitud !== 0 && item.longitud !== 0)
        .map(item => ({ ...item, hora: formatTime(item.hora) }));  // Formatear la hora

      const sortedData = [...rawData].sort((a, b) => a.hora.localeCompare(b.hora));
      setSensorData(sortedData);
    });

    return () => unsubscribe();
  }, [selectedDate]);

  const handleMarkerClick = (point) => {
    setSelectedPoint(point);
    setShowMarkers(false);  // Oculta todos los demás puntos
  };

  const toggleMarkers = () => {
    if (selectedPoint || selectedMarker) {
      setSelectedPoint(null);
      setSelectedMarker(null);
      setShowMarkers(true);
    } else {
      setShowMarkers(!showMarkers);
    }
  };

  
    
  

  let warningMessage = '';

  const filteredMarkers = selectedPoint
    ? [selectedPoint]
    : (selectedMarker 
        ? (() => {
            const result = sensorData.filter((item) => item.hora === formatTime(selectedMarker.hora));
            if (result.length === 0) {
                warningMessage = 'No existe longitud ni latitud del dato debido a que el dispositivo se estaba apagando o prendiendo.';
            }
            return result;
        })()
        : (showMarkers ? sensorData : [])
      );

  // Mostrar la advertencia si es necesario
  if (warningMessage) {
      console.warn(warningMessage);  // Puedes reemplazar con un alert() o cualquier otro mecanismo de notificación
  }

    
  
  const positions = sensorData.map(item => [item.latitud, item.longitud]);
  const polylines = [positions];

  const mapCenter = sensorData.length > 0 
    ? [sensorData[0].latitud, sensorData[0].longitud]
    : [-33.426327667, -70.591642];

  const lastPosition = sensorData.length > 0 
    ? [sensorData[sensorData.length - 1].latitud, sensorData[sensorData.length - 1].longitud]
    : mapCenter;



  const handleConfirm = (date) => {
    setSelectedDate(date);
    setShowModal(false);
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
        
        {filteredMarkers.map((point, index) => (
          <Marker
            key={index}
            position={[point.latitud, point.longitud]}
            eventHandlers={{
              click: () => handleMarkerClick(point),  // Maneja el clic en el marcador
            }}
          >
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
  
        <CenterButton 
          center={lastPosition} 
          selectedMarker={selectedMarker} 
          sensorData={sensorData}
          selectedPoint={selectedPoint}
        />

  
        <ToggleMarkersButton showMarkers={showMarkers} toggleMarkers={toggleMarkers} selectedPoint={selectedPoint} />
  
        {/* Select Date Button */}
        <button
          onClick={() => setShowModal(true)}
          style={{
            position: 'absolute',
            bottom: '10px',
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
          <FontAwesomeIcon icon={faCalendarAlt} /> Seleccionar Fecha
        </button>
      </MapContainer>
  
      {/* Modal for Date Selection */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1001,
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
        }}>
          <DatePicker
            selected={selectedDate}
            onChange={date => setSelectedDate(date)}
            inline
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
            <button
              onClick={() => setShowModal(false)}
              style={{
                backgroundColor: '#ccc',
                border: 'none',
                borderRadius: '4px',
                padding: '8px 16px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => handleConfirm(selectedDate)}
              style={{
                backgroundColor: '#007bff',
                border: 'none',
                borderRadius: '4px',
                padding: '8px 16px',
                cursor: 'pointer',
                color: 'white',
              }}
            >
              Confirm
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SensorMap;