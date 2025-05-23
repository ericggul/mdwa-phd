import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Box } from '@react-three/drei';
import { Vector3 } from 'three';
import { STRUCTURE } from '../utils/constant/index.js';

// Cube component with proper aspect ratio
function PresentationCube({ position, title, section, onClick, isSelected }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  // Cube dimensions - maintaining 1:9:16 aspect ratio (scaled down for visibility)
  const width = 2;
  const height = width * 9 / 16 * 0.3; // Scaled down for neural network view
  const depth = width * 1 / 16 * 0.3;
  
  useFrame((state) => {
    if (meshRef.current && !isSelected) {
      meshRef.current.rotation.y += 0.005;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group position={position}>
      <Box
        ref={meshRef}
        args={[width, height, depth]}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial 
          color={isSelected ? '#00ff88' : hovered ? '#ff6b6b' : '#4ecdc4'} 
          transparent
          opacity={hovered ? 0.9 : 0.7}
        />
      </Box>
      <Text
        position={[0, -height/2 - 0.5, 0]}
        fontSize={0.3}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        maxWidth={3}
      >
        {title}
      </Text>
      <Text
        position={[0, height/2 + 0.3, 0]}
        fontSize={0.2}
        color="#cccccc"
        anchorX="center"
        anchorY="middle"
        maxWidth={3}
      >
        {section}
      </Text>
    </group>
  );
}

// Connection line between cubes
function ConnectionLine({ start, end }) {
  const points = [new Vector3(...start), new Vector3(...end)];
  
  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color="#666666" opacity={0.6} transparent />
    </line>
  );
}

// Camera controller for zoom functionality
function CameraController({ targetPosition, targetLookAt, isZoomed }) {
  const { camera } = useThree();
  
  useFrame(() => {
    if (isZoomed && targetPosition) {
      camera.position.lerp(new Vector3(...targetPosition), 0.05);
      camera.lookAt(new Vector3(...targetLookAt));
    } else {
      // Default overview position
      camera.position.lerp(new Vector3(0, 0, 25), 0.05);
      camera.lookAt(new Vector3(0, 0, 0));
    }
  });
  
  return null;
}

// Main presentation structure
function PresentationStructure() {
  const [selectedCube, setSelectedCube] = useState(null);
  const [cubes, setCubes] = useState([]);
  const [connections, setConnections] = useState([]);

  useEffect(() => {
    // Generate cube positions based on the 1-3-1-3-1-3-1 structure
    const layerSpacing = 8;
    const verticalSpacing = 4;
    const generatedCubes = [];
    const generatedConnections = [];
    
    let cubeIndex = 0;
    
    STRUCTURE.forEach((section, layerIndex) => {
      const layerY = (STRUCTURE.length - 1 - layerIndex) * layerSpacing - (STRUCTURE.length - 1) * layerSpacing / 2;
      const componentCount = section.components.length;
      
      section.components.forEach((component, componentIndex) => {
        const x = componentCount === 1 ? 0 : 
                  (componentIndex - (componentCount - 1) / 2) * verticalSpacing;
        
        const cube = {
          id: cubeIndex,
          position: [x, layerY, 0],
          title: component.title,
          section: section.section,
          layerIndex,
          componentIndex
        };
        
        generatedCubes.push(cube);
        
        // Create connections to previous layer
        if (layerIndex > 0) {
          const prevLayerCubes = generatedCubes.filter(c => c.layerIndex === layerIndex - 1);
          prevLayerCubes.forEach(prevCube => {
            generatedConnections.push({
              start: prevCube.position,
              end: cube.position
            });
          });
        }
        
        cubeIndex++;
      });
    });
    
    setCubes(generatedCubes);
    setConnections(generatedConnections);
  }, []);

  const handleCubeClick = (cube) => {
    if (selectedCube?.id === cube.id) {
      // Deselect if clicking the same cube
      setSelectedCube(null);
    } else {
      setSelectedCube(cube);
    }
  };

  const getCameraTarget = () => {
    if (!selectedCube) return { position: [0, 0, 25], lookAt: [0, 0, 0] };
    
    const [x, y, z] = selectedCube.position;
    return {
      position: [x + 8, y, z + 12], // Position camera to view the cube in landscape orientation
      lookAt: [x, y, z]
    };
  };

  const { position: targetPosition, lookAt: targetLookAt } = getCameraTarget();

  return (
    <>
      <CameraController 
        targetPosition={targetPosition}
        targetLookAt={targetLookAt}
        isZoomed={!!selectedCube}
      />
      
      {/* Render connections */}
      {connections.map((connection, index) => (
        <ConnectionLine 
          key={`connection-${index}`}
          start={connection.start}
          end={connection.end}
        />
      ))}
      
      {/* Render cubes */}
      {cubes.map((cube) => (
        <PresentationCube
          key={cube.id}
          position={cube.position}
          title={cube.title}
          section={cube.section}
          onClick={() => handleCubeClick(cube)}
          isSelected={selectedCube?.id === cube.id}
        />
      ))}
      
      {/* Instructions text */}
      <Text
        position={[0, -20, 0]}
        fontSize={0.8}
        color="#888888"
        anchorX="center"
        anchorY="middle"
      >
        Click on any cube to zoom in • Click again to zoom out
      </Text>
    </>
  );
}

export default function ThreeDPresentation() {
  return (
    <Canvas 
      camera={{ position: [0, 0, 25], fov: 75 }}
      style={{ width: '100%', height: '100%' }}
    >
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
      
      <PresentationStructure />
      
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        maxDistance={50}
        minDistance={5}
      />
    </Canvas>
  );
} 