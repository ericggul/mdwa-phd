import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Text } from '@react-three/drei';
import { useSpring, a } from '@react-spring/three';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { 
  SPRING_CONFIG_NORMAL, 
  SLIDE_WIDTH_16, 
  SLIDE_DEPTH_9, 
  EDGE_TITLE_Z_OFFSET 
} from './constants';

const AnimatedDreiText = a(Text);

const ImageSlideContent = ({ imagePath, springProps, isStrictlyHidden, id }) => {
  // Properly encode the path to handle spaces and special characters
  const encodedPath = imagePath.replace(/ /g, '%20');
  
  let imageTexture;
  try {
    imageTexture = useLoader(THREE.TextureLoader, encodedPath);
  } catch (error) {
    console.error(`[ImageSlideContent ${id}] useLoader failed:`, error);
    return (
      <a.meshStandardMaterial 
        color="red"
        roughness={0.5}
        metalness={0.0}
        transparent
        opacity={springProps.meshOpacity}
      />
    );
  }
  
  useEffect(() => {
    if (imageTexture) {
      imageTexture.flipY = true;
      imageTexture.wrapS = THREE.ClampToEdgeWrapping;
      imageTexture.wrapT = THREE.ClampToEdgeWrapping;
      imageTexture.magFilter = THREE.LinearFilter;
      imageTexture.minFilter = THREE.LinearMipmapLinearFilter;
      imageTexture.colorSpace = THREE.SRGBColorSpace;
    }
  }, [imageTexture, imagePath, id]);

  if (!imageTexture) {
    return (
      <a.meshStandardMaterial 
        color="grey"
        roughness={0.8}
        metalness={0.0}
        transparent
        opacity={springProps.meshOpacity}
      />
    );
  }

  return (
    <a.meshStandardMaterial 
      map={imageTexture}
      roughness={1.0}
      metalness={0.0}
      color="white"
      transparent={springProps.meshOpacity.get() < 1.0}
      opacity={springProps.meshOpacity}
      side={THREE.FrontSide}
      envMapIntensity={0}
    />
  );
};

const Slide = ({ 
  id, 
  position, 
  title, 
  slideType, 
  imagePath, 
  onClick, 
  onImageClick, 
  isSelected, 
  shouldCaptureClicks = true, 
  showFrontEdgeTitle, 
  individualThickness, 
  animatedOpacity, 
  isStrictlyHidden 
}) => {
  const meshRef = useRef();
  const [hovered, setHover] = useState(false);

  const springProps = useSpring({
    scale: hovered && !isSelected ? 1.05 : 1,
    meshOpacity: animatedOpacity,
    textOpacity: animatedOpacity,
    config: SPRING_CONFIG_NORMAL,
    onRest: () => {
      // Spring animation completed
    }
  });
  
  useEffect(() => {
    // Handle opacity updates
  }, [springProps.meshOpacity, id, isStrictlyHidden]);

  const adjustedBoxArgs = [SLIDE_WIDTH_16, SLIDE_DEPTH_9, individualThickness];

  const handleClick = (event) => {
    event.stopPropagation();
    
    // Only handle clicks if this slide should capture them
    if (!shouldCaptureClicks) {
      return;
    }
    
    if (slideType === 'image' && imagePath && onImageClick) {
      // For image slides, call the image click handler (imagePath is already bound)
      onImageClick();
    } else {
      // For other slides, use the regular click handler
      onClick();
    }
  };

  const handlePointerOver = (event) => {
    event.stopPropagation();
    if (!isSelected) setHover(true);
    
    // Only show special cursors if this slide captures clicks
    if (shouldCaptureClicks) {
      const canvas = event.target?.domElement || document.querySelector('canvas');
      if (canvas) {
        if (slideType === 'image' && imagePath) {
          canvas.style.cursor = 'zoom-in';
          canvas.classList.add('zoom-cursor');
        } else {
          canvas.style.cursor = hovered ? 'pointer' : 'default';
          canvas.classList.remove('zoom-cursor');
        }
      }
    }
  };

  const handlePointerOut = (event) => {
    event.stopPropagation();
    setHover(false);
    // Reset cursor style
    const canvas = event.target?.domElement || document.querySelector('canvas');
    if (canvas) {
      canvas.style.cursor = 'default';
      canvas.classList.remove('zoom-cursor');
    }
  };

  return (
    <a.mesh
      ref={meshRef}
      position={position}
      scale={springProps.scale}
      visible={!isStrictlyHidden && springProps.meshOpacity.get() > 0.01} // Apply strict hide and opacity-based visibility
      onClick={shouldCaptureClicks && !isStrictlyHidden ? handleClick : undefined}
      onPointerOver={shouldCaptureClicks && !isStrictlyHidden ? handlePointerOver : undefined}
      onPointerOut={shouldCaptureClicks && !isStrictlyHidden ? handlePointerOut : undefined}
    >

      <boxGeometry args={adjustedBoxArgs} />
      {slideType === 'image' && imagePath ? (
        <Suspense fallback={
          <a.meshStandardMaterial 
            color="gray"
            transparent
            opacity={springProps.meshOpacity}
            depthWrite={!isStrictlyHidden && springProps.meshOpacity.get() < 1 ? false : true}
          />
        }>
          <ImageSlideContent 
            imagePath={imagePath} 
            springProps={springProps} 
            isStrictlyHidden={isStrictlyHidden}
            id={id}
          />
        </Suspense>
      ) : (
        <a.meshStandardMaterial 
          color={isSelected ? 'lightgreen' : hovered ? 'skyblue' : '#fff'} 
          roughness={0.2} 
          metalness={0.3} 
          envMapIntensity={0.1}
          transparent
          opacity={springProps.meshOpacity}
          depthWrite={!isStrictlyHidden && springProps.meshOpacity.get() < 1 ? false : true}
        />
      )}
      
      {slideType === 'title' && (
        <AnimatedDreiText
          position={[0, 0, individualThickness / 2 + 0.02]}
          fontSize={1.5}
          color="black"
          anchorX="center"
          anchorY="middle"
          maxWidth={SLIDE_WIDTH_16 * 0.85}
          textAlign="center"
          lineHeight={1.2}
          fillOpacity={springProps.textOpacity}
          fontWeight={300}
        >
          {title}
        </AnimatedDreiText>
      )}

    </a.mesh>
  );
};

export default Slide; 