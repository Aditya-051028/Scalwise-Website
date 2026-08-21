"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

type ProgressRef = { current: number };

const BARS = [
  { height: 0.95, x: -1.3, color: "#6229A8", opacity: 0.65, emissive: 0.12 },
  { height: 1.75, x: 0, color: "#7440C9", opacity: 0.85, emissive: 0.2 },
  { height: 2.55, x: 1.3, color: "#9061F9", opacity: 1, emissive: 0.3 },
];

const BAR_WIDTH = 0.85;
const BAR_DEPTH = 0.85;

function easeOutExpo(t: number) {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

function Bar({
  index,
  height,
  x,
  color,
  opacity,
  emissive,
  progress,
}: {
  index: number;
  height: number;
  x: number;
  color: string;
  opacity: number;
  emissive: number;
  progress: ProgressRef;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const delay = index * 0.15;

  useFrame(() => {
    if (!ref.current) return;
    const local = THREE.MathUtils.clamp((progress.current - delay) / 0.6, 0, 1);
    const eased = easeOutExpo(local);
    ref.current.scale.y = Math.max(eased, 0.001);
    ref.current.position.y = (height / 2) * eased;
  });

  return (
    <mesh ref={ref} position={[x, 0, 0]}>
      <boxGeometry args={[BAR_WIDTH, height, BAR_DEPTH]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={emissive}
        roughness={0.35}
        metalness={0.4}
        transparent
        opacity={opacity}
      />
    </mesh>
  );
}

function TrendLine({ progress }: { progress: ProgressRef }) {
  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-2.1, 0.25, 0.6),
        new THREE.Vector3(0, 2.05, 0.6),
        new THREE.Vector3(2.15, 3.15, 0.6),
      ]),
    []
  );

  const coreMat = useRef<THREE.MeshBasicMaterial>(null);
  const glowMat = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(() => {
    const local = THREE.MathUtils.clamp((progress.current - 0.45) / 0.55, 0, 1);
    const eased = easeOutExpo(local);
    if (coreMat.current) coreMat.current.opacity = eased;
    if (glowMat.current) glowMat.current.opacity = eased * 0.5;
  });

  return (
    <group>
      <mesh>
        <tubeGeometry args={[curve, 40, 0.045, 8, false]} />
        <meshBasicMaterial ref={coreMat} color="#D4FF3D" transparent opacity={0} />
      </mesh>
      <mesh>
        <tubeGeometry args={[curve, 40, 0.11, 8, false]} />
        <meshBasicMaterial
          ref={glowMat}
          color="#D4FF3D"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

function Scene() {
  const progress = useRef(0);
  const group = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0 });

  useFrame((state, delta) => {
    progress.current = Math.min(progress.current + delta / 1.4, 1);

    pointer.current.x = THREE.MathUtils.lerp(pointer.current.x, state.pointer.x, 0.04);
    pointer.current.y = THREE.MathUtils.lerp(pointer.current.y, state.pointer.y, 0.04);

    if (group.current) {
      const t = state.clock.elapsedTime;
      group.current.rotation.y = pointer.current.x * 0.18 + Math.sin(t * 0.25) * 0.03;
      group.current.rotation.x = -pointer.current.y * 0.08 + Math.sin(t * 0.2) * 0.015;
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} color="#B7A9D6" />
      <pointLight position={[3, 4, 4]} intensity={40} color="#9061F9" />
      <pointLight position={[-3, 1, 2]} intensity={12} color="#D4FF3D" />
      <group ref={group} position={[0, -1, 0]}>
        {BARS.map((bar, i) => (
          <Bar key={i} index={i} progress={progress} {...bar} />
        ))}
        <TrendLine progress={progress} />
      </group>
    </>
  );
}

export function HeroScene({ active = true }: { active?: boolean }) {
  return (
    <Canvas
      dpr={[1, 1.6]}
      gl={{ alpha: true, antialias: true }}
      camera={{ position: [0, 0.6, 7.5], fov: 32 }}
      frameloop={active ? "always" : "never"}
      className="!absolute inset-0"
    >
      <Scene />
    </Canvas>
  );
}
