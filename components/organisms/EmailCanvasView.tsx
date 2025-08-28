'use client';

import React from 'react';
import {
  useDroppable
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Smartphone, Monitor } from 'lucide-react';
import { EmailComponentRenderer } from '../molecules/EmailComponentRenderer';
import { cn } from '@/lib/utils';

interface EmailComponent {
  id: string;
  type: string;
  data: any;
  order: number;
}

interface EmailCanvasViewProps {
  components: EmailComponent[];
  selectedId: string | null;
  activeId: string | null;
  viewMode: 'desktop' | 'mobile';
  onComponentsChange: (components: EmailComponent[]) => void;
  onSelectComponent: (id: string | null) => void;
  onUpdateComponent: (id: string, data: any) => void;
  onDeleteComponent: (id: string) => void;
  selectedColumnComponentId?: string | null;
}

function CanvasDropZone({ children }: { children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'email-canvas',
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "min-h-96 transition-all duration-200",
        isOver && "bg-blue-50"
      )}
    >
      {children}
    </div>
  );
}

// コンポーネント間の挿入ゾーン
function InsertionDropZone({ index, isVisible }: { index: number; isVisible: boolean }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `insert-${index}`,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "h-2 transition-all duration-200 mx-4",
        isVisible ? "opacity-100" : "opacity-0",
        isOver && "h-8 bg-blue-100 border-2 border-dashed border-blue-400 rounded"
      )}
    >
      {isOver && (
        <div className="h-full flex items-center justify-center">
          <div className="text-xs text-blue-600 font-medium">
            ここに挿入
          </div>
        </div>
      )}
    </div>
  );
}

export function EmailCanvasView({
  components,
  selectedId,
  activeId,
  viewMode,
  onComponentsChange,
  onSelectComponent,
  onUpdateComponent,
  onDeleteComponent,
  selectedColumnComponentId
}: EmailCanvasViewProps) {

  // ソートされたコンポーネント
  const sortedComponents = [...components].sort((a, b) => a.order - b.order);

  return (
    <div className="flex-1 bg-gray-100 overflow-y-auto">
        {/* キャンバスコンテナ */}
        <div className="flex justify-center p-8">
          <div className="relative">
            {/* ビューモード表示 */}
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-full shadow-sm border">
                {viewMode === 'desktop' ? (
                  <Monitor size={16} className="text-gray-600" />
                ) : (
                  <Smartphone size={16} className="text-gray-600" />
                )}
                <span className="text-sm text-gray-600">
                  {viewMode === 'desktop' ? 'デスクトップ表示 (600px)' : 'モバイル表示 (375px)'}
                </span>
              </div>
            </div>

            {/* Email キャンバス */}
            <Card 
              className={cn(
                "bg-white shadow-lg transition-all duration-300",
                viewMode === 'desktop' ? 'w-[600px]' : 'w-[375px]'
              )}
            >
              <CardContent className="p-0">
                <CanvasDropZone>
                  <SortableContext
                    items={sortedComponents.map(comp => comp.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {sortedComponents.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                        <Plus size={48} className="mb-4 opacity-50" />
                        <p className="text-lg font-medium mb-2">メールを作成しましょう</p>
                        <p className="text-sm text-center max-w-xs">
                          左のコンポーネントライブラリからドラッグ&ドロップして<br />
                          メールコンテンツを追加してください
                        </p>
                      </div>
                    ) : (
                      <>
                        {/* 最初の挿入ゾーン */}
                        <InsertionDropZone index={0} isVisible={!!activeId} />
                        
                        {sortedComponents.map((component, index) => (
                          <React.Fragment key={component.id}>
                            <EmailComponentRenderer
                              component={component}
                              isSelected={selectedId === component.id}
                              viewMode={viewMode}
                              onSelect={onSelectComponent}
                              onUpdate={onUpdateComponent}
                              onDelete={onDeleteComponent}
                              selectedColumnComponentId={selectedColumnComponentId}
                            />
                            {/* 各コンポーネント後の挿入ゾーン */}
                            <InsertionDropZone 
                              index={index + 1} 
                              isVisible={!!activeId} 
                            />
                          </React.Fragment>
                        ))}
                      </>
                    )}
                  </SortableContext>
                </CanvasDropZone>
              </CardContent>
            </Card>

            {/* デバイス境界線表示 */}
            {viewMode === 'mobile' && (
              <div className="absolute -inset-4 border-2 border-gray-300 rounded-xl pointer-events-none opacity-30" />
            )}
          </div>
        </div>
    </div>
  );
}