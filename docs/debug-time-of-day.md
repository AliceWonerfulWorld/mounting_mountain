# 時間帯デバッグ機能

開発環境で時間帯を強制的に切り替えてテストできる機能です。

## 使い方

ブラウザの開発者ツールのコンソールで以下のコマンドを実行：

### 夜に切り替え
```javascript
window.__DEBUG_TIME_OF_DAY = 'night';
```

### 夜明け前に切り替え
```javascript
window.__DEBUG_TIME_OF_DAY = 'dawn';
```

### 朝に切り替え
```javascript
window.__DEBUG_TIME_OF_DAY = 'morning';
```

### 昼に切り替え
```javascript
window.__DEBUG_TIME_OF_DAY = 'day';
```

### 午後に切り替え
```javascript
window.__DEBUG_TIME_OF_DAY = 'afternoon';
```

### 夕暮れに切り替え
```javascript
window.__DEBUG_TIME_OF_DAY = 'sunset';
```

### 実際の時刻に戻す
```javascript
window.__DEBUG_TIME_OF_DAY = undefined;
// またはページをリロード
```

## 注意事項

- この機能は **開発環境（`NODE_ENV=development`）でのみ** 動作します
- 本番環境では無効化されます
- デバッグモードを解除するには、変数を `undefined` にするかページをリロードしてください

## 実装詳細

`useTimeOfDayExtended` フックが `window.__DEBUG_TIME_OF_DAY` の値をチェックし、設定されている場合はその時間帯を使用します。

```typescript
// src/hooks/useTimeOfDay.ts 内で実装
const debugTimeOfDay = 
  process.env.NODE_ENV === "development"
    ? (window as any).__DEBUG_TIME_OF_DAY
    : undefined;
```
