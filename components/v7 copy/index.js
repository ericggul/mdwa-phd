import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import PresentationLayoutV5 from './PresentationLayout';
import NavigationUI from '../NavigationUI';

const InteractivePresentationV5 = () => {
  const [navFunctions, setNavFunctions] = useState({ onPrev: () => {}, onNext: () => {}, onOverview: () => {}, currentIndex: -1, totalSlides: 0 });
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas camera={{ fov: 40 }} style={{ width: '100%', height: '100%' }} onCreated={({ gl }) => { gl.setClearColor(new THREE.Color('#1a1a1f')); }}>
        <PresentationLayoutV5 setNavigationFunctions={setNavFunctions} />
      </Canvas>
      <NavigationUI {...navFunctions} />
    </div>
  );
};

export default InteractivePresentationV5; 