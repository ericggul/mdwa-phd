import React, { useRef, useState, useEffect } from 'react';
import { Text, useTexture } from '@react-three/drei';
import { useSpring, a } from '@react-spring/three';
import { 
  SPRING_CONFIG_NORMAL, 
  SLIDE_WIDTH_16, 
  SLIDE_DEPTH_9, 
  EDGE_TITLE_Z_OFFSET 
} from './constants';

const AnimatedDreiText = a(Text);

const Slide = ({ id, position, title, onClick, isSelected, showFrontEdgeTitle, individualThickness, animatedOpacity, isStrictlyHidden, imageUrl }) => {
  const meshRef = useRef();
  const [hovered, setHover] = useState(false);

  // Load texture if imageUrl is provided
  const texture = imageUrl ? useTexture(imageUrl) : null;

  // Set texture properties to preserve aspect ratio and fit within slide bounds
  if (texture && texture.image) {
    const imageAspect = texture.image.width / texture.image.height;
    const slideAspect = SLIDE_WIDTH_16 / SLIDE_DEPTH_9;
    
    // Calculate scale to fit image within slide bounds (like object-fit: contain)
    let scaleX, scaleY;
    if (imageAspect > slideAspect) {
      // Image is wider than slide - scale based on width
      scaleX = 1;
      scaleY = imageAspect / slideAspect;
    } else {
      // Image is taller than slide - scale based on height  
      scaleX = slideAspect / imageAspect;
      scaleY = 1;
    }
    
    texture.repeat.set(scaleX, scaleY);
    texture.center.set(0.5, 0.5);
    texture.offset.set(0, 0);
  }

  // console.log(`[Slide ${id}] Props: isSelected=${isSelected}, animatedOpacity=${animatedOpacity}, isStrictlyHidden=${isStrictlyHidden}`);

  const springProps = useSpring({
    scale: hovered && !isSelected ? 1.05 : 1,
    meshOpacity: animatedOpacity,
    textOpacity: animatedOpacity,
    config: SPRING_CONFIG_NORMAL,
    onRest: () => {
      // console.log(`[Slide ${id}] Spring onRest. meshOpacity is now: ${springProps.meshOpacity.get()}`);
    }
  });
  
  useEffect(() => {
    // console.log(`[Slide ${id}] springProps.meshOpacity updated: ${springProps.meshOpacity.get()}, isStrictlyHidden: ${isStrictlyHidden}`);
  }, [springProps.meshOpacity, id, isStrictlyHidden]);

  const adjustedBoxArgs = [SLIDE_WIDTH_16, SLIDE_DEPTH_9, individualThickness];

  // Determine material color: no green highlight if texture is present
  const getMaterialColor = () => {
    if (texture) {
      // If texture exists, use neutral color regardless of selection/hover state
      return 'white';
    } else {
      // Original color logic for non-textured slides
      return isSelected ? 'lightgreen' : hovered ? 'skyblue' : '#CCCCCC';
    }
  };

  return (
    <a.mesh
      ref={meshRef}
      position={position}
      scale={springProps.scale}
      visible={!isStrictlyHidden && springProps.meshOpacity.get() > 0.01} // Apply strict hide and opacity-based visibility
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
        color={getMaterialColor()}
        roughness={0.6} 
        metalness={0.2} 
        transparent
        opacity={springProps.meshOpacity}
        depthWrite={!isStrictlyHidden && springProps.meshOpacity.get() < 1 ? false : true}
        map={texture} // Apply texture if available
      />
      
      {/* Only show text title if no image, or show it with reduced opacity over image */}
      <AnimatedDreiText
        position={[0, 0, individualThickness / 2 + 0.02]}
        fontSize={texture ? 0.8 : 1} // Smaller font if there's an image
        color={texture ? "white" : "black"} // White text over image, black over solid color
        anchorX="center"
        anchorY="middle"
        maxWidth={SLIDE_WIDTH_16 * 0.85}
        textAlign="center"
        lineHeight={1.2}
        fillOpacity={texture ? springProps.textOpacity * 0.9 : springProps.textOpacity} // Slightly more transparent over image
      >
        {title}
      </AnimatedDreiText>

    </a.mesh>
  );
};

export default Slide; 