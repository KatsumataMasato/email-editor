'use client';

import React from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  useDroppable,
  pointerWithin
} from '@dnd-kit/core';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, GripVertical } from 'lucide-react';
import { EmailComponentItem } from '../molecules/EmailComponentItem';
import { cn } from '@/lib/utils';

interface EmailComponent {
  id: string;
  type: string;
  data: any;
  position: number; // 0, 1, 2 (横3つ)
}

interface EmailCanvasProps {
  components: EmailComponent[];
  selectedId: string | null;
  activeId: string | null;
  onComponentsChange: (components: EmailComponent[]) => void;
  onSelectComponent: (id: string | null) => void;
  onDragStart: (event: DragStartEvent) => void;
  onDragEnd: (event: DragEndEvent) => void;
  onUpdateComponent: (id: string, data: any) => void;
  onDeleteComponent: (id: string) => void;
}

function DropSlot({ position, children }: { position: number; children?: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `slot-${position}`,
    data: { position }
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex-1 min-h-96 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center relative p-4",
        isOver && "border-blue-400 bg-blue-50"
      )}
    >
      {children || (
        <div className="text-gray-400 text-center">
          <Plus size={32} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">スロット {position + 1}</p>
          <p className="text-xs opacity-75">ここにドラッグ</p>
        </div>
      )}
    </div>
  );
}

export function EmailCanvas({
  components,
  selectedId,
  activeId,
  onComponentsChange,
  onSelectComponent,
  onDragStart,
  onDragEnd,
  onUpdateComponent,
  onDeleteComponent
}: EmailCanvasProps) {
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    // 新しいコンポーネントの追加
    if (active.id.toString().startsWith('new-') && over.id.toString().startsWith('slot-')) {
      const position = parseInt(over.id.toString().split('-')[1]);
      const componentType = active.data.current?.type;
      
      if (componentType) {
        // そのポジションに既にコンポーネントがあるかチェック
        const existingComponent = components.find(c => c.position === position);
        if (existingComponent) return; // 既に占有されている場合は追加しない

        const newComponent: EmailComponent = {
          id: `component-${Date.now()}`,
          type: componentType,
          data: getDefaultData(componentType),
          position
        };
        
        onComponentsChange([...components, newComponent]);
        onSelectComponent(newComponent.id);
      }
    }
    // 既存コンポーネントの移動
    else if (!active.id.toString().startsWith('new-') && over.id.toString().startsWith('slot-')) {
      const newPosition = parseInt(over.id.toString().split('-')[1]);
      const componentId = active.id.toString();
      
      // 移動先に既にコンポーネントがある場合はスワップ
      const movingComponent = components.find(c => c.id === componentId);
      const targetComponent = components.find(c => c.position === newPosition);
      
      if (movingComponent) {
        const updatedComponents = components.map(comp => {
          if (comp.id === componentId) {
            return { ...comp, position: newPosition };
          } else if (targetComponent && comp.id === targetComponent.id) {
            return { ...comp, position: movingComponent.position };
          }
          return comp;
        });
        onComponentsChange(updatedComponents);
      }
    }

    onDragEnd(event);
  };

  const getDefaultData = (type: string) => {
    switch (type) {
      case 'text':
        return { text: 'テキストを入力してください', fontSize: '16px', color: '#000000' };
      case 'image':
        return { src: '', alt: '', width: 'auto', height: 'auto' };
      case 'button':
        return { text: 'ボタンテキスト', backgroundColor: '#007bff', color: '#ffffff' };
      case 'divider':
        return { height: '1px', color: '#cccccc' };
      case 'spacer':
        return { height: '20px' };
      case 'header':
        return { title: 'メールヘッダー', subtitle: '', fontSize: '24px', color: '#000000', backgroundColor: '#f8f9fa' };
      case 'footer':
        return { content: 'フッター情報・配信停止リンクなど', color: '#666666', backgroundColor: '#f1f3f4' };
      case 'social':
        return { facebookUrl: '#', twitterUrl: '#', instagramUrl: '#', linkedinUrl: '#' };
      case 'columns':
        return { columnCount: 2, column1: '列 1 の内容', column2: '列 2 の内容', gap: '20px' };
      default:
        return {};
    }
  };

  const getComponentByPosition = (position: number) => {
    return components.find(comp => comp.position === position);
  };

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={onDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex-1 p-6 overflow-y-auto bg-gray-100">
        <Card className="max-w-6xl mx-auto bg-white shadow-sm">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4 text-center">Email キャンバス（横3列）</h2>
            
            {/* 横3列レイアウト */}
            <div className="flex gap-4 min-h-96">
              {[0, 1, 2].map(position => {
                const component = getComponentByPosition(position);
                return (
                  <DropSlot key={position} position={position}>
                    {component && (
                      <EmailComponentItem
                        component={component}
                        isSelected={selectedId === component.id}
                        onSelect={onSelectComponent}
                        onUpdate={onUpdateComponent}
                        onDelete={onDeleteComponent}
                      />
                    )}
                  </DropSlot>
                );
              })}
            </div>

            {components.length === 0 && (
              <div className="text-center text-gray-500 mt-8">
                <p className="text-lg font-medium">コンポーネントを追加</p>
                <p className="text-sm">左のパネルからドラッグ&ドロップ</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <DragOverlay>
        {activeId ? (
          <Card className="p-4 shadow-lg opacity-80 bg-white">
            <GripVertical className="w-4 h-4 text-muted-foreground mx-auto" />
          </Card>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}