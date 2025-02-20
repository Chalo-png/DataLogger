import React, { useState } from 'react';
import { Container, Navbar, Button } from 'react-bootstrap';
import { GearFill } from 'react-bootstrap-icons'; // Icono de tuerca
import GraficoFirestore from './components/GraficoFirestore';
import SensorMap from './components/SensorMap';
import './App.css';

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [selectedPointIndex, setSelectedPointIndex] = useState(null);

  console.log('selectedDate:', selectedDate);
  console.log('selectedMarker:', selectedMarker);
  console.log('selectedPoint:', selectedPoint);
  console.log('selectedPointIndex:', selectedPointIndex);

  return (
    <Container className="custom-container" fluid>
      {/* Barra de navegación con título y botón de configuración */}
      <Navbar bg="dark" variant="dark" className="w-100 px-3 mb-3 d-flex justify-content-between align-items-center">
        <h1 className="text-light m-0">Monitoreo de Sensores</h1>
        <Button variant="outline-light" onClick={() => alert('Abrir configuración')}>
          <GearFill size={24} />
        </Button>
      </Navbar>

      {/* Título de la página */}
      <h2 className="text-center my-4">Mapa y Gráfico Datalogger</h2>

      <div className="d-flex flex-column align-items-center">
        <div className="mb-2">
          <SensorMap
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            selectedMarker={selectedMarker}
            setSelectedMarker={setSelectedMarker}
            selectedPoint={selectedPoint}
            setSelectedPoint={setSelectedPoint}
            setSelectedPointIndex={setSelectedPointIndex}
          />
        </div>
        <div>
          <GraficoFirestore
            selectedDate={selectedDate}
            setSelectedMarker={setSelectedMarker}
            setSelectedPoint={setSelectedPoint}
            selectedMarker={selectedMarker}
            selectedPointIndex={selectedPointIndex}
            setSelectedPointIndex={setSelectedPointIndex}
          />
        </div>
      </div>
    </Container>
  );
}

export default App;