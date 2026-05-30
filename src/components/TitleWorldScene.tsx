"use client";

import Image from "next/image";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import { memo, useRef } from "react";
import * as THREE from "three";

export const TitleWorldScene = memo(function TitleWorldScene() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-20 overflow-hidden bg-[#ed846d]">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#f0836c_0%,#e763b4_48%,#a98ce8_100%)]" />
      <Canvas
        camera={{ position: [0, 0.6, 8], fov: 42 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        className="absolute inset-0"
      >
        <ambientLight intensity={1.2} />
        <directionalLight position={[3, 4, 4]} intensity={1.8} color="#fff7ed" />
        <FloatingSun />
        <DriftingClouds />
        <LightRibbons />
        <Sparkles
          count={42}
          scale={[9, 4, 2]}
          position={[0, 0.8, -1.8]}
          size={1.7}
          speed={0.22}
          color="#ffffff"
          opacity={0.28}
        />
      </Canvas>

      <div className="absolute inset-x-0 bottom-[-6%] mx-auto w-[190vw] max-w-none sm:bottom-[-10%] sm:w-[130vw] lg:bottom-[-18%] lg:w-[110vw]">
        <Image
          src="/mountain.png"
          alt=""
          width={1920}
          height={1080}
          priority
          className="h-auto w-full object-contain object-bottom opacity-[0.78] drop-shadow-[0_28px_90px_rgba(36,18,68,0.42)]"
        />
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_84%,rgba(251,191,36,0.38),transparent_16%),radial-gradient(circle_at_73%_32%,rgba(255,255,255,0.24),transparent_18%),linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(36,18,68,0.16)_54%,rgba(15,23,42,0.28)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-slate-950/[0.35] to-transparent" />
    </div>
  );
});

function FloatingSun() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.position.x = -4.6 + Math.sin(clock.elapsedTime * 0.18) * 0.16;
    groupRef.current.position.y = 2.6 + Math.cos(clock.elapsedTime * 0.22) * 0.12;
  });

  return (
    <group ref={groupRef} position={[-4.6, 2.6, -1.2]}>
      <mesh>
        <sphereGeometry args={[0.46, 32, 24]} />
        <meshBasicMaterial color="#facc15" transparent opacity={0.9} />
      </mesh>
      <mesh>
        <torusGeometry args={[0.74, 0.045, 10, 72]} />
        <meshBasicMaterial color="#fde68a" transparent opacity={0.34} />
      </mesh>
      <mesh>
        <torusGeometry args={[1.04, 0.034, 10, 72]} />
        <meshBasicMaterial color="#fb7185" transparent opacity={0.26} />
      </mesh>
    </group>
  );
}

function DriftingClouds() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.position.x = Math.sin(clock.elapsedTime * 0.11) * 0.42;
    groupRef.current.position.y = Math.cos(clock.elapsedTime * 0.14) * 0.08;
  });

  return (
    <group ref={groupRef} position={[-3.6, 2.55, -1.6]}>
      <Float speed={0.8} rotationIntensity={0.04} floatIntensity={0.15}>
        <CloudCluster position={[0, 0, 0]} scale={[0.9, 0.36, 0.22]} color="#fecdd3" opacity={0.72} />
        <CloudCluster position={[1.2, -0.04, 0.02]} scale={[0.82, 0.32, 0.2]} color="#fdba74" opacity={0.52} />
      </Float>
    </group>
  );
}

function CloudCluster({
  position,
  scale,
  color,
  opacity,
}: {
  position: [number, number, number];
  scale: [number, number, number];
  color: string;
  opacity: number;
}) {
  return (
    <group position={position} scale={scale}>
      {[
        [-1.0, 0, 0],
        [-0.45, 0.2, 0.02],
        [0.15, 0.08, 0],
        [0.72, 0.18, -0.02],
        [1.14, 0, 0.01],
      ].map((point, index) => (
        <mesh key={index} position={point as [number, number, number]}>
          <sphereGeometry args={[0.58 - Math.abs(index - 2) * 0.035, 16, 12]} />
          <meshBasicMaterial color={color} transparent opacity={opacity} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

function LightRibbons() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.position.x = Math.sin(clock.elapsedTime * 0.2) * 0.5;
  });

  return (
    <group ref={groupRef} rotation={[0, 0, -0.1]} position={[0.2, 0.72, -2.2]}>
      {[-1.1, -0.2, 0.72].map((y, index) => (
        <mesh key={index} position={[index * 0.7 - 0.7, y, 0]}>
          <boxGeometry args={[2.2, 0.025, 0.01]} />
          <meshBasicMaterial color="#fdba74" transparent opacity={0.28} />
        </mesh>
      ))}
    </group>
  );
}
