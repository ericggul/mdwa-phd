import React, { useState, useEffect } from 'react';

const ImageViewer = ({ isOpen, imagePath, onClose }) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, imagePath]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (imagePath) {
      // Reset state when image changes
      setZoomLevel(1);
      setPosition({ x: 0, y: 0 });
      setIsDragging(false);
    }
  }, [imagePath]);

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoomLevel(prev => Math.min(Math.max(prev * delta, 0.5), 5));
  };

  const handleMouseDown = (e) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && zoomLevel > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev * 1.2, 5));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev / 1.2, 0.5));
  };

  const handleReset = () => {
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleImageClick = (e) => {
    e.stopPropagation(); // Prevent the background click handler
    if (zoomLevel < 5) {
      // Zoom in when clicking on the image
      setZoomLevel(prev => Math.min(prev * 1.3, 5));
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'default' // Default cursor for the background
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      onWheel={handleWheel}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Control Buttons */}
      <div style={{
        position: 'absolute',
        top: '2rem',
        right: '2rem',
        display: 'flex',
        gap: '1rem',
        zIndex: 1001
      }}>
        <button
          onClick={handleZoomIn}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '0.5rem',
            color: 'white',
            padding: '0.5rem 1rem',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          +
        </button>
        <button
          onClick={handleZoomOut}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '0.5rem',
            color: 'white',
            padding: '0.5rem 1rem',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          -
        </button>
        <button
          onClick={handleReset}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '0.5rem',
            color: 'white',
            padding: '0.5rem 1rem',
            cursor: 'pointer',
            fontSize: '0.875rem'
          }}
        >
          Reset
        </button>
        <button
          onClick={onClose}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '0.5rem',
            color: 'white',
            padding: '0.5rem 1rem',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          ✕
        </button>
      </div>

      {/* Zoom Level Indicator */}
      <div style={{
        position: 'absolute',
        bottom: '2rem',
        left: '2rem',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '0.5rem',
        color: 'white',
        padding: '0.5rem 1rem',
        fontSize: '0.875rem'
      }}>
        {Math.round(zoomLevel * 100)}%
      </div>

      {/* Image */}
      <img
        key={imagePath}
        src={imagePath}
        alt="Enlarged view"
        style={{
          maxWidth: zoomLevel > 1 ? 'none' : '90vw',
          maxHeight: zoomLevel > 1 ? 'none' : '90vh',
          transform: `scale(${zoomLevel}) translate(${position.x / zoomLevel}px, ${position.y / zoomLevel}px)`,
          transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          cursor: zoomLevel >= 5 
            ? (isDragging ? 'grabbing' : 'grab') 
            : zoomLevel > 1 
              ? (isDragging ? 'grabbing' : 'zoom-in')
              : 'zoom-in',
          userSelect: 'none',
          pointerEvents: 'auto' // Enable pointer events so image can be clicked
        }}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleReset}
        onClick={handleImageClick}
        draggable={false}
      />

      {/* Instructions */}
      <div style={{
        position: 'absolute',
        bottom: '2rem',
        right: '2rem',
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: '0.875rem',
        textAlign: 'right',
        lineHeight: 1.4
      }}>
        <div>Click image to zoom in</div>
        <div>Scroll to zoom in/out</div>
        <div>Drag to pan (when zoomed)</div>
        <div>Double-click to reset</div>
        <div>Click outside image to close</div>
      </div>
    </div>
  );
};

export default ImageViewer; 