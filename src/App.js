import React from 'react';
import GraficoFirestore from './components/GraficoFirestore';
import SensorMap from './components/SensorMap';
import './App.css';
import { Container } from 'react-bootstrap';

function App() {
  return (
    <Container className="custom-container" fluid>
      <div className="d-flex flex-column align-items-center">
        <div className="mb-2">
          <SensorMap />
        </div>
        <div>
          <GraficoFirestore />
        </div>
      </div>
    </Container>
  );
}

export default App;