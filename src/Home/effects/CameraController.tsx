import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';

export default function CameraController() {
  const { camera, gl } = useThree();
  const dragging    = useRef(false);
  const didDrag     = useRef(false);          // ← true only if mouse actually moved
  const lastMouse   = useRef({ x: 0, y: 0 });
  const downPos     = useRef({ x: 0, y: 0 }); // ← where mousedown happened
  const targetRot   = useRef({ x: 0.74, y: 0.74 });
  const currentRot  = useRef({ x: 0.74, y: 0.74 });
  const targetDist  = useRef(32);
  const currentDist = useRef(32);

  useEffect(() => {
    const DRAG_THRESHOLD = 5; // pixels — below this it's a click, not a drag

    const onDown = (e: MouseEvent) => {
      dragging.current  = true;
      didDrag.current   = false;
      lastMouse.current = { x: e.clientX, y: e.clientY };
      downPos.current   = { x: e.clientX, y: e.clientY };
    };

    const onUp = () => {
      dragging.current = false;
      // didDrag stays set until next mousedown so R3F onClick can check it
      // Reset on next frame via setTimeout so click handlers fire first
      setTimeout(() => { didDrag.current = false; }, 0);
    };

    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      const dx = e.clientX - downPos.current.x;
      const dy = e.clientY - downPos.current.y;
      // Only start rotating once we've moved past the drag threshold
      if (!didDrag.current && Math.sqrt(dx*dx + dy*dy) < DRAG_THRESHOLD) return;
      didDrag.current = true;
      targetRot.current.y += (e.clientX - lastMouse.current.x) * 0.005;
      targetRot.current.x  = Math.max(0.32, Math.min(1.28,
        targetRot.current.x - (e.clientY - lastMouse.current.y) * 0.005));
      lastMouse.current = { x: e.clientX, y: e.clientY };
    };

    const onWheel = (e: WheelEvent) => {
      targetDist.current = Math.max(14, Math.min(48,
        targetDist.current + e.deltaY * 0.018));
    };

    const c = gl.domElement;
    c.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onUp);
    c.addEventListener('wheel', onWheel, { passive: true });
    return () => {
      c.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup',   onUp);
      c.removeEventListener('wheel', onWheel);
    };
  }, [gl]);

  useFrame(() => {
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    currentRot.current.x  = lerp(currentRot.current.x,  targetRot.current.x,  0.06);
    currentRot.current.y  = lerp(currentRot.current.y,  targetRot.current.y,  0.06);
    currentDist.current   = lerp(currentDist.current,   targetDist.current,   0.06);
    const { x, y } = currentRot.current;
    const d = currentDist.current;
    camera.position.set(
      Math.sin(y) * Math.cos(x) * d,
      Math.sin(x) * d + 2,
      Math.cos(y) * Math.cos(x) * d,
    );
    camera.lookAt(0, 1, 0);
  });

  return null;
}