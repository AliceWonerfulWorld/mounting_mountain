import { useState, useCallback } from "react";
import type { Round } from "@/types/game";

/**
 * カットイン演出の状態管理カスタムフック
 * カットインのタイミング制御を集約
 */
export function useSoloCutins() {
  const [showRoundCutin, setShowRoundCutin] = useState(false);
  const [showResultCutin, setShowResultCutin] = useState(false);
  const [showFallCutin, setShowFallCutin] = useState(false);
  const [showInsuranceCutin, setShowInsuranceCutin] = useState(false);
  const [cutinRoundNumber, setCutinRoundNumber] = useState(1);
  const [cutinTheme, setCutinTheme] = useState<0 | 1 | 2>(0); // 0: 山岳, 1: 空, 2: 森林

  /**
   * ラウンド開始カットインを表示
   */
  const triggerRoundCutin = useCallback((roundNumber: number) => {
    setCutinRoundNumber(roundNumber);
    setCutinTheme(Math.floor(Math.random() * 3) as 0 | 1 | 2);
    setShowRoundCutin(true);
    setTimeout(() => setShowRoundCutin(false), 2300);
  }, []);

  /**
   * 結果カットインを表示（滑落/保険/通常を判定）
   */
  const triggerResultCutin = useCallback((currentRound: Round, onComplete: () => void) => {
    const result = currentRound.result;

    if (!result) {
      onComplete();
      return;
    }

    // 滑落した場合（保険未使用）
    if (result.didFall && !result.insuranceUsed) {
      setShowFallCutin(true);
      setTimeout(() => {
        setShowFallCutin(false);
        onComplete();
      }, 2500);
    }
    // 安全ルートで保険獲得
    else if (currentRound.routeId === "SAFE") {
      setShowInsuranceCutin(true);
      setTimeout(() => {
        setShowInsuranceCutin(false);
        onComplete();
      }, 2500);
    }
    // その他の通常結果
    else {
      setShowResultCutin(true);
      setTimeout(() => {
        setShowResultCutin(false);
        onComplete();
      }, 2500);
    }
  }, []);

  return {
    showRoundCutin,
    showResultCutin,
    showFallCutin,
    showInsuranceCutin,
    cutinRoundNumber,
    cutinTheme,
    triggerRoundCutin,
    triggerResultCutin,
  };
}
