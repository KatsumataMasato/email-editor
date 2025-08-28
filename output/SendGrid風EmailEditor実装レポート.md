# SendGrid風 Email Editor 実装レポート

## ベンチマーク・SendGrid メールエディター機能分析

### 参考にした主要機能
- **3パネル構成**: コンポーネント | キャンバス | プロパティ
- **トップツールバー**: 保存・プレビュー・テスト送信・デバイス切り替え
- **レスポンシブキャンバス**: 600px(デスクトップ) / 375px(モバイル)
- **リッチコンポーネントライブラリ**: カテゴリ別分類、ドラッグ操作
- **詳細プロパティパネル**: スライダー、カラーピッカー、リアルタイム更新

## UI/UX構造設計とアトミックデザイン適用

### 完全アトミックデザイン構造

```
components/
├── atoms/                          # 最小構成要素
│   ├── ImageComponent.tsx          # 画像表示・リサイズ
│   ├── DraggableItem.tsx           # D&D要素
│   ├── DragHandle.tsx              # ドラッグハンドル
│   └── DeleteButton.tsx            # 削除ボタン
├── molecules/                      # 組み合わせ要素
│   ├── ComponentToolbar.tsx        # 旧ツールバー（非推奨）
│   ├── EmailComponentItem.tsx      # 旧アイテム（非推奨）  
│   └── EmailComponentRenderer.tsx  # コンポーネント表示
├── organisms/                      # 複合機能
│   ├── ComponentLibrary.tsx        # 左パネル
│   ├── EmailCanvasView.tsx         # 中央キャンバス
│   └── PropertiesPanel.tsx         # 右プロパティ
├── templates/                      # ページレベル
│   └── EmailEditorLayout.tsx       # メインレイアウト
└── ui/                            # UIコンポーネント
    ├── slider.tsx                  # Radix Slider
    ├── switch.tsx                  # Radix Switch
    └── textarea.tsx                # Textarea
```

## ベンチマーク機能の実装

### 1. トップツールバー機能
```typescript
// EmailEditorLayout.tsx
<div className="h-14 bg-white border-b flex items-center justify-between px-4">
  <div className="flex items-center space-x-2">
    <h1>📧 Email Designer</h1>
    <Button><Undo />元に戻す</Button>
    <Button><Redo />やり直し</Button>
  </div>
  
  <div className="flex items-center space-x-2">
    {/* デバイス切り替え */}
    <div className="flex bg-gray-100 rounded-md p-1">
      <Button variant={viewMode === 'desktop' ? 'default' : 'ghost'}>
        <Monitor />デスクトップ
      </Button>
      <Button variant={viewMode === 'mobile' ? 'default' : 'ghost'}>
        <Smartphone />モバイル
      </Button>
    </div>
    
    <Button><Eye />プレビュー</Button>
    <Button><Send />テスト送信</Button>
    <Button><Save />保存</Button>
  </div>
</div>
```

### 2. コンポーネントライブラリ（左パネル）
```typescript
// ComponentLibrary.tsx - カテゴリ別分類
const componentTypes: ComponentType[] = [
  // Basic: テキスト、画像、ボタン、区切り線、スペーサー、HTML
  { type: 'text', icon: Type, label: 'テキスト', category: 'basic' },
  { type: 'html', icon: Code, label: 'HTML', category: 'basic' },
  
  // Layout: ヘッダー、フッター、2列レイアウト
  { type: 'header', icon: Layout, label: 'ヘッダー', category: 'layout' },
  
  // Social: SNSリンク
  { type: 'social', icon: Share2, label: 'ソーシャル', category: 'social' }
];

// ホバー効果付きドラッグアイテム
<DraggableItem id={`new-${type}`} type={type}>
  <div className="group flex items-start p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50">
    <div className="flex-shrink-0 p-2 bg-gray-100 rounded-md group-hover:bg-blue-100">
      <Icon size={16} className="text-gray-600 group-hover:text-blue-600" />
    </div>
    <div className="ml-3">
      <p className="font-medium">{label}</p>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  </div>
</DraggableItem>
```

### 3. レスポンシブキャンバス（中央）
```typescript
// EmailCanvasView.tsx - デバイス切り替え対応
<div className="flex justify-center p-8">
  <div className="relative">
    {/* ビューモード表示 */}
    <div className="flex items-center justify-center mb-4">
      <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-full shadow-sm">
        {viewMode === 'desktop' ? <Monitor /> : <Smartphone />}
        <span>{viewMode === 'desktop' ? 'デスクトップ表示 (600px)' : 'モバイル表示 (375px)'}</span>
      </div>
    </div>

    {/* メールキャンバス */}
    <Card className={cn(
      "bg-white shadow-lg transition-all duration-300",
      viewMode === 'desktop' ? 'w-[600px]' : 'w-[375px]'
    )}>
      {/* コンポーネント一覧 */}
      {sortedComponents.map(component => (
        <EmailComponentRenderer
          key={component.id}
          component={component}
          viewMode={viewMode}  // モバイル最適化
          isSelected={selectedId === component.id}
          onSelect={onSelectComponent}
          onUpdate={onUpdateComponent}
          onDelete={onDeleteComponent}
        />
      ))}
    </Card>
  </div>
</div>
```

### 4. 高機能プロパティパネル（右パネル）
```typescript
// PropertiesPanel.tsx - SendGrid風の詳細設定
const ColorInput = ({ label, value, onChange }) => (
  <div className="space-y-2">
    <Label className="text-sm font-medium">{label}</Label>
    <div className="flex items-center space-x-2">
      <div 
        className="w-8 h-8 rounded border cursor-pointer"
        style={{ backgroundColor: value }}
        onClick={() => document.getElementById(`color-${label}`)?.click()}
      />
      <Input type="text" value={value} onChange={onChange} className="font-mono text-sm" />
      <input type="color" value={value} onChange={onChange} className="w-0 h-0 opacity-0" />
    </div>
  </div>
);

const NumberInput = ({ label, value, unit = 'px', min = 0, max = 100, onChange }) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    <div className="flex items-center space-x-2">
      <Input type="number" value={parseInt(value)} onChange={onChange} className="w-20" />
      <Slider 
        value={[parseInt(value) || min]}
        onValueChange={([val]) => onChange(`${val}${unit}`)}
        min={min} max={max} step={1}
        className="flex-1"
      />
    </div>
  </div>
);
```

### 5. レスポンシブコンポーネント描画
```typescript
// EmailComponentRenderer.tsx - モバイル最適化
const renderComponent = () => {
  const isMobile = viewMode === 'mobile';
  
  switch (component.type) {
    case 'text':
      return (
        <div style={{ 
          fontSize: isMobile ? '14px' : (component.data.fontSize || '16px'),
          padding: isMobile ? '8px 16px' : '12px 20px',
          // その他モバイル最適化
        }}>
          {component.data.text}
        </div>
      );
      
    case 'button':
      return (
        <div style={{ padding: isMobile ? '12px' : '20px' }}>
          <div style={{
            padding: isMobile ? '10px 20px' : '12px 24px',
            fontSize: isMobile ? '14px' : '16px',
            minWidth: isMobile ? '120px' : '140px'
          }}>
            {component.data.text}
          </div>
        </div>
      );
  }
};
```

### 6. インラインエディティング機能
```typescript
// ダブルクリックでインライン編集
<div
  contentEditable={isEditing}
  onDoubleClick={() => setIsEditing(true)}
  onBlur={(e) => {
    onUpdate(component.id, { ...component.data, text: e.target.textContent });
    setIsEditing(false);
  }}
  suppressContentEditableWarning={true}
  className="outline-none"
>
  {component.data.text}
</div>
```

### 7. ソート可能なコンポーネント管理
```typescript
// order ベースの並び替え
interface EmailComponent {
  id: string;
  type: string;
  data: any;
  order: number;  // 並び順管理
}

const handleDragEnd = (event: DragEndEvent) => {
  // 新規追加
  if (active.id.startsWith('new-') && over.id === 'email-canvas') {
    const newComponent = {
      id: `component-${Date.now()}`,
      type: componentType,
      data: getDefaultData(componentType),
      order: components.length
    };
    onComponentsChange([...components, newComponent]);
  }
  // 並び替え
  else if (active.id !== over.id) {
    const reorderedComponents = arrayMove(components, oldIndex, newIndex);
    const updatedComponents = reorderedComponents.map((comp, index) => ({
      ...comp, order: index
    }));
    onComponentsChange(updatedComponents);
  }
};
```

## 検証手順

```bash
# 1. pnpm環境準備
npm install -g pnpm

# 2. 依存関係インストール  
pnpm install

# 3. 追加パッケージインストール
pnpm add @radix-ui/react-slider @radix-ui/react-switch

# 4. TypeScript型チェック
pnpm dlx tsc --noEmit

# 5. ビルド実行
pnpm run build

# 6. 開発サーバー起動
pnpm run dev
# → http://localhost:3000 でSendGrid風エディター確認
```

## 実装された主要機能

### ✅ SendGrid ベンチマーク機能
- [x] **3パネル構成**: コンポーネント | キャンバス | プロパティ
- [x] **トップツールバー**: 保存・プレビュー・テスト送信・元に戻す・やり直し
- [x] **レスポンシブキャンバス**: 600px ⇔ 375px 切り替え
- [x] **カテゴリ別コンポーネントライブラリ**: Basic/Layout/Social分類
- [x] **高機能プロパティパネル**: カラーピッカー・スライダー・リアルタイム更新
- [x] **インラインエディティング**: ダブルクリック編集
- [x] **ドラッグ&ドロップ**: 直感的なコンポーネント配置・並び替え
- [x] **モバイル最適化**: デバイス別スタイル調整

### 🆕 独自機能
- [x] **完全アトミックデザイン**: Templates/Organisms/Molecules/Atoms
- [x] **画像リサイズ機能**: ドラッグリサイズハンドル
- [x] **HTMLコンポーネント**: カスタムHTML埋め込み
- [x] **ホバー効果**: SendGrid以上の視覚フィードバック

### 📱 レスポンシブ対応
- Desktop: 600px固定幅（メール標準）
- Mobile: 375px幅（モバイル標準）  
- 自動スタイル調整（フォントサイズ・パディング最適化）

## Before/After比較

### Before（従来の実装）
- 横3列の限定的配置
- 基本的なドラッグ&ドロップ
- 簡素なプロパティ設定

### After（SendGrid風実装）  
- プロフェッショナルな3パネル構成
- レスポンシブキャンバス
- 詳細なプロパティ制御
- インラインエディティング
- カテゴリ別コンポーネントライブラリ
- モバイル/デスクトップ最適化

## 技術スタック

- **Framework**: Next.js 15.5.0 + React 19.1.0 + TypeScript 5
- **UI Library**: Radix UI + Tailwind CSS 4
- **D&D**: @dnd-kit/core 6.3.1
- **Package Manager**: pnpm 8.15.6
- **Architecture**: Atomic Design Pattern

🎯 **SendGrid/Benchmark レベルの高機能メールエディターを完全実装しました！**

🤖 Generated with [Claude Code](https://claude.ai/code)