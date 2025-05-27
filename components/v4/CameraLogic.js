import { useRef, useMemo, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CAMERA_LERP_SPEED, SLIDE_DEPTH_9, SLIDE_WIDTH_16, SLIDE_COMPONENT_SLOT_THICKNESS } from './constants';

export const useCameraLogic = (selectedSlideId, slides, controlsRef, initialCameraPosition, initialLookAt, totalActualHeight, totalActualWidth) => {
  const { camera, size } = useThree();
  const previousTargetIdRef = useRef(null);

  const defaultCameraUp = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  const zoomedInCameraUp = useMemo(() => new THREE.Vector3(0, 0, -1), []);
  // let frameCount = 0; // Reduced logging

  useFrame(() => {
    // frameCount++; // Reduced logging
    const targetSlide = selectedSlideId ? slides.find(s => s.id === selectedSlideId) : null;
    const targetChanged = targetSlide?.id !== previousTargetIdRef.current;

    if (targetSlide) { 
      const slideMeshPosition = targetSlide.position;
      const individualThickness = targetSlide.individualThickness;

      const contentFaceCenterY = slideMeshPosition.y + (individualThickness / 2);
      const newLookAtPosition = new THREE.Vector3(
        slideMeshPosition.x,
        contentFaceCenterY,
        slideMeshPosition.z
      );

      const fovInRadians = camera.fov * (Math.PI / 180);
      const aspect = size.width / size.height;
      const distanceForDepthFit = (SLIDE_DEPTH_9 / 2) / Math.tan(fovInRadians / 2); 
      const distanceForWidthFit = (SLIDE_WIDTH_16 / (2 * aspect)) / Math.tan(fovInRadians / 2); 
      const zoomDistance = Math.max(distanceForDepthFit, distanceForWidthFit) * 1.15; 

      const newCameraTargetPosition = new THREE.Vector3(
        newLookAtPosition.x, 
        newLookAtPosition.y + zoomDistance,
        newLookAtPosition.z  
      );
      
      if (targetChanged) {
        console.log(`***** TARGET CHANGED (Slide Mode) *****`);
        console.log(`    Prev Target ID: ${previousTargetIdRef.current}, New Target ID: ${targetSlide.id}`);
        console.log(`    Setting camera.up to zoomedIn:`, zoomedInCameraUp.toArray());
        console.log(`    Cam Pos BEFORE Lerp:`, camera.position.clone().toArray());
        if (controlsRef.current) {
          console.log(`    Controls Target BEFORE Lerp:`, controlsRef.current.target.clone().toArray());
        }
        console.log(`    New LookAt Goal:`, newLookAtPosition.toArray());
        console.log(`    New Cam Pos Goal:`, newCameraTargetPosition.toArray());
        camera.up.copy(zoomedInCameraUp);
      }

      camera.position.lerp(newCameraTargetPosition, CAMERA_LERP_SPEED);
      
      if (controlsRef.current) {
        controlsRef.current.target.lerp(newLookAtPosition, CAMERA_LERP_SPEED);
        controlsRef.current.enabled = true;
      }
      
      // Use newLookAtPosition when target just changed to avoid looking at stale target
      const lookAtTarget = targetChanged ? newLookAtPosition : (controlsRef.current ? controlsRef.current.target : newLookAtPosition);
      camera.lookAt(lookAtTarget);

    } else { // Overview mode
      if(targetChanged){
        console.log(`***** SWITCHING TO OVERVIEW *****`);
        console.log(`    Prev Target ID: ${previousTargetIdRef.current}`);
        if (controlsRef.current) controlsRef.current.target.copy(initialLookAt);
        console.log(`    Setting camera.up to default:`, defaultCameraUp.toArray());
        camera.up.copy(defaultCameraUp);
      }
      camera.position.lerp(initialCameraPosition, CAMERA_LERP_SPEED);
      if (controlsRef.current) {
        controlsRef.current.target.lerp(initialLookAt, CAMERA_LERP_SPEED);
        controlsRef.current.enabled = true;
        camera.lookAt(controlsRef.current.target);
        controlsRef.current.update();
      }
    }
    previousTargetIdRef.current = targetSlide?.id || null;
  });

  useEffect(() => {
    console.log("[Initial Effect] Fired. Setting up for overview or initial slide.");
    if (selectedSlideId === null) { 
        console.log("    Mode: Overview. Setting initial controls target and camera.up.");
        if (controlsRef.current) {
          controlsRef.current.target.copy(initialLookAt);
        }
        camera.up.copy(defaultCameraUp);
    } else {
        console.log(`    Mode: Slide selected (${selectedSlideId}). Ensuring camera.up is zoomedIn.`);
        // This ensures that if we land directly on a slide, the camera.up is correct from the start.
        camera.up.copy(zoomedInCameraUp); 
    }
  }, [selectedSlideId, initialLookAt, defaultCameraUp, camera, controlsRef]);

  return { defaultCameraUp, zoomedInCameraUp }; 
}; 