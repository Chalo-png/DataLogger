import React, { useState, useCallback, useMemo } from 'react';
import { Container, Navbar } from 'react-bootstrap';
import GraficoFirestore from './components/GraficoFirestore';
import SensorMap from './components/SensorMap';
import Tuerca from './components/tuerca';
import './App.css';

function App() {
  const [state, setState] = useState({
    selectedDate: new Date(),
    selectedMarker: null,
    selectedPoint: null,
    selectedPointIndex: null,
  });

  const handleStateChange = useCallback((key, value) => {
    setState((prev) => ({ ...prev, [key]: value }));
  }, []);

  const memoizedDate = useMemo(() => state.selectedDate, [state.selectedDate]);

  return (
    <Container className="custom-container" fluid>
      <Navbar bg="dark" variant="dark" className="w-100 px-3 mb-3">
        <h1 className="text-light m-0">MF</h1>
      </Navbar>

      {/* Componente Tuerca */}
      <Tuerca />

      {/* Se comenta la línea del título para eliminarlo */}
      {/*
      <h2 className="text-center my-4">Bienvenido al Sistema de Monitoreo de Sensores</h2>
      */}

      <div className="d-flex flex-column align-items-center">
        <div className="mb-2">
          <SensorMap
            selectedDate={memoizedDate}
            setSelectedDate={(value) => handleStateChange('selectedDate', value)}
            selectedMarker={state.selectedMarker}
            setSelectedMarker={(value) => handleStateChange('selectedMarker', value)}
            selectedPoint={state.selectedPoint}
            setSelectedPoint={(value) => handleStateChange('selectedPoint', value)}
            setSelectedPointIndex={(value) => handleStateChange('selectedPointIndex', value)}
          />
        </div>
        <div>
          <GraficoFirestore
            selectedDate={memoizedDate}
            selectedMarker={state.selectedMarker}
            setSelectedMarker={(value) => handleStateChange('selectedMarker', value)}
            selectedPoint={state.selectedPoint}
            setSelectedPoint={(value) => handleStateChange('selectedPoint', value)}
            selectedPointIndex={state.selectedPointIndex}
            setSelectedPointIndex={(value) => handleStateChange('selectedPointIndex', value)}
          />
        </div>
      </div>
    </Container>
  );
}

export default App;
