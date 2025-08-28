'use client';

import React, { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  useDroppable,
  DragOverEvent,
  pointerWithin
} from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, GripVertical } from 'lucide-react';
import { SortableGridItem } from '../molecules/SortableGridItem';
import { cn } from '@/lib/utils';

interface EmailComponent {
  id: string;
  type: string;
  data: any;
  gridPosition: { x: number; y: number };
}

interface EmailEditorGridProps {
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

function GridDropZone({ position, children }: { position: { x: number; y: number }; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `grid-${position.x}-${position.y}`,
    data: { position }
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "min-h-48 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center relative",
        isOver && "border-blue-400 bg-blue-50"
      )}
    >
      {children || (
        <div className="text-gray-400 text-sm text-center p-4">
          <Plus size={24} className="mx-auto mb-2" />
          <p>ここにドラッグ</p>
        </div>
      )}
    </div>
  );
}

export function EmailEditorGrid({
  components,
  selectedId,
  activeId,
  onComponentsChange,
  onSelectComponent,
  onDragStart,
  onDragEnd,
  onUpdateComponent,
  onDeleteComponent
}: EmailEditorGridProps) {
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    // 新しいコンポーネントの追加
    if (active.id.toString().startsWith('new-') && over.id.toString().startsWith('grid-')) {
      const [, x, y] = over.id.toString().split('-').map(Number);
      const componentType = active.data.current?.type;
      
      if (componentType) {
        const newComponent: EmailComponent = {
          id: `component-${Date.now()}`,
          type: componentType,
          data: getDefaultData(componentType),
          gridPosition: { x, y }
        };
        
        // 既存のコンポーネントがその位置にあるかチェック
        const existingComponent = components.find(c => 
          c.gridPosition.x === x && c.gridPosition.y === y
        );
        
        if (!existingComponent) {
          onComponentsChange([...components, newComponent]);
          onSelectComponent(newComponent.id);
        }
      }
    }
    // 既存コンポーネントの移動
    else if (!active.id.toString().startsWith('new-') && over.id.toString().startsWith('grid-')) {
      const [, x, y] = over.id.toString().split('-').map(Number);
      const componentId = active.id.toString();
      
      const updatedComponents = components.map(comp => 
        comp.id === componentId 
          ? { ...comp, gridPosition: { x, y } }
          : comp
      );
      onComponentsChange(updatedComponents);
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

  const getComponentByPosition = (x: number, y: number) => {
    return components.find(comp => comp.gridPosition.x === x && comp.gridPosition.y === y);
  };

  return (
    <DndContext
      collisionDetection={pointerWithin}
      onDragStart={onDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex-1 p-6 overflow-y-auto bg-gray-100">
        <Card className="max-w-6xl mx-auto bg-white shadow-sm">
          <CardContent className="p-6">
            {/* 3x3 Grid */}
            <div className="grid grid-cols-3 gap-4 min-h-96">
              {Array.from({ length: 9 }, (_, index) => {
                const x = index % 3;
                const y = Math.floor(index / 3);
                const component = getComponentByPosition(x, y);

                return (
                  <GridDropZone key={`${x}-${y}`} position={{ x, y }}>
                    {component && (
                      <SortableGridItem
                        key={component.id}
                        component={component}
                        isSelected={selectedId === component.id}
                        onSelect={onSelectComponent}
                        onUpdate={onUpdateComponent}
                        onDelete={onDeleteComponent}
                      />
                    )}
                  </GridDropZone>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <DragOverlay>
        {activeId ? (
          <Card className="p-4 shadow-lg opacity-80">
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </Card>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}