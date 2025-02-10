import React, { useState } from 'react';
import GraficoFirestore from './components/GraficoFirestore';
import SensorMap from './components/SensorMap';
import './App.css';
import { Container } from 'react-bootstrap';

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date(2025, 1, 7)); // 2025-02-07
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [selectedPointIndex, setSelectedPointIndex] = useState(null);


  return (
    <Container className="custom-container" fluid>
      <div className="d-flex flex-column align-items-center">
        <div className="mb-2">
        <SensorMap
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          selectedMarker={selectedMarker}
          setSelectedMarker={setSelectedMarker}
          selectedPoint={selectedPoint}
          setSelectedPoint={setSelectedPoint}
          setSelectedPointIndex={setSelectedPointIndex}  // Nueva prop para actualizar el índice
        />

        </div>
        <div>
          <GraficoFirestore selectedDate={selectedDate} setSelectedMarker={setSelectedMarker}  setSelectedPoint={setSelectedPoint} selectedMarker={selectedMarker} selectedPointIndex={selectedPointIndex} setSelectedPointIndex={setSelectedPointIndex} />
        </div>
      </div>
    </Container>
  );
}

export default App;
