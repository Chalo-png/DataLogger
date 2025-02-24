// pantalla

// src/components/Pantalla.js
import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot } from "firebase/firestore";

const Pantalla = () => {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    const configDocRef = doc(db, "datalogger", "config", "times", "config");
    const unsubscribe = onSnapshot(
      configDocRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          setConfig(docSnapshot.data());
        } else {
          setConfig(null);
        }
      },
      (error) => {
        console.error("Error al obtener la configuración:", error);
      }
    );
    return () => unsubscribe();
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '90px', // Ajusta este valor para que quede al lado de la tuerca
      background: 'white',
      padding: '10px',
      border: '1px solid #ccc',
      borderRadius: '8px',
      zIndex: 1000,
      fontFamily: 'Arial, sans-serif',
      fontSize: '0.9rem'
    }}>
      <table>
        <thead>
          <tr>
            <th style={{ padding: '0 5px' }}>Tintervalo</th>
            <th style={{ padding: '0 5px' }}>Tdeepsleep</th>
            <th style={{ padding: '0 5px' }}>Twakeup</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ textAlign: 'center', padding: '0 5px' }}>
              {config ? config.dataInterval : '...'}
            </td>
            <td style={{ textAlign: 'center', padding: '0 5px' }}>
              {config ? config.sleepTime : '...'}
            </td>
            <td style={{ textAlign: 'center', padding: '0 5px' }}>
              {config ? config.wakeTime : '...'}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Pantalla;
