import React from 'react';
import './RetroWindow.css'; // We'll add specific window styles here

const RetroWindow = ({ title, children, width = "300px" }) => {
  return (
    <div className="retro-window" style={{ width }}>
      <div className="title-bar">
        <div className="title-bar-text">{title}</div>
        <div className="title-bar-controls">
          <button aria-label="Minimize"></button>
          <button aria-label="Maximize"></button>
          <button aria-label="Close">X</button>
        </div>
      </div>
      <div className="window-body">
        {children}
      </div>
    </div>
  );
};

export default RetroWindow;