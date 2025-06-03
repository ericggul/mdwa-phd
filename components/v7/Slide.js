import React, { useRef, useState, useEffect } from 'react';
import { Text } from '@react-three/drei';
import { useSpring, a } from '@react-spring/three';
import { 
  SPRING_CONFIG_NORMAL, 
  SLIDE_WIDTH_16, 
  SLIDE_DEPTH_9, 
  EDGE_TITLE_Z_OFFSET 
} from './constants';

const AnimatedDreiText = a(Text);

const Slide = ({ id, position, title, onClick, isSelected, showFrontEdgeTitle, individualThickness, animatedOpacity, isStrictlyHidden }) => {
  const meshRef = useRef();
  const [hovered, setHover] = useState(false);

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
        color={isSelected ? 'lightgreen' : hovered ? 'skyblue' : '#fff'} 
        roughness={0.2} 
        metalness={0.3} 
        envMapIntensity={0.1}
        transparent
        opacity={springProps.meshOpacity}
        depthWrite={!isStrictlyHidden && springProps.meshOpacity.get() < 1 ? false : true} // Adjust depthWrite based on strict hide too
      />
      
      <AnimatedDreiText
        position={[0, 0, individualThickness / 2 + 0.02]}
        fontSize={1.5}
        color="black"
        anchorX="center"
        anchorY="middle"
        maxWidth={SLIDE_WIDTH_16 * 0.85}
        textAlign="center"
        lineHeight={1.2}
        fillOpacity={springProps.textOpacity}
        //font
        fontWeight={300}
      >
        {title}
      </AnimatedDreiText>

    </a.mesh>
  );
};

export default Slide; 