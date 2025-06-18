import { useState, useEffect } from 'react';
import { STRUCTURE } from '@/utils/constant';

const useContentLoader = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [canvasReady, setCanvasReady] = useState(false);

  useEffect(() => {
    let loadedImages = 0;
    const totalImages = getTotalImageCount();
    
    if (totalImages === 0) {
      setIsLoading(false);
      setLoadingProgress(100);
      return;
    }

    const imagePromises = [];
    
    // Preload all images from STRUCTURE
    STRUCTURE.forEach(section => {
      section.components.forEach(component => {
        component.slides.forEach(slide => {
          if (slide.image) {
            const imagePromise = new Promise((resolve, reject) => {
              const img = new Image();
              img.onload = () => {
                loadedImages++;
                setLoadingProgress((loadedImages / totalImages) * 100);
                resolve();
              };
              img.onerror = () => {
                loadedImages++;
                setLoadingProgress((loadedImages / totalImages) * 100);
                resolve(); // Still resolve to continue loading
              };
              img.src = `/slides/${slide.image}`;
            });
            imagePromises.push(imagePromise);
          }
        });
      });
    });

    // Wait for all images to load (or fail)
    Promise.all(imagePromises).then(() => {
      // Add a small delay to ensure smooth transition
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    });

  }, []);

  const getTotalImageCount = () => {
    let count = 0;
    STRUCTURE.forEach(section => {
      section.components.forEach(component => {
        component.slides.forEach(slide => {
          if (slide.image) count++;
        });
      });
    });
    return count;
  };

  const handleCanvasReady = () => {
    setCanvasReady(true);
  };

  return {
    isLoading: isLoading || !canvasReady,
    loadingProgress,
    canvasReady,
    handleCanvasReady
  };
};

export default useContentLoader; 