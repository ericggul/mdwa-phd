import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Plane } from '@react-three/drei';
import * as THREE from 'three';
import { useSpring, a } from '@react-spring/three';
import { STRUCTURE } from '@/utils/constant';
import NavigationUI from './NavigationUI'; // Import NavigationUI

const SLIDE_WIDTH_16 = 16; // X-dimension of the content face
const SLIDE_DEPTH_9 = 9;   // Z-dimension of the content face (becomes "height" on screen when zoomed)
const SLIDE_COMPONENT_SLOT_THICKNESS = 2; // Defines the total thickness each component slot occupies

const AnimatedDreiText = a(Text); // Define animatable Drei Text component

// BoxGeometry arguments: [width, height, depth] for the mesh
// Mesh: X=SLIDE_WIDTH_16, Y=SLIDE_COMPONENT_SLOT_THICKNESS, Z=SLIDE_DEPTH_9
const slideBoxArgs = [SLIDE_WIDTH_16, SLIDE_COMPONENT_SLOT_THICKNESS, SLIDE_DEPTH_9];

const Slide = ({ id, position, title, onClick, isSelected, showFrontEdgeTitle, isDimmed, individualThickness }) => {
  const meshRef = useRef();
  const [hovered, setHover] = useState(false);

  const springProps = useSpring({
    scale: hovered && !isSelected ? 1.05 : 1,
    meshOpacity: isDimmed ? 0 : 1, // Dimmed slides (mesh) become fully transparent
    textOpacity: isDimmed ? 0 : 1, // Dimmed text also becomes fully transparent
    config: { tension: 200, friction: 20 },
  });

  const slideBoxArgs = [SLIDE_WIDTH_16, individualThickness, SLIDE_DEPTH_9];

  return (
    <a.mesh
      ref={meshRef}
      position={position}
      scale={springProps.scale}
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
      <boxGeometry args={slideBoxArgs} />
      <a.meshStandardMaterial 
        color={isSelected ? 'lightgreen' : hovered ? 'skyblue' : '#CCCCCC'} 
        roughness={0.6} 
        metalness={0.2} 
        transparent // Required for opacity changes
        opacity={springProps.meshOpacity} // Apply animated opacity
      />
      
      {/* Text on the top face (XZ plane), primarily for zoomed-in view */}
      <AnimatedDreiText
        position={[0, individualThickness / 2 + 0.01, 0]} // On top face, slightly above
        rotation={[-Math.PI / 2, 0, 0]} // Rotate to lay flat on XZ plane
        fontSize={0.7}
        color="black"
        anchorX="center"
        anchorY="middle"
        maxWidth={SLIDE_WIDTH_16 * 0.85}
        textAlign="center"
        lineHeight={1.2}
        fillOpacity={springProps.textOpacity} // Animate text opacity
      >
        {title}
      </AnimatedDreiText>

      {/* Text on the front edge (XY plane at positive Z), for overview visibility */}
      {showFrontEdgeTitle && (
        <AnimatedDreiText
          position={[0, 0, SLIDE_DEPTH_9 / 2 + 0.05]} // Slightly in front of the Z-face
          fontSize={0.65} // Increased font size
          color={isSelected? "black" : "white"} // White for overview, black if selected and material is lightgreen
          anchorX="center"
          anchorY="middle"
          maxWidth={SLIDE_WIDTH_16 * 0.9}
          textAlign="center"
          lineHeight={1}
          fillOpacity={springProps.textOpacity} // Animate text opacity
        >
          {title}
        </AnimatedDreiText>
      )}
    </a.mesh>
  );
};

