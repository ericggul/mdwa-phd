import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Plane, Box } from '@react-three/drei';
import * as THREE from 'three';
import { useSpring, a } from '@react-spring/three';
import { STRUCTURE } from '@/utils/constant';

const SLIDE_WIDTH_16 = 16; // X-dimension of the content face
const SLIDE_DEPTH_9 = 9;   // Z-dimension of the content face (becomes "height" on screen when zoomed)
const SLIDE_ACTUAL_THICKNESS = 0.5; // Y-dimension (actual thickness of the "file" mesh)

// BoxGeometry arguments: [width, height, depth] for the mesh
// Mesh: X=SLIDE_WIDTH_16, Y=SLIDE_ACTUAL_THICKNESS, Z=SLIDE_DEPTH_9
const slideBoxArgs = [SLIDE_WIDTH_16, SLIDE_ACTUAL_THICKNESS, SLIDE_DEPTH_9];

const Slide = ({ id, position, title, onClick, isSelected }) => {
  const meshRef = useRef();
  const [hovered, setHover] = useState(false);

  const { scale } = useSpring({
    scale: hovered && !isSelected ? 1.05 : 1,
    config: { tension: 400, friction: 30 },
  });

  return (
    <a.mesh
      ref={meshRef}
      position={position}
      scale={scale}
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
      castShadow // Slides can cast shadows
      receiveShadow // Slides can receive shadows
    >
      <boxGeometry args={slideBoxArgs} />
      <meshStandardMaterial color={isSelected ? 'lightgreen' : hovered ? 'skyblue' : '#CCCCCC'} roughness={0.6} metalness={0.2} />
      <Text
        position={[0, SLIDE_ACTUAL_THICKNESS / 2 + 0.01, 0]} // On top face, slightly above
        rotation={[-Math.PI / 2, 0, 0]} // Rotate to lay flat on XZ plane
        fontSize={0.7} // Adjusted font size
        color="black"
        anchorX="center"
        anchorY="middle"
        maxWidth={SLIDE_WIDTH_16 * 0.85}
        textAlign="center"
        lineHeight={1.2}
      >
        {title}
      </Text>
    </a.mesh>
  );
};

