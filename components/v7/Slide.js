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
      <a.meshBasicMaterial 
        color="red"
        transparent
        opacity={springProps.meshOpacity}
      />
    );
  }
  
  useEffect(() => {
    if (imageTexture) {
      // Log original texture properties for debugging
      console.log(`[TEXTURE QUALITY ${id}] Original size: ${imageTexture.image?.width}x${imageTexture.image?.height}`);
      console.log(`[TEXTURE QUALITY ${id}] Format: ${imageTexture.format}, Type: ${imageTexture.type}`);
      
      // Optimize texture settings for maximum quality
      imageTexture.flipY = true;
      imageTexture.wrapS = THREE.ClampToEdgeWrapping;
      imageTexture.wrapT = THREE.ClampToEdgeWrapping;
      
      // Use highest quality filtering
      imageTexture.magFilter = THREE.LinearFilter;
      imageTexture.minFilter = THREE.LinearMipmapLinearFilter;
      
      // Ensure proper color space
      imageTexture.colorSpace = THREE.SRGBColorSpace;
      
      // Prevent texture compression/downsampling
      imageTexture.generateMipmaps = true;
      imageTexture.premultiplyAlpha = false;
      
      // Force texture update
      imageTexture.needsUpdate = true;
      
      console.log(`[TEXTURE QUALITY ${id}] Applied settings - ColorSpace: ${imageTexture.colorSpace}, MagFilter: ${imageTexture.magFilter}, MinFilter: ${imageTexture.minFilter}`);
    }
  }, [imageTexture, imagePath, id]);

  if (!imageTexture) {
    return (
      <a.meshBasicMaterial 
        color="grey"
        transparent
        opacity={springProps.meshOpacity}
      />
    );
  }

  // Use meshBasicMaterial for unlit, pure image display (like img tag)
  return (
    <a.meshBasicMaterial 
      map={imageTexture}
      transparent={springProps.meshOpacity.get() < 1.0}
      opacity={springProps.meshOpacity}
      side={THREE.FrontSide}
      toneMapped={false}
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
          <a.meshBasicMaterial 
            color="gray"
            transparent
            opacity={springProps.meshOpacity}
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
        <a.meshBasicMaterial 
        color={isSelected ? 'lightgreen' : hovered ? 'skyblue' : '#fff'} 
        transparent
        opacity={springProps.meshOpacity}
      />
      )}
      
      {slideType === 'title' && (
        <AnimatedDreiText
          font="/fonts/EBGaramond-VariableFont_wght.ttf"
          position={[0, 0, individualThickness / 2 + 0.1]}
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