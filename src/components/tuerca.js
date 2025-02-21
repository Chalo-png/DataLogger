// components/Tuerca.js
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, setDoc, getDoc } from "firebase/firestore";
import { GearFill } from 'react-bootstrap-icons';

const Tuerca = () => {
    const [showConfig, setShowConfig] = useState(false);
    const [configTimes, setConfigTimes] = useState({
      dataInterval: '',
      sleepTime: '',
      wakeTime: ''
    });

    useEffect(() => {
        const fetchConfig = async () => {
          try {
            const docRef = doc(db, "configuracion", "tiempos");
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
              setConfigTimes(docSnap.data());
            }
          } catch (error) {
            console.error("Error obteniendo la configuración:", error);
          }
        };
    
        fetchConfig();
    }, []);

    // Función para actualizar el estado cuando cambian los valores
    const handleConfigChange = (e) => {
        const { name, value } = e.target;
        setConfigTimes(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Función para guardar los valores cuando el usuario hace clic en "Guardar"
    const handleConfigSubmit = async (e) => {
        e.preventDefault(); // Evita que la página se recargue

        try {
            const updatedConfig = {
                dataInterval: Number(configTimes.dataInterval),
                sleepTime: Number(configTimes.sleepTime),
                wakeTime: Number(configTimes.wakeTime)
            };

            await setDoc(doc(db, "datalogger", "config", "times", "config"), updatedConfig);
            console.log("Configuración guardada en Firestore:", updatedConfig);
            setShowConfig(false);
        } catch (error) {
            console.error("Error al guardar la configuración:", error);
            alert("Hubo un error al guardar la configuración");
        }
    };

    return (
        <>
            <button
                style={{ position: "fixed", top: "20px", right: "20px", zIndex: 1000, background: "none", border: "none", cursor: "pointer", padding: "8px", transition: "transform 0.2s" }}
                onClick={() => setShowConfig(true)}
            >
                <GearFill size={24} color="#333" />
            </button>

            {showConfig && (
                <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0, 0, 0, 0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 }} onClick={() => setShowConfig(false)}>
                    <div style={{ backgroundColor: "white", padding: "2rem", borderRadius: "10px", width: "90%", maxWidth: "400px", boxShadow: "0 4px 10px rgba(0,0,0,0.3)" }} onClick={(e) => e.stopPropagation()}>
                        <h3 style={{ color: "#333", textAlign: "center", marginBottom: "1.5rem", fontSize: "1.5rem", fontWeight: "bold" }}>Configuración de tiempos</h3>

                        <form onSubmit={handleConfigSubmit}>
                            {[{ label: "Intervalo de Datos (seg)", name: "dataInterval" }, { label: "Deep Sleep (seg)", name: "sleepTime" }, { label: "Wake Up (seg)", name: "wakeTime" }].map((field) => (
                                <div key={field.name} style={{ marginBottom: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                    <label style={{ color: "#333", fontSize: "1rem" }}>{field.label}</label>
                                    <input
                                        style={{ padding: "0.5rem", border: "1px solid #ccc", borderRadius: "4px", fontSize: "1rem" }}
                                        type="number"
                                        name={field.name}
                                        value={configTimes[field.name]}
                                        onChange={handleConfigChange}
                                        placeholder="Ingrese el tiempo en segundos"
                                        required
                                    />
                                </div>
                            ))}
                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "2rem" }}>
                                <button type="button" style={{ backgroundColor: "#6c757d", color: "white", border: "none", padding: "0.5rem 1.5rem", borderRadius: "4px", cursor: "pointer" }} onClick={() => setShowConfig(false)}>Cancelar</button>
                                <button type="submit" style={{ backgroundColor: "#007bff", color: "white", border: "none", padding: "0.5rem 1.5rem", borderRadius: "4px", cursor: "pointer" }}>Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Tuerca;
