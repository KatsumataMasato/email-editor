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
  Columns
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardAction } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { DraggableItem } from '../atoms/DraggableItem';

interface ComponentToolbarProps {
  onTitleEdit: () => void;
}

const componentTypes = [
  { type: 'header', icon: Layout, label: 'ヘッダー' },
  { type: 'text', icon: Type, label: 'テキスト' },
  { type: 'image', icon: Image, label: '画像' },
  { type: 'button', icon: Square, label: 'ボタン' },
  { type: 'columns', icon: Columns, label: 'カラム' },
  { type: 'social', icon: Share2, label: 'ソーシャル' },
  { type: 'divider', icon: Minus, label: '区切り線' },
  { type: 'spacer', icon: Square, label: 'スペーサー' },
  { type: 'footer', icon: LayoutGrid, label: 'フッター' }
];

export function ComponentToolbar({ onTitleEdit }: ComponentToolbarProps) {
  return (
    <Card className="h-full rounded-none border-0 bg-white">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">📧 Email Editor</CardTitle>
        <CardAction>
          <Button
            onClick={onTitleEdit}
            variant="ghost"
            size="sm"
          >
            <Settings size={16} />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
            コンポーネント（ドラッグ&ドロップ）
          </label>
          {componentTypes.map(({ type, icon: Icon, label }) => (
            <DraggableItem
              key={type}
              id={`new-${type}`}
              type={type}
            >
              <div className="w-full justify-start h-10 border border-gray-200 rounded p-2 hover:bg-gray-50 transition-colors flex items-center">
                <Icon size={16} className="mr-3" />
                {label}
              </div>
            </DraggableItem>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}