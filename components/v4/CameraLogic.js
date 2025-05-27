import { useRef, useMemo, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CAMERA_LERP_SPEED, SLIDE_DEPTH_9, SLIDE_WIDTH_16, SLIDE_COMPONENT_SLOT_THICKNESS } from './constants';

export const useCameraLogic = (selectedSlideId, slides, controlsRef, initialCameraPosition, initialLookAt, totalActualHeight, totalActualWidth) => {
  const { camera, size } = useThree();
  const previousTargetIdRef = useRef(null);

  const defaultCameraUp = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  const zoomedInCameraUp = useMemo(() => new THREE.Vector3(0, 0, -1), []);

  useFrame(() => {
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
        camera.up.copy(zoomedInCameraUp);
      }

      camera.position.lerp(newCameraTargetPosition, CAMERA_LERP_SPEED);
      
      if (controlsRef.current) {
        controlsRef.current.target.lerp(newLookAtPosition, CAMERA_LERP_SPEED);
        controlsRef.current.enabled = true;
      }
      
      camera.lookAt(controlsRef.current ? controlsRef.current.target : newLookAtPosition); 

    } else { // Overview mode
      if(targetChanged){ 
         if (controlsRef.current) controlsRef.current.target.copy(initialLookAt);
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

  // Effect for initially setting overview state
  useEffect(() => {
    if (selectedSlideId === null) { 
        if (controlsRef.current) {
          controlsRef.current.target.copy(initialLookAt);
        }
        camera.up.copy(defaultCameraUp);
    }
  }, [selectedSlideId, initialLookAt, defaultCameraUp, camera, controlsRef]);

  return { defaultCameraUp, zoomedInCameraUp }; // Exporting these if PresentationLayout needs them
}; 