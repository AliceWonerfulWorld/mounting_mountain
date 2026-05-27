"use client";

import { memo, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Html, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import clsx from "clsx";
import type { WeatherId } from "@/lib/solo/weather";
import type { TimeOfDay } from "@/lib/timeOfDayConfig";

type MountainResultSceneProps = {
  altitude: number;
  maxAltitude?: number;
  mode?: "solo" | "versus";
  color?: "red" | "blue" | "neutral";
  weather?: WeatherId;
  timeOfDay?: TimeOfDay;
  isWinner?: boolean;
  didFall?: boolean;
  bonusAltitude?: number;
  className?: string;
  size?: "compact" | "large";
  showHud?: boolean;
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
  label: string;
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
    label: "#334155",
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
    label: "#7f1d1d",
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
    label: "#172554",
  },
};

const WEATHER_TINTS: Record<WeatherId, Partial<Palette>> = {
  SUNNY: {
    sky: "#bae6fd",
    horizon: "#fef9c3",
    ridge: "#86efac",
    snow: "#fff7ed",
    glow: "rgba(251, 191, 36, 0.34)",
  },
  WINDY: {
    sky: "#cbd5e1",
    horizon: "#e2e8f0",
    ridge: "#94a3b8",
    rock: "#64748b",
    shadow: "#334155",
    glow: "rgba(226, 232, 240, 0.26)",
  },
  BLIZZARD: {
    sky: "#dbeafe",
    horizon: "#f8fafc",
    ridge: "#cbd5e1",
    rock: "#94a3b8",
    shadow: "#475569",
    snow: "#ffffff",
    glow: "rgba(255, 255, 255, 0.42)",
  },
};

const TIME_TINTS: Record<TimeOfDay, Partial<Palette>> = {
  dawn: {
    sky: "#c7d2fe",
    horizon: "#fed7aa",
    accent: "#fb923c",
    glow: "rgba(251, 146, 60, 0.36)",
  },
  morning: {
    sky: "#bae6fd",
    horizon: "#fef3c7",
    accent: "#f59e0b",
  },
  day: {
    sky: "#bfdbfe",
    horizon: "#f8fafc",
  },
  afternoon: {
    sky: "#93c5fd",
    horizon: "#fde68a",
    accent: "#f97316",
  },
  sunset: {
    sky: "#fda4af",
    horizon: "#fed7aa",
    ridge: "#c084fc",
    accent: "#fb7185",
    glow: "rgba(251, 113, 133, 0.4)",
    label: "#4c1d95",
  },
  night: {
    sky: "#0f172a",
    horizon: "#1e293b",
    ridge: "#334155",
    rock: "#475569",
    shadow: "#020617",
    snow: "#dbeafe",
    accent: "#93c5fd",
    glow: "rgba(147, 197, 253, 0.28)",
    label: "#dbeafe",
  },
};

export const MountainResultScene = memo(function MountainResultScene({
  altitude,
  maxAltitude = 8848,
  mode = "solo",
  color = "neutral",
  weather,
  timeOfDay = "day",
  isWinner = false,
  didFall = false,
  bonusAltitude = 0,
  className,
  size = "large",
  showHud = true,
}: MountainResultSceneProps) {
  const ratio = Math.min(Math.max(altitude / maxAltitude, 0), 1);
  const palette = buildPalette(color, weather, timeOfDay, ratio);
  const tier = getAltitudeTier(altitude);
  const isCompact = size === "compact";
  const sceneScale = 0.72 + ratio * 0.42;

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
        <ambientLight intensity={timeOfDay === "night" ? 0.92 : 1.35} />
        <directionalLight position={[3.2, 4.5, 2.6]} intensity={timeOfDay === "night" ? 1.45 : 2.4} color={timeOfDay === "sunset" ? "#fed7aa" : "#ffffff"} />
        <directionalLight position={[-4, 1.6, -2]} intensity={0.9} color={palette.ridge} />
        <fog attach="fog" args={[palette.horizon, 7, 13]} />

        <ResultAtmosphere palette={palette} weather={weather} timeOfDay={timeOfDay} />

        <Float speed={1.2} rotationIntensity={0.12} floatIntensity={isCompact ? 0.12 : 0.22}>
          <MountainMesh altitudeRatio={ratio} palette={palette} didFall={didFall} />
        </Float>

        <RidgeLine z={-1.45} y={-1.14} color={palette.ridge} opacity={0.18 + ratio * 0.22} scale={sceneScale} />
        <RidgeLine z={-2.05} y={-1.03} color={palette.shadow} opacity={0.12 + ratio * 0.12} scale={sceneScale + 0.28} />
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

      {showHud && (
        <div className="pointer-events-none absolute inset-x-4 top-4 flex items-start justify-between gap-3">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.26em]" style={{ color: palette.label }}>
              {mode === "versus" ? "Judged Peak" : "Current Peak"}
            </div>
            <div className="mt-1 text-sm font-bold sm:text-base" style={{ color: palette.label }}>{tier}</div>
          </div>
          <div className="rounded-full bg-white/72 px-3 py-1 text-xs font-black text-slate-800 shadow-sm backdrop-blur-md">
            {Math.round(ratio * 100)}%
          </div>
        </div>
      )}

      {showHud && (
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
      )}
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
  const height = 0.48 + Math.pow(altitudeRatio, 0.82) * 4.35;
  const radius = 1.1 + altitudeRatio * 0.32;
  const sideHeight = Math.max(0.32, height * (0.42 + altitudeRatio * 0.24));
  const baseY = -1.36;
  const snowHeight = altitudeRatio > 0.55 ? Math.max(0.22, height * 0.26) : 0;
  const foothillHeight = Math.max(0.22, height * 0.36);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.38) * 0.08;
    groupRef.current.position.y = Math.sin(clock.elapsedTime * 0.72) * 0.025;
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
      <mesh position={[0, baseY + height / 2, 0]} rotation={[0, Math.PI / 4, 0]} material={rockMaterial}>
        <coneGeometry args={[radius, height, 7, 5]} />
      </mesh>
      <mesh position={[-0.58, baseY + sideHeight / 2 + height * 0.02, 0.2]} rotation={[0, -0.35, 0.18]} material={shadowMaterial}>
        <coneGeometry args={[radius * 0.56, sideHeight, 5, 4]} />
      </mesh>
      <mesh position={[0.52, baseY + sideHeight / 2, 0.1]} rotation={[0, 0.42, -0.12]} material={rockMaterial}>
        <coneGeometry args={[radius * 0.5, sideHeight * 0.9, 5, 4]} />
      </mesh>
      {altitudeRatio < 0.22 && (
        <mesh position={[0, baseY + foothillHeight / 2 - 0.05, -0.1]} rotation={[0, 0.2, 0]} material={rockMaterial}>
          <coneGeometry args={[radius * 1.26, foothillHeight, 8, 2]} />
        </mesh>
      )}
      {snowHeight > 0 && (
        <mesh position={[0, baseY + height - snowHeight / 2 + 0.02, 0]} rotation={[0, Math.PI / 4, 0]} material={snowMaterial}>
          <coneGeometry args={[radius * (snowHeight / height) * 1.22, snowHeight, 7, 2]} />
        </mesh>
      )}
      {altitudeRatio >= 0.9 && <SummitFlag color={palette.accent} height={height} baseY={baseY} />}
      {didFall && (
        <Html position={[0.52, baseY + height * 0.42, 0.95]} transform>
          <div className="h-16 w-1 rotate-[22deg] rounded-full bg-red-500 shadow-[0_0_18px_rgba(239,68,68,0.95)]" />
        </Html>
      )}
    </group>
  );
}

function SummitFlag({ color, height, baseY }: { color: string; height: number; baseY: number }) {
  return (
    <group position={[0, baseY + height - 0.02, 0]}>
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

function ResultAtmosphere({
  palette,
  weather,
  timeOfDay,
}: {
  palette: Palette;
  weather?: WeatherId;
  timeOfDay: TimeOfDay;
}) {
  const showSnow = weather === "BLIZZARD";
  const showWind = weather === "WINDY";
  const showStars = timeOfDay === "night" || timeOfDay === "dawn";

  return (
    <>
      {showStars && (
        <Sparkles
          count={28}
          scale={[4.8, 2.3, 1.8]}
          position={[0, 1.4, -1.2]}
          size={1.5}
          speed={0.12}
          color={palette.snow}
          opacity={0.42}
        />
      )}
      {showSnow && (
        <Sparkles
          count={54}
          scale={[4.8, 2.8, 2]}
          position={[0, 0.4, 0]}
          size={2.2}
          speed={0.62}
          color={palette.snow}
          opacity={0.58}
        />
      )}
      {showWind && <WindRibbons color={palette.accent} />}
    </>
  );
}

function WindRibbons({ color }: { color: string }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.position.x = ((clock.elapsedTime * 1.9) % 3) - 1.5;
  });

  return (
    <group ref={groupRef} rotation={[0, 0, -0.08]} position={[0, 0.25, 0.3]}>
      {[-1.15, -0.45, 0.32, 1.05].map((y, index) => (
        <mesh key={index} position={[-0.6 + index * 0.34, y, 0]}>
          <boxGeometry args={[1.3, 0.018, 0.018]} />
          <meshBasicMaterial color={color} transparent opacity={0.28} />
        </mesh>
      ))}
    </group>
  );
}

function getAltitudeTier(altitude: number) {
  if (altitude >= 8000) return "Death Zone Summit";
  if (altitude >= 6000) return "Snow Line";
  if (altitude >= 4000) return "Alpine Wall";
  if (altitude >= 2000) return "Rocky Ridge";
  return "Foothills";
}

function buildPalette(
  color: NonNullable<MountainResultSceneProps["color"]>,
  weather: WeatherId | undefined,
  timeOfDay: TimeOfDay,
  ratio: number,
): Palette {
  const base = PALETTES[color];
  const weatherTint = weather ? WEATHER_TINTS[weather] : {};
  const timeTint = TIME_TINTS[timeOfDay];
  const altitudeTint: Partial<Palette> = ratio < 0.22
    ? {
        rock: color === "neutral" ? "#3f7d4d" : base.rock,
        shadow: color === "neutral" ? "#245135" : base.shadow,
        ridge: color === "neutral" ? "#86efac" : base.ridge,
      }
    : ratio > 0.68
      ? {
          rock: color === "neutral" ? "#64748b" : base.rock,
          shadow: color === "neutral" ? "#334155" : base.shadow,
          snow: "#f8fafc",
        }
      : {};

  return {
    ...base,
    ...weatherTint,
    ...timeTint,
    ...altitudeTint,
  };
}