const PresentationLayoutV4 = () => {
  const [selectedSlideId, setSelectedSlideId] = useState(null);
  const { camera, size } = useThree();
  const controlsRef = useRef();

  const slideData = React.useMemo(() => {
    const generatedSlides = [];
    const yLayerSpacing = SLIDE_ACTUAL_THICKNESS * 6; // More compact Y spacing based on new thickness
    const xNodeSpacing = SLIDE_WIDTH_16 * 1.2; // X spacing within a layer
    const stackedSlideVerticalOffset = SLIDE_ACTUAL_THICKNESS * 1.1; // Offset for stacked slides

    let minYOverall = Infinity, maxYOverall = -Infinity;
    let minXOverall = Infinity, maxXOverall = -Infinity;

    STRUCTURE.forEach((layer, layerIndex) => {
      const numComponents = layer.components.length;
      const layerWidth = (numComponents - 1) * xNodeSpacing;
      const startX = -layerWidth / 2;
      // Base Y for this layer, layers go "down" (negative Y) before centering
      const currentLayerBaseY = -(layerIndex * yLayerSpacing);

      layer.components.forEach((component, componentIndex) => {
        const componentBaseX = startX + componentIndex * xNodeSpacing;
        const componentBaseZ = 0; // All slides primarily on Z=0 plane before centering

        const isFrameworkComponent = layer.section === 'Framework Design' &&
                                     (component.title === 'Interactive Taxonomy' ||
                                      component.title === 'State-based Architecture' ||
                                      component.title === 'Dimensional Transformation');
        const numSlidesForThisComponent = isFrameworkComponent ? 2 : 1;

        for (let i = 0; i < numSlidesForThisComponent; i++) {
          const slideId = `${layerIndex}-${componentIndex}-${i}`;
          const slideTitle = numSlidesForThisComponent > 1 ? `${component.title} (Part ${i + 1})` : component.title;
          
          // If stacked, the first slide is at currentLayerBaseY, second is below it.
          // We want slides to stack "upwards" visually in the initial layout if multiple.
          // Let's make currentLayerBaseY the Y of the *bottom-most* slide in a stack.
          // So, yPos will be currentLayerBaseY + i * stackedSlideVerticalOffset
          const yPos = currentLayerBaseY + i * stackedSlideVerticalOffset;

          const position = new THREE.Vector3(componentBaseX, yPos, componentBaseZ);
          generatedSlides.push({
            id: slideId,
            title: slideTitle,
            position: position,
          });
          
          // For overall bounds calculation (pre-centering)
          minYOverall = Math.min(minYOverall, yPos - SLIDE_ACTUAL_THICKNESS / 2);
          maxYOverall = Math.max(maxYOverall, yPos + SLIDE_ACTUAL_THICKNESS / 2);
          minXOverall = Math.min(minXOverall, componentBaseX - SLIDE_WIDTH_16 / 2);
          maxXOverall = Math.max(maxXOverall, componentBaseX + SLIDE_WIDTH_16 / 2);
        }
      });
    });
    
    // Calculate the true vertical center of the generated Y positions
    const structureCenterY = (minYOverall + maxYOverall) / 2;

    // Shift all positions so their collective vertical center is at Y=0
    // And ensure horizontal center is also at X=0 (already handled by startX if STRUCTURE is symmetric)
    const structureCenterX = (minXOverall + maxXOverall) / 2; // Should be near 0

    generatedSlides.forEach(s => {
      s.position.y -= structureCenterY;
      s.position.x -= structureCenterX; // Center horizontally too
    });

    // Recalculate actual height/width after centering for camera logic (as in v3)
    let finalMinY = Infinity, finalMaxY = -Infinity;
    let finalMinX = Infinity, finalMaxX = -Infinity;
    generatedSlides.forEach(p => {
        finalMinY = Math.min(finalMinY, p.position.y - SLIDE_ACTUAL_THICKNESS / 2);
        finalMaxY = Math.max(finalMaxY, p.position.y + SLIDE_ACTUAL_THICKNESS / 2);
        finalMinX = Math.min(finalMinX, p.position.x - SLIDE_WIDTH_16 / 2);
        finalMaxX = Math.max(finalMaxX, p.position.x + SLIDE_WIDTH_16 / 2);
    });

    const totalActualHeight = finalMaxY - finalMinY;
    const totalActualWidth = finalMaxX - finalMinX;
    // All slides are on Z=0 plane (relative to each other before global centering, which doesn't affect Z here)
    // so totalActualDepth is just SLIDE_DEPTH_9.
    
    return { slides: generatedSlides, totalActualHeight, totalActualWidth };
  }, []);


  const initialLookAt = React.useMemo(() => new THREE.Vector3(0, 0, 0), []); // Centered structure

  const initialCameraPosition = React.useMemo(() => {
    const fovInRadians = camera.fov * (Math.PI / 180);
    const aspect = size.width / size.height;
    
    const heightToFit = slideData.totalActualHeight + SLIDE_DEPTH_9; // Consider slide depth for perspective
    const widthToFit = slideData.totalActualWidth;

    let zDistanceHeight = SLIDE_DEPTH_9 * 2; // Min distance
    if (heightToFit > 0) {
        zDistanceHeight = (heightToFit / 2) / Math.tan(fovInRadians / 2);
    }

    let zDistanceWidth = SLIDE_WIDTH_16 * 2; // Min distance
    if (widthToFit > 0 && aspect > 0) {
        zDistanceWidth = (widthToFit / (2 * aspect)) / Math.tan(fovInRadians / 2);
    }
    
    const zDistance = Math.max(zDistanceHeight, zDistanceWidth, SLIDE_DEPTH_9 * 2) * 1.3; // 30% margin, ensure min distance

    return new THREE.Vector3(0, 0, zDistance); // Y is 0 because layout is centered at Y=0
  }, [slideData, camera.fov, size.width, size.height]);
  
  const defaultCameraUp = React.useMemo(() => new THREE.Vector3(0, 1, 0), []); // Standard Y up for overview
  const zoomedInCameraUp = React.useMemo(() => new THREE.Vector3(0, 0, -1), []); // For looking down, world Z is screen Y

  useFrame(() => {
    const targetSlide = selectedSlideId ? slideData.slides.find(s => s.id === selectedSlideId) : null;

    if (targetSlide) { // Zoom IN
      const slideMeshPosition = targetSlide.position;
      const fovInRadians = camera.fov * (Math.PI / 180);
      const aspect = size.width / size.height;

      // Calculate distance to fit the 16x9 (world X by world Z) content face
      // When camera.up is (0,0,-1), screen Y maps to world -Z, screen X maps to world X
      const distanceForDepthFit = (SLIDE_DEPTH_9 / 2) / Math.tan(fovInRadians / 2); // Fit world Z (screen Y)
      const distanceForWidthFit = (SLIDE_WIDTH_16 / (2 * aspect)) / Math.tan(fovInRadians / 2); // Fit world X (screen X)
      const zoomDistance = Math.max(distanceForDepthFit, distanceForWidthFit) * 1.15; // 15% margin

      const cameraTargetPosition = new THREE.Vector3(
        slideMeshPosition.x,
        slideMeshPosition.y + zoomDistance, // Position camera "above" the slide (along +Y)
        slideMeshPosition.z
      );
      
      const lookAtPosition = slideMeshPosition.clone(); // Look at the center of the slide

      camera.position.lerp(cameraTargetPosition, 0.08);
      camera.up.copy(zoomedInCameraUp); 
      
      if (controlsRef.current) {
        controlsRef.current.target.lerp(lookAtPosition, 0.08);
        controlsRef.current.enabled = false;
      }
      camera.lookAt(lookAtPosition);

    } else { // Zoom OUT
      camera.position.lerp(initialCameraPosition, 0.08);
      camera.up.copy(defaultCameraUp);
      if (controlsRef.current) {
        controlsRef.current.target.lerp(initialLookAt, 0.08);
        controlsRef.current.enabled = true;
      }
      camera.lookAt(initialLookAt);
    }
    if (controlsRef.current) controlsRef.current.update();
  });

  // Initial camera setup
  useEffect(() => {
    camera.position.copy(initialCameraPosition);
    camera.lookAt(initialLookAt);
    camera.up.copy(defaultCameraUp);
    if (controlsRef.current) {
      controlsRef.current.target.copy(initialLookAt);
      controlsRef.current.update();
    }
  }, [camera, initialCameraPosition, initialLookAt, defaultCameraUp, slideData]); // Added slideData as dep

  const handleSlideClick = (slideId) => {
    setSelectedSlideId(prev => (prev === slideId ? null : slideId));
  };
  
  return (
    <>
      <OrbitControls ref={controlsRef} />
      <ambientLight intensity={0.7} />
      <directionalLight 
        position={[30, 40, 50]} 
        intensity={1.2} 
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={150}
        shadow-camera-left={-slideData.totalActualWidth / 2 || -50}
        shadow-camera-right={slideData.totalActualWidth / 2 || 50}
        shadow-camera-top={slideData.totalActualHeight / 2 || 50}
        shadow-camera-bottom={-slideData.totalActualHeight / 2 || -50}
      />
      <directionalLight position={[-20, -10, -30]} intensity={0.4} />
      <Suspense fallback={
          <Text position={[0,0,0]} fontSize={1.5} color="white" anchorX="center" anchorY="middle">Loading PhD Proposal...</Text>
      }>
        {slideData.slides.map(slide => (
          <Slide
            key={slide.id}
            id={slide.id}
            position={slide.position}
            title={slide.title}
            onClick={() => handleSlideClick(slide.id)}
            isSelected={selectedSlideId === slide.id}
          />
        ))}
      </Suspense>
      {selectedSlideId && (
        <Plane
            args={[size.width * 20, size.height * 20]} // Very large backdrop
            position={camera.position.clone().add(new THREE.Vector3(0,0,-1).applyQuaternion(camera.quaternion).multiplyScalar(SLIDE_DEPTH_9 * 5))} 
            onClick={() => setSelectedSlideId(null)} 
            material-transparent
            material-opacity={0.05} 
            material-color="black"
        />
      )}
    </>
  );
};

const InteractivePresentationV4 = () => {
  // Access slideData constants for shadow camera setup if possible, or use estimated fallbacks
  // This is tricky because slideData is internal to PresentationLayoutV4
  // For now, using fixed large shadow frustum or let PresentationLayoutV4 handle it.
  // The shadow props on directionalLight inside PresentationLayoutV4 are better.

  return (
    <Canvas 
      shadows
      camera={{ fov: 50 }} // Initial pos/lookAt set by PresentationLayoutV4
      style={{ width: '100%', height: '100%' }}
      onCreated={({ gl }) => {
        gl.setClearColor(new THREE.Color('#282c34')); // Darker, slightly bluish background
        gl.shadowMap.enabled = true;
        gl.shadowMap.type = THREE.PCFSoftShadowMap;
      }}
    >
      <PresentationLayoutV4 />
    </Canvas>
  );
};

export default InteractivePresentationV4;

// Helper variables for directionalLight shadow camera, needs to be defined or passed if used outside component
// These are illustrative; PresentationLayoutV4 calculates them internally for its lights.
const totalActualWidth = 100; // Example fallback
const totalActualHeight = 100; // Example fallback 