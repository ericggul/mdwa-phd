import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Plane } from '@react-three/drei';
import * as THREE from 'three';
import { useSpring, a } from '@react-spring/three';
import { STRUCTURE } from '@/utils/constant';

// Define slide dimensions based on 2:9:16 ratio
const SLIDE_DIM_16 = 16; // The 16-unit dimension (becomes width for content)
const SLIDE_DIM_9 = 9;   // The 9-unit dimension (becomes height for content)
const SLIDE_THICKNESS = 2; // The 2-unit dimension (thickness, becomes Y in layout)

// BoxGeometry arguments: [width, height, depth] for the mesh
// Initial view: 2x16 face. This means height is SLIDE_THICKNESS, width is SLIDE_DIM_16.
// The content face (9x16) is oriented "upwards" (its normal along world Y initially).
// So, for the mesh, dimensions will be: X (width) = 16, Y (height/thickness) = 2, Z (depth) = 9.
const slideBoxArgs = [SLIDE_DIM_16, SLIDE_THICKNESS, SLIDE_DIM_9];

const Slide = ({ position, title, onClick, isSelected }) => {
  const meshRef = useRef();
  const [hovered, setHover] = useState(false);

  const { scale } = useSpring({
    scale: hovered ? 1.1 : 1,
    config: { tension: 300, friction: 20 },
  });

  return (
    <a.mesh
      ref={meshRef}
      position={position}
      scale={scale}
      onClick={(event) => {
        event.stopPropagation();
        console.log("Slide <a.mesh> clicked:", title);
        onClick();
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHover(true);
      }}
      onPointerOut={(event) => {
        event.stopPropagation();
        setHover(false);
      }}
    >
      <boxGeometry args={slideBoxArgs} />
      <meshStandardMaterial color={isSelected ? 'hotpink' : hovered ? 'lightsalmon' : 'royalblue'} />
      <Text
        position={[0, 0, SLIDE_DIM_9 / 2 + 0.1]}
        fontSize={0.6}
        color="white"
        anchorX="center"
        anchorY="middle"
        maxWidth={SLIDE_DIM_16 * 0.9}
        textAlign="center"
      >
        {title}
      </Text>
    </a.mesh>
  );
};

const PresentationLayout = () => {
  const [selectedSlideId, setSelectedSlideId] = useState(null);
  console.log("PresentationLayout rendered. SelectedSlideId:", selectedSlideId);
  const { camera, size } = useThree();
  const controlsRef = useRef();

  const slideData = React.useMemo(() => {
    const positions = [];
    let currentYOffset = 0;
    const yLayerSpacing = SLIDE_THICKNESS * 3;
    const xNodeSpacing = SLIDE_DIM_16 * 1.2;
    let minY = Infinity, maxY = -Infinity;

    STRUCTURE.forEach((layer, layerIndex) => {
      const numComponents = layer.components.length;
      const layerWidth = (numComponents - 1) * xNodeSpacing;
      const startX = -layerWidth / 2;

      // Calculate Y for this layer BEFORE applying it to slides
      // The first layer starts at some Y, then subsequent layers go down.
      let layerY = - (layerIndex * yLayerSpacing); 

      layer.components.forEach((component, componentIndex) => {
        const position = new THREE.Vector3(startX + componentIndex * xNodeSpacing, layerY, 0);
        positions.push({
          id: `${layerIndex}-${componentIndex}`,
          title: component.title,
          position: position,
          targetLookAt: position.clone(), 
        });
        if (layerY < minY) minY = layerY;
        if (layerY > maxY) maxY = layerY;
      });
    });
    
    // Calculate the true center of the generated Y positions
    const structureCenterY = (minY + maxY) / 2;

    // Shift all positions so their collective center is at Y=0
    positions.forEach(p => {
      p.position.y -= structureCenterY;
      p.targetLookAt.y -= structureCenterY;
    });

    // Recalculate actual height/width after centering for camera logic
    let finalMinY = Infinity, finalMaxY = -Infinity;
    let finalMinX = Infinity, finalMaxX = -Infinity;
    positions.forEach(p => {
        if(p.position.y < finalMinY) finalMinY = p.position.y;
        if(p.position.y > finalMaxY) finalMaxY = p.position.y;
        if(p.position.x - SLIDE_DIM_16/2 < finalMinX) finalMinX = p.position.x - SLIDE_DIM_16/2;
        if(p.position.x + SLIDE_DIM_16/2 > finalMaxX) finalMaxX = p.position.x + SLIDE_DIM_16/2;
    });

    const totalActualHeight = finalMaxY - finalMinY;
    const totalActualWidth = finalMaxX - finalMinX;
    
    console.log("Calculated slideData: minY, maxY, centerY, totalActualHeight, totalActualWidth", minY, maxY, structureCenterY, totalActualHeight, totalActualWidth);
    return { positions, totalActualHeight, totalActualWidth };
  }, []);

  const initialLookAt = React.useMemo(() => new THREE.Vector3(0, 0, 0), []);

  const initialCameraPosition = React.useMemo(() => {
    const fovInRadians = camera.fov * (Math.PI / 180);
    const aspect = size.width / size.height;
    
    // Use totalActualHeight and totalActualWidth from the centered slideData
    const heightToFit = slideData.totalActualHeight;
    const widthToFit = slideData.totalActualWidth;
    console.log("InitialCam: HtoFit, WtoFit", heightToFit, widthToFit);

    let zDistanceHeight = SLIDE_DIM_9 * 4; // Default min distance
    if (heightToFit > 0) {
        zDistanceHeight = (heightToFit / 2) / Math.tan(fovInRadians / 2);
    }

    let zDistanceWidth = SLIDE_DIM_16 * 4; // Default min distance
    if (widthToFit > 0 && aspect > 0) {
        zDistanceWidth = (widthToFit / (2 * aspect)) / Math.tan(fovInRadians / 2);
    }
    
    const zDistance = Math.max(zDistanceHeight, zDistanceWidth, SLIDE_DIM_9 * 2) * 1.3; // 30% margin
    console.log("InitialCam: zDistH, zDistW, final Z", zDistanceHeight, zDistanceWidth, zDistance);

    return new THREE.Vector3(0, 0, zDistance);
  }, [slideData, camera.fov, size.width, size.height]);
  
  const defaultCameraUp = React.useMemo(() => new THREE.Vector3(0, 1, 0), []);
  const zoomedCameraUp = React.useMemo(() => new THREE.Vector3(0, 0, -1), []);

  useEffect(() => {
    console.log("Zoom useEffect triggered. SelectedSlideId:", selectedSlideId);
    const targetData = selectedSlideId ? slideData.positions.find(s => s.id === selectedSlideId) : null;

    if (targetData) { // Zoom IN
      const slide = targetData;
      const lookAtPosition = slide.targetLookAt; // Already centered correctly for the slide

      const contentWidth = SLIDE_DIM_16;
      const contentHeight = SLIDE_DIM_9;
      const aspect = size.width / size.height;
      const fovInRadians = camera.fov * (Math.PI / 180);
      let distance = (contentHeight / 2) / Math.tan(fovInRadians / 2);
      const visibleWidthAtThisDistance = distance * 2 * Math.tan(fovInRadians / 2) * aspect;
      if (visibleWidthAtThisDistance < contentWidth) {
        distance = (contentWidth / (2 * aspect)) / Math.tan(fovInRadians / 2);
      }
      distance *= 1.15; // 15% margin

      const cameraPosition = new THREE.Vector3(
        slide.position.x,
        slide.position.y + SLIDE_THICKNESS / 2 + distance, // Positioned above the top face of the slide
        slide.position.z
      );
      
      camera.up.copy(zoomedCameraUp);
      camera.position.lerp(cameraPosition, 0.15);
      camera.lookAt(lookAtPosition);

      if (controlsRef.current) {
        controlsRef.current.target.lerp(lookAtPosition, 0.15);
        controlsRef.current.enabled = false;
      }
    } else { // Zoom OUT
      camera.up.copy(defaultCameraUp);
      camera.position.lerp(initialCameraPosition, 0.15);
      camera.lookAt(initialLookAt);
      if (controlsRef.current) {
        controlsRef.current.target.lerp(initialLookAt, 0.15);
        controlsRef.current.enabled = true;
      }
    }
    if (controlsRef.current) controlsRef.current.update();
  }, [selectedSlideId, camera, size, slideData, initialCameraPosition, initialLookAt, defaultCameraUp, zoomedCameraUp]);

  useEffect(() => {
    camera.position.copy(initialCameraPosition);
    camera.lookAt(initialLookAt);
    camera.up.copy(defaultCameraUp);
    if (controlsRef.current) {
      controlsRef.current.target.copy(initialLookAt);
      controlsRef.current.update();
    }
  }, [camera, initialCameraPosition, initialLookAt, defaultCameraUp]); // Removed slideData from deps to avoid re-trigger due to its object nature


  return (
    <>
      <OrbitControls ref={controlsRef} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 15, 20]} intensity={1.2} />
      <Suspense fallback={null}>
        {slideData.positions.map(({ id, title, position }) => (
          <Slide
            key={id}
            position={position}
            title={title}
            onClick={() => setSelectedSlideId(prev => (prev === id ? null : id))}
            isSelected={selectedSlideId === id}
          />
        ))}
      </Suspense>
      {selectedSlideId && (
        <Plane
            args={[size.width * 2, size.height * 2]} 
             position={camera.position.clone().add(new THREE.Vector3(0,0,-1).applyQuaternion(camera.quaternion).multiplyScalar(20))} 
            onClick={() => setSelectedSlideId(null)} 
            material-transparent
            material-opacity={0.05} 
            material-color="black"
        />
      )}
    </>
  );
};

const InteractivePresentation = () => {
  return (
    <Canvas 
      camera={{ position: [0,0,50], fov: 50}} // Initial position set by PresentationLayout's useEffect
      style={{ width: '100%', height: '100%' }}
      onCreated={({ gl }) => {
        gl.setClearColor(new THREE.Color('#202020')); // Dark grey background
      }}
    >
      <PresentationLayout />
    </Canvas>
  );
};

export default InteractivePresentation;
