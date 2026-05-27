"use client";

import { memo, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Html, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import clsx from "clsx";

type MountainResultSceneProps = {
  altitude: number;
  maxAltitude?: number;
  mode?: "solo" | "versus";
  color?: "red" | "blue" | "neutral";
  isWinner?: boolean;
  didFall?: boolean;
  bonusAltitude?: number;
  className?: string;
  size?: "compact" | "large";
};

type Palette = {
  sky: string;
  horizon: string;
  ridge: string;
  rock: string;
  shadow: string;
  snow: string;
  accent: string;
  glow: string;
};

const PALETTES: Record<NonNullable<MountainResultSceneProps["color"]>, Palette> = {
  neutral: {
    sky: "#dbeafe",
    horizon: "#f8fafc",
    ridge: "#94a3b8",
    rock: "#57534e",
    shadow: "#292524",
    snow: "#f8fafc",
    accent: "#f59e0b",
    glow: "rgba(245, 158, 11, 0.38)",
  },
  red: {
    sky: "#fee2e2",
    horizon: "#fff7ed",
    ridge: "#fca5a5",
    rock: "#991b1b",
    shadow: "#450a0a",
    snow: "#fff1f2",
    accent: "#ef4444",
    glow: "rgba(239, 68, 68, 0.38)",
  },
  blue: {
    sky: "#dbeafe",
    horizon: "#eff6ff",
    ridge: "#93c5fd",
    rock: "#1d4ed8",
    shadow: "#172554",
    snow: "#f0f9ff",
    accent: "#3b82f6",
    glow: "rgba(59, 130, 246, 0.38)",
  },
};

export const MountainResultScene = memo(function MountainResultScene({
  altitude,
  maxAltitude = 8848,
  mode = "solo",
  color = "neutral",
  isWinner = false,
  didFall = false,
  bonusAltitude = 0,
  className,
  size = "large",
}: MountainResultSceneProps) {
  const ratio = Math.min(Math.max(altitude / maxAltitude, 0), 1);
  const palette = PALETTES[color];
  const tier = getAltitudeTier(altitude);
  const isCompact = size === "compact";

  return (
    <div
      className={clsx(
        "relative isolate overflow-hidden rounded-2xl bg-slate-950 text-white shadow-[0_24px_80px_rgba(15,23,42,0.35)]",
        isCompact ? "h-[260px] sm:h-[300px]" : "h-[320px] sm:h-[420px]",
        didFall && "ring-2 ring-red-400/70",
        isWinner && "ring-2 ring-amber-300/80",
        className,
      )}
      style={{
        background: `linear-gradient(180deg, ${palette.sky} 0%, ${palette.horizon} 46%, #0f172a 100%)`,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background:
            "radial-gradient(circle at 50% 12%, rgba(255,255,255,0.88), transparent 22%), linear-gradient(180deg, transparent 48%, rgba(15,23,42,0.38) 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2"
        style={{
          background: `radial-gradient(circle at 50% 65%, ${palette.glow}, transparent 54%)`,
        }}
      />

      <Canvas
        camera={{
          position: isCompact ? [0, 1.45, 6.4] : [0, 1.65, 6.1],
          fov: isCompact ? 42 : 38,
        }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true }}
        className="absolute inset-0"
      >
        <ambientLight intensity={1.35} />
        <directionalLight position={[3.2, 4.5, 2.6]} intensity={2.4} color="#ffffff" />
        <directionalLight position={[-4, 1.6, -2]} intensity={0.9} color={palette.ridge} />
        <fog attach="fog" args={[palette.horizon, 7, 13]} />

        <Float speed={1.2} rotationIntensity={0.12} floatIntensity={isCompact ? 0.12 : 0.22}>
          <MountainMesh altitudeRatio={ratio} palette={palette} didFall={didFall} />
        </Float>

        <RidgeLine z={-1.45} y={-1.14} color={palette.ridge} opacity={0.42} scale={1.22} />
        <RidgeLine z={-2.05} y={-1.03} color={palette.shadow} opacity={0.18} scale={1.46} />
        {(isWinner || altitude >= 8000) && (
          <Sparkles
            count={isCompact ? 34 : 56}
            scale={isCompact ? [4.6, 2.2, 1.8] : [5.4, 2.8, 2.2]}
            size={isWinner ? 4 : 2.5}
            speed={0.55}
            color={palette.accent}
            opacity={0.75}
          />
        )}
        {didFall && <FallScar palette={palette} />}
      </Canvas>

      <div className="pointer-events-none absolute inset-x-4 top-4 flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.26em] text-slate-700/80">
            {mode === "versus" ? "Judged Peak" : "Current Peak"}
          </div>
          <div className="mt-1 text-sm font-bold text-slate-900/85 sm:text-base">{tier}</div>
        </div>
        <div className="rounded-full bg-white/72 px-3 py-1 text-xs font-black text-slate-800 shadow-sm backdrop-blur-md">
          {Math.round(ratio * 100)}%
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-4 bottom-4 flex items-end justify-between gap-3">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.22em] text-white/70">
            Altitude
          </div>
          <div className="mt-1 font-mono text-4xl font-black leading-none tracking-tight text-white drop-shadow-[0_3px_10px_rgba(0,0,0,0.45)] sm:text-5xl">
            {altitude.toLocaleString()}
            <span className="ml-1 text-base text-white/75 sm:text-xl">m</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 text-right">
          {bonusAltitude > 0 && (
            <div className="rounded-full bg-amber-300/92 px-3 py-1 text-xs font-black text-amber-950 shadow-lg">
              +{bonusAltitude.toLocaleString()}m
            </div>
          )}
          {didFall && (
            <div className="rounded-full bg-red-500/92 px-3 py-1 text-xs font-black text-white shadow-lg">
              滑落
            </div>
          )}
          {isWinner && (
            <div className="rounded-full bg-white/90 px-3 py-1 text-xs font-black text-slate-900 shadow-lg">
              WINNER
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

function MountainMesh({
  altitudeRatio,
  palette,
  didFall,
}: {
  altitudeRatio: number;
  palette: Palette;
  didFall: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const height = 1.75 + altitudeRatio * 2.65;
  const radius = 1.48 - altitudeRatio * 0.28;
  const snowHeight = altitudeRatio > 0.55 ? Math.max(0.22, height * 0.26) : 0;

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.38) * 0.08;
    groupRef.current.position.y = -1.12 + Math.sin(clock.elapsedTime * 0.72) * 0.025;
  });

  const rockMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: palette.rock,
        roughness: 0.86,
        metalness: 0.04,
        flatShading: true,
      }),
    [palette.rock],
  );
  const shadowMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: palette.shadow,
        roughness: 0.92,
        metalness: 0.02,
        flatShading: true,
      }),
    [palette.shadow],
  );
  const snowMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: palette.snow,
        roughness: 0.42,
        metalness: 0.02,
        flatShading: true,
      }),
    [palette.snow],
  );

  return (
    <group ref={groupRef}>
      <mesh position={[0, height / 2 - 1.1, 0]} rotation={[0, Math.PI / 4, 0]} material={rockMaterial}>
        <coneGeometry args={[radius, height, 7, 5]} />
      </mesh>
      <mesh position={[-0.58, height * 0.34 - 1.05, 0.2]} rotation={[0, -0.35, 0.18]} material={shadowMaterial}>
        <coneGeometry args={[radius * 0.62, height * 0.82, 5, 4]} />
      </mesh>
      <mesh position={[0.52, height * 0.32 - 1.04, 0.1]} rotation={[0, 0.42, -0.12]} material={rockMaterial}>
        <coneGeometry args={[radius * 0.52, height * 0.76, 5, 4]} />
      </mesh>
      {snowHeight > 0 && (
        <mesh position={[0, height - snowHeight / 2 - 1.08, 0]} rotation={[0, Math.PI / 4, 0]} material={snowMaterial}>
          <coneGeometry args={[radius * (snowHeight / height) * 1.22, snowHeight, 7, 2]} />
        </mesh>
      )}
      {altitudeRatio >= 0.9 && <SummitFlag color={palette.accent} height={height} />}
      {didFall && (
        <Html position={[0.52, height * 0.42 - 1.05, 0.95]} transform>
          <div className="h-16 w-1 rotate-[22deg] rounded-full bg-red-500 shadow-[0_0_18px_rgba(239,68,68,0.95)]" />
        </Html>
      )}
    </group>
  );
}

