import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Plane } from '@react-three/drei';
import * as THREE from 'three';
import { useSpring, a } from '@react-spring/three';
import { STRUCTURE } from '@/utils/constant';
import NavigationUI from './NavigationUI';

// Layout constants - using v4's approach but for front-facing slides
const SLIDE_WIDTH_16 = 16; 
const SLIDE_DEPTH_9 = 9;   
const SLIDE_THICKNESS = 0.8; // Thickness of individual slides
const SLIDE_COMPONENT_SLOT_THICKNESS = 2; // Total thickness each component slot occupies

const AnimatedDreiText = a(Text);

// BoxGeometry: [width, height, depth] where slides face forward (positive Z)
const slideBoxArgs = [SLIDE_WIDTH_16, SLIDE_DEPTH_9, SLIDE_THICKNESS];

const Slide = ({ id, position, title, onClick, isSelected, showFrontEdgeTitle, isDimmed, individualThickness }) => {
  const meshRef = useRef();
  const [hovered, setHover] = useState(false);

  const springProps = useSpring({
    scale: hovered && !isSelected ? 1.05 : 1,
    meshOpacity: isDimmed ? 0 : 1,
    textOpacity: isDimmed ? 0 : 1,
    config: { tension: 200, friction: 20 },
  });

  const adjustedBoxArgs = [SLIDE_WIDTH_16, SLIDE_DEPTH_9, individualThickness];

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
      <boxGeometry args={adjustedBoxArgs} />
      <a.meshStandardMaterial 
        color={isSelected ? 'lightgreen' : hovered ? 'skyblue' : '#CCCCCC'} 
        roughness={0.6} 
        metalness={0.2} 
        transparent
        opacity={springProps.meshOpacity}
      />
      
      {/* Text on the front face (positive Z face) */}
      <AnimatedDreiText
        position={[0, 0, individualThickness / 2 + 0.02]}
        fontSize={0.7}
        color="black"
        anchorX="center"
        anchorY="middle"
        maxWidth={SLIDE_WIDTH_16 * 0.85}
        textAlign="center"
        lineHeight={1.2}
        fillOpacity={springProps.textOpacity}
      >
        {title}
      </AnimatedDreiText>

      {/* Optional title on the edge for overview visibility */}
      {showFrontEdgeTitle && (
        <AnimatedDreiText
          position={[0, SLIDE_DEPTH_9 / 2 + 0.05, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          fontSize={0.65}
          color={isSelected ? "black" : "white"}
          anchorX="center"
          anchorY="middle"
          maxWidth={SLIDE_WIDTH_16 * 0.9}
          textAlign="center"
          lineHeight={1}
          fillOpacity={springProps.textOpacity}
        >
          {title}
        </AnimatedDreiText>
      )}
    </a.mesh>
  );
};

const PresentationLayoutV5 = ({ setNavigationFunctions }) => {
  const [selectedSlideId, setSelectedSlideId] = useState(null);
  const [currentNavigatedIndex, setCurrentNavigatedIndex] = useState(-1);
  const { camera, size } = useThree();
  const controlsRef = useRef();
  const previousTargetIdRef = useRef(null);

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
            const yPos = currentLayerBaseY + (i * actualIndividualSlideThickness) + (actualIndividualSlideThickness / 2);
            // Z position: stack slides in depth (negative Z goes away from camera)
            const zPos = componentBaseZ - (i * 1); 
            const position = new THREE.Vector3(componentBaseX, yPos, zPos);
            generatedSlides.push({
              id: slideId,
              title: individualSlideTitle,
              position: position,
              showFrontEdgeTitle: false, 
              individualThickness: actualIndividualSlideThickness,
            });
          }
          
          const stackCenterY = currentLayerBaseY + SLIDE_COMPONENT_SLOT_THICKNESS / 2;
          generatedOverviewTitles.push({
            id: `title-${layerIndex}-${componentIndex}`,
            text: component.title,
            position: new THREE.Vector3(componentBaseX, stackCenterY + SLIDE_DEPTH_9 / 2 + 0.05, componentBaseZ),
          });

        } else {
          const slideId = `${layerIndex}-${componentIndex}-0`;
          generatedOrderedSlideIds.push(slideId);
          const yPos = currentLayerBaseY + SLIDE_COMPONENT_SLOT_THICKNESS / 2;
          const position = new THREE.Vector3(componentBaseX, yPos, componentBaseZ);
          generatedSlides.push({
            id: slideId,
            title: component.title, 
            position: position,
            showFrontEdgeTitle: true,
            individualThickness: actualIndividualSlideThickness,
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
    
    STRUCTURE.forEach((layer, layerIndex) => {
        const numComponents = layer.components.length;
        const layerWidth = (numComponents - 1) * xNodeSpacing;
        const startX = -layerWidth / 2 - structureCenterX;
        const layerBaseY = -(layerIndex * yLayerSpacing) - structureCenterY;

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
      setSelectedSlideId(null);
    }
  }, [currentNavigatedIndex, orderedSlideIds]);

  const goToSlideByIndex = (index) => {
    setCurrentNavigatedIndex(index);
  };

  const goToNextSlide = React.useCallback(() => {
    setCurrentNavigatedIndex(prev => {
      if (prev === -1) return 0;
      const nextIndex = prev + 1;
      return nextIndex >= orderedSlideIds.length ? -1 : nextIndex;
    });
  }, [orderedSlideIds.length]);

  const goToPrevSlide = React.useCallback(() => {
    setCurrentNavigatedIndex(prev => {
      if (prev === -1) return orderedSlideIds.length - 1;
      const prevIndex = prev - 1;
      return prevIndex < 0 ? -1 : prevIndex;
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

  // Camera positioned in front of the structure (positive Z) looking toward it
  const initialCameraPosition = React.useMemo(() => {
    const fovInRadians = camera.fov * (Math.PI / 180);
    const aspect = size.width / size.height;
    
    const heightToFit = totalActualHeight + SLIDE_DEPTH_9; 
    const widthToFit = totalActualWidth;

    let zDistanceHeight = 20; 
    if (heightToFit > 0) {
        zDistanceHeight = (heightToFit / 2) / Math.tan(fovInRadians / 2);
    }

    let zDistanceWidth = 20; 
    if (widthToFit > 0 && aspect > 0) {
        zDistanceWidth = (widthToFit / (2 * aspect)) / Math.tan(fovInRadians / 2);
    }
    
    const zDistance = Math.max(zDistanceHeight, zDistanceWidth, 20) * 1.3; 

    return new THREE.Vector3(0, 0, zDistance); 
  }, [totalActualHeight, totalActualWidth, camera.fov, size.width, size.height]);
  
  const defaultCameraUp = React.useMemo(() => new THREE.Vector3(0, 1, 0), []);

  useFrame(() => {
    const targetSlide = selectedSlideId ? slides.find(s => s.id === selectedSlideId) : null;
    const targetChanged = targetSlide?.id !== previousTargetIdRef.current;

    if (targetSlide) { 
      const slideMeshPosition = targetSlide.position;
      const individualThickness = targetSlide.individualThickness;

      const newLookAtPosition = new THREE.Vector3(
        slideMeshPosition.x,
        slideMeshPosition.y,
        slideMeshPosition.z
      );

      const fovInRadians = camera.fov * (Math.PI / 180);
      const aspect = size.width / size.height;
      const distanceForDepthFit = (SLIDE_DEPTH_9 / 2) / Math.tan(fovInRadians / 2); 
      const distanceForWidthFit = (SLIDE_WIDTH_16 / (2 * aspect)) / Math.tan(fovInRadians / 2); 
      const zoomDistance = Math.max(distanceForDepthFit, distanceForWidthFit) * 1.15; 

      const newCameraTargetPosition = new THREE.Vector3(
        newLookAtPosition.x, 
        newLookAtPosition.y,
        newLookAtPosition.z + zoomDistance // Position camera in front of the slide
      );
      
      if (targetChanged) {
        camera.up.copy(defaultCameraUp);
        if (controlsRef.current) controlsRef.current.target.copy(newLookAtPosition);
      }

      camera.position.lerp(newCameraTargetPosition, 0.08);
      camera.lookAt(newLookAtPosition); 

      if (controlsRef.current) {
        if (!targetChanged) {
            controlsRef.current.target.lerp(newLookAtPosition, 0.08);
        }
        controlsRef.current.enabled = false;
      }

    } else { 
      if(targetChanged){
         if (controlsRef.current) controlsRef.current.target.copy(initialLookAt);
         camera.up.copy(defaultCameraUp);
      }
      camera.position.lerp(initialCameraPosition, 0.08);
      if (controlsRef.current) {
        controlsRef.current.target.lerp(initialLookAt, 0.08);
        controlsRef.current.enabled = true;
        camera.lookAt(controlsRef.current.target);
      }
    }
    if (controlsRef.current) controlsRef.current.update();
    previousTargetIdRef.current = targetSlide?.id || null;
  });

  useEffect(() => {
    if (selectedSlideId === null) { 
        if (controlsRef.current) {
          controlsRef.current.target.copy(initialLookAt);
        }
        camera.up.copy(defaultCameraUp);
    }
  }, [selectedSlideId, initialLookAt, defaultCameraUp]);

  const handleSlideClick = (slideId) => {
    const index = orderedSlideIds.findIndex(id => id === slideId);
    if (index !== -1) {
      goToSlideByIndex(index);
    } else {
      goToOverview(); 
    }
  };
  
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
            <AnimatedDreiText
                key={titleInfo.id}
                position={titleInfo.position}
                rotation={[Math.PI / 2, 0, 0]}
                fontSize={0.65} 
                color={"white"} 
                anchorX="center"
                anchorY="middle"
                maxWidth={SLIDE_WIDTH_16 * 0.9}
                textAlign="center"
                lineHeight={1}
                fillOpacity={overviewTitlesSpring.opacity}
            >
                {titleInfo.text}
            </AnimatedDreiText>
        ))}
      </Suspense>
      {selectedSlideId && (
        <Plane
            args={[size.width * 20, size.height * 20]} 
            position={camera.position.clone().add(new THREE.Vector3(0,0,-1).applyQuaternion(camera.quaternion).multiplyScalar(50))}
            onClick={goToOverview}
            material-transparent
            material-opacity={0.02}
            material-color="black"
        />
      )}
    </>
  );
};

const InteractivePresentationV5 = () => {
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
        <PresentationLayoutV5 setNavigationFunctions={setNavFunctions} />
      </Canvas>
      <NavigationUI {...navFunctions} />
    </div>
  );
};

export default InteractivePresentationV5; 