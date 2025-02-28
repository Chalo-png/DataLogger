// src/components/reset.js
import React, { useState, useEffect } from "react";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const db = getFirestore();

const ResetButton = () => {
  const [active, setActive] = useState(false);

  useEffect(() => {
    let timer;
    if (active) {
      // Al activar, se envía resetRequested: 1
      setDoc(
        doc(db, "datalogger", "config", "times", "config"),
        { resetRequested: 1 },
        { merge: true }
      );

      // Mantiene el botón activo por 5 segundos
      timer = setTimeout(() => {
        setActive(false);
        // Al finalizar, se envía resetRequested: 0
        setDoc(
          doc(db, "datalogger", "config", "times", "config"),
          { resetRequested: 0 },
          { merge: true }
        );
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [active]);

  return (
    <button className="reset-button" onClick={() => setActive(true)} disabled={active}>
      {active ? "Reiniciando..." : "Reiniciar ESP32"}
    </button>
  );
};

export default ResetButton;
