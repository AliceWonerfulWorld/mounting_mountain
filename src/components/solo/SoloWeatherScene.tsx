'use client';

import type { WeatherId } from '@/lib/solo/weather';

const SNOW_PARTICLES = Array.from({ length: 50 }, () => ({
  left: Math.random() * 100,
  top: Math.random() * 20,
  fontSize: Math.random() * 10 + 10,
  duration: Math.random() * 3 + 2,
  delay: Math.random() * 5,
}));

const WIND_LEAVES = Array.from({ length: 20 }, () => ({
  leaf: ['🍁', '🌿'][Math.floor(Math.random() * 2)],
  top: Math.random() * 80,
  fontSize: Math.random() * 20 + 15,
  duration: Math.random() * 3 + 2,
  delay: Math.random() * 4,
}));

const WIND_LINES = Array.from({ length: 40 }, () => ({
  top: Math.random() * 100,
  width: Math.random() * 150 + 100,
  duration: Math.random() * 1.5 + 0.8,
  delay: Math.random() * 3,
}));

type SoloWeatherSceneProps = {
  weather?: WeatherId;
  backgroundClass: string;
};

export function SoloWeatherScene({ weather, backgroundClass }: SoloWeatherSceneProps) {
  return (
    <>
      <div className={`fixed inset-0 ${backgroundClass} -z-20 transition-colors duration-1000`} />

      {weather === 'BLIZZARD' && (
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
          {SNOW_PARTICLES.map((particle, i) => (
            <div
              key={i}
              className="absolute text-white opacity-70"
              style={{
                left: `${particle.left}%`,
                top: `-${particle.top}%`,
                fontSize: `${particle.fontSize}px`,
                animation: `snowfall ${particle.duration}s linear infinite`,
                animationDelay: `${particle.delay}s`,
              }}
            >
              ❄
            </div>
          ))}
        </div>
      )}

      {weather === 'WINDY' && (
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
          {WIND_LEAVES.map((leafData, i) => (
            <div
              key={`leaf-${i}`}
              className="absolute"
              style={{
                top: `${leafData.top}%`,
                left: '-50px',
                fontSize: `${leafData.fontSize}px`,
                animation: `windLeaf ${leafData.duration}s linear infinite`,
                animationDelay: `${leafData.delay}s`,
              }}
            >
              {leafData.leaf}
            </div>
          ))}
          {WIND_LINES.map((line, i) => (
            <div
              key={`line-${i}`}
              className="absolute bg-white/40"
              style={{
                top: `${line.top}%`,
                left: '-150px',
                width: `${line.width}px`,
                height: '2px',
                animation: `windBlow ${line.duration}s linear infinite`,
                animationDelay: `${line.delay}s`,
                transform: 'rotate(-5deg)',
              }}
            />
          ))}
        </div>
      )}

      <MountainSilhouettes weather={weather} />
    </>
  );
}

function MountainSilhouettes({ weather }: { weather?: WeatherId }) {
  const farFill = weather === 'SUNNY'
    ? 'fill-green-600 dark:fill-green-700'
    : 'fill-stone-400 dark:fill-stone-600';
  const nearFill = weather === 'SUNNY'
    ? 'fill-green-700 dark:fill-green-800'
    : 'fill-stone-500 dark:fill-stone-700';

  return (
    <>
      <div className="fixed bottom-0 left-0 w-full h-1/3 pointer-events-none -z-10 opacity-30 dark:opacity-20 transition-all duration-1000">
        <svg viewBox="0 0 1200 320" preserveAspectRatio="none" className={`w-full h-full ${farFill}`}>
          <path d="M0,320 L200,160 L400,280 L600,100 L800,240 L1000,140 L1200,320 Z" />
        </svg>
      </div>
      <div className="fixed bottom-0 left-0 w-full h-1/4 pointer-events-none -z-10 opacity-50 dark:opacity-40 transition-all duration-1000">
        <svg viewBox="0 0 1200 320" preserveAspectRatio="none" className={`w-full h-full ${nearFill}`}>
          <path d="M0,320 L150,200 L350,300 L550,150 L850,280 L1100,180 L1200,320 Z" />
        </svg>
      </div>
    </>
  );
}
