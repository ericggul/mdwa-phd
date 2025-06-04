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
  console.log(`[ImageSlideContent ${id}] Original path: ${imagePath}`);
  console.log(`[ImageSlideContent ${id}] Encoded path: ${encodedPath}`);
  
  let imageTexture;
  try {
    imageTexture = useLoader(THREE.TextureLoader, encodedPath);
    console.log(`[ImageSlideContent ${id}] useLoader succeeded, texture:`, imageTexture);
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
      console.log(`[Slide ${id}] Successfully configured texture: ${imagePath}`, imageTexture);
    }
  }, [imageTexture, imagePath, id]);

  if (!imageTexture) {
    console.log(`[ImageSlideContent ${id}] Loading texture...`);
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
      roughness={0.0}
      metalness={0.0}
      transparent={springProps.meshOpacity.get() < 1.0}
      opacity={springProps.meshOpacity}
      side={THREE.FrontSide}
      envMapIntensity={0}
    />
  );
};

const Slide = ({ id, position, title, slideType, imagePath, onClick, isSelected, showFrontEdgeTitle, individualThickness, animatedOpacity, isStrictlyHidden }) => {
  const meshRef = useRef();
  const [hovered, setHover] = useState(false);

  console.log(`[Slide ${id}] slideType: ${slideType}, imagePath: ${imagePath}`);

  const springProps = useSpring({
    scale: hovered && !isSelected ? 1.05 : 1,
    meshOpacity: animatedOpacity,
    textOpacity: animatedOpacity,
    config: SPRING_CONFIG_NORMAL,
    onRest: () => {
      // console.log(`[Slide ${id}] Spring onRest. meshOpacity is now: ${springProps.meshOpacity.get()}`);
    }
  });
  
  useEffect(() => {
    // console.log(`[Slide ${id}] springProps.meshOpacity updated: ${springProps.meshOpacity.get()}, isStrictlyHidden: ${isStrictlyHidden}`);
  }, [springProps.meshOpacity, id, isStrictlyHidden]);

  const adjustedBoxArgs = [SLIDE_WIDTH_16, SLIDE_DEPTH_9, individualThickness];

  return (
    <a.mesh
      ref={meshRef}
      position={position}
      scale={springProps.scale}
      visible={!isStrictlyHidden && springProps.meshOpacity.get() > 0.01} // Apply strict hide and opacity-based visibility
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        if (!isSelected) setHover(true);
      }}
      onPointerOut={(event) => {
        event.stopPropagation();
        setHover(false);
      }}
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