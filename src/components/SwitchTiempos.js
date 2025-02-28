// SwitchTiempos.js
import React from 'react';

const SwitchTiempos = ({ value, onChange }) => {
  const handleToggle = (e) => {
    onChange(e.target.checked ? "1" : "0");
  };

  return (
    <div className="switch-container">
      <label className="switch">
        <input 
          type="checkbox" 
          checked={value === "1"} 
          onChange={handleToggle} 
        />
        <span className="slider"></span>
      </label>
      <span className="switch-label">{value === "1" ? "ON" : "OFF"}</span>
    </div>
  );
};

export default SwitchTiempos;