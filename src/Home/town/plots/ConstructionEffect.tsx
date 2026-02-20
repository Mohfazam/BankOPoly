// ConstructionEffect.tsx
// Plays a multi-stage build celebration when a plot is purchased.
// Stage 1 (0–0.6s):  Scaffolding rises from ground
// Stage 2 (0.6–1.4s): 3D particles burst outward
// Stage 3 (1.4–2.2s): Gold sparkle rain
// Stage 4 (2D overlay): Big "BUILT! 🏠" banner with coin shower

import { useRef, useState} from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Particle {
  id      : number;
  pos     : THREE.Vector3;
  vel     : THREE.Vector3;
  color   : string;
  scale   : number;
  life    : number; // 0–1, decreases over time
}

interface ConstructionEffectProps {
  px      : number;
  pz      : number;
  onDone  : () => void; // called when animation finishes
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const COLORS = ['#fbbf24','#fde68a','#4ade80','#86efac','#fb923c','#f9a8d4','#a78bfa','#ffffff'];
const rand   = (a: number, b: number) => a + Math.random() * (b - a);

// ── Scaffolding pole ──────────────────────────────────────────────────────────
function Pole({ x, z, height }: { x: number; z: number; height: number }) {
  return (
    <mesh position={[x, height / 2, z]} castShadow>
      <cylinderGeometry args={[0.06, 0.06, height, 6]} />
      <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.3} />
    </mesh>
  );
}

// ── Main effect component ─────────────────────────────────────────────────────
export default function ConstructionEffect({ px, pz, onDone }: ConstructionEffectProps) {
  const elapsed      = useRef(0);
  const particles    = useRef<Particle[]>([]);
  const particleMesh = useRef<THREE.InstancedMesh>(null!);
  const dummy        = useRef(new THREE.Object3D());
  const spawned      = useRef(false);

  const [scaffoldH, setScaffoldH] = useState(0);   // 0→3 over 0.6s
  const [showBanner, setShowBanner] = useState(false);
  const [bannerOut,  setBannerOut]  = useState(false);
  const [done,       setDone]       = useState(false);

  // Spawn particles once at t=0.6s
  const spawnParticles = () => {
    const list: Particle[] = [];
    for (let i = 0; i < 40; i++) {
      const angle  = rand(0, Math.PI * 2);
      const speed  = rand(2, 6);
      list.push({
        id   : i,
        pos  : new THREE.Vector3(0, 0.5, 0),
        vel  : new THREE.Vector3(
          Math.cos(angle) * speed * rand(0.4, 1),
          rand(3, 8),
          Math.sin(angle) * speed * rand(0.4, 1),
        ),
        color : COLORS[Math.floor(Math.random() * COLORS.length)],
        scale : rand(0.12, 0.28),
        life  : 1,
      });
    }
    particles.current = list;
  };

  useFrame((_, delta) => {
    if (done) return;
    elapsed.current += delta;
    const t = elapsed.current;

    // Stage 1 — scaffold rises (0 → 0.6s)
    if (t < 0.6) {
      setScaffoldH(Math.min(3, (t / 0.6) * 3));
    }

    // Stage 2 — particle burst (0.6 → 2s)
    if (t >= 0.6 && !spawned.current) {
      spawned.current = true;
      spawnParticles();
      setShowBanner(true);
    }

    // Animate particles
    if (particles.current.length > 0 && particleMesh.current) {
      particles.current.forEach((p, i) => {
        p.life = Math.max(0, p.life - delta * 0.7);
        p.vel.y -= delta * 9.8 * 0.5; // gravity
        p.pos.addScaledVector(p.vel, delta);

        dummy.current.position.copy(p.pos);
        const s = p.scale * p.life;
        dummy.current.scale.set(s, s, s);
        dummy.current.updateMatrix();
        particleMesh.current.setMatrixAt(i, dummy.current.matrix);
      });
      particleMesh.current.instanceMatrix.needsUpdate = true;
    }

    // Stage 4 — banner fades out at 2.5s, done at 3s
    if (t >= 2.5 && !bannerOut) {
      setBannerOut(true);
    }
    if (t >= 3.2) {
      setDone(true);
      onDone();
    }
  });

  if (done) return null;

  return (
    <group position={[px, 0, pz]}>

      {/* ── Scaffolding poles rising ── */}
      {scaffoldH > 0.05 && (
        <>
          <Pole x={-1.2} z={-1.2} height={scaffoldH} />
          <Pole x={ 1.2} z={-1.2} height={scaffoldH} />
          <Pole x={-1.2} z={ 1.2} height={scaffoldH} />
          <Pole x={ 1.2} z={ 1.2} height={scaffoldH} />
          {/* Crossbeam */}
          {scaffoldH > 1.5 && (
            <mesh position={[0, scaffoldH * 0.7, 0]}>
              <boxGeometry args={[2.6, 0.07, 0.07]} />
              <meshStandardMaterial color="#64748b" metalness={0.6} roughness={0.4} />
            </mesh>
          )}
          {scaffoldH > 2 && (
            <mesh position={[0, scaffoldH * 0.7, 0]} rotation={[0, Math.PI / 2, 0]}>
              <boxGeometry args={[2.6, 0.07, 0.07]} />
              <meshStandardMaterial color="#64748b" metalness={0.6} roughness={0.4} />
            </mesh>
          )}
          {/* Construction light on top */}
          {scaffoldH > 2.5 && (
            <pointLight position={[0, scaffoldH + 0.5, 0]} intensity={6} distance={8} color="#fbbf24" />
          )}
        </>
      )}

      {/* ── Particle burst (instanced for perf) ── */}
      {particles.current.length > 0 && (
        <instancedMesh ref={particleMesh} args={[undefined, undefined, 40]} castShadow>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.8} />
        </instancedMesh>
      )}

      {/* ── 2D overlay banner ── */}
      {showBanner && (
        <Html position={[0, 6, 0]} center distanceFactor={12} zIndexRange={[500, 0]}>
          <div style={{
            fontFamily  : '"Nunito",system-ui,sans-serif',
            textAlign   : 'center',
            pointerEvents: 'none',
            opacity     : bannerOut ? 0 : 1,
            transform   : bannerOut ? 'scale(0.8) translateY(-20px)' : 'scale(1)',
            transition  : 'opacity 0.6s ease, transform 0.6s ease',
          }}>
            {/* Main badge */}
            <div style={{
              background  : 'linear-gradient(135deg,#fef9c3,#fef08a)',
              border      : '4px solid #d97706',
              borderRadius: 24,
              padding     : '14px 28px',
              boxShadow   : '0 0 0 6px rgba(251,191,36,0.3), 0 16px 48px rgba(0,0,0,0.5)',
              animation   : 'builtPop 0.4s cubic-bezier(0.34,1.56,0.64,1)',
              marginBottom: 8,
            }}>
              <div style={{ fontSize: 48, lineHeight: 1, marginBottom: 4 }}>🏠</div>
              <div style={{
                fontWeight   : 900, fontSize: 22, color: '#92400e',
                letterSpacing: 2, textTransform: 'uppercase',
              }}>Built!</div>
              <div style={{ fontSize: 13, color: '#a16207', fontWeight: 700, marginTop: 2 }}>
                Your town is growing! 🌟
              </div>
            </div>

            {/* Floating coin emojis */}
            {['🪙','💰','⭐','🎉','✨'].map((emoji, i) => (
              <div key={i} style={{
                position    : 'absolute',
                fontSize    : 22,
                top         : 0,
                left        : '50%',
                animation   : `coinFly${i} 1.2s ease-out ${i * 0.1}s forwards`,
                opacity     : 0,
                pointerEvents: 'none',
              }}>{emoji}</div>
            ))}
          </div>

          {/* Keyframes */}
          <style>{`
            @keyframes builtPop {
              0%   { transform: scale(0.3) rotate(-10deg); opacity: 0 }
              60%  { transform: scale(1.12) rotate(3deg);  opacity: 1 }
              100% { transform: scale(1) rotate(0deg);     opacity: 1 }
            }
            @keyframes coinFly0 { 0%{opacity:0;transform:translate(-50%,0) scale(0)} 20%{opacity:1} 100%{opacity:0;transform:translate(calc(-50% - 60px),-80px) scale(1.2)} }
            @keyframes coinFly1 { 0%{opacity:0;transform:translate(-50%,0) scale(0)} 20%{opacity:1} 100%{opacity:0;transform:translate(calc(-50% - 20px),-100px) scale(1)} }
            @keyframes coinFly2 { 0%{opacity:0;transform:translate(-50%,0) scale(0)} 20%{opacity:1} 100%{opacity:0;transform:translate(calc(-50% + 10px),-90px) scale(1.1)} }
            @keyframes coinFly3 { 0%{opacity:0;transform:translate(-50%,0) scale(0)} 20%{opacity:1} 100%{opacity:0;transform:translate(calc(-50% + 40px),-70px) scale(1)} }
            @keyframes coinFly4 { 0%{opacity:0;transform:translate(-50%,0) scale(0)} 20%{opacity:1} 100%{opacity:0;transform:translate(calc(-50% + 70px),-85px) scale(1.2)} }
          `}</style>
        </Html>
      )}
    </group>
  );
}
