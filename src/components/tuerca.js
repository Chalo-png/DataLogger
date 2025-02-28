import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, setDoc, getDoc } from "firebase/firestore";
import { GearFill, XCircle, CheckCircle, ExclamationTriangle } from 'react-bootstrap-icons';
import SwitchTiempos from './SwitchTiempos';

const Tuerca = () => {
  const [configTimes, setConfigTimes] = useState({
    dataInterval: '',
    sleepTime: '',
    wakeTime: '',
    mainTimesEnabled: ''
  });

  const [actualConfig, setActualConfig] = useState({
    dataInterval: '',
    sleepTime: '',
    wakeTime: '',
    mainTimesEnabled: 1
  });

  const [loading, setLoading] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSavedConfig = async () => {
      try {
        const savedConfig = localStorage.getItem("configTimes");
        if (savedConfig) {
          const parsed = JSON.parse(savedConfig);
          setActualConfig(parsed);
          setConfigTimes({
            dataInterval: '',
            sleepTime: '',
            wakeTime: '',
            mainTimesEnabled: ''
          });
        } else {
          const docRef = doc(db, "datalogger", "config", "times", "config");
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setActualConfig(docSnap.data());
            setConfigTimes({
              dataInterval: '',
              sleepTime: '',
              wakeTime: '',
              mainTimesEnabled: ''
            });
          }
        }
      } catch (error) {
        console.error("Error al cargar la configuración:", error);
      }
    };

    loadSavedConfig();
  }, []);

  const handleConfigChange = (e) => {
    const { name, value } = e.target;
    
    if (value === '') {
      setConfigTimes(prev => ({ ...prev, [name]: '' }));
      setError('');
      return;
    }
    
    if (!/^\d+$/.test(value)) {
      return;
    }
    
    const numericValue = parseInt(value, 10);
    
    if (numericValue < 20) {
      setError("Solo se permiten valores iguales o mayores que 20.");
    } else {
      setError('');
    }
    
    setConfigTimes(prev => ({ ...prev, [name]: value }));
  };

  const handleIncrementDecrement = (name, increment) => {
    setConfigTimes(prev => {
      const baseValue = prev[name] === '' 
        ? (actualConfig[name] ? Number(actualConfig[name]) : 0) 
        : Number(prev[name]);
      let newValue = increment ? baseValue + 10 : baseValue - 10;
      if (newValue < 1) newValue = 1;
      return { ...prev, [name]: newValue.toString() };
    });
  };
  
  const handleOpenConfig = () => {
    setConfigTimes({
      dataInterval: '',
      sleepTime: '',
      wakeTime: '',
      mainTimesEnabled: ''
    });
    setShowConfig(true);
    setError('');
  };

  const handleConfigSubmit = async (e) => {
    e.preventDefault();
  
    if (configTimes.dataInterval !== "" && Number(configTimes.dataInterval) < 20) {
      setError("El intervalo de datos debe ser al menos 20 segundos.");
      return;
    }
  
    if (configTimes.mainTimesEnabled === "1") {
      if (
        (configTimes.sleepTime !== "" && Number(configTimes.sleepTime) < 20) ||
        (configTimes.wakeTime !== "" && Number(configTimes.wakeTime) < 20)
      ) {
        setError("Los tiempos de Deep Sleep y Wake Up deben ser al menos 20 segundos.");
        return;
      }
    }
  
    setLoading(true);
    setError('');
  
    try {
      const updatedConfig = {
        dataInterval: configTimes.dataInterval !== '' 
          ? Number(configTimes.dataInterval) 
          : actualConfig.dataInterval,
        sleepTime: configTimes.mainTimesEnabled === "1"
          ? (configTimes.sleepTime !== '' ? Number(configTimes.sleepTime) : actualConfig.sleepTime)
          : actualConfig.sleepTime,
        wakeTime: configTimes.mainTimesEnabled === "1"
          ? (configTimes.wakeTime !== '' ? Number(configTimes.wakeTime) : actualConfig.wakeTime)
          : actualConfig.wakeTime,
        mainTimesEnabled: configTimes.mainTimesEnabled !== '' 
          ? Number(configTimes.mainTimesEnabled) 
          : actualConfig.mainTimesEnabled,
        resetRequested: 0
      };

      await setDoc(doc(db, "datalogger", "config", "times", "config"), updatedConfig);

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      setShowConfig(false);

      localStorage.setItem("configTimes", JSON.stringify(updatedConfig));
      setActualConfig(updatedConfig);

      setConfigTimes({
        dataInterval: '',
        sleepTime: '',
        wakeTime: '',
        mainTimesEnabled: ''
      });

    } catch (error) {
      console.error("Error al guardar:", error);
      setError("Error al guardar configuración. Intenta nuevamente.");

    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div style={{ position: "absolute", top: "20px", right: "20px", zIndex: 1000 }}>
        <button
          style={{
            background: "#007bff",
            border: "none",
            cursor: "pointer",
            padding: "12px",
            borderRadius: "50%",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            transition: "all 0.3s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "rotate(90deg) scale(1.1)";
            e.currentTarget.style.background = "#0056b3";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "rotate(0deg) scale(1)";
            e.currentTarget.style.background = "#007bff";
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleOpenConfig();
          }}
        >
          <GearFill size={28} color="white" />
        </button>
      </div>

      {showConfig && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) { setShowConfig(false); setError(''); } }}>
          <div className="config-modal">
            <div className="modal-header">
              <h3>
                <span role="img" aria-label="map">🗺️</span> 
                Configuración del Sistema
              </h3>
              <XCircle 
                size={24} 
                className="close-icon" 
                onClick={() => { setShowConfig(false); setError(''); }}
              />
            </div>

            {error && (
              <div className="error-message">
                <ExclamationTriangle size={16} />
                {error}
              </div>
            )}

            <form noValidate onSubmit={handleConfigSubmit}>
              <div className="input-grid">
                <div className="input-group">
                  <label htmlFor="dataInterval">
                    <span className="input-icon">⏱️</span>
                    Intervalo de Datos
                  </label>
                  <div className="input-wrapper">
                    <button type="button" onClick={() => handleIncrementDecrement('dataInterval', false)} className="step-button">-</button>
                    <input
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      id="dataInterval"
                      name="dataInterval"
                      value={configTimes.dataInterval}
                      onChange={handleConfigChange}
                      placeholder={actualConfig.dataInterval?.toString() || "60"}
                      className="number-input"
                    />
                    <button type="button" onClick={() => handleIncrementDecrement('dataInterval', true)} className="step-button">+</button>
                    <span className="input-unit">segundos</span>
                  </div>
                </div>

                <div className="controls-row">
                  <div className="switch-container">
                    <label htmlFor="mainTimesEnabled">
                      <span className="input-icon">🔌</span>
                      Activar Deep Sleep y Wake Up
                    </label>
                    <SwitchTiempos
                      value={
                        configTimes.mainTimesEnabled !== ''
                          ? configTimes.mainTimesEnabled
                          : (actualConfig.mainTimesEnabled === 1 ? "1" : "0")
                      }
                      onChange={(newValue) => setConfigTimes(prev => ({ ...prev, mainTimesEnabled: newValue }))}
                    />
                  </div>
                </div>

                { (configTimes.mainTimesEnabled === "1" || (configTimes.mainTimesEnabled === "" && actualConfig.mainTimesEnabled === 1)) && (
                  <>
                    <div className="input-group">
                      <label htmlFor="sleepTime">
                        <span className="input-icon">💤</span>
                        Modo Deep Sleep
                      </label>
                      <div className="input-wrapper">
                        <button type="button" onClick={() => handleIncrementDecrement('sleepTime', false)} className="step-button">-</button>
                        <input
                          type="tel"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          id="sleepTime"
                          name="sleepTime"
                          value={configTimes.sleepTime}
                          onChange={handleConfigChange}
                          placeholder={actualConfig.sleepTime?.toString() || "300"}
                          className="number-input"
                        />
                        <button type="button" onClick={() => handleIncrementDecrement('sleepTime', true)} className="step-button">+</button>
                        <span className="input-unit">segundos</span>
                      </div>
                    </div>
                    <div className="input-group">
                      <label htmlFor="wakeTime">
                        <span className="input-icon">⏰</span>
                        Tiempo Wake Up
                      </label>
                      <div className="input-wrapper">
                        <button type="button" onClick={() => handleIncrementDecrement('wakeTime', false)} className="step-button">-</button>
                        <input
                          type="tel"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          id="wakeTime"
                          name="wakeTime"
                          value={configTimes.wakeTime}
                          onChange={handleConfigChange}
                          placeholder={actualConfig.wakeTime?.toString() || "300"}
                          className="number-input"
                        />
                        <button type="button" onClick={() => handleIncrementDecrement('wakeTime', true)} className="step-button">+</button>
                        <span className="input-unit">segundos</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <button 
                type="submit" 
                className="save-button"
                disabled={loading || (error !== '' && !Object.values(configTimes).every(val => val === ''))}
              >
                {loading ? (
                  <div className="spinner"></div>
                ) : (
                  <>
                    <CheckCircle size={18} />
                    <span>Guardar Configuración</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="success-toast">
          <CheckCircle size={20} />
          Configuración guardada exitosamente!
        </div>
      )}

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1001;
        }
        .config-modal {
          background: #fff;
          width: 90%;
          max-width: 500px;
          border-radius: 40px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          overflow: hidden;
          animation: fadeIn 0.3s ease-out;
        }
        .modal-header {
          background: #007bff;
          color: white;
          padding: 13px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .modal-header h3 {
          margin: 0;
          font-size: 1.2rem;
        }
        .close-icon {
          cursor: pointer;
          transition: transform 0.3 ease;
        }
        .close-icon:hover {
          transform: scale(1.2);
        }
        .input-grid {
          padding: 16px;
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        .input-group label {
          display: block;
          margin-bottom: 4px;
          font-weight: bold;
        }
        .input-icon {
          margin-right: 5px;
        }
        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .input-wrapper input {
          width: 100%;
          padding: 8px 40px;
          border: 1px solid #ccc;
          border-radius: 40px;
          font-size: 1rem;
          transition: border 0.3s ease;
          text-align: center;
        }
        .input-wrapper input::placeholder {
          color: #aaa;
          opacity: 0.7;
        }
        .number-input {
          -moz-appearance: textfield;
        }
        .number-input::-webkit-outer-spin-button,
        .number-input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .step-button {
          background: #f0f0f0;
          border: none;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 1.2rem;
          margin: 0 5px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .step-button:hover {
          background: #e0e0e0;
        }
        .input-unit {
          position: absolute;
          right: 60px;
          top: 50%;
          transform: translateY(-50%);
          color: #555;
          font-size: 0.9rem;
          pointer-events: none;
        }
        .controls-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          width: 100%;
        }
        .switch-container {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
        .save-button {
          width: calc(100% - 32px);
          margin: 16px;
          background: #007bff;
          color: white;
          border: none;
          padding: 12px;
          border-radius: 30px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background 0.3s ease;
        }
        .save-button:hover {
          background: #0056b3;
        }
        .save-button:disabled {
          background: #6c757d;
          opacity: 0.7;
          cursor: not-allowed;
        }
        .spinner {
          border: 3px solid #f3f3f3;
          border-top: 3px solid #fff;
          border-radius: 50%;
          width: 18px;
          height: 18px;
          animation: spin 1s linear infinite;
        }
        .success-toast {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: #28a745;
          color: white;
          padding: 12px 16px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          z-index: 1001;
          animation: fadeInOut 2s ease-in-out;
        }
        .error-message {
          background-color: #f8d7da;
          color: #721c24;
          padding: 10px 16px;
          margin: 10px 16px 0 16px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInOut {
          0%, 100% { opacity: 0; }
          10%, 90% { opacity: 1; }
        }
      `}</style>
    </>
  );
};

export default Tuerca;  