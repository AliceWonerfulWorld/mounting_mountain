import { useState, useCallback, useRef, useEffect } from "react";
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

  // タイマーIDを保持してクリーンアップを管理
  const roundCutinTimerRef = useRef<NodeJS.Timeout | null>(null);
  const resultCutinTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * ラウンド開始カットインを表示
   */
  const triggerRoundCutin = useCallback((roundNumber: number) => {
    // 既存のタイマーをクリア
    if (roundCutinTimerRef.current) {
      clearTimeout(roundCutinTimerRef.current);
    }

    setCutinRoundNumber(roundNumber);
    setCutinTheme(Math.floor(Math.random() * 3) as 0 | 1 | 2);
    setShowRoundCutin(true);
    
    roundCutinTimerRef.current = setTimeout(() => {
      setShowRoundCutin(false);
      roundCutinTimerRef.current = null;
    }, 2300);
  }, []);

  /**
   * 結果カットインを表示（滑落/保険/通常を判定）
   */
  const triggerResultCutin = useCallback((currentRound: Round, onComplete: () => void) => {
    // 既存のタイマーをクリア
    if (resultCutinTimerRef.current) {
      clearTimeout(resultCutinTimerRef.current);
    }

    const result = currentRound.result;

    if (!result) {
      onComplete();
      return;
    }

    // 滑落した場合（保険未使用）
    if (result.didFall && !result.insuranceUsed) {
      setShowFallCutin(true);
      resultCutinTimerRef.current = setTimeout(() => {
        setShowFallCutin(false);
        resultCutinTimerRef.current = null;
        onComplete();
      }, 2500);
    }
    // 安全ルートで保険獲得
    else if (currentRound.routeId === "SAFE") {
      setShowInsuranceCutin(true);
      resultCutinTimerRef.current = setTimeout(() => {
        setShowInsuranceCutin(false);
        resultCutinTimerRef.current = null;
        onComplete();
      }, 2500);
    }
    // その他の通常結果
    else {
      setShowResultCutin(true);
      resultCutinTimerRef.current = setTimeout(() => {
        setShowResultCutin(false);
        resultCutinTimerRef.current = null;
        onComplete();
      }, 2500);
    }
  }, []);

  // クリーンアップ: コンポーネントアンマウント時にタイマーをクリア
  useEffect(() => {
    return () => {
      if (roundCutinTimerRef.current) {
        clearTimeout(roundCutinTimerRef.current);
      }
      if (resultCutinTimerRef.current) {
        clearTimeout(resultCutinTimerRef.current);
      }
    };
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
