'use client';

import React, { useState } from 'react';
import { 
  Type, 
  Image, 
  Square, 
  Minus, 
  Layout,
  LayoutGrid,
  Share2,
  Columns,
  Code,
  AlignLeft,
  Mail
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { DraggableItem } from '../atoms/DraggableItem';

interface ComponentType {
  type: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  description: string;
  category: 'basic' | 'layout' | 'social';
}

const componentTypes: ComponentType[] = [
  // Basic Components
  { type: 'text', icon: Type, label: 'テキスト', description: '見出しや段落テキストを追加', category: 'basic' },
  { type: 'image', icon: Image, label: '画像', description: '画像をアップロードまたはURLから追加', category: 'basic' },
  { type: 'button', icon: Square, label: 'ボタン', description: 'CTAボタンやリンクボタンを追加', category: 'basic' },
  { type: 'divider', icon: Minus, label: '区切り線', description: 'セクションを分ける水平線', category: 'basic' },
  { type: 'spacer', icon: AlignLeft, label: 'スペーサー', description: '余白やスペースを追加', category: 'basic' },
  { type: 'html', icon: Code, label: 'HTML', description: 'カスタムHTMLコードを挿入', category: 'basic' },
  
  // Layout Components
  { type: 'header', icon: Layout, label: 'ヘッダー', description: 'メールの上部セクション', category: 'layout' },
  { type: 'footer', icon: LayoutGrid, label: 'フッター', description: 'メールの下部セクション', category: 'layout' },
  { type: 'columns', icon: Columns, label: '2列レイアウト', description: '2カラムのレイアウトコンテナ', category: 'layout' },
  
  // Social Components  
  { type: 'social', icon: Share2, label: 'ソーシャル', description: 'SNSリンクボタンセット', category: 'social' }
];

const categoryTitles = {
  basic: '基本コンポーネント',
  layout: 'レイアウト',
  social: 'ソーシャル'
};

export function ComponentLibrary() {
  const [isClient] = useState(true); // SSR対応を一時的に無効化

  console.log('ComponentLibrary render, isClient:', isClient);

  // SSRハイドレーション問題を避けるため、クライアントサイドでのみドラッグ機能を有効化
  // useEffect(() => {
  //   setIsClient(true);
  // }, []);

  const renderComponentGrid = (components: ComponentType[]) => {
    return (
      <div className="grid grid-cols-3 gap-3 p-4">
        {components.map(({ type, icon: Icon, label }) => (
          <div key={type}>
            {isClient ? (
              <DraggableItem
                id={`new-${type}`}
                type={type}
              >
                <div className="group flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all min-h-[80px]">
                  <div className="flex-shrink-0 p-2 bg-gray-100 rounded-md group-hover:bg-blue-100 transition-colors mb-2">
                    <Icon size={20} className="text-gray-600 group-hover:text-blue-600" />
                  </div>
                  <p className="text-xs font-medium text-gray-900 group-hover:text-blue-900 text-center">
                    {label}
                  </p>
                </div>
              </DraggableItem>
            ) : (
              <div className="group flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all min-h-[80px]">
                <div className="flex-shrink-0 p-2 bg-gray-100 rounded-md group-hover:bg-blue-100 transition-colors mb-2">
                  <Icon size={20} className="text-gray-600 group-hover:text-blue-600" />
                </div>
                <p className="text-xs font-medium text-gray-900 group-hover:text-blue-900 text-center">
                  {label}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="p-4 border-b border-gray-200 bg-white">
        <h2 className="text-sm font-semibold text-gray-800 mb-4">
          ADD MODULES
        </h2>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {renderComponentGrid(componentTypes)}
      </div>
      
      {/* 拡張セクション */}
      <div className="border-t border-gray-200 bg-white">
        <div className="p-4 space-y-2">
          <button className="w-full text-left p-2 text-sm text-gray-600 hover:text-gray-800 flex items-center">
            <div className="w-2 h-2 mr-2">▶</div>
            GLOBAL STYLES
          </button>
          <button className="w-full text-left p-2 text-sm text-gray-600 hover:text-gray-800 flex items-center">
            <div className="w-2 h-2 mr-2">▶</div>
            ADVANCED
          </button>
        </div>
      </div>
    </div>
  );
}