const PresentationLayoutV4 = ({ setNavigationFunctions }) => {
  const [selectedSlideId, setSelectedSlideId] = useState(null);
  const [currentNavigatedIndex, setCurrentNavigatedIndex] = useState(-1); // -1 for overview
  const { camera, size } = useThree();
  const controlsRef = useRef();

  const { slides, overviewTitles, totalActualHeight, totalActualWidth, orderedSlideIds } = React.useMemo(() => {
    const generatedSlides = [];
    const generatedOverviewTitles = [];
    const generatedOrderedSlideIds = [];
    const yLayerSpacing = SLIDE_COMPONENT_SLOT_THICKNESS * 3; 
    const xNodeSpacing = SLIDE_WIDTH_16 * 1.2; 

    let minYOverall = Infinity, maxYOverall = -Infinity;
    let minXOverall = Infinity, maxXOverall = -Infinity;

    STRUCTURE.forEach((layer, layerIndex) => {
      const numComponents = layer.components.length;
      const layerWidth = (numComponents - 1) * xNodeSpacing;
      const startX = -layerWidth / 2;
      // currentLayerBaseY is the Y of the BOTTOM of the current component slot
      const currentLayerBaseY = -(layerIndex * yLayerSpacing);

      minYOverall = Math.min(minYOverall, currentLayerBaseY);
      maxYOverall = Math.max(maxYOverall, currentLayerBaseY + SLIDE_COMPONENT_SLOT_THICKNESS);

      layer.components.forEach((component, componentIndex) => {
        const componentBaseX = startX + componentIndex * xNodeSpacing;
        const componentBaseZ = 0; 

        const isFrameworkComponent = layer.section === 'Framework Design' &&
                                     (component.title === 'Interactive Taxonomy' ||
                                      component.title === 'State-based Architecture' ||
                                      component.title === 'Dimensional Transformation');
        const numSlidesForThisComponent = isFrameworkComponent ? 2 : 1;
        const actualIndividualSlideThickness = SLIDE_COMPONENT_SLOT_THICKNESS / numSlidesForThisComponent;

        if (numSlidesForThisComponent > 1) {
          for (let i = 0; i < numSlidesForThisComponent; i++) {
            const slideId = `${layerIndex}-${componentIndex}-${i}`;
            generatedOrderedSlideIds.push(slideId);
            const individualSlideTitle = `${component.title} (Part ${i + 1})`;
            // Calculate Y center of this individual sub-slide within the slot
            const yPos = currentLayerBaseY + (i * actualIndividualSlideThickness) + (actualIndividualSlideThickness / 2);
            const position = new THREE.Vector3(componentBaseX, yPos, componentBaseZ);
            generatedSlides.push({
              id: slideId,
              title: individualSlideTitle,
              position: position,
              showFrontEdgeTitle: false, 
              individualThickness: actualIndividualSlideThickness,
            });
          }
          // Overview title for the entire stack, centered in the component slot
          const stackCenterY = currentLayerBaseY + SLIDE_COMPONENT_SLOT_THICKNESS / 2;
          generatedOverviewTitles.push({
            id: `title-${layerIndex}-${componentIndex}`,
            text: component.title,
            position: new THREE.Vector3(componentBaseX, stackCenterY, componentBaseZ + SLIDE_DEPTH_9 / 2 + 0.05),
          });

        } else {
          const slideId = `${layerIndex}-${componentIndex}-0`;
          generatedOrderedSlideIds.push(slideId);
          // Center of the single slide within the slot
          const yPos = currentLayerBaseY + SLIDE_COMPONENT_SLOT_THICKNESS / 2;
          const position = new THREE.Vector3(componentBaseX, yPos, componentBaseZ);
          generatedSlides.push({
            id: slideId,
            title: component.title, 
            position: position,
            showFrontEdgeTitle: true,
            individualThickness: actualIndividualSlideThickness, // which is SLIDE_COMPONENT_SLOT_THICKNESS
          });
        }
        minXOverall = Math.min(minXOverall, componentBaseX - SLIDE_WIDTH_16 / 2);
        maxXOverall = Math.max(maxXOverall, componentBaseX + SLIDE_WIDTH_16 / 2);
      });
    });
    
    const structureCenterY = (minYOverall + maxYOverall) / 2;
    const structureCenterX = (minXOverall + maxXOverall) / 2; 

    generatedSlides.forEach(s => {
      s.position.y -= structureCenterY;
      s.position.x -= structureCenterX; 
    });
    generatedOverviewTitles.forEach(t => {
        t.position.y -= structureCenterY;
        t.position.x -= structureCenterX;
    });

    let finalMinY = Infinity, finalMaxY = -Infinity;
    let finalMinX = Infinity, finalMaxX = -Infinity;
    // Calculate bounds based on component slots for camera fitting
    STRUCTURE.forEach((layer, layerIndex) => {
        const numComponents = layer.components.length;
        const layerWidth = (numComponents - 1) * xNodeSpacing;
        const startX = -layerWidth / 2 - structureCenterX; // Apply centering
        const layerBaseY = -(layerIndex * yLayerSpacing) - structureCenterY; // Apply centering

        finalMinY = Math.min(finalMinY, layerBaseY);
        finalMaxY = Math.max(finalMaxY, layerBaseY + SLIDE_COMPONENT_SLOT_THICKNESS);

        for(let compIdx = 0; compIdx < numComponents; compIdx++){
            const compX = startX + compIdx * xNodeSpacing;
            finalMinX = Math.min(finalMinX, compX - SLIDE_WIDTH_16/2);
            finalMaxX = Math.max(finalMaxX, compX + SLIDE_WIDTH_16/2);
        }
    });

    const calcTotalActualHeight = finalMaxY - finalMinY;
    const calcTotalActualWidth = finalMaxX - finalMinX;
    
    return { slides: generatedSlides, overviewTitles: generatedOverviewTitles, totalActualHeight: calcTotalActualHeight, totalActualWidth: calcTotalActualWidth, orderedSlideIds: generatedOrderedSlideIds };
  }, []);

  useEffect(() => {
    if (currentNavigatedIndex >= 0 && currentNavigatedIndex < orderedSlideIds.length) {
      setSelectedSlideId(orderedSlideIds[currentNavigatedIndex]);
    } else {
      setSelectedSlideId(null); // Go to overview
    }
  }, [currentNavigatedIndex, orderedSlideIds]);

  const goToSlideByIndex = (index) => {
    setCurrentNavigatedIndex(index);
  };

  const goToNextSlide = React.useCallback(() => {
    setCurrentNavigatedIndex(prev => {
      if (prev === -1) return 0; // From overview, go to first slide
      const nextIndex = prev + 1;
      return nextIndex >= orderedSlideIds.length ? -1 : nextIndex; // If at end, go to overview, else next
    });
  }, [orderedSlideIds.length]);

  const goToPrevSlide = React.useCallback(() => {
    setCurrentNavigatedIndex(prev => {
      if (prev === -1) return orderedSlideIds.length - 1; // From overview, go to last slide
      const prevIndex = prev - 1;
      return prevIndex < 0 ? -1 : prevIndex; // If at beginning, go to overview, else prev
    });
  }, [orderedSlideIds.length]);
  
  const goToOverview = React.useCallback(() => {
      setCurrentNavigatedIndex(-1);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowRight') {
        goToNextSlide();
      } else if (event.key === 'ArrowLeft') {
        goToPrevSlide();
      } else if (event.key === 'Escape') {
        goToOverview();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [goToNextSlide, goToPrevSlide, goToOverview]);

  useEffect(() => {
    if (setNavigationFunctions) {
      setNavigationFunctions({
        onPrev: goToPrevSlide,
        onNext: goToNextSlide,
        onOverview: goToOverview,
        currentIndex: currentNavigatedIndex,
        totalSlides: orderedSlideIds.length
      });
    }
  }, [setNavigationFunctions, goToPrevSlide, goToNextSlide, goToOverview, currentNavigatedIndex, orderedSlideIds.length]);

  const initialLookAt = React.useMemo(() => new THREE.Vector3(0, 0, 0), []);

  const initialCameraPosition = React.useMemo(() => {
    const fovInRadians = camera.fov * (Math.PI / 180);
    const aspect = size.width / size.height;
    
    const heightToFit = totalActualHeight + SLIDE_DEPTH_9; 
    const widthToFit = totalActualWidth;

    let zDistanceHeight = SLIDE_DEPTH_9 * 2; 
    if (heightToFit > 0) {
        zDistanceHeight = (heightToFit / 2) / Math.tan(fovInRadians / 2);
    }

    let zDistanceWidth = SLIDE_WIDTH_16 * 2; 
    if (widthToFit > 0 && aspect > 0) {
        zDistanceWidth = (widthToFit / (2 * aspect)) / Math.tan(fovInRadians / 2);
    }
    
    const zDistance = Math.max(zDistanceHeight, zDistanceWidth, SLIDE_DEPTH_9 * 2, SLIDE_COMPONENT_SLOT_THICKNESS * 5) * 1.3; 

    return new THREE.Vector3(0, 0, zDistance); 
  }, [totalActualHeight, totalActualWidth, camera.fov, size.width, size.height]);
  
  const defaultCameraUp = React.useMemo(() => new THREE.Vector3(0, 1, 0), []);
  const zoomedInCameraUp = React.useMemo(() => new THREE.Vector3(0, 0, -1), []);

  useFrame(() => {
    const targetSlide = selectedSlideId ? slides.find(s => s.id === selectedSlideId) : null;

    if (targetSlide) { 
      const slideMeshPosition = targetSlide.position;
      const fovInRadians = camera.fov * (Math.PI / 180);
      const aspect = size.width / size.height;

      const distanceForDepthFit = (SLIDE_DEPTH_9 / 2) / Math.tan(fovInRadians / 2); 
      const distanceForWidthFit = (SLIDE_WIDTH_16 / (2 * aspect)) / Math.tan(fovInRadians / 2); 
      const zoomDistance = Math.max(distanceForDepthFit, distanceForWidthFit) * 1.15; 

      const cameraTargetPosition = new THREE.Vector3(
        slideMeshPosition.x,
        slideMeshPosition.y + zoomDistance, 
        slideMeshPosition.z
      );
      
      const lookAtPosition = slideMeshPosition.clone(); 

      camera.position.lerp(cameraTargetPosition, 0.08);
      camera.up.copy(zoomedInCameraUp); 
      
      if (controlsRef.current) {
        controlsRef.current.target.lerp(lookAtPosition, 0.08);
        controlsRef.current.enabled = false;
      }
      camera.lookAt(lookAtPosition);

    } else { 
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

  useEffect(() => {
    if (!selectedSlideId) { // Only reset to initial if going to overview
        camera.position.copy(initialCameraPosition);
        camera.lookAt(initialLookAt);
        camera.up.copy(defaultCameraUp);
        if (controlsRef.current) {
          controlsRef.current.target.copy(initialLookAt);
          controlsRef.current.update();
        }
    }
  }, [selectedSlideId, camera, initialCameraPosition, initialLookAt, defaultCameraUp]);

  const handleSlideClick = (slideId) => {
    const index = orderedSlideIds.findIndex(id => id === slideId);
    if (index !== -1) {
      goToSlideByIndex(index);
    } else {
      // Fallback or error if slideId not in ordered list, though should not happen
      goToOverview(); 
    }
  };
  
  // For the overview titles, they should also dim if any slide is selected.
  const overviewTitlesSpring = useSpring({
    opacity: selectedSlideId !== null ? 0 : 1,
    config: { tension: 200, friction: 20 }
  });

  return (
    <>
      <OrbitControls ref={controlsRef} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[30, 40, 50]} intensity={1.2} />
      <directionalLight position={[-20, -10, -30]} intensity={0.4} />
      <Suspense fallback={
          <Text position={[0,0,0]} fontSize={1.5} color="white" anchorX="center" anchorY="middle">Loading PhD Proposal...</Text>
      }>
        {slides.map(slide => (
          <Slide
            key={slide.id}
            id={slide.id}
            position={slide.position}
            title={slide.title}
            onClick={() => handleSlideClick(slide.id)}
            isSelected={selectedSlideId === slide.id}
            showFrontEdgeTitle={slide.showFrontEdgeTitle}
            isDimmed={selectedSlideId !== null && selectedSlideId !== slide.id}
            individualThickness={slide.individualThickness}
          />
        ))}
        {overviewTitles.map(titleInfo => (
            <AnimatedDreiText // Use AnimatedDreiText for overview titles as well
                key={titleInfo.id}
                position={titleInfo.position}
                fontSize={0.65} 
                color={"white"} 
                anchorX="center"
                anchorY="middle"
                maxWidth={SLIDE_WIDTH_16 * 0.9}
                textAlign="center"
                lineHeight={1}
                fillOpacity={overviewTitlesSpring.opacity} // Animate opacity of overview titles
            >
                {titleInfo.text}
            </AnimatedDreiText>
        ))}
      </Suspense>
      {selectedSlideId && (
        <Plane
            args={[size.width * 20, size.height * 20]} 
            position={camera.position.clone().add(new THREE.Vector3(0,0,-1).applyQuaternion(camera.quaternion).multiplyScalar(SLIDE_DEPTH_9 * 6))} // Pushed further back
            onClick={goToOverview} // Use goToOverview for consistency
            material-transparent
            material-opacity={0.02} // More transparent backdrop
            material-color="black"
        />
      )}
    </>
  );
};

const InteractivePresentationV4 = () => {
  const [navFunctions, setNavFunctions] = useState({
    onPrev: () => {},
    onNext: () => {},
    onOverview: () => {},
    currentIndex: -1,
    totalSlides: 0
  });

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas 
        camera={{ fov: 50 }} 
        style={{ width: '100%', height: '100%' }}
        onCreated={({ gl }) => {
          gl.setClearColor(new THREE.Color('#282c34')); 
        }}
      >
        <PresentationLayoutV4 setNavigationFunctions={setNavFunctions} />
      </Canvas>
      <NavigationUI {...navFunctions} />
    </div>
  );
};

export default InteractivePresentationV4;

// Helper variables for directionalLight shadow camera, needs to be defined or passed if used outside component
// These are illustrative; PresentationLayoutV4 calculates them internally for its lights.
const totalActualWidth = 100; // Example fallback
const totalActualHeight = 100; // Example fallback 