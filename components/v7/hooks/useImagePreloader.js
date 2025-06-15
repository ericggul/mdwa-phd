import { useState, useEffect } from 'react';
import { STRUCTURE } from '@/utils/constant';

const useImagePreloader = () => {
  const [loadingState, setLoadingState] = useState({
    isLoading: true,
    loadedCount: 0,
    totalCount: 0,
    progress: 0,
    errors: []
  });
  const [preloadedImages, setPreloadedImages] = useState(new Map());

  useEffect(() => {
    // Extract all image paths from STRUCTURE
    const extractImagePaths = () => {
      const paths = [];
      STRUCTURE.forEach(layer => {
        layer.components.forEach(component => {
          if (component.slides && component.slides.length > 0) {
            component.slides.forEach(slide => {
              if (slide.image) {
                paths.push(slide.image);
              }
            });
          }
        });
      });
      return [...new Set(paths)]; // Remove duplicates
    };

    const imagePaths = extractImagePaths();
    const totalImages = imagePaths.length;

    if (totalImages === 0) {
      setLoadingState({
        isLoading: false,
        loadedCount: 0,
        totalCount: 0,
        progress: 100,
        errors: []
      });
      return;
    }

    setLoadingState(prev => ({
      ...prev,
      totalCount: totalImages,
      progress: 0
    }));

    const imageMap = new Map();
    const errors = [];
    let loadedCount = 0;

    const updateProgress = () => {
      const progress = Math.round((loadedCount / totalImages) * 100);
      setLoadingState(prev => ({
        ...prev,
        loadedCount,
        progress,
        errors: [...errors],
        isLoading: loadedCount < totalImages
      }));

      if (loadedCount === totalImages) {
        setPreloadedImages(imageMap);
      }
    };

    // Preload each image
    imagePaths.forEach(imagePath => {
      const img = new Image();
      
      // Create the full path - encode the entire path properly
      const fullPath = `/slides/${imagePath}`;
      
      img.onload = () => {
        imageMap.set(imagePath, img);
        loadedCount++;
        updateProgress();
      };

      img.onerror = () => {
        errors.push(`Failed to load: ${imagePath}`);
        loadedCount++; // Still count as processed
        updateProgress();
      };

      img.src = fullPath;
    });

  }, []);

  return {
    isLoading: loadingState.isLoading,
    progress: loadingState.progress,
    loadedCount: loadingState.loadedCount,
    totalCount: loadingState.totalCount,
    errors: loadingState.errors,
    preloadedImages
  };
};

export default useImagePreloader; 