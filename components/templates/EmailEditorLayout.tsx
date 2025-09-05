'use client';

import React, { useState, useRef, useCallback } from 'react';
import { 
  DndContext,
  DragEndEvent, 
  DragStartEvent,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { 
  Save, 
  Eye, 
  Send, 
  Settings, 
  Smartphone, 
  Monitor,
  Undo,
  Redo
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ComponentLibrary } from '../organisms/ComponentLibrary';
import { EmailCanvasView } from '../organisms/EmailCanvasView';
import { PropertiesPanel } from '../organisms/PropertiesPanel';
import { EmailComponentRenderer } from '../molecules/EmailComponentRenderer';

interface EmailComponent {
  id: string;
  type: string;
  data: any;
  order: number;
}

export function EmailEditorLayout() {
  const [components, setComponents] = useState<EmailComponent[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedColumnComponentId, setSelectedColumnComponentId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [isSaving, setIsSaving] = useState(false);
  const [componentCounter, setComponentCounter] = useState(1); // 決定的なID生成用
  const [isClient] = useState(true); // SSR対応フラグ - 一時的に無効化
  const fileInputRef = useRef<HTMLInputElement>(null);

  // センサーの設定
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px移動でドラッグ開始
      },
    })
  );

  // SSR対応を一時的に無効化
  // useEffect(() => {
  //   setIsClient(true);
  //   console.log('EmailEditorLayout mounted, setting isClient to true');
  // }, []);

  const updateComponent = useCallback((id: string, data: any) => {
    console.log('updateComponent called:', id, data);
    setComponents(prev => {
      const updated = prev.map(comp => 
        comp.id === id ? { ...comp, data } : comp
      );
      console.log('Components after update:', updated);
      return updated;
    });
  }, []);

  const deleteComponent = useCallback((id: string) => {
    setComponents(prev => prev.filter(comp => comp.id !== id));
    if (selectedId === id) {
      setSelectedId(null);
    }
    if (selectedColumnComponentId === id) {
      setSelectedColumnComponentId(null);
    }
  }, [selectedId, selectedColumnComponentId]);

  const handleSelectComponent = (id: string | null) => {
    // 列内のコンポーネントかチェック
    if (id && id.startsWith('col-')) {
      setSelectedColumnComponentId(id);
      setSelectedId(null);
    } else {
      setSelectedId(id);
      setSelectedColumnComponentId(null);
    }
  };

  const updateColumnComponent = useCallback((data: any) => {
    if (!selectedColumnComponentId) return;
    
    // 列内コンポーネントを探す
    let foundColumnComponent = null;
    for (const component of components) {
      if (component.type === 'columns') {
        const columnCount = component.data.columnCount || 2;
        for (let i = 1; i <= columnCount; i++) {
          const columnKey = `column${i}`;
          const columnComponents = component.data[columnKey]?.components || [];
          const found = columnComponents.find((comp: any) => comp.id === selectedColumnComponentId);
          if (found) {
            foundColumnComponent = {
              ...found,
              parentId: component.id,
              columnKey: columnKey
            };
            break;
          }
        }
        if (foundColumnComponent) break;
      }
    }
    
    if (foundColumnComponent) {
      const parentComponent = components.find(comp => comp.id === foundColumnComponent.parentId);
      if (parentComponent && parentComponent.type === 'columns') {
        const updatedParent = {
          ...parentComponent,
          data: {
            ...parentComponent.data,
            [foundColumnComponent.columnKey]: {
              ...parentComponent.data[foundColumnComponent.columnKey],
              components: parentComponent.data[foundColumnComponent.columnKey].components.map((comp: any) =>
                comp.id === selectedColumnComponentId ? { ...comp, data } : comp
              )
            }
          }
        };
        
        const updatedComponents = components.map(comp =>
          comp.id === foundColumnComponent.parentId ? updatedParent : comp
        );
        
        setComponents(updatedComponents);
      }
    }
  }, [selectedColumnComponentId, components]);

  const handleComponentUpdate = useCallback((data: any) => {
    if (selectedId) {
      updateComponent(selectedId, data);
    }
  }, [selectedId, updateComponent]);

  const handleDragStart = (event: DragStartEvent) => {
    console.log('Drag started:', event.active.id, event.active.data);
    setActiveId(event.active.id as string);
  };

  const handleSave = async () => {
    setIsSaving(true);
    // 保存処理をシミュレート
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    alert('保存しました');
  };

  const handlePreview = () => {
    // プレビュー機能
    alert('プレビュー機能（実装予定）');
  };

  const handleTestSend = () => {
    // テスト送信機能
    alert('テスト送信機能（実装予定）');
  };

  const selectedComponent = components.find(comp => comp.id === selectedId);
  
  // 列内コンポーネントが選択されている場合は、そのコンポーネントのデータを取得
  let selectedColumnComponent = null;
  if (selectedColumnComponentId) {
    // 列内コンポーネントを探す
    for (const component of components) {
      if (component.type === 'columns') {
        const columnCount = component.data.columnCount || 2;
        for (let i = 1; i <= columnCount; i++) {
          const columnKey = `column${i}`;
          const columnComponents = component.data[columnKey]?.components || [];
          const found = columnComponents.find((comp: any) => comp.id === selectedColumnComponentId);
          if (found) {
            selectedColumnComponent = {
              ...found,
              parentId: component.id,
              columnKey: columnKey
            };
            break;
          }
        }
        if (selectedColumnComponent) break;
      }
    }
  }
  
  const showPropertiesPanel = selectedComponent || selectedColumnComponent;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    console.log('Drag ended:', { active: active.id, over: over?.id, data: active.data.current });
    setActiveId(null);
    
    if (!over) {
      console.log('No drop target found');
      return;
    }

    // 新しいコンポーネントの追加
    if (active.id.toString().startsWith('new-')) {
      const componentType = active.data.current?.type;
      
      if (componentType) {
        const newComponent: EmailComponent = {
          id: `component-${componentCounter}`,
          type: componentType,
          data: getDefaultData(componentType),
          order: 0
        };
        setComponentCounter(prev => prev + 1); // カウンターを更新
        
        // 列レイアウトの列にドロップした場合
        if (over.id.toString().includes('-column-')) {
          const overIdStr = over.id.toString();
          console.log('Column drop detected, overIdStr:', overIdStr);
          
          // 最後の'-column-'で分割して正確なIDを取得
          const lastColumnIndex = overIdStr.lastIndexOf('-column-');
          if (lastColumnIndex === -1) return;
          
          const parentId = overIdStr.substring(0, lastColumnIndex);
          const columnIndex = overIdStr.substring(lastColumnIndex + 8); // '-column-'.length = 8
          console.log('Parsed parentId:', parentId, 'columnIndex:', columnIndex);
          
          const parentComponent = components.find(comp => comp.id === parentId);
          console.log('Found parent component:', parentComponent);
          
          if (parentComponent && parentComponent.type === 'columns') {
            const columnNum = parseInt(columnIndex) + 1;
            const columnKey = `column${columnNum}`;
            console.log('Updating column:', columnKey);
            
            // 既存のコンポーネントを保持して新しいコンポーネントを追加
            const existingComponents = parentComponent.data[columnKey]?.components || [];
            console.log('Existing components in column:', columnKey, existingComponents);
            
            const newComponent = {
              id: `col-comp-${componentCounter}`,
              type: componentType,
              data: getDefaultData(componentType)
            };
            
            const updatedParent = {
              ...parentComponent,
              data: {
                ...parentComponent.data,
                [columnKey]: {
                  ...parentComponent.data[columnKey],
                  components: [...existingComponents, newComponent]
                }
              }
            };
            
            console.log('Updated parent after adding component:', {
              columnKey,
              existingComponentsCount: existingComponents.length,
              newComponentsCount: updatedParent.data[columnKey].components.length,
              newComponent,
              allComponents: updatedParent.data[columnKey].components
            });
            
            const updatedComponents = components.map(comp => 
              comp.id === parentId ? updatedParent : comp
            );
            
            console.log('Final components state:', updatedComponents.map(comp => ({
              id: comp.id,
              type: comp.type,
              columnData: comp.type === 'columns' ? comp.data : null
            })));
            
            setComponents(updatedComponents);
            setSelectedId(parentId);
            return;
          } else {
            console.log('Parent component not found or not columns type');
          }
        }
        
        let insertPosition = components.length; // デフォルトは最後
        
        // 挿入位置の特定
        if (over.id.toString().startsWith('insert-')) {
          const insertIndex = parseInt(over.id.toString().replace('insert-', ''));
          insertPosition = insertIndex;
        } else if (over.id === 'email-canvas') {
          insertPosition = components.length; // キャンバスの場合は最後に追加
        }
        
        // 新しいコンポーネントを指定位置に挿入
        const updatedComponents = [...components];
        updatedComponents.splice(insertPosition, 0, newComponent);
        
        // order を再計算
        const reorderedComponents = updatedComponents.map((comp, index) => ({
          ...comp,
          order: index
        }));
        
        setComponents(reorderedComponents);
        setSelectedId(newComponent.id);
      }
    }
    // 既存コンポーネントの並び替え
    else if (active.id !== over.id && !active.id.toString().startsWith('new-')) {
      const activeIdStr = active.id.toString();
      const overIdStr = over.id.toString();

      // カラム内のコンポーネントの並び替えかチェック
      if (activeIdStr.startsWith('col-') && overIdStr.startsWith('col-')) {
        // カラム内での並び替え処理
        console.log('Column component reordering:', activeIdStr, overIdStr);
        
        // 両方のコンポーネントがどの親とカラムに属しているかを特定
        let activeParent = null, activeColumnKey = '', activeCompIndex = -1;
        let overParent = null, overColumnKey = '', overCompIndex = -1;

        // アクティブなコンポーネントの情報を取得
        for (const component of components) {
          if (component.type === 'columns') {
            const columnCount = component.data.columnCount || 2;
            for (let i = 1; i <= columnCount; i++) {
              const columnKey = `column${i}`;
              const columnComponents = component.data[columnKey]?.components || [];
              const foundIndex = columnComponents.findIndex((comp: any) => comp.id === activeIdStr);
              if (foundIndex !== -1) {
                activeParent = component;
                activeColumnKey = columnKey;
                activeCompIndex = foundIndex;
                break;
              }
            }
            if (activeParent) break;
          }
        }

        // オーバーしているコンポーネントの情報を取得
        for (const component of components) {
          if (component.type === 'columns') {
            const columnCount = component.data.columnCount || 2;
            for (let i = 1; i <= columnCount; i++) {
              const columnKey = `column${i}`;
              const columnComponents = component.data[columnKey]?.components || [];
              const foundIndex = columnComponents.findIndex((comp: any) => comp.id === overIdStr);
              if (foundIndex !== -1) {
                overParent = component;
                overColumnKey = columnKey;
                overCompIndex = foundIndex;
                break;
              }
            }
            if (overParent) break;
          }
        }

        // 同じカラム内での並び替え
        if (activeParent && overParent && activeParent.id === overParent.id && activeColumnKey === overColumnKey) {
          const columnComponents = [...activeParent.data[activeColumnKey].components];
          const reorderedComponents = arrayMove(columnComponents, activeCompIndex, overCompIndex);
          
          const updatedParent = {
            ...activeParent,
            data: {
              ...activeParent.data,
              [activeColumnKey]: {
                ...activeParent.data[activeColumnKey],
                components: reorderedComponents
              }
            }
          };
          
          const updatedComponents = components.map(comp =>
            comp.id === activeParent.id ? updatedParent : comp
          );
          
          setComponents(updatedComponents);
          return;
        }
      }

      // 通常のコンポーネント並び替え
      const oldIndex = components.findIndex(item => item.id === active.id);
      
      let newIndex = oldIndex;
      
      // 挿入位置の特定
      if (over.id.toString().startsWith('insert-')) {
        const insertIndex = parseInt(over.id.toString().replace('insert-', ''));
        newIndex = insertIndex > oldIndex ? insertIndex - 1 : insertIndex;
      } else {
        newIndex = components.findIndex(item => item.id === over.id);
      }

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const reorderedComponents = arrayMove(components, oldIndex, newIndex);
        // order を更新
        const updatedComponents = reorderedComponents.map((comp, index) => ({
          ...comp,
          order: index
        }));
        setComponents(updatedComponents);
      }
    }
  };

  const getDefaultData = (type: string) => {
    switch (type) {
      case 'text':
        return { 
          text: 'テキストを入力してください',
          richText: 'テキストを入力してください',
          useRichText: true, // 最初からリッチテキスト有効
          fontSize: '16px', 
          color: '#000000', 
          textAlign: 'left',
          fontFamily: 'Arial, sans-serif',
          fontWeight: 'normal',
          lineHeight: '1.4',
          backgroundColor: 'transparent',
          padding: '0px',
          margin: '0px',
          borderRadius: '0px',
          showBorder: false,
          borderColor: '#d1d5db',
          borderWidth: '1px',
          isLink: false,
          linkUrl: '',
          linkColor: '#007bff',
          linkUnderline: true,
          linkTarget: '_blank'
        };
      case 'image':
        return { 
          src: '', 
          alt: '', 
          width: '400px', 
          height: 'auto',
          maxWidth: '600px',
          textAlign: 'center',
          borderRadius: '0px',
          isLink: false,
          linkUrl: '',
          padding: '0px',
          margin: '0px',
          showBorder: false,
          borderColor: '#d1d5db',
          borderWidth: '1px',
          boxShadow: 'none',
          backgroundColor: 'transparent'
        };
      case 'button':
        return { 
          text: 'ボタンテキスト', 
          backgroundColor: '#007bff', 
          color: '#ffffff', 
          url: '#', 
          textAlign: 'center',
          fontFamily: 'Arial, sans-serif',
          fontWeight: 'normal',
          fontSize: '16px',
          borderRadius: '4px',
          padding: '8px',
          margin: '0px',
          width: '200px',
          showBorder: false,
          borderColor: '#d1d5db',
          borderWidth: '1px',
          boxShadow: 'none'
        };
      case 'divider':
        return { 
          height: '1px', 
          color: '#e5e7eb',
          borderStyle: 'solid',
          width: '100%',
          textAlign: 'center',
          margin: '12px'
        };
      case 'spacer':
        return { height: '20px' };
      case 'header':
        return { 
          title: 'メールヘッダー', 
          subtitle: '', 
          fontSize: '28px', 
          color: '#000000', 
          backgroundColor: '#f8f9fa', 
          textAlign: 'center',
          fontFamily: 'Arial, sans-serif',
          fontWeight: '600',
          subtitleSize: '16px',
          subtitleColor: '#6b7280',
          padding: '30px',
          margin: '0px',
          showBorder: false,
          borderColor: '#d1d5db',
          borderWidth: '1px'
        };
      case 'footer':
        return { content: 'フッター情報・配信停止リンクなど', color: '#666666', backgroundColor: '#f1f3f4', textAlign: 'center' };
      case 'social':
        return { 
          platforms: ['facebook', 'twitter', 'instagram', 'linkedin'],
          facebookUrl: '#', twitterUrl: '#', instagramUrl: '#', linkedinUrl: '#',
          alignment: 'center'
        };
      case 'columns':
        const defaultColumnData: any = { 
          columnCount: 2, 
          gap: '20px' 
        };
        // 各列にcomponents配列を初期化
        for (let i = 1; i <= 2; i++) {
          defaultColumnData[`column${i}`] = { components: [] };
        }
        return defaultColumnData;
      case 'html':
        return { content: '<p>カスタムHTMLコードをここに入力</p>' };
      default:
        return {};
    }
  };

  // SSRの場合はDndContext無しで表示
  if (!isClient) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        {/* トップツールバー */}
        <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-semibold text-gray-800">📧 Email Designer</h1>
            <Separator orientation="vertical" className="h-6" />
            <Button variant="ghost" size="sm">
              <Undo size={16} className="mr-1" />
              元に戻す
            </Button>
            <Button variant="ghost" size="sm">
              <Redo size={16} className="mr-1" />
              やり直し
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* ビューモード切り替え */}
            <div className="flex bg-gray-100 rounded-md p-1">
              <Button
                variant={viewMode === 'desktop' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('desktop')}
                className="h-8"
              >
                <Monitor size={16} className="mr-1" />
                デスクトップ
              </Button>
              <Button
                variant={viewMode === 'mobile' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('mobile')}
                className="h-8"
              >
                <Smartphone size={16} className="mr-1" />
                モバイル
              </Button>
            </div>
            
            <Separator orientation="vertical" className="h-6" />
            
            {/* アクションボタン */}
            <Button variant="outline" size="sm" onClick={handlePreview}>
              <Eye size={16} className="mr-1" />
              プレビュー
            </Button>
            <Button variant="outline" size="sm" onClick={handleTestSend}>
              <Send size={16} className="mr-1" />
              テスト送信
            </Button>
            <Button 
              size="sm" 
              onClick={handleSave}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save size={16} className="mr-1" />
              {isSaving ? '保存中...' : '保存'}
            </Button>
            <Button variant="ghost" size="sm">
              <Settings size={16} />
            </Button>
          </div>
        </div>

        {/* メインコンテンツエリア */}
        <div className="flex flex-1 overflow-hidden">
          {/* 左パネル - コンポーネントライブラリ */}
          <div className="w-80 border-r bg-white border-gray-200 overflow-y-auto">
            <ComponentLibrary />
          </div>

          {/* 中央 - キャンバス */}
          <div className="flex-1 flex flex-col">
            {/* SSR中は静的表示 */}
            <div className="flex-1 p-4 bg-gray-100">
              <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="p-8 text-center text-gray-500">
                  <Monitor size={48} className="mx-auto mb-4 opacity-50" />
                  <p>メールエディターを読み込み中...</p>
                </div>
              </div>
            </div>
          </div>

          {/* 右パネル - プロパティは非表示 */}
        </div>
      </div>
    );
  }

  console.log('EmailEditorLayout render, DndContext setup');

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={(event) => {
        console.log('Drag over:', event.active.id, event.over?.id);
      }}
    >
      <div className="flex flex-col h-screen bg-gray-100">
      {/* トップツールバー - 参考UIスタイル */}
      <div className="h-12 bg-slate-700 text-white flex items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white hover:bg-slate-600 rounded-none border-b-2 border-transparent hover:border-white"
          >
            ✏️ DESIGN
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-slate-300 hover:text-white hover:bg-slate-600"
            onClick={handlePreview}
          >
            👁️ PREVIEW
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="bg-slate-600 border-slate-500 text-white hover:bg-slate-500"
          >
            💾 {isSaving ? 'Saving...' : 'Save'}
          </Button>
          <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
            ↶ Undo
          </Button>
          <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
            ↷ Redo
          </Button>
        </div>
      </div>
      
      {/* セカンダリツールバー */}
      <div className="h-10 bg-white border-b border-gray-200 flex items-center px-4">
        <div className="flex items-center space-x-6 text-sm">
          <Button variant="ghost" size="sm" className="text-blue-600 font-medium border-b-2 border-blue-600">
            Build
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-500">
            Settings
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-500">
            Tags
          </Button>
        </div>
        <div className="ml-auto flex items-center space-x-4 text-sm text-gray-600">
          <span>Subject:</span>
          <span>Preheader:</span>
        </div>
      </div>

      {/* メインコンテンツエリア */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左パネル - コンポーネントライブラリ */}
        <div className="w-80 border-r bg-white border-gray-200 overflow-y-auto">
          <ComponentLibrary />
        </div>

        {/* 中央 - キャンバス */}
        <div className="flex-1 flex flex-col">
          <EmailCanvasView
            components={components}
            selectedId={selectedId}
            activeId={activeId}
            viewMode={viewMode}
            onComponentsChange={setComponents}
            onSelectComponent={handleSelectComponent}
            onUpdateComponent={updateComponent}
            onDeleteComponent={deleteComponent}
            selectedColumnComponentId={selectedColumnComponentId}
          />
        </div>

        {/* 右パネル - プロパティ */}
        {showPropertiesPanel && (
          <div className="w-80 border-l bg-white border-gray-200 overflow-y-auto">
            <PropertiesPanel 
              component={selectedColumnComponent || selectedComponent}
              onUpdate={selectedColumnComponent ? updateColumnComponent : handleComponentUpdate}
            />
          </div>
        )}
      </div>

      {/* ドラッグオーバーレイ */}
      <DragOverlay
        style={{ 
          zIndex: 10000,
          pointerEvents: 'none'
        }}
      >
        {activeId ? (
          <div style={{ 
            opacity: 0.9, 
            transform: 'scale(1.02)',
            boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
            borderRadius: '6px'
          }}>
            {/* 新しいコンポーネントのプレビュー */}
            {activeId.toString().startsWith('new-') ? (
              <div style={{
                padding: '12px 16px',
                backgroundColor: '#3b82f6',
                color: 'white',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                minWidth: '120px',
                textAlign: 'center',
                border: '2px solid #2563eb'
              }}>
                + {activeId.toString().replace('new-', '').toUpperCase()}
              </div>
            ) : (
              /* 既存のコンポーネントのプレビュー */
              (() => {
                // 通常のコンポーネント
                const draggedComponent = components.find(comp => comp.id === activeId);
                if (draggedComponent) {
                  return (
                    <EmailComponentRenderer
                      component={draggedComponent}
                      isSelected={false}
                      viewMode={viewMode}
                      onSelect={() => {}}
                      onUpdate={() => {}}
                      onDelete={() => {}}
                    />
                  );
                }
                
                // 列コンポーネント内のドラッグかチェック
                if (activeId?.toString().startsWith('col-')) {
                  for (const component of components) {
                    if (component.type === 'columns') {
                      const columnCount = component.data.columnCount || 2;
                      for (let i = 1; i <= columnCount; i++) {
                        const columnKey = `column${i}`;
                        const columnComponents = component.data[columnKey]?.components || [];
                        const found = columnComponents.find((comp: any) => comp.id === activeId);
                        if (found) {
                          return (
                            <div style={{
                              padding: '8px 12px',
                              backgroundColor: '#3b82f6',
                              color: 'white',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '500',
                              minWidth: '100px',
                              textAlign: 'center',
                              border: '2px solid #2563eb'
                            }}>
                              📦 {found.type.toUpperCase()}
                            </div>
                          );
                        }
                      }
                    }
                  }
                }
                
                return null;
              })()
            )}
          </div>
        ) : null}
      </DragOverlay>
    </div>
    </DndContext>
  );
}