function SummitFlag({ color, height }: { color: string; height: number }) {
  return (
    <group position={[0, height - 0.86, 0]}>
      <mesh position={[0, 0.32, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.66, 8]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.42} />
      </mesh>
      <mesh position={[0.16, 0.5, 0]} rotation={[0, 0, -0.08]}>
        <boxGeometry args={[0.32, 0.16, 0.018]} />
        <meshStandardMaterial color={color} roughness={0.36} />
      </mesh>
    </group>
  );
}

function RidgeLine({
  z,
  y,
  color,
  opacity,
  scale,
}: {
  z: number;
  y: number;
  color: string;
  opacity: number;
  scale: number;
}) {
  return (
    <group position={[0, y, z]} scale={[scale, scale, scale]}>
      <mesh position={[-1.6, 0, 0]} rotation={[0, 0, 0.08]}>
        <coneGeometry args={[1.1, 1.65, 5, 1]} />
        <meshBasicMaterial color={color} transparent opacity={opacity} />
      </mesh>
      <mesh position={[0.2, 0.02, 0]}>
        <coneGeometry args={[1.3, 1.9, 5, 1]} />
        <meshBasicMaterial color={color} transparent opacity={opacity + 0.06} />
      </mesh>
      <mesh position={[1.8, -0.02, 0]} rotation={[0, 0, -0.08]}>
        <coneGeometry args={[1.0, 1.55, 5, 1]} />
        <meshBasicMaterial color={color} transparent opacity={opacity} />
      </mesh>
    </group>
  );
}

function FallScar({ palette }: { palette: Palette }) {
  return (
    <Sparkles
      count={18}
      scale={[2.2, 1.1, 1.2]}
      position={[0.5, -0.1, 0.4]}
      size={3.4}
      speed={0.8}
      color={palette.accent}
      opacity={0.55}
    />
  );
}

function getAltitudeTier(altitude: number) {
  if (altitude >= 8000) return "Death Zone Summit";
  if (altitude >= 6000) return "Snow Line";
  if (altitude >= 4000) return "Alpine Wall";
  if (altitude >= 2000) return "Rocky Ridge";
  return "Foothills";
}
