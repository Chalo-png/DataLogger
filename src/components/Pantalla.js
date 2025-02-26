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
      position: 'absolute',
      top: '20px',
      right: '90px',
      background: 'white',
      padding: '10px 10px',
      border: '1px solid #ddd',
      borderRadius: '15px',
      zIndex: 1000,
      fontFamily: 'Arial, sans-serif',
      fontSize: '1.1rem',
      boxShadow: '0 3px 8px rgba(0,0,0,0.15)',
      minWidth: '100px',
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '10px',
        textAlign: 'center',
      }}>
        <div>
          <div style={{
            fontWeight: 'bold',
            marginBottom: '2px',
            fontSize: '1rem',
            color: '#444',
          }}>Tintervalo</div>
          <div style={{
            padding: '4px 0',
            fontWeight: '500',
          }}>{config ? config.dataInterval : '...'}</div>
        </div>
        
        <div>
          <div style={{
            fontWeight: 'bold',
            marginBottom: '2px',
            fontSize: '1rem',
            color: '#444',
          }}>Tdeepsleep</div>
          <div style={{
            padding: '2px 0',
            fontWeight: '500',
          }}>{config ? config.sleepTime : '...'}</div>
        </div>
        
        <div>
          <div style={{
            fontWeight: 'bold',
            marginBottom: '2px',
            fontSize: '1rem',
            color: '#444',
          }}>Twakeup</div>
          <div style={{
            padding: '2px 0',
            fontWeight: '500',
          }}>{config ? config.wakeTime : '...'}</div>
        </div>
      </div>
    </div>
  );
};

export default Pantalla;