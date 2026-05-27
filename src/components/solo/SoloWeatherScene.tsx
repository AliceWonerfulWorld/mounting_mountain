'use client';

import type { WeatherId } from '@/lib/solo/weather';
import { GameWorldScene } from '@/components/GameWorldScene';

type SoloWeatherSceneProps = {
  weather?: WeatherId;
  backgroundClass: string;
};

export function SoloWeatherScene({ weather, backgroundClass }: SoloWeatherSceneProps) {
  return (
    <>
      <div className={`fixed inset-0 ${backgroundClass} -z-20 transition-colors duration-1000`} />
      <GameWorldScene weather={weather} variant="solo" />

      <div className="fixed inset-0 pointer-events-none -z-10 bg-gradient-to-b from-transparent via-transparent to-white/20 dark:to-black/20" />
    </>
  );
}
