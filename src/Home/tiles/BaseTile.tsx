import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export interface BaseTileProps {
  position: [number, number, number];
  size?: number;
  onHover?: (hovered: boolean) => void;
  interactive?: boolean;
}

export const BaseTile = ({
  onHover,
  interactive = false,
}: BaseTileProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (groupRef.current && interactive) {
      const target = hovered ? 0.15 : 0;
      groupRef.current.position.y += (target - groupRef.current.position.y) * 0.1;
    }
  });

  const handlePointerEnter = (e: any) => {
    e.stopPropagation();
    setHovered(true);
    onHover?.(true);
  };

  const handlePointerLeave = (e: any) => {
    e.stopPropagation();
    setHovered(false);
    onHover?.(false);
  };

  return {
    groupRef,
    meshRef,
    hovered,
    handlePointerEnter,
    handlePointerLeave,
  };
};
