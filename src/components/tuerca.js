import React, { useState } from 'react';
import { db } from '../firebase';
import { doc, setDoc } from "firebase/firestore";
import { GearFill, XCircle, CheckCircle } from 'react-bootstrap-icons';

const Tuerca = () => {
  const [showConfig, setShowConfig] = useState(false);
  const [configTimes, setConfigTimes] = useState({
    dataInterval: '',
    sleepTime: '',
    wakeTime: ''
  });
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Maneja el cambio en los inputs y elimina ceros a la izquierda
  const handleConfigChange = (e) => {
    const { name, value } = e.target;
    if (Number(value) < 0) return; // Evita valores negativos

    // Convertimos el valor a número entero para remover ceros a la izquierda
    const numericValue = parseInt(value, 10);

    // Si es un número válido, lo guardamos como string sin ceros a la izquierda
    if (!isNaN(numericValue)) {
      setConfigTimes(prev => ({
        ...prev,
        [name]: numericValue.toString()
      }));
    } else {
      // Si el usuario borra todo y queda vacío, lo dejamos vacío
      setConfigTimes(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Cierra el modal al hacer clic fuera de él
  const handleModalClick = (e) => {
    if (e.target === e.currentTarget) {
      setShowConfig(false);
    }
  };

  // Guarda la configuración en Firestore y en localStorage
  const handleConfigSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updatedConfig = {
        dataInterval: Number(configTimes.dataInterval),
        sleepTime: Number(configTimes.sleepTime),
        wakeTime: Number(configTimes.wakeTime)
      };

      await setDoc(doc(db, "datalogger", "config", "times", "config"), updatedConfig);
      localStorage.setItem("configTimes", JSON.stringify(updatedConfig));
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      setShowConfig(false);
    } catch (error) {
      console.error("Error al guardar la configuración:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Botón de configuración */}
      <button
        style={{ 
          position: "fixed",
          top: "20px",
          right: "20px",
          zIndex: 1000,
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
          setShowConfig(true);
        }}
      >
        <GearFill size={28} color="white" />
      </button>

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
                onClick={() => setShowConfig(false)}
              />
            </div>

            {/* noValidate para deshabilitar validación nativa y permitir números no múltiplos de 10 */}
            <form noValidate onSubmit={handleConfigSubmit}>
              <div className="input-grid">
                {[
                  { 
                    id: 'dataInterval',
                    label: 'Intervalo de Datos',
                    unit: 'segundos',
                    icon: '⏱️'
                  },
                  { 
                    id: 'sleepTime', 
                    label: 'Modo Deep Sleep', 
                    unit: 'segundos',
                    icon: '💤'
                  },
                  { 
                    id: 'wakeTime', 
                    label: 'Tiempo Wake Up', 
                    unit: 'segundos',
                    icon: '⏰'
                  }
                ].map(({id, label, unit, icon}) => (
                  <div className="input-group" key={id}>
                    <label htmlFor={id}>
                      <span className="input-icon">{icon}</span>
                      {label}
                    </label>
                    <div className="input-wrapper">
                      <input
                        type="number"
                        id={id}
                        name={id}
                        min="0"
                        step="10"   // Sigue mostrando flechas que saltan de 10 en 10
                        value={configTimes[id]}
                        onChange={handleConfigChange}
                        placeholder={`Ej: ${id === 'dataInterval' ? '60' : '300'}`}
                      />
                      <span className="input-unit">{unit}</span>
                    </div>
                  </div>
                ))}
              </div>

              <button 
                type="submit" 
                className="save-button"
                disabled={loading}
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
          transition: transform 0.3s ease;
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
        .input-wrapper {
          position: relative;
        }
        .input-wrapper input {
          width: 80%;
          padding: 8px 75px 8px 12px;
          border: 1px solid #ccc;
          border-radius: 40px;
          font-size: 1rem;
          transition: border 0.3s ease;
        }
        /* Forzamos que los spinners se muestren siempre y ajustamos su posición */
        .input-wrapper input::-webkit-inner-spin-button,
        .input-wrapper input::-webkit-outer-spin-button {
          opacity: 1 !important;
          margin-right: 10px;
        }
        .input-unit {
          position: absolute;
          right: 10px;
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
          background: #007bff;
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
