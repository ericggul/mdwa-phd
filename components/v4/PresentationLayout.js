import React, { useRef, useState, useEffect, Suspense, useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import { OrbitControls, Text, Plane } from '@react-three/drei';
import * as THREE from 'three';
import { useSpring, a } from '@react-spring/three';
import { STRUCTURE } from '@/utils/constant'; 
import Slide from './Slide';
import { useCameraLogic } from './CameraLogic';
import { SLIDE_WIDTH_16, SLIDE_DEPTH_9, SLIDE_COMPONENT_SLOT_THICKNESS } from './constants';

const AnimatedDreiText = a(Text);

const PresentationLayout = ({ setNavigationFunctions }) => {
  const [selectedSlideId, setSelectedSlideId] = useState(null);
  const [currentNavigatedIndex, setCurrentNavigatedIndex] = useState(-1);
  const { camera, size } = useThree();
  const controlsRef = useRef();

  const { slides, overviewTitles, totalActualHeight, totalActualWidth, orderedSlideIds } = useMemo(() => {
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
            const position = new THREE.Vector3(componentBaseX, yPos, componentBaseZ);
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
            position: new THREE.Vector3(componentBaseX, stackCenterY, componentBaseZ + SLIDE_DEPTH_9 / 2 + 0.05),
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

  const goToSlideByIndex = (index) => setCurrentNavigatedIndex(index);
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
  const goToOverview = React.useCallback(() => setCurrentNavigatedIndex(-1), []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowRight') goToNextSlide();
      else if (event.key === 'ArrowLeft') goToPrevSlide();
      else if (event.key === 'Escape') goToOverview();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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

  const initialLookAt = useMemo(() => new THREE.Vector3(0, 0, 0), []);
  const initialCameraPosition = useMemo(() => {
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
  
  useCameraLogic(selectedSlideId, slides, controlsRef, initialCameraPosition, initialLookAt, totalActualHeight, totalActualWidth);

  const handleSlideClick = (slideId) => {
    const index = orderedSlideIds.findIndex(id => id === slideId);
    if (index !== -1) goToSlideByIndex(index);
    else goToOverview(); 
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
            {...slide}
            onClick={() => handleSlideClick(slide.id)}
            isSelected={selectedSlideId === slide.id}
            isDimmed={selectedSlideId !== null && selectedSlideId !== slide.id}
          />
        ))}
        {overviewTitles.map(titleInfo => (
            <AnimatedDreiText
                key={titleInfo.id}
                position={titleInfo.position}
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
            position={camera.position.clone().add(new THREE.Vector3(0,0,-1).applyQuaternion(camera.quaternion).multiplyScalar(SLIDE_DEPTH_9 * 6))}
            onClick={goToOverview}
            material-transparent
            material-opacity={0.02}
            material-color="black"
        />
      )}
    </>
  );
};

export default PresentationLayout; 