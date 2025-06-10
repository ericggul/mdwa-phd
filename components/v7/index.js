import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import PresentationLayoutV5 from './PresentationLayout';
import NavigationUI from '../NavigationUI';
import ImageViewer from './ImageViewer';

const InteractivePresentationV5 = () => {
  const [navFunctions, setNavFunctions] = useState({ onPrev: () => {}, onNext: () => {}, onOverview: () => {}, currentIndex: -1, totalSlides: 0 });
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [currentViewerImage, setCurrentViewerImage] = useState(null);

  const handleImageClick = (imagePath) => {
    console.log(`[ImageClick] Opening image viewer for: ${imagePath}`);
    setCurrentViewerImage(imagePath);
    setImageViewerOpen(true);
  };

  const closeImageViewer = () => {
    setImageViewerOpen(false);
    setCurrentViewerImage(null);
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas camera={{ fov: 45 }} style={{ width: '100%', height: '100%' }} onCreated={({ gl }) => { gl.setClearColor(new THREE.Color('#1a1a1f')); }}>
        <PresentationLayoutV5 setNavigationFunctions={setNavFunctions} onImageClick={handleImageClick} />
      </Canvas>
      <NavigationUI {...navFunctions} />
      
      <ImageViewer 
        isOpen={imageViewerOpen}
        imagePath={currentViewerImage}
        onClose={closeImageViewer}
      />
    </div>
  );
};

export default InteractivePresentationV5; 