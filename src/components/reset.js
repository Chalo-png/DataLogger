import React, { useState, useEffect } from "react";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const db = getFirestore();

const ResetButton = () => {
  const [active, setActive] = useState(false);

  useEffect(() => {
    let timer;
    if (active) {
      // Send resetRequested: 1 when activated
      setDoc(
        doc(db, "datalogger", "config", "times", "config"),
        { resetRequested: 1 },
        { merge: true }
      );

      // Keep button active for 5 seconds
      timer = setTimeout(() => {
        setActive(false);
        // Send resetRequested: 0 when finished
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
    <button 
      className="reset-button" 
      onClick={() => setActive(true)} 
      disabled={active}
      style={{
        position: 'absolute',
        top: '95px', // Positioned much lower than before
        right: '10px',
        padding: '6px 10px',
        fontSize: '12px',
        backgroundColor: active ? '#f44336' : '#2196f3',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: active ? 'not-allowed' : 'pointer'
      }}
    >
      {active ? "Reiniciando..." : "Reinicar"}
    </button>
  );
};

export default ResetButton;