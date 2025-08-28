'use client';

import React from 'react';
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
  const renderComponentsByCategory = (category: 'basic' | 'layout' | 'social') => {
    const components = componentTypes.filter(comp => comp.category === category);
    
    return (
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700 px-4">
          {categoryTitles[category]}
        </h3>
        {components.map(({ type, icon: Icon, label, description }) => (
          <div key={type} className="px-4">
            <DraggableItem
              id={`new-${type}`}
              type={type}
            >
              <div className="group flex items-start p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all cursor-grab active:cursor-grabbing">
                <div className="flex-shrink-0 p-2 bg-gray-100 rounded-md group-hover:bg-blue-100 transition-colors">
                  <Icon size={16} className="text-gray-600 group-hover:text-blue-600" />
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 group-hover:text-blue-900">
                    {label}
                  </p>
                  <p className="text-xs text-gray-500 group-hover:text-blue-700 mt-1">
                    {description}
                  </p>
                </div>
              </div>
            </DraggableItem>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
          <Mail size={20} className="mr-2" />
          コンポーネント
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          ドラッグしてキャンバスに配置
        </p>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <div className="space-y-6">
          {renderComponentsByCategory('basic')}
          <Separator className="mx-4" />
          {renderComponentsByCategory('layout')}
          <Separator className="mx-4" />
          {renderComponentsByCategory('social')}
        </div>
      </div>
      
      {/* テンプレートセクション */}
      <div className="border-t border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          🎨 テンプレート
        </h3>
        <div className="space-y-2">
          <div className="p-2 rounded border border-dashed border-gray-300 text-center">
            <p className="text-xs text-gray-500">近日公開</p>
          </div>
        </div>
      </div>
    </div>
  );
}