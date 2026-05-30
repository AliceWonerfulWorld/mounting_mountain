"use client";

import { memo, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import type { WeatherId } from "@/lib/solo/weather";

type GameWorldSceneProps = {
  weather?: WeatherId;
  variant?: "solo" | "versus";
};

type WorldPalette = {
  sky: string;
  horizon: string;
  fog: string;
  far: string;
  mid: string;
  near: string;
  snow: string;
  accent: string;
};

const WEATHER_PALETTES: Record<WeatherId | "DEFAULT", WorldPalette> = {
  DEFAULT: {
    sky: "#cbd5e1",
    horizon: "#f8fafc",
    fog: "#e2e8f0",
    far: "#cbd5e1",
    mid: "#94a3b8",
    near: "#64748b",
    snow: "#f8fafc",
    accent: "#93c5fd",
  },
  SUNNY: {
    sky: "#7dd3fc",
    horizon: "#eff6ff",
    fog: "#dbeafe",
    far: "#86efac",
    mid: "#4ade80",
    near: "#15803d",
    snow: "#f8fafc",
    accent: "#fde68a",
  },
  WINDY: {
    sky: "#94a3b8",
    horizon: "#e2e8f0",
    fog: "#cbd5e1",
    far: "#cbd5e1",
    mid: "#94a3b8",
    near: "#475569",
    snow: "#f1f5f9",
    accent: "#e2e8f0",
  },
  BLIZZARD: {
    sky: "#cbd5e1",
    horizon: "#f8fafc",
    fog: "#f1f5f9",
    far: "#e2e8f0",
    mid: "#cbd5e1",
    near: "#94a3b8",
    snow: "#ffffff",
    accent: "#ffffff",
  },
};

const RIDGES = [
  { x: -6.5, z: -8.5, h: 3.4, r: 2.7 },
  { x: -3.8, z: -9.2, h: 4.8, r: 3.1 },
  { x: -0.8, z: -9.7, h: 5.9, r: 3.6 },
  { x: 2.5, z: -9.0, h: 4.4, r: 2.9 },
  { x: 6.0, z: -8.6, h: 3.6, r: 2.8 },
  { x: -7.0, z: -5.8, h: 3.1, r: 2.4 },
  { x: -2.2, z: -5.5, h: 4.2, r: 2.8 },
  { x: 2.2, z: -5.9, h: 3.8, r: 2.6 },
  { x: 6.6, z: -5.6, h: 3.3, r: 2.5 },
  { x: -4.4, z: -4.2, h: 2.6, r: 2.25 },
  { x: 0.4, z: -4.0, h: 3.5, r: 2.55 },
  { x: 5.0, z: -4.3, h: 2.8, r: 2.3 },
];

const SNOW_POINTS = Array.from({ length: 220 }, (_, i) => ({
  x: ((i * 37) % 120) / 10 - 6,
  y: ((i * 53) % 70) / 10 - 0.5,
  z: -((i * 29) % 90) / 10 - 1,
}));

const WIND_STREAKS = Array.from({ length: 28 }, (_, i) => ({
  x: ((i * 41) % 120) / 10 - 6,
  y: ((i * 23) % 42) / 10 + 0.5,
  z: -((i * 31) % 80) / 10 - 1.5,
  scale: 0.35 + ((i * 17) % 30) / 100,
}));

const STAR_POINTS = Array.from({ length: 58 }, (_, i) => ({
  x: ((i * 43) % 140) / 10 - 7,
  y: ((i * 61) % 42) / 10 + 0.6,
  z: -((i * 47) % 90) / 10 - 3.5,
  size: 0.012 + ((i * 11) % 9) / 1000,
}));

export const GameWorldScene = memo(function GameWorldScene({
  weather,
  variant = "solo",
}: GameWorldSceneProps) {
  const palette = WEATHER_PALETTES[weather ?? "DEFAULT"];
  const isBlizzard = weather === "BLIZZARD";
  const isWindy = weather === "WINDY";

  return (
    <div className="pointer-events-none fixed inset-0 -z-20 overflow-hidden">
      <div
        className="absolute inset-0 transition-colors duration-1000"
        style={{
          background: `linear-gradient(180deg, ${palette.sky} 0%, ${palette.horizon} 46%, #eef2f7 100%)`,
        }}
      />
      <Canvas
        camera={{ position: [0, 2.4, 7.2], fov: variant === "versus" ? 45 : 42 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        className="absolute inset-0"
      >
        <CameraDrift variant={variant} />
        <ambientLight intensity={1.35} />
        <AnimatedKeyLight color="#ffffff" accent={palette.accent} />
        <directionalLight position={[-5, 2, -4]} intensity={0.7} color={palette.accent} />
        <fog attach="fog" args={[palette.fog, 7.2, 17]} />

        <SkySignals palette={palette} weather={weather} />
        <WorldMountains palette={palette} />
        <CloudBank palette={palette} weather={weather} />
        <Atmosphere
          showSnow={isBlizzard}
          showWind={isWindy}
          palette={palette}
        />
        {variant === "versus" && (
          <Sparkles count={42} scale={[10, 3.2, 5]} position={[0, 1.2, -4]} size={1.4} speed={0.18} color={palette.accent} opacity={0.32} />
        )}
      </Canvas>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.48),transparent_28%),linear-gradient(180deg,transparent_55%,rgba(15,23,42,0.10)_100%)]" />
      <div className="absolute inset-0 opacity-45 mix-blend-screen [background:linear-gradient(105deg,transparent_0%,rgba(255,255,255,0.18)_18%,transparent_36%)] animate-[world-sheen_8s_ease-in-out_infinite]" />
    </div>
  );
});

function CameraDrift({ variant }: { variant: "solo" | "versus" }) {
  const { camera } = useThree();
  const baseZ = variant === "versus" ? 7.45 : 7.2;

  useFrame(({ clock, pointer }) => {
    const time = clock.elapsedTime;
    const targetX = Math.sin(time * 0.12) * 0.28 + pointer.x * 0.16;
    const targetY = 2.42 + Math.sin(time * 0.18) * 0.08 + pointer.y * 0.08;
    const targetZ = baseZ + Math.cos(time * 0.1) * 0.12;

    camera.position.lerp(new THREE.Vector3(targetX, targetY, targetZ), 0.025);
    camera.lookAt(Math.sin(time * 0.08) * 0.22, -0.08, -4.6);
  });

  return null;
}

function AnimatedKeyLight({ color, accent }: { color: string; accent: string }) {
  const lightRef = useRef<THREE.DirectionalLight>(null);
  const accentRef = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    const time = clock.elapsedTime;
    if (lightRef.current) {
      lightRef.current.position.x = 4 + Math.sin(time * 0.22) * 0.7;
      lightRef.current.position.y = 7 + Math.cos(time * 0.18) * 0.3;
      lightRef.current.intensity = 2.05 + Math.sin(time * 0.7) * 0.18;
    }
    if (accentRef.current) {
      accentRef.current.position.x = Math.sin(time * 0.26) * 3.2;
      accentRef.current.intensity = 0.8 + Math.sin(time * 0.9) * 0.22;
    }
  });

  return (
    <>
      <directionalLight ref={lightRef} position={[4, 7, 4]} intensity={2.2} color={color} />
      <pointLight ref={accentRef} position={[0, 2.5, -3.5]} intensity={0.8} color={accent} distance={9} />
    </>
  );
}

function SkySignals({ palette, weather }: { palette: WorldPalette; weather?: WeatherId }) {
  const ringRef = useRef<THREE.Group>(null);
  const showStars = weather === "BLIZZARD" || weather === "WINDY";

  useFrame(({ clock }) => {
    if (!ringRef.current) return;
    ringRef.current.rotation.z = clock.elapsedTime * 0.025;
    ringRef.current.position.x = Math.sin(clock.elapsedTime * 0.12) * 0.24;
  });

  return (
    <group position={[0, 2.4, -7.5]}>
      <group ref={ringRef}>
        <mesh>
          <torusGeometry args={[1.85, 0.008, 8, 96]} />
          <meshBasicMaterial color={palette.accent} transparent opacity={weather === "SUNNY" ? 0.18 : 0.1} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 4]}>
          <torusGeometry args={[2.35, 0.006, 8, 96]} />
          <meshBasicMaterial color={palette.horizon} transparent opacity={0.12} />
        </mesh>
      </group>
      {showStars && (
        <group>
          {STAR_POINTS.map((point, index) => (
            <mesh key={index} position={[point.x, point.y, point.z]}>
              <sphereGeometry args={[point.size, 6, 6]} />
              <meshBasicMaterial color={palette.snow} transparent opacity={0.42 + (index % 4) * 0.08} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}

function WorldMountains({ palette }: { palette: WorldPalette }) {
  const farMaterial = useMemo(() => mountainMaterial(palette.far, 0.62), [palette.far]);
  const midMaterial = useMemo(() => mountainMaterial(palette.mid, 0.82), [palette.mid]);
  const nearMaterial = useMemo(() => mountainMaterial(palette.near, 0.95), [palette.near]);
  const snowMaterial = useMemo(() => mountainMaterial(palette.snow, 0.96), [palette.snow]);
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.position.x = Math.sin(clock.elapsedTime * 0.08) * 0.16;
    groupRef.current.position.z = Math.cos(clock.elapsedTime * 0.06) * 0.08;
    groupRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.05) * 0.024;
  });

  return (
    <group ref={groupRef} position={[0, -2.95, 0]}>
      {RIDGES.map((ridge, index) => {
        const layer = ridge.z < -8 ? "far" : ridge.z < -5 ? "mid" : "near";
        const material = layer === "far" ? farMaterial : layer === "mid" ? midMaterial : nearMaterial;
        const snowSize = Math.max(0.34, ridge.h * 0.18);

        return (
          <group key={`${ridge.x}-${ridge.z}`} position={[ridge.x, ridge.h / 2, ridge.z]}>
            <mesh rotation={[0, index % 2 ? 0.42 : -0.36, 0]} material={material}>
              <coneGeometry args={[ridge.r, ridge.h, 5, 3]} />
            </mesh>
            <mesh position={[0, ridge.h / 2 - snowSize / 2 + 0.01, 0]} rotation={[0, index % 2 ? 0.42 : -0.36, 0]} material={snowMaterial}>
              <coneGeometry args={[ridge.r * (snowSize / ridge.h) * 1.34, snowSize, 5, 1]} />
            </mesh>
          </group>
        );
      })}
      <mesh position={[0, -0.06, -2.8]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[24, 10]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.8} transparent opacity={0.58} />
      </mesh>
    </group>
  );
}

function CloudBank({ palette, weather }: { palette: WorldPalette; weather?: WeatherId }) {
  const opacity = weather === "SUNNY" ? 0.18 : weather === "BLIZZARD" ? 0.55 : 0.34;
  const groupRef = useRef<THREE.Group>(null);
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: palette.horizon,
        transparent: true,
        opacity,
        depthWrite: false,
      }),
    [opacity, palette.horizon],
  );

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const speed = weather === "WINDY" ? 0.42 : 0.14;
    groupRef.current.position.x = Math.sin(clock.elapsedTime * speed) * 1.5;
    groupRef.current.position.y = 1.4 + Math.sin(clock.elapsedTime * 0.24) * 0.08;
  });

  return (
    <group ref={groupRef} position={[0, 1.4, -6.5]}>
      <Float speed={0.45} rotationIntensity={0.04} floatIntensity={0.18}>
        <VolumetricCloud position={[-3.6, 0.15, 0]} scale={[1.05, 0.34, 0.24]} material={material} />
        <VolumetricCloud position={[2.5, -0.05, -0.6]} scale={[1.2, 0.38, 0.26]} material={material} />
      </Float>
    </group>
  );
}

function VolumetricCloud({
  position,
  scale,
  material,
}: {
  position: [number, number, number];
  scale: [number, number, number];
  material: THREE.Material;
}) {
  return (
    <group position={position} scale={scale}>
      {[
        [-1.3, 0, 0],
        [-0.65, 0.14, 0.04],
        [0.05, 0.03, 0],
        [0.72, 0.18, -0.03],
        [1.35, 0.02, 0.02],
      ].map((cloud, index) => (
        <mesh key={index} position={cloud as [number, number, number]} material={material}>
          <sphereGeometry args={[0.78 - Math.abs(index - 2) * 0.08, 14, 10]} />
        </mesh>
      ))}
    </group>
  );
}

function Atmosphere({
  showSnow,
  showWind,
  palette,
}: {
  showSnow: boolean;
  showWind: boolean;
  palette: WorldPalette;
}) {
  const snowRef = useRef<THREE.Group>(null);
  const windRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (snowRef.current) {
      snowRef.current.position.y = -((clock.elapsedTime * 0.72) % 2.5);
      snowRef.current.position.x = Math.sin(clock.elapsedTime * 0.65) * 0.32;
      snowRef.current.rotation.z = Math.sin(clock.elapsedTime * 0.2) * 0.08;
    }
    if (windRef.current) {
      windRef.current.position.x = ((clock.elapsedTime * 3.4) % 5) - 2.5;
      windRef.current.position.y = Math.sin(clock.elapsedTime * 1.2) * 0.18;
    }
  });

  return (
    <>
      {showSnow && (
        <group ref={snowRef}>
          {SNOW_POINTS.map((point, index) => (
            <mesh key={index} position={[point.x, point.y, point.z]}>
              <sphereGeometry args={[0.018 + (index % 3) * 0.006, 6, 6]} />
              <meshBasicMaterial color={palette.snow} transparent opacity={0.72} />
            </mesh>
          ))}
        </group>
      )}
      {showWind && (
        <group ref={windRef} rotation={[0, 0, -0.08]}>
          {WIND_STREAKS.map((streak, index) => (
            <mesh key={index} position={[streak.x, streak.y, streak.z]} scale={[streak.scale, 1, 1]}>
              <boxGeometry args={[1.4, 0.012, 0.012]} />
              <meshBasicMaterial color={palette.accent} transparent opacity={0.42} />
            </mesh>
          ))}
        </group>
      )}
    </>
  );
}

function mountainMaterial(color: string, opacity: number) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.9,
    metalness: 0.02,
    transparent: opacity < 1,
    opacity,
    flatShading: true,
  });
}
