import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, setDoc, getDoc } from "firebase/firestore";
import { GearFill, XCircle, CheckCircle, ExclamationTriangle } from 'react-bootstrap-icons';

const Tuerca = () => {
  const [showConfig, setShowConfig] = useState(false);
  const [configTimes, setConfigTimes] = useState({
    dataInterval: '',
    sleepTime: '',
    wakeTime: ''
  });
  const [actualConfig, setActualConfig] = useState({
    dataInterval: '',
    sleepTime: '',
    wakeTime: ''
  });
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  // Cargar datos guardados al iniciar el componente
  useEffect(() => {
    const loadSavedConfig = async () => {
      try {
        // Intentar cargar desde localStorage primero
        const savedConfig = localStorage.getItem("configTimes");
        if (savedConfig) {
          const parsed = JSON.parse(savedConfig);
          setActualConfig(parsed);
          // Inicializamos configTimes con campos vacíos para mostrar solo placeholders
          setConfigTimes({
            dataInterval: '',
            sleepTime: '',
            wakeTime: ''
          });
        } else {
          // Si no hay datos en localStorage, intentar cargar desde Firebase
          const docRef = doc(db, "datalogger", "config", "times", "config");
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            setActualConfig(docSnap.data());
            // Inicializamos configTimes con campos vacíos para mostrar solo placeholders
            setConfigTimes({
              dataInterval: '',
              sleepTime: '',
              wakeTime: ''
            });
          }
        }
      } catch (error) {
        console.error("Error al cargar la configuración:", error);
      }
    };

    loadSavedConfig();
  }, []);

  // Maneja el cambio en los inputs y valida valores positivos
  const handleConfigChange = (e) => {
    const { name, value } = e.target;
    
    // Permite que el usuario borre el valor para luego ingresar uno nuevo
    if (value === '') {
      setConfigTimes(prev => ({
        ...prev,
        [name]: ''
      }));
      setError('');
      return;
    }
    
    // Solo permite números
    if (!/^\d+$/.test(value) && value !== '') {
      return;
    }
    
    const numericValue = parseInt(value, 10);
    
    if (numericValue > 0) {
      setConfigTimes(prev => ({
        ...prev,
        [name]: numericValue.toString()
      }));
      setError('');
    } else if (numericValue === 0) {
      setConfigTimes(prev => ({
        ...prev,
        [name]: '0'
      }));
      setError('Los valores deben ser mayores a 0');
    } else if (value === '') {
      setConfigTimes(prev => ({
        ...prev,
        [name]: ''
      }));
      setError('');
    } else {
      setError('Los valores deben ser mayores a 0');
    }
  };

  // Función para incrementar o decrementar en 10
  const handleIncrementDecrement = (name, increment) => {
    setConfigTimes(prev => {
      // Si el campo está vacío, usamos el valor actual guardado o 0 si no hay valor
      const baseValue = prev[name] === '' 
        ? (actualConfig[name] ? Number(actualConfig[name]) : 0) 
        : Number(prev[name]);
      
      let newValue;
      if (increment) {
        newValue = baseValue + 10;
      } else {
        newValue = baseValue - 10;
        if (newValue < 1) newValue = 1;
      }
      return {
        ...prev,
        [name]: newValue.toString()
      };
    });
  };

  // Cierra el modal al hacer clic fuera de él
  const handleModalClick = (e) => {
    if (e.target === e.currentTarget) {
      setShowConfig(false);
      setError('');
    }
  };

  // Guarda la configuración en Firestore y en localStorage
  const handleConfigSubmit = async (e) => {
    e.preventDefault();
    
    // Verificar si todos los campos contienen 0
    const hasZeroValue = Object.values(configTimes).some(value => value === '0');
    if (hasZeroValue) {
      setError("Todos los valores deben ser mayores a 0.");
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      // Combinar valores existentes con los nuevos (si hay alguno vacío)
      const updatedConfig = {
        dataInterval: configTimes.dataInterval !== '' 
          ? Number(configTimes.dataInterval) 
          : actualConfig.dataInterval,
        sleepTime: configTimes.sleepTime !== '' 
          ? Number(configTimes.sleepTime) 
          : actualConfig.sleepTime,
        wakeTime: configTimes.wakeTime !== '' 
          ? Number(configTimes.wakeTime) 
          : actualConfig.wakeTime
      };
      
      await setDoc(doc(db, "datalogger", "config", "times", "config"), updatedConfig);
      localStorage.setItem("configTimes", JSON.stringify(updatedConfig));
      
      // Actualizar el estado actual después de guardar
      setActualConfig(updatedConfig);
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      setShowConfig(false);
      
      // Limpiar los campos después de guardar
      setConfigTimes({
        dataInterval: '',
        sleepTime: '',
        wakeTime: ''
      });
    } catch (error) {
      console.error("Error al guardar la configuración:", error);
      setError("Error al guardar la configuración. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  // Resetear configuración al abrir el modal
  const handleOpenConfig = () => {
    // Iniciar con campos vacíos para mostrar solo placeholders
    setConfigTimes({
      dataInterval: '',
      sleepTime: '',
      wakeTime: ''
    });
    setShowConfig(true);
    setError('');
  };

  return (
    <>
      {/* Botón de configuración */}
      <div
        style={{ 
          position: "absolute",
          top: "20px",
          right: "20px",
          zIndex: 1000,
        }}
      >
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

      {/* Modal de configuración */}
      {showConfig && (
        <div className="modal-overlay" onClick={handleModalClick}>
          <div className="config-modal">
            <div className="modal-header">
              <h3>
                <span role="img" aria-label="map">🗺️</span> 
                Configuración del Sistema
              </h3>
              <XCircle 
                size={24} 
                className="close-icon" 
                onClick={() => {
                  setShowConfig(false);
                  setError('');
                }}
              />
            </div>

            {/* Mensaje de error */}
            {error && (
              <div className="error-message">
                <ExclamationTriangle size={16} />
                {error}
              </div>
            )}

            <form noValidate onSubmit={handleConfigSubmit}>
              <div className="input-grid">
                {[
                  { 
                    id: 'dataInterval',
                    label: 'Intervalo de Datos',
                    unit: 'segundos',
                    icon: '⏱️',
                    placeholder: '60'
                  },
                  { 
                    id: 'sleepTime', 
                    label: 'Modo Deep Sleep', 
                    unit: 'segundos',
                    icon: '💤',
                    placeholder: '300'
                  },
                  { 
                    id: 'wakeTime', 
                    label: 'Tiempo Wake Up', 
                    unit: 'segundos',
                    icon: '⏰',
                    placeholder: '300'
                  }
                ].map(({id, label, unit, icon, placeholder}) => (
                  <div className="input-group" key={id}>
                    <label htmlFor={id}>
                      <span className="input-icon">{icon}</span>
                      {label}
                    </label>
                    <div className="input-wrapper">
                      {/* Botón para disminuir */}
                      <button 
                        type="button" 
                        onClick={() => handleIncrementDecrement(id, false)}
                        className="step-button"
                      >
                        -
                      </button>
                      <input
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        id={id}
                        name={id}
                        value={configTimes[id]}
                        onChange={handleConfigChange}
                        placeholder={placeholder}
                        className="number-input"
                      />
                      {/* Botón para aumentar */}
                      <button 
                        type="button" 
                        onClick={() => handleIncrementDecrement(id, true)}
                        className="step-button"
                      >
                        +
                      </button>
                      <span className="input-unit">{unit}</span>
                    </div>
                  </div>
                ))}
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

      {/* Toast de éxito */}
      {showSuccess && (
        <div className="success-toast">
          <CheckCircle size={20} />
          Configuración guardada exitosamente!
        </div>
      )}

      {/* Estilos */}
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
        /* Eliminar las flechas nativas de los inputs tipo number */
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