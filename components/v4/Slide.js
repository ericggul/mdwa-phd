import React, { useRef, useState } from 'react';
import { Text } from '@react-three/drei';
import { useSpring, a } from '@react-spring/three';
import * as THREE from 'three';
import { SLIDE_WIDTH_16, SLIDE_DEPTH_9 } from './constants';

const AnimatedDreiText = a(Text);

const Slide = ({ id, position, title, onClick, isSelected, showFrontEdgeTitle, isDimmed, individualThickness }) => {
  const meshRef = useRef();
  const [hovered, setHover] = useState(false);

  const springProps = useSpring({
    scale: hovered && !isSelected ? 1.05 : 1,
    meshOpacity: isDimmed ? 0 : 1,
    textOpacity: isDimmed ? 0 : 1,
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
        transparent
        opacity={springProps.meshOpacity}
      />
      
      <AnimatedDreiText
        position={[0, individualThickness / 2 + 0.01, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
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

      {showFrontEdgeTitle && (
        <AnimatedDreiText
          position={[0, 0, SLIDE_DEPTH_9 / 2 + 0.05]}
          fontSize={0.65}
          color={isSelected? "black" : "white"}
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

export default Slide; 