import { memo } from "react";
import type { RouteId } from "@/lib/solo/routes";
import { ROUTES } from "@/lib/solo/routes";

type SoloInputAreaProps = {
  text: string;
  onTextChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: () => void;
  onReset: () => void;
  loading: boolean;
  disabled: boolean;
  selectedRoute: RouteId | undefined;
  onRouteSelect: (routeId: RouteId) => void;
};

export const SoloInputArea = memo(function SoloInputArea({
  text,
  onTextChange,
  onSubmit,
  onReset,
  loading,
  disabled,
  selectedRoute,
  onRouteSelect,
}: SoloInputAreaProps) {
  return (
    <div className="space-y-5 sm:space-y-6">
      {/* ルート選択 */}
      <div className="space-y-3">
        <div className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
          📍 Route Selection
        </div>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {ROUTES.map((route) => {
            const isSelected = selectedRoute === route.id;
            const borderClass = isSelected
              ? "border-blue-500 dark:border-blue-400 ring-2 ring-blue-500 dark:ring-blue-400"
              : "border-gray-200 dark:border-zinc-700";
            const activeClass = isSelected
              ? "bg-blue-50 dark:bg-blue-950/30"
              : "bg-white dark:bg-zinc-900";

            return (
              <button
                key={route.id}
                onClick={() => {
                  onRouteSelect(route.id);
                }}
                className={`relative flex min-h-[88px] flex-col items-center justify-center gap-1 rounded-lg border-2 px-2 py-3 transition-all duration-200 hover:scale-[1.02] sm:min-h-[112px] sm:gap-2 sm:px-3 md:py-5 ${borderClass} ${activeClass} ${isSelected ? "" : "hover:bg-gray-50 dark:hover:bg-zinc-800"}`}
              >
                <div className="text-2xl sm:text-3xl md:text-4xl">{route.emoji}</div>
                <div className="text-xs font-bold leading-tight sm:text-sm md:text-base">{route.label}</div>
                <div className="text-[11px] font-mono sm:text-xs md:text-sm">x{route.multiplier}</div>

                {isSelected && (
                  <div className="absolute -top-2 -right-2">
                    <span className="flex h-5 w-5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-5 w-5 bg-blue-500"></span>
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 入力エリア */}
      <div className="space-y-4">
        <textarea
          className="min-h-36 w-full resize-y rounded-xl border-2 border-transparent bg-gray-50/50 p-4 text-base shadow-inner outline-none transition-all focus:bg-white focus:ring-2 focus:ring-blue-500 dark:bg-black/50 dark:focus:bg-black sm:min-h-40 sm:p-5 sm:text-xl md:text-2xl"
          placeholder="ここにマウント発言を入力... (例: 「まあ、俺なら3秒で終わるけどね」)"
          value={text}
          onChange={onTextChange}
          disabled={disabled || loading}
        />

        <div className="flex gap-3 sm:gap-6">
          <button
            className="group relative flex-1 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-[2px] transition-transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!text.trim() || loading || disabled}
            onClick={onSubmit}
          >
            <div className="relative h-full w-full rounded-[10px] bg-transparent px-4 py-3 transition-all group-hover:bg-white/10 sm:px-8 sm:py-4">
              <div className="flex items-center justify-center gap-2 text-base font-bold text-white sm:gap-3 sm:text-xl md:text-2xl">
                {loading ? (
                  <>
                    <svg className="h-5 w-5 animate-spin text-white sm:h-6 sm:w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>判定中...</span>
                  </>
                ) : (
                  <>
                    <span>マウントを取る!</span>
                    <span className="text-xl sm:text-2xl md:text-3xl">🏔️</span>
                  </>
                )}
              </div>
            </div>
          </button>

          <button
            className="min-w-12 flex-shrink-0 rounded-xl border-2 border-gray-200 px-4 text-xl text-gray-500 transition-all hover:scale-[1.02] hover:border-red-200 hover:bg-red-50 hover:text-red-500 dark:border-zinc-700 md:text-2xl"
            onClick={onReset}
            title="最初からやり直す"
          >
            ↺
          </button>
        </div>
      </div>
    </div>
  );
});
