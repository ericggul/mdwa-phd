import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Text } from '@react-three/drei';
import { useSpring, a } from '@react-spring/three';
import * as THREE from 'three';
import { 
  SPRING_CONFIG_NORMAL, 
  SLIDE_WIDTH_16, 
  SLIDE_DEPTH_9, 
  EDGE_TITLE_Z_OFFSET,
  INTRO_SPRING_TENSION,
  INTRO_SPRING_FRICTION
} from './constants';

const AnimatedDreiText = a(Text);

const ImageSlideContent = ({ imagePath, springProps, isStrictlyHidden, id }) => {
  const [imageTexture, setImageTexture] = useState(null);
  const [loadingError, setLoadingError] = useState(false);
  
  useEffect(() => {
    if (!imagePath) return;
    
    // Clean up previous texture
    if (imageTexture) {
      imageTexture.dispose();
    }
    
    setLoadingError(false);
    setImageTexture(null);
    
    // Create image element for loading
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        // Create texture from loaded image
        const texture = new THREE.Texture(img);
        
        // Optimize texture settings for maximum quality
        texture.flipY = true;
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        
        // Use highest quality filtering
        texture.magFilter = THREE.LinearFilter;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        
        // Ensure proper color space
        texture.colorSpace = THREE.SRGBColorSpace;
        
        // Prevent texture compression/downsampling
        texture.generateMipmaps = true;
        texture.premultiplyAlpha = false;
        
        // Force texture update
        texture.needsUpdate = true;
        
        setImageTexture(texture);
      } catch (error) {
        console.error(`[ImageSlideContent ${id}] Texture creation failed:`, error);
        setLoadingError(true);
      }
    };
    
    img.onerror = (error) => {
      console.error(`[ImageSlideContent ${id}] Image load failed for: ${imagePath}`, error);
      setLoadingError(true);
    };
    
    // Set the image source - handle spaces and special characters
    const cleanPath = imagePath.replace(/\s+/g, '%20');
    img.src = cleanPath;
    
    // Cleanup function
    return () => {
      if (imageTexture) {
        imageTexture.dispose();
      }
    };
  }, [imagePath, id]);

  if (loadingError) {
    return (
      <a.meshBasicMaterial 
        color="red"
        transparent
        opacity={springProps.meshOpacity}
      />
    );
  }

  if (!imageTexture) {
    return (
      <a.meshBasicMaterial 
        color="grey"
        transparent
        opacity={springProps.meshOpacity}
      />
    );
  }

  // Use meshStandardMaterial for better image quality
  return (
    <a.meshStandardMaterial 
      map={imageTexture}
      transparent={springProps.meshOpacity.get() < 1.0}
      opacity={springProps.meshOpacity}
      side={THREE.FrontSide}
      roughness={0.5}
      metalness={0.5}
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
  isStrictlyHidden,
  isFirstEntry = false,
  introDelay = 0
}) => {
  const meshRef = useRef();
  const [hovered, setHover] = useState(false);
  const [hasIntroAnimationRun, setHasIntroAnimationRun] = useState(false);
  const [introAnimationStarted, setIntroAnimationStarted] = useState(false);

  // Start intro animation after delay - only when user enters from intro page
  useEffect(() => {
    if (isFirstEntry && !hasIntroAnimationRun && !introAnimationStarted) {
      const timer = setTimeout(() => {
        setIntroAnimationStarted(true);
      }, introDelay);
      
      return () => {
        clearTimeout(timer);
      };
    }
  }, [isFirstEntry, introDelay, hasIntroAnimationRun, introAnimationStarted, id]);

  const springProps = useSpring({
    scale: (!hasIntroAnimationRun && !introAnimationStarted)
      ? 0 
      : hovered && !isSelected 
        ? 1.05 
        : 1,
    rotationX: (!hasIntroAnimationRun && !introAnimationStarted)
      ? -Math.PI / 2  // 90 degrees - lying flat (vertical)
      : 0,           // 0 degrees - facing forward
    meshOpacity: animatedOpacity,
    textOpacity: animatedOpacity,
    config: (!hasIntroAnimationRun)
      ? { tension: INTRO_SPRING_TENSION, friction: INTRO_SPRING_FRICTION } 
      : SPRING_CONFIG_NORMAL,
    onRest: () => {
      // If this was the intro animation completing
      if (isFirstEntry && introAnimationStarted && !hasIntroAnimationRun) {
        setHasIntroAnimationRun(true);
      }
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
    
    if (slideType === 'image' && imagePath && onImageClick && isSelected) {
      // For image slides that are currently selected, open image viewer
      onImageClick();
    } else {
      // For all other cases (non-selected slides, title slides), navigate to the slide
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
        if (slideType === 'image' && imagePath && isSelected) {
          // Show zoom cursor only for currently selected image slides
          canvas.style.cursor = 'zoom-in';
          canvas.classList.add('zoom-cursor');
        } else {
          // Show pointer cursor for all other clickable slides
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
      rotation-x={springProps.rotationX}
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