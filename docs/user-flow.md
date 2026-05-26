# マウンティングマウンテン ユーザーフロー

このドキュメントは、現在の Next.js App Router 実装をもとにしたユーザー導線の整理です。

## 全体フロー

```mermaid
flowchart TD
  Entry["ユーザーがアクセス"] --> Home["ホーム /"]

  Home --> Solo["ソロモード /solo"]
  Home --> Versus["対戦モード /versus/local"]
  Home --> Achievements["実績一覧 /achievements"]
  Home --> Ranking["ランキング /ranking"]
  Home --> HowTo["遊び方 /howto"]

  Home --> AuthCheck{"ログイン済み?"}
  AuthCheck -->|はい| History["プレイ履歴 /history"]
  AuthCheck -->|はい| Profile["プロフィール /profile"]
  AuthCheck -->|はい| Logout["ログアウト"]
  AuthCheck -->|いいえ| Login["ログイン /auth/login"]
  AuthCheck -->|いいえ| Signup["新規登録 /auth/signup"]

  Login -->|メール + パスワード| LoginResult{"認証成功?"}
  Login -->|Google / X OAuth| AuthCallback["OAuth callback /auth/callback"]
  LoginResult -->|はい| Home
  LoginResult -->|いいえ| LoginError["エラー表示"]
  LoginError --> Login

  Signup -->|メール + パスワード| SignupResult{"登録成功?"}
  Signup -->|Google / X OAuth| AuthCallback
  SignupResult -->|はい| VerifyEmail["メール確認案内 /auth/verify-email"]
  SignupResult -->|いいえ| SignupError["エラー表示"]
  SignupError --> Signup
  VerifyEmail --> Home
  AuthCallback --> Home

  History -->|未ログインの場合| Login
  Profile -->|未ログインの場合| Login
  Ranking -->|未ログイン| Signup
  Ranking -->|ゲストでプレイ| Solo
  Ranking -->|ログイン済み| Solo
  History -->|履歴なし| Solo
  Profile -->|編集 / 保存| Profile
```

## ソロモード

```mermaid
flowchart TD
  SoloEntry["/solo に入る"] --> Init["3ラウンド・お題・天候・ミッションを抽選"]
  Init --> Briefing["ミッション説明"]
  Briefing --> Start["ゲーム開始"]

  Start --> Round["現在ラウンド表示"]
  Round --> RouteSelect["ルート選択<br/>SAFE / NORMAL / RISKY"]
  RouteSelect --> Input["マウント文を入力"]
  Input --> Submit{"送信できる?"}
  Submit -->|未入力 / 通信中| Input
  Submit -->|送信| Analyze["POST /api/analyze"]

  Analyze --> AiPath{"GEMINI_API_KEYあり?"}
  AiPath -->|あり| Gemini["Geminiで分析"]
  AiPath -->|なし / 失敗| Fallback["Fallback判定"]
  Gemini --> Validate["AI出力を検証・補正"]
  Fallback --> Validate
  Validate --> Score["最終標高を計算<br/>ルート倍率・滑落・天候・ボーナス"]
  Score --> RoundResult["ラウンド結果表示"]

  RoundResult --> NextCheck{"3ラウンド完了?"}
  NextCheck -->|いいえ| NextRound["次のラウンドへ"]
  NextRound --> Round
  NextCheck -->|はい| Finish["最終結果・星評価・サマリー表示"]

  Finish --> Achievement["ローカル実績統計を更新"]
  Finish --> LoginCheck{"ログイン済み?"}
  LoginCheck -->|はい| SaveHistory["Supabaseに履歴保存"]
  LoginCheck -->|いいえ| GuestEnd["保存せず終了"]
  SaveHistory --> EndActions["もう一度プレイ / ホームへ戻る"]
  GuestEnd --> EndActions
  EndActions -->|もう一度| Init
  EndActions -->|ホーム| Home["/"]
```

## ローカル対戦モード

```mermaid
flowchart TD
  VersusEntry["/versus/local に入る"] --> InitBattle["3ラウンド分のお題を抽選"]
  InitBattle --> RoundStart["ラウンド開始演出"]
  RoundStart --> P1Turn["Player 1 ターン"]
  P1Turn --> P1Route["Player 1 ルート選択"]
  P1Route --> P1Input["Player 1 入力"]
  P1Input --> P1Analyze["/api/analyze で判定"]

  P1Analyze --> P2Turn["Player 2 ターン"]
  P2Turn --> P2Route["Player 2 ルート選択"]
  P2Route --> P2Input["Player 2 入力"]
  P2Input --> P2Analyze["/api/analyze で判定"]

  P2Analyze --> Compare["両者の標高を比較"]
  Compare --> RoundWinner{"ラウンド勝者"}
  RoundWinner -->|P1勝利| AddP1["P1に勝利ボーナス +1000m"]
  RoundWinner -->|P2勝利| AddP2["P2に勝利ボーナス +1000m"]
  RoundWinner -->|引き分け| AddNone["ボーナスなし"]

  AddP1 --> BothResults["ラウンド結果表示"]
  AddP2 --> BothResults
  AddNone --> BothResults
  BothResults --> BattleCheck{"3ラウンド完了?"}
  BattleCheck -->|いいえ| NextBattleRound["次のラウンドへ"]
  NextBattleRound --> RoundStart
  BattleCheck -->|はい| FinalBattle["最終結果・勝者表示"]

  FinalBattle --> BattleActions["再戦 / ホームへ戻る"]
  BattleActions -->|再戦| InitBattle
  BattleActions -->|ホーム| Home["/"]
```

## データ・保存フロー

```mermaid
flowchart LR
  UserInput["入力文"] --> AnalyzeApi["/api/analyze"]
  AnalyzeApi --> Gemini["Gemini API"]
  AnalyzeApi --> Fallback["Fallback"]
  Gemini --> Validator["validateAiOutput"]
  Fallback --> Validator
  Validator --> GameLogic["ゲームロジック<br/>score / route / weather / bonus"]
  GameLogic --> UI["結果表示"]

  UI --> LocalAchievements["localStorage 実績統計"]
  UI --> LoginGate{"ログイン済み?"}
  LoginGate -->|はい| SoloHistory["solo_game_history"]
  LoginGate -->|はい| Profiles["profiles"]
  SoloHistory --> Leaderboard["leaderboard view"]
  Profiles --> Leaderboard
  Leaderboard --> Ranking["ランキング画面"]
  SoloHistory --> History["履歴画面"]
```

## 画面別の主目的

| 画面 | 主目的 | ログイン要否 |
| --- | --- | --- |
| `/` | モード選択、認証導線、主要ページへの入口 | 不要 |
| `/solo` | 3ラウンド制ソロプレイ | 不要 |
| `/versus/local` | 同一端末での2人対戦 | 不要 |
| `/ranking` | 最高スコアランキング表示 | 不要 |
| `/achievements` | 実績一覧の確認 | 不要 |
| `/howto` | 遊び方の確認 | 不要 |
| `/history` | 自分のソロプレイ履歴確認 | 必須 |
| `/profile` | 表示名・ランキング表示設定の編集 | 必須 |
| `/auth/login` | ログイン | 不要 |
| `/auth/signup` | 新規登録 | 不要 |
| `/auth/verify-email` | メール確認案内 | 不要 |
