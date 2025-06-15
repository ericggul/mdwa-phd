import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import PresentationLayoutV5 from './PresentationLayout';
import NavigationUI from '../NavigationUI';
import ImageViewer from './ImageViewer';
import IntroPage from './IntroPage';
import useContentLoader from './hooks/useContentLoader';

const InteractivePresentationV5 = () => {
  const [navFunctions, setNavFunctions] = useState({ onPrev: () => {}, onNext: () => {}, onOverview: () => {}, currentIndex: -1, totalSlides: 0 });
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [currentViewerImage, setCurrentViewerImage] = useState(null);
  const [showIntro, setShowIntro] = useState(true);
  
  const { isLoading, loadingProgress, handleCanvasReady } = useContentLoader();

  const handleImageClick = (imagePath) => {
    setCurrentViewerImage(imagePath);
    setImageViewerOpen(true);
  };

  const closeImageViewer = () => {
    setImageViewerOpen(false);
    setCurrentViewerImage(null);
  };

  const handleEnterExperience = () => {
    setShowIntro(false);
  };

  const handleCanvasCreated = ({ gl }) => {
    gl.setClearColor(new THREE.Color('#1a1a1f'));
    handleCanvasReady();
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* 3D Canvas - loads in background */}
      <Canvas 
        camera={{ fov: 40 }} 
        style={{ 
          width: '100%', 
          height: '100%',
          opacity: showIntro ? 0 : 1,
          transition: 'opacity 0.8s ease-out'
        }} 
        onCreated={handleCanvasCreated}
      >
        <PresentationLayoutV5 setNavigationFunctions={setNavFunctions} onImageClick={handleImageClick} />
      </Canvas>
      
      {/* Navigation UI - only show when not in intro */}
      {!showIntro && (
        <NavigationUI {...navFunctions} />
      )}
      
      {/* Image Viewer */}
      <ImageViewer 
        isOpen={imageViewerOpen}
        imagePath={currentViewerImage}
        onClose={closeImageViewer}
      />

      {/* Intro Page Overlay */}
      {showIntro && (
        <IntroPage 
          onEnter={handleEnterExperience}
          isLoading={isLoading}
          loadingProgress={loadingProgress}
        />
      )}
    </div>
  );
};

export default InteractivePresentationV5; 