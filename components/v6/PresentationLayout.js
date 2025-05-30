import React, { useRef, useState, useEffect, Suspense } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Plane } from '@react-three/drei';
import * as THREE from 'three';
import { useSpring } from '@react-spring/three';
import { STRUCTURE } from '@/utils/constant';
import Slide from './Slide';
import { 
  SPRING_CONFIG_NORMAL, 
  FLY_OVER_PAUSE_DURATION,
  SLIDE_WIDTH_16, 
  SLIDE_DEPTH_9, 
  SLIDE_COMPONENT_SLOT_THICKNESS 
} from './constants';

const PresentationLayoutV5 = ({ setNavigationFunctions }) => {
  const [selectedSlideId, setSelectedSlideId] = useState(null);
  const [currentNavigatedIndex, setCurrentNavigatedIndex] = useState(-1);
  const [visuallySelectedSlideId, setVisuallySelectedSlideId] = useState(null);
  const { camera, size } = useThree();
  const controlsRef = useRef();
  const previousTargetIdRef = useRef(null); 
  const [isFlyingOver, setIsFlyingOver] = useState(false);
  const prevSlideIdAnimRef = useRef(null); 
  const defaultCameraUp = React.useMemo(() => new THREE.Vector3(0, 1, 0), []);

  const [dimmingSpring, dimmingApi] = useSpring(() => ({
    opacity: 1,
    config: SPRING_CONFIG_NORMAL,
  }));

  const { slides, totalActualHeight, totalActualWidth, orderedSlideIds, initialLookAt, initialCameraPosition } = React.useMemo(() => {
    // console.log("[Layout] Recalculating slides geometry...");
    const generatedSlides = [];
    const generatedOrderedSlideIds = [];
    const yLayerSpacing = SLIDE_DEPTH_9 * 1.2; 
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
            const yPos = currentLayerBaseY + SLIDE_COMPONENT_SLOT_THICKNESS / 2;
            const zPos = componentBaseZ - (i * actualIndividualSlideThickness * 1.1); 
            const position = new THREE.Vector3(componentBaseX, yPos, zPos);
            // console.log(`[Layout] Stacked Slide: ${slideId}, Position: {x: ${position.x.toFixed(2)}, y: ${position.y.toFixed(2)}, z: ${position.z.toFixed(2)}}`);
            generatedSlides.push({
              id: slideId,
              title: individualSlideTitle,
              position: position,
              showFrontEdgeTitle: false, 
              individualThickness: actualIndividualSlideThickness,
              isStackedPart: true, // Mark as part of a stack
              partIndex: i // Mark its index in the stack (0 for front, 1 for back)
            });
          }
        } else {
          const slideId = `${layerIndex}-${componentIndex}-0`;
          generatedOrderedSlideIds.push(slideId);
          const yPos = currentLayerBaseY + SLIDE_COMPONENT_SLOT_THICKNESS / 2;
          const position = new THREE.Vector3(componentBaseX, yPos, componentBaseZ);
          // console.log(`[Layout] Single Slide: ${slideId}, Position: {x: ${position.x.toFixed(2)}, y: ${position.y.toFixed(2)}, z: ${position.z.toFixed(2)}}`);
          generatedSlides.push({
            id: slideId,
            title: component.title, 
            position: position,
            showFrontEdgeTitle: true,
            individualThickness: actualIndividualSlideThickness,
            isStackedPart: false,
            partIndex: 0
          });
        }
        minXOverall = Math.min(minXOverall, componentBaseX - SLIDE_WIDTH_16 / 2);
        maxXOverall = Math.max(maxXOverall, componentBaseX + SLIDE_WIDTH_16 / 2);
      });
    });
    
    const structureCenterY = (minYOverall + maxYOverall) / 2;
    const structureCenterX = (minXOverall + maxXOverall) / 2; 
    generatedSlides.forEach(s => { s.position.y -= structureCenterY; s.position.x -= structureCenterX; });

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
    const memoizedInitialLookAt = new THREE.Vector3(0, 0, 0);
    const fovInRadians = camera.fov * (Math.PI / 180); 
    const aspect = size.width / size.height; 
    const heightToFit = calcTotalActualHeight + SLIDE_DEPTH_9; 
    const widthToFit = calcTotalActualWidth;
    let zDistanceHeight = 20; 
    if (heightToFit > 0) zDistanceHeight = (heightToFit / 2) / Math.tan(fovInRadians / 2);
    let zDistanceWidth = 20; 
    if (widthToFit > 0 && aspect > 0) zDistanceWidth = (widthToFit / (2 * aspect)) / Math.tan(fovInRadians / 2);
    const zDistance = Math.max(zDistanceHeight, zDistanceWidth, 20) * 1.3;
    const memoizedInitialCameraPosition = new THREE.Vector3(0, 0, zDistance);
    return { slides: generatedSlides, totalActualHeight: calcTotalActualHeight, totalActualWidth: calcTotalActualWidth, orderedSlideIds: generatedOrderedSlideIds, initialLookAt: memoizedInitialLookAt, initialCameraPosition: memoizedInitialCameraPosition };
  }, [camera.fov, size.width, size.height]);

  const [cameraSpring, cameraApi] = useSpring(() => ({
    position: initialCameraPosition.toArray(),
    target: initialLookAt.toArray(),
    up: defaultCameraUp.toArray(),
    config: SPRING_CONFIG_NORMAL,
  }));

  const getSectionIndexFromSlideId = (slideId) => {
    if (!slideId) return -1;
    const parts = slideId.split('-');
    return parts.length > 0 ? parseInt(parts[0], 10) : -1;
  };

  const getBaseSlideId = (slideId) => {
    if (!slideId) return null;
    const parts = slideId.split('-');
    if (parts.length === 3) return `${parts[0]}-${parts[1]}`;
    return null; // Should not happen for valid slide IDs
  };

  const calculateZoomedInCameraProps = (targetSlide) => {
    if (!targetSlide) return null;
    const slideMeshPosition = targetSlide.position;
    const lookAtPos = new THREE.Vector3(slideMeshPosition.x, slideMeshPosition.y, slideMeshPosition.z);
    const fovInRadians = camera.fov * (Math.PI / 180);
    const aspect = size.width / size.height;
    const distanceForHeightFit = (SLIDE_DEPTH_9 / 2) / Math.tan(fovInRadians / 2);
    const distanceForWidthFit = (SLIDE_WIDTH_16 / (2 * aspect)) / Math.tan(fovInRadians / 2);
    const zoomDistance = Math.max(distanceForHeightFit, distanceForWidthFit) * 1.15;
    const cameraPos = new THREE.Vector3(lookAtPos.x, lookAtPos.y, lookAtPos.z + zoomDistance);
    return { position: cameraPos.toArray(), target: lookAtPos.toArray(), up: defaultCameraUp.toArray() };
  };
  
  useEffect(() => {
    const currentSelectedId = selectedSlideId;
    const previousSelectedIdForEffect = prevSlideIdAnimRef.current;
    console.log(`[CameraEffect] Triggered. Current selectedSlideId: ${currentSelectedId}, Previous ID for anim: ${previousSelectedIdForEffect}`);
    const targetSlide = currentSelectedId ? slides.find(s => s.id === currentSelectedId) : null;
    const prevSlideForEffect = previousSelectedIdForEffect ? slides.find(s => s.id === previousSelectedIdForEffect) : null;
    const currentSectionIndex = targetSlide ? getSectionIndexFromSlideId(targetSlide.id) : -1;
    const previousSectionIndex = prevSlideForEffect ? getSectionIndexFromSlideId(prevSlideForEffect.id) : -1;
    const shouldFlyOver = prevSlideForEffect && targetSlide && currentSectionIndex !== -1 && previousSectionIndex !== -1 && currentSectionIndex !== previousSectionIndex;
    console.log(`[CameraEffect] Target: ${targetSlide?.id}, Prev: ${prevSlideForEffect?.id}, CurrentSection: ${currentSectionIndex}, PrevSection: ${previousSectionIndex}, ShouldFlyOver: ${shouldFlyOver}`);
    const overviewCameraProps = { position: initialCameraPosition.toArray(), target: initialLookAt.toArray(), up: defaultCameraUp.toArray() };

    if (targetSlide) {
      const zoomedInProps = calculateZoomedInCameraProps(targetSlide);
      if (!zoomedInProps) { console.error("[CameraEffect] Could not calculate zoomedInProps for targetSlide:", targetSlide); return; }
      if (shouldFlyOver) {
        console.log(`[CameraEffect] Starting FLY OVER from ${previousSelectedIdForEffect} to ${currentSelectedId}`);
        setIsFlyingOver(true);
        setVisuallySelectedSlideId(previousSelectedIdForEffect);
        dimmingApi.start({ opacity: 1, immediate: false, config: SPRING_CONFIG_NORMAL, onRest: () => {} /* console.log("[Dimming] Fly-over dimming (to 1) onRest") */ });
        cameraApi.start({
          from: { position: camera.position.toArray(), target: controlsRef.current ? controlsRef.current.target.toArray() : initialLookAt.toArray(), up: camera.up.toArray() },
          to: async (next) => {
            console.log("[CameraEffect FlyOver TO] Zooming OUT to overview.");
            // Start zooming out
            const zoomOutPromise = next({ ...overviewCameraProps, config: SPRING_CONFIG_NORMAL, immediate: false });
            // Transition visual selection halfway through zoom-out
            setTimeout(() => {
              setVisuallySelectedSlideId(currentSelectedId);
            }, 300); // Smooth transition during zoom-out
            await zoomOutPromise;
            console.log("[CameraEffect FlyOver TO] Pausing at overview.");
            await new Promise(res => setTimeout(res, FLY_OVER_PAUSE_DURATION));      
            console.log(`[CameraEffect FlyOver TO] Zooming IN to ${currentSelectedId}.`);
            await next({ ...zoomedInProps, config: SPRING_CONFIG_NORMAL, immediate: false });
          },
          onStart: () => {
            console.log("[CameraEffect FlyOver] onStart: setIsFlyingOver(true)");
            setIsFlyingOver(true); 
          },
          onRest: (result) => { 
            console.log(`[CameraEffect FlyOver] onRest. Cancelled: ${result.cancelled}, Finished: ${result.finished}. Setting setIsFlyingOver(false).`);
            setIsFlyingOver(false);
            if (!result.cancelled && result.finished) {
                if (zoomedInProps && controlsRef.current) controlsRef.current.target.fromArray(zoomedInProps.target);
                setTimeout(() => {
                  if (selectedSlideId) dimmingApi.start({ opacity: 0.1, immediate: false, config: SPRING_CONFIG_NORMAL, onRest: () => {} /* console.log("[Dimming] Post-fly-over dimming (to 0.1) onRest") */ });
                }, 50);
            }
            if (controlsRef.current) controlsRef.current.update();
          }
        });
      } else { 
        console.log(`[CameraEffect] Starting DIRECT transition to ${currentSelectedId}. Previous: ${previousSelectedIdForEffect}`);
        setIsFlyingOver(false); 
        console.log(`[CameraEffect] Dimming non-selected slides (opacity 0.1) for DIRECT transition. IMMEDIATE.`);
        dimmingApi.start({ opacity: 0.1, immediate: true, onRest: () => {} /* console.log("[Dimming] Direct transition dimming (to 0.1) onRest") */ });
      }
    } else { 
      console.log(`[CameraEffect] Going to OVERVIEW. Previous: ${previousSelectedIdForEffect}`);
      setIsFlyingOver(false); 
      console.log("[CameraEffect] Making all slides visible (opacity 1) for OVERVIEW.");
      dimmingApi.start({ opacity: 1, immediate: false, config: SPRING_CONFIG_NORMAL, onRest: () => {} /* console.log("[Dimming] Overview visibility (to 1) onRest") */ });
    }
  }, [selectedSlideId, slides, cameraApi, dimmingApi, initialCameraPosition, initialLookAt, defaultCameraUp, camera.fov, size.width, size.height]);

  useEffect(() => { 
    // console.log(`[PrevIdUpdateEffect] Updating prevSlideIdAnimRef from ${prevSlideIdAnimRef.current} to ${selectedSlideId}`);
    prevSlideIdAnimRef.current = selectedSlideId; 
  }, [selectedSlideId]);

  useEffect(() => {
    // console.log(`[NavIndexEffect] Setting selectedSlideId to: ${currentNavigatedIndex >= 0 && currentNavigatedIndex < orderedSlideIds.length ? orderedSlideIds[currentNavigatedIndex] : null} (index: ${currentNavigatedIndex})`);
    setSelectedSlideId(currentNavigatedIndex >= 0 && currentNavigatedIndex < orderedSlideIds.length ? orderedSlideIds[currentNavigatedIndex] : null);
  }, [currentNavigatedIndex, orderedSlideIds]);

  const goToSlideByIndex = (index) => {
    // console.log(`[Navigation] goToSlideByIndex: ${index}`);
    setCurrentNavigatedIndex(index);
  };
  const goToNextSlide = React.useCallback(() => {
    // console.log("[Navigation] goToNextSlide called.");
    setCurrentNavigatedIndex(prev => (prev === -1 ? 0 : prev + 1) >= orderedSlideIds.length ? -1 : (prev === -1 ? 0 : prev + 1));
  }, [orderedSlideIds.length]);
  const goToPrevSlide = React.useCallback(() => {
    // console.log("[Navigation] goToPrevSlide called.");
    setCurrentNavigatedIndex(prev => (prev === -1 ? orderedSlideIds.length - 1 : prev - 1) < 0 ? -1 : (prev === -1 ? orderedSlideIds.length - 1 : prev - 1));
  }, [orderedSlideIds.length]);
  const goToOverview = React.useCallback(() => {
    // console.log("[Navigation] goToOverview called.");
    setCurrentNavigatedIndex(-1);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => { if (event.key === 'ArrowRight') goToNextSlide(); else if (event.key === 'ArrowLeft') goToPrevSlide(); else if (event.key === 'Escape') goToOverview(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNextSlide, goToPrevSlide, goToOverview]);

  useEffect(() => { if (setNavigationFunctions) setNavigationFunctions({ onPrev: goToPrevSlide, onNext: goToNextSlide, onOverview: goToOverview, currentIndex: currentNavigatedIndex, totalSlides: orderedSlideIds.length });
  }, [setNavigationFunctions, goToPrevSlide, goToNextSlide, goToOverview, currentNavigatedIndex, orderedSlideIds.length]);

  useFrame(() => {
    const localSelectedSlideId = selectedSlideId;
    const targetSlide = localSelectedSlideId ? slides.find(s => s.id === localSelectedSlideId) : null;
    if (isFlyingOver) {
      camera.position.fromArray(cameraSpring.position.get());
      camera.up.fromArray(cameraSpring.up.get());
      if (controlsRef.current) { controlsRef.current.target.fromArray(cameraSpring.target.get()); controlsRef.current.enabled = false; }
    } else {
      if (targetSlide) {
        const slideMeshPosition = targetSlide.position;
        const newLookAtPosition = new THREE.Vector3(slideMeshPosition.x, slideMeshPosition.y, slideMeshPosition.z);
        const fovInRadians = camera.fov * (Math.PI / 180);
        const aspect = size.width / size.height;
        const distanceForHeightFit = (SLIDE_DEPTH_9 / 2) / Math.tan(fovInRadians / 2);
        const distanceForWidthFit = (SLIDE_WIDTH_16 / (2 * aspect)) / Math.tan(fovInRadians / 2);
        const zoomDistance = Math.max(distanceForHeightFit, distanceForWidthFit) * 1.15;
        const newCameraTargetPosition = new THREE.Vector3(newLookAtPosition.x, newLookAtPosition.y, newLookAtPosition.z + zoomDistance);
        if (previousTargetIdRef.current !== localSelectedSlideId) camera.up.copy(defaultCameraUp);
        camera.position.lerp(newCameraTargetPosition, 0.08);
        if (controlsRef.current) { controlsRef.current.target.lerp(newLookAtPosition, 0.08); controlsRef.current.enabled = false; }
      } else { 
        if (previousTargetIdRef.current !== null) camera.up.copy(defaultCameraUp);
        camera.position.lerp(initialCameraPosition, 0.08);
        if (controlsRef.current) { controlsRef.current.target.lerp(initialLookAt, 0.08); controlsRef.current.enabled = true; }
      }
      previousTargetIdRef.current = localSelectedSlideId; 
    }
    if (controlsRef.current) controlsRef.current.update();
  });

  const handleSlideClick = (slideId) => { 
    // console.log(`[SlideClick] Clicked on slide: ${slideId}`);
    const index = orderedSlideIds.findIndex(id => id === slideId); 
    if (index !== -1) goToSlideByIndex(index); 
    else { /* console.warn(`[SlideClick] Slide ID ${slideId} not found.`); */ goToOverview(); } 
  };
  const handleGoToOverview = () => {
    // console.log("[ClickOutsidePlane] Clicked! Calling goToOverview.");
    goToOverview();
  };

  useEffect(() => {
    if (!isFlyingOver) {
      setVisuallySelectedSlideId(selectedSlideId);
    }
  }, [selectedSlideId, isFlyingOver]);

  return (
    <>
      <OrbitControls ref={controlsRef} />
      <ambientLight intensity={0.5} />
      <hemisphereLight skyColor={0xadd8e6} groundColor={0x444444} intensity={0.5} />
      <directionalLight position={[40, 50, 60]} intensity={1.5} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-camera-far={150} shadow-camera-left={-30} shadow-camera-right={30} shadow-camera-top={30} shadow-camera-bottom={-30} />
      <directionalLight position={[-30, -20, -40]} intensity={0.3} />
      <Suspense fallback={ <Text position={[0,0,0]} fontSize={1.5} color="white" anchorX="center" anchorY="middle">Loading PhD Proposal...</Text> }>
        {slides.map(slide => {
          const isActuallySelected = selectedSlideId === slide.id;
          const isVisuallySelected = visuallySelectedSlideId === slide.id;
          let isStrictlyHidden = false;
          if (slide.isStackedPart && slide.partIndex === 0 && selectedSlideId) {
            const baseCurrentSlideId = getBaseSlideId(slide.id);
            const baseSelectedSlideId = getBaseSlideId(selectedSlideId);
            if (baseCurrentSlideId && baseSelectedSlideId && baseCurrentSlideId === baseSelectedSlideId) {
                const selectedPartIndex = parseInt(selectedSlideId.split('-')[2], 10);
                if (selectedPartIndex === 1) {
                    isStrictlyHidden = true;
                    // console.log(`[RenderSlides] STRICTLY HIDING ${slide.id} because ${selectedSlideId} (Part 2) is selected.`);
                }
            }
          }
          
          // console.log(`[RenderSlides] Slide: ${slide.id}, isSelected: ${isActuallySelected}, isStrictlyHidden: ${isStrictlyHidden}, isFlyingOver: ${isFlyingOver}, dimmingOpacity: ${dimmingSpring.opacity.get()}`);

          let currentAnimatedOpacity;
          if (isActuallySelected) {
            // Selected slide is ALWAYS visible
            currentAnimatedOpacity = 1;
          } else if (selectedSlideId === null || isFlyingOver) {
            // Overview mode or during fly-over: all slides visible
            currentAnimatedOpacity = 1;
          } else {
            // Non-selected slides get dimmed
            currentAnimatedOpacity = dimmingSpring.opacity;
          }
          
          return (
            <Slide
              key={slide.id}
              id={slide.id}
              position={slide.position}
              title={slide.title}
              onClick={() => handleSlideClick(slide.id)}
              isSelected={isVisuallySelected}
              showFrontEdgeTitle={slide.showFrontEdgeTitle}
              animatedOpacity={currentAnimatedOpacity}
              individualThickness={slide.individualThickness}
              isStrictlyHidden={isStrictlyHidden}
            />
          );
        })}
      </Suspense>
      {selectedSlideId && ( <Plane args={[size.width * 5, size.height * 5]} position={[0, 0, -100]} onClick={handleGoToOverview} material-transparent material-opacity={0.001} renderOrder={-1} /> )}
    </>
  );
};

export default PresentationLayoutV5; 