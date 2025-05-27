import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import PresentationLayout from './PresentationLayout';
import NavigationUI from '../NavigationUI'; // Assuming NavigationUI is in the parent components folder

const InteractivePresentationV4 = () => {
  const [navFunctions, setNavFunctions] = useState({
    onPrev: () => {},
    onNext: () => {},
    onOverview: () => {},
    currentIndex: -1,
    totalSlides: 0
  });

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas 
        camera={{ fov: 50 }} 
        style={{ width: '100%', height: '100%' }}
        onCreated={({ gl }) => {
          gl.setClearColor(new THREE.Color('#282c34')); 
        }}
      >
        <PresentationLayout setNavigationFunctions={setNavFunctions} />
      </Canvas>
      <NavigationUI {...navFunctions} />
    </div>
  );
};

export default InteractivePresentationV4; 