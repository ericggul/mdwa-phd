import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Box, Plane } from '@react-three/drei';
import * as THREE from 'three';
import { useSpring, a } from '@react-spring/three';
import { STRUCTURE } from '@/utils/constant'; // Assuming this is the correct path
import { Interactive } from '@react-three/xr'; // For click interactions

const slideDepth = 1;
const slideHeight = 9;
const slideWidth = 16;
const slideRatio = slideWidth / slideHeight;

const Slide = ({ position, title, onClick, isSelected }) => {
  const meshRef = useRef();
  const [hovered, setHover] = useState(false);

  const { scale } = useSpring({
    scale: hovered ? 1.1 : 1,
    config: { tension: 300, friction: 20 },
  });

  return (
    <Interactive onSelect={onClick} onHover={() => setHover(true)} onBlur={() => setHover(false)}>
      <a.mesh
        ref={meshRef}
        position={position}
        scale={scale}
      >
        <boxGeometry args={[slideWidth, slideHeight, slideDepth]} />
        <meshStandardMaterial color={isSelected ? 'hotpink' : hovered ? 'lightsalmon' : 'royalblue'} />
        <Text
          position={[0, 0, slideDepth / 2 + 0.1]} // Slightly in front of the slide
          fontSize={1}
          color="white"
          anchorX="center"
          anchorY="middle"
          maxWidth={slideWidth * 0.8}
          textAlign="center"
        >
          {title}
        </Text>
      </a.mesh>
    </Interactive>
  );
};

const PresentationLayout = () => {
  const [selectedSlide, setSelectedSlide] = useState(null);
  const { camera, size } = useThree();
  const controlsRef = useRef();

  const slidePositions = [];
  let yOffset = 0;
  const ySpacing = slideHeight * 1.5; // Vertical spacing between layers
  const xSpacing = slideWidth * 1.2; // Horizontal spacing within layers

  STRUCTURE.forEach((layer, layerIndex) => {
    const numComponents = layer.components.length;
    const layerWidth = (numComponents - 1) * xSpacing;
    const startX = -layerWidth / 2;

    layer.components.forEach((component, componentIndex) => {
      slidePositions.push({
        id: `${layerIndex}-${componentIndex}`,
        title: component.title,
        position: new THREE.Vector3(startX + componentIndex * xSpacing, yOffset, 0),
        targetPosition: new THREE.Vector3(startX + componentIndex * xSpacing, yOffset, slideDepth * 2 + 5), // Camera looks at this point
        cameraPosition: new THREE.Vector3(startX + componentIndex * xSpacing, yOffset, slideDepth * 2 + 25), // Camera zooms to here
      });
    });
    yOffset -= ySpacing; // Move to the next layer down
  });

  // Center the whole structure vertically
  const totalHeight = Math.abs(yOffset) - ySpacing;
  slidePositions.forEach(p => {
    p.position.y += totalHeight / 2;
    p.targetPosition.y += totalHeight / 2;
    p.cameraPosition.y += totalHeight / 2;
  });

  const initialCameraPosition = new THREE.Vector3(0, 0, Math.max(totalHeight, slidePositions.length * slideWidth / 3) + 50); // Adjust Z based on layout size
  const initialLookAt = new THREE.Vector3(0, 0, 0);

  useEffect(() => {
    if (selectedSlide) {
      // Zoom in to selected slide
      const target = slidePositions.find(s => s.id === selectedSlide);
      if (target) {
        camera.position.lerp(target.cameraPosition, 0.1); // Smooth transition
        camera.lookAt(target.targetPosition);
        if (controlsRef.current) {
          controlsRef.current.target.lerp(target.targetPosition, 0.1);
        }
      }
    } else {
      // Zoom out to overview
      camera.position.lerp(initialCameraPosition, 0.1);
      camera.lookAt(initialLookAt);
      if (controlsRef.current) {
        controlsRef.current.target.lerp(initialLookAt, 0.1);
      }
    }
    if (controlsRef.current) controlsRef.current.update();
  }, [selectedSlide, camera, initialCameraPosition, initialLookAt, slidePositions]);

  // Adjust camera for aspect ratio on zoom
  useEffect(() => {
    if (selectedSlide) {
        const target = slidePositions.find(s => s.id === selectedSlide);
        if (target) {
            const fitOffset = 1.1; // a bit of margin
            const distance = (slideHeight / 2 / Math.tan(Math.PI * camera.fov / 360)) * fitOffset;
            const newCameraZ = target.position.z + distance;
            const newCameraPos = new THREE.Vector3(target.position.x, target.position.y, newCameraZ);
            
            // Update target and camera positions for zoom
            target.cameraPosition.set(newCameraPos.x, newCameraPos.y, newCameraPos.z);
            target.targetPosition.set(target.position.x, target.position.y, target.position.z);

            // If this slide is currently selected, immediately update the lerp target
            camera.position.lerp(target.cameraPosition, 0.1);
            camera.lookAt(target.targetPosition);
            if (controlsRef.current) {
                controlsRef.current.target.lerp(target.targetPosition, 0.1);
            }
        }
    }
  }, [selectedSlide, camera, size, slidePositions]);


  // Set initial camera position
  useEffect(() => {
    camera.position.copy(initialCameraPosition);
    camera.lookAt(initialLookAt);
    if (controlsRef.current) {
      controlsRef.current.target.copy(initialLookAt);
      controlsRef.current.update();
    }
  }, [camera, initialCameraPosition, initialLookAt]);


  return (
    <>
      <OrbitControls ref={controlsRef} enableZoom={!selectedSlide} enablePan={!selectedSlide} enableRotate={!selectedSlide} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} intensity={1} />
      <Suspense fallback={null}>
        {slidePositions.map(({ id, title, position }) => (
          <Slide
            key={id}
            position={position}
            title={title}
            onClick={() => setSelectedSlide(prev => (prev === id ? null : id))} // Click to select/deselect
            isSelected={selectedSlide === id}
          />
        ))}
      </Suspense>
      {selectedSlide && (
        <Plane
            args={[size.width /100, size.height /100]} // Make a backdrop plane
            position={[camera.position.x, camera.position.y, camera.position.z - 20]} // Position behind zoomed slide but in front of far plane
            onClick={() => setSelectedSlide(null)} // Click backdrop to zoom out
        >
            <meshStandardMaterial color="black" transparent opacity={0.5} />
        </Plane>
      )}
    </>
  );
};

const InteractivePresentation = () => {
  return (
    <Canvas style={{ width: '100%', height: '100%' }}>
      <PresentationLayout />
    </Canvas>
  );
};

export default InteractivePresentation; 