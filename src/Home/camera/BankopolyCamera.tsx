import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

export default function MonopolyCamera() {
  const { camera } = useThree();
  const targetPosition = useRef(new THREE.Vector3(15, 18, 15));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));

  useEffect(() => {
    // Set initial isometric angle
    camera.position.set(15, 18, 15);
    camera.lookAt(0, 0, 0);

    let frame: number;
    let time = 0;

    const animate = () => {
      time += 0.01;
      
      // Smooth damping
      camera.position.lerp(targetPosition.current, 0.05);
      camera.lookAt(targetLookAt.current);
      
      frame = requestAnimationFrame(animate);
    };

    animate();

    // Handle mouse drag for limited rotation
    const handleMouseMove = (e: MouseEvent) => {
      if (e.buttons !== 1) return; // Only when left button pressed
      
      // Very limited rotation (only ±15 degrees)
      const deltaX = (e.movementX * 0.002);
      const deltaY = (e.movementY * 0.002);
      
      const currentPos = targetPosition.current;
      const radius = Math.sqrt(currentPos.x * currentPos.x + currentPos.z * currentPos.z);
      const angle = Math.atan2(currentPos.z, currentPos.x);
      
      const newAngle = Math.max(-0.3, Math.min(0.3, angle + deltaX));
      
      targetPosition.current.x = Math.cos(newAngle) * radius;
      targetPosition.current.z = Math.sin(newAngle) * radius;
      targetPosition.current.y = Math.max(16, Math.min(20, currentPos.y - deltaY * 10));
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [camera]);

  return null;
}