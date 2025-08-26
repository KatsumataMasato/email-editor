'use client';

import React, { useState, useRef, useCallback } from 'react';
import { 
  DndContext, 
  DragEndEvent, 
  DragOverlay, 
  DragStartEvent, 
  closestCenter,
  useDraggable,
  useDroppable,
  DragOverEvent
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  Type, 
  Image, 
  Square, 
  Minus, 
  Download, 
  Upload,
  Trash2,
  Settings,
  Plus,
  GripVertical,
  Layout,
  LayoutGrid,
  Share2,
  Columns
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardAction } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface EmailComponent {
  id: string;
  type: 'text' | 'image' | 'button' | 'divider' | 'spacer' | 'header' | 'footer' | 'social' | 'columns';
  data: any;
}

interface SortableItemProps {
  id: string;
  component: EmailComponent;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onUpdate: (id: string, data: any) => void;
  onDelete: (id: string) => void;
}

interface DraggableComponentButtonProps {
  type: string;
  icon: any;
  label: string;
}

function DraggableComponentButton({ type, icon: Icon, label }: DraggableComponentButtonProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `new-${type}`,
    data: { type }
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Button
      ref={setNodeRef}
      style={style}
      variant="ghost"
      className="w-full justify-start h-10 cursor-grab active:cursor-grabbing"
      data-testid="draggable-button"
      {...attributes}
      {...listeners}
    >
      <Icon size={16} className="mr-3" />
      {label}
    </Button>
  );
}

function SortableItem({ id, component, isSelected, onSelect, onUpdate, onDelete }: SortableItemProps) {
  const [isImageLoading, setIsImageLoading] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleImageUpload = async (file: File) => {
    setIsImageLoading(true);
    console.log('🔥 Custom editor: Uploading to R2:', file.name);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Custom editor: R2 upload successful:', data.url);
        onUpdate(id, { ...component.data, src: data.url });
      } else {
        throw new Error(`Upload failed: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Custom editor: Upload failed:', error);
    } finally {
      setIsImageLoading(false);
    }
  };

  const renderComponent = () => {
    switch (component.type) {
      case 'text':
        return (
          <Card className="m-2">
            <CardContent 
              style={{ 
                fontSize: component.data.fontSize || '16px',
                color: component.data.color || '#000000',
                textAlign: component.data.textAlign || 'left',
                fontWeight: component.data.fontWeight || 'normal',
                fontFamily: component.data.fontFamily || 'Arial',
                lineHeight: component.data.lineHeight || '120%',
                letterSpacing: component.data.letterSpacing || '0px',
                paddingTop: component.data.paddingTop || '10px',
                paddingRight: component.data.paddingRight || '10px',
                paddingBottom: component.data.paddingBottom || '10px',
                paddingLeft: component.data.paddingLeft || '10px',
              }}
              contentEditable
              onBlur={(e) => onUpdate(id, { ...component.data, text: e.target.textContent })}
              suppressContentEditableWarning={true}
            >
              {component.data.text || 'テキストを入力してください'}
            </CardContent>
          </Card>
        );
      case 'image':
        return (
          <Card className="m-2">
            <CardContent className="text-center p-4">
              {isImageLoading ? (
                <div className="border-2 border-dashed border-gray-300 p-8 rounded-lg">
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
                    <p className="text-sm text-gray-600">アップロード中...</p>
                  </div>
                </div>
              ) : component.data.src ? (
                <div className="relative">
                  <div className="bg-gray-200 animate-pulse rounded h-48 w-full"></div>
                  <img 
                    src={component.data.src} 
                    alt={component.data.alt || ''} 
                    style={{
                      width: component.data.width || 'auto',
                      height: component.data.height || 'auto',
                      maxWidth: '100%'
                    }}
                    className="absolute top-0 left-0 w-full h-full object-cover rounded"
                    onLoad={(e) => {
                      const skeleton = e.target.previousElementSibling;
                      if (skeleton) skeleton.style.display = 'none';
                    }}
                  />
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 p-8 rounded-lg hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                    }}
                    className="hidden"
                    id={`file-${id}`}
                  />
                  <label htmlFor={`file-${id}`} className="cursor-pointer flex flex-col items-center">
                    <Image className="mb-2 text-gray-400" size={32} />
                    <p className="text-sm text-gray-600">画像をアップロード (R2)</p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF対応</p>
                  </label>
                </div>
              )}
            </CardContent>
          </Card>
        );
      case 'button':
        return (
          <Card className="m-2">
            <CardContent className="text-center p-4">
              <div
                style={{
                  display: 'inline-block',
                  backgroundColor: component.data.backgroundColor || '#007bff',
                  color: component.data.color || '#ffffff',
                  paddingTop: component.data.paddingTop || '12px',
                  paddingRight: component.data.paddingRight || '24px',
                  paddingBottom: component.data.paddingBottom || '12px',
                  paddingLeft: component.data.paddingLeft || '24px',
                  border: `${component.data.borderWidth || '0px'} solid ${component.data.borderColor || 'transparent'}`,
                  borderRadius: component.data.borderRadius || '4px',
                  fontSize: component.data.fontSize || '16px',
                  fontWeight: component.data.fontWeight || 'normal',
                  lineHeight: component.data.lineHeight || '120%',
                  cursor: 'text',
                  minHeight: '20px',
                  minWidth: '60px',
                  transition: 'all 0.2s ease'
                }}
                contentEditable
                onBlur={(e) => onUpdate(id, { ...component.data, text: e.target.textContent })}
                suppressContentEditableWarning={true}
              >
                {component.data.text || 'ボタンテキスト'}
              </div>
            </CardContent>
          </Card>
        );
      case 'divider':
        return (
          <Card className="m-2">
            <CardContent className="py-4">
              <hr 
                style={{
                  border: 'none',
                  height: component.data.height || '1px',
                  backgroundColor: component.data.color || '#cccccc',
                  margin: '0'
                }}
              />
            </CardContent>
          </Card>
        );
      case 'spacer':
        return (
          <Card className="m-2">
            <CardContent 
              style={{ 
                height: component.data.height || '20px',
                backgroundColor: 'transparent'
              }}
            />
          </Card>
        );
      case 'header':
        return (
          <Card className="m-2">
            <CardContent 
              style={{
                backgroundColor: component.data.backgroundColor || '#f8f9fa',
                padding: '20px',
                textAlign: 'center'
              }}
            >
              <h1 
                style={{
                  fontSize: component.data.fontSize || '24px',
                  color: component.data.color || '#000000',
                  margin: '0',
                  fontFamily: component.data.fontFamily || 'Arial'
                }}
                contentEditable
                onBlur={(e) => onUpdate(id, { ...component.data, title: e.target.textContent })}
                suppressContentEditableWarning={true}
              >
                {component.data.title || 'メールヘッダー'}
              </h1>
              {component.data.subtitle && (
                <p 
                  style={{
                    fontSize: '16px',
                    color: component.data.subtitleColor || '#666666',
                    margin: '10px 0 0 0'
                  }}
                  contentEditable
                  onBlur={(e) => onUpdate(id, { ...component.data, subtitle: e.target.textContent })}
                  suppressContentEditableWarning={true}
                >
                  {component.data.subtitle}
                </p>
              )}
            </CardContent>
          </Card>
        );
      case 'footer':
        return (
          <Card className="m-2">
            <CardContent 
              style={{
                backgroundColor: component.data.backgroundColor || '#f1f3f4',
                padding: '20px',
                textAlign: 'center',
                fontSize: '14px',
                color: component.data.color || '#666666'
              }}
            >
              <div
                contentEditable
                onBlur={(e) => onUpdate(id, { ...component.data, content: e.target.textContent })}
                suppressContentEditableWarning={true}
              >
                {component.data.content || 'フッター情報・配信停止リンクなど'}
              </div>
            </CardContent>
          </Card>
        );
      case 'social':
        return (
          <Card className="m-2">
            <CardContent className="text-center p-4">
              <div className="inline-flex space-x-3">
                {['facebook', 'twitter', 'instagram', 'linkedin'].map(social => (
                  <a
                    key={social}
                    href={component.data[`${social}Url`] || '#'}
                    className="inline-block w-8 h-8 bg-gray-400 rounded hover:bg-gray-500 transition-colors"
                    style={{ backgroundColor: component.data[`${social}Color`] || '#6b7280' }}
                    title={social}
                  >
                    <span className="sr-only">{social}</span>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      case 'columns':
        const columnCount = component.data.columnCount || 2;
        return (
          <Card className="m-2">
            <CardContent 
              style={{
                display: 'flex',
                gap: component.data.gap || '20px',
                padding: '20px'
              }}
            >
              {Array.from({ length: columnCount }, (_, i) => i + 1).map(col => (
                <div
                  key={col}
                  style={{ 
                    flex: component.data[`column${col}Flex`] || 1,
                    border: '1px dashed #ddd',
                    padding: '20px',
                    minHeight: '100px'
                  }}
                >
                  <div className="text-xs text-gray-500 mb-2">列 {col}</div>
                  <div 
                    contentEditable
                    onBlur={(e) => onUpdate(id, { ...component.data, [`column${col}`]: e.target.textContent })}
                    suppressContentEditableWarning={true}
                    className="min-h-[60px]"
                  >
                    {component.data[`column${col}`] || `列 ${col} の内容`}
                  </div>
                  {/* ドロップゾーン */}
                  <div className="mt-2 p-2 border-2 border-dashed border-gray-200 rounded text-xs text-gray-400 text-center">
                    要素をドラッグしてください
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative border-2 ${isSelected ? 'border-blue-500 shadow-lg' : 'border-transparent'} hover:border-blue-300 group transition-all duration-200 bg-white`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(id);
      }}
    >
      {/* ドラッグハンドル */}
      <div 
        {...attributes}
        {...listeners}
        className={`absolute left-0 top-0 bottom-0 w-2 cursor-grab active:cursor-grabbing ${isSelected ? 'bg-blue-500' : 'bg-gray-300 opacity-0 group-hover:opacity-100'} transition-opacity`}
      />
      
      <div className="ml-2">
        {renderComponent()}
      </div>
      
      {isSelected && (
        <div className="absolute -top-8 right-0 bg-blue-600 text-white p-1 flex space-x-1 rounded shadow-md">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(id);
            }} 
            className="hover:bg-blue-700 p-1 rounded"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}
      
    </div>
  );
}

export default function CustomEmailEditor() {
  const [components, setComponents] = useState<EmailComponent[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showColumnTemplates, setShowColumnTemplates] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addComponent = (type: EmailComponent['type']) => {
    if (components.length >= 3) {
      alert('最大3つまでのコンポーネントしか追加できません');
      return;
    }
    const id = `component-${Date.now()}`;
    const newComponent: EmailComponent = {
      id,
      type,
      data: getDefaultData(type)
    };
    setComponents(prev => [...prev, newComponent]);
    setSelectedId(id);
  };

  const addColumnComponent = (columnCount: number, flexRatios: number[] = []) => {
    if (components.length >= 3) {
      alert('最大3つまでのコンポーネントしか追加できません');
      return;
    }
    const id = `component-${Date.now()}`;
    const data: any = { columnCount, gap: '20px', elements: {} };
    flexRatios.forEach((ratio, i) => {
      data[`column${i + 1}Flex`] = ratio;
    });
    for (let i = 1; i <= columnCount; i++) {
      data[`column${i}`] = `列 ${i} の内容`;
      data.elements[`column${i}`] = [];
    }
    setComponents(prev => [...prev, { id, type: 'columns', data }]);
    setSelectedId(id);
    setShowColumnTemplates(false);
  };

  const getDefaultData = (type: EmailComponent['type']) => {
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
        return { columnCount: 2, column1: '列 1 の内容', column2: '列 2 の内容', gap: '20px', elements: { column1: [], column2: [] } };
      default:
        return {};
    }
  };

  const updateComponent = (id: string, data: any) => {
    setComponents(prev => prev.map(comp => 
      comp.id === id ? { ...comp, data } : comp
    ));
  };

  const deleteComponent = (id: string) => {
    setComponents(prev => prev.filter(comp => comp.id !== id));
    if (selectedId === id) {
      setSelectedId(null);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    // 新しいコンポーネントの追加
    if (active.id.toString().startsWith('new-') && over?.id === 'editor-dropzone') {
      const componentType = active.data.current?.type;
      if (componentType) {
        addComponent(componentType);
      }
    }
    // 既存コンポーネントの並び替え
    else if (active.id !== over?.id && !active.id.toString().startsWith('new-')) {
      setComponents((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over?.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }

    setActiveId(null);
  };

  function EditorDropZone({ children }: { children: React.ReactNode }) {
    const { setNodeRef, isOver } = useDroppable({
      id: 'editor-dropzone',
    });

    return (
      <div
        ref={setNodeRef}
        data-testid="editor-dropzone"
        className={cn(
          "min-h-96 w-full",
          isOver && "bg-blue-50 border-2 border-dashed border-blue-300"
        )}
      >
        {children}
      </div>
    );
  }

  const exportHtml = () => {
    const html = components.map(component => {
      switch (component.type) {
        case 'text':
          return `<div style="font-size: ${component.data.fontSize || '16px'}; color: ${component.data.color || '#000000'}; text-align: ${component.data.textAlign || 'left'}; font-weight: ${component.data.fontWeight || 'normal'}; padding: 10px;">${component.data.text || 'テキストを入力してください'}</div>`;
        case 'image':
          return component.data.src ? `<div style="text-align: center; padding: 16px;"><img src="${component.data.src}" alt="${component.data.alt || ''}" style="width: ${component.data.width || 'auto'}; height: ${component.data.height || 'auto'}; max-width: 100%;" /></div>` : '';
        case 'button':
          return `<div style="text-align: center; padding: 16px;"><button style="background-color: ${component.data.backgroundColor || '#007bff'}; color: ${component.data.color || '#ffffff'}; padding: ${component.data.padding || '12px 24px'}; border: none; border-radius: ${component.data.borderRadius || '4px'}; font-size: ${component.data.fontSize || '16px'}; cursor: pointer;">${component.data.text || 'ボタンテキスト'}</button></div>`;
        case 'divider':
          return `<div style="padding: 16px 0;"><hr style="border: none; height: ${component.data.height || '1px'}; background-color: ${component.data.color || '#cccccc'}; margin: 0;" /></div>`;
        case 'spacer':
          return `<div style="height: ${component.data.height || '20px'}; background-color: transparent;"></div>`;
        default:
          return '';
      }
    }).join('');

    const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td>
              ${html}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(fullHtml);
    }

    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'email.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importHtml = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const html = e.target?.result as string;
      console.log('HTML imported:', html);
      alert('HTML import is not fully implemented in this demo');
    };
    reader.readAsText(file);
  };

  const selectedComponent = components.find(comp => comp.id === selectedId);

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-screen bg-gray-50">
      {/* ツールバー */}
      <div className="w-64 border-r bg-white border-gray-200">
        <Card className="h-full rounded-none border-0 bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">📧 Email Editor</CardTitle>
            <CardAction>
              <Button
                onClick={() => alert('タイトル編集機能')}
                variant="ghost"
                size="sm"
              >
                <Settings size={16} />
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                コンポーネント
              </Label>
              {[
                { type: 'header', icon: Layout, label: 'ヘッダー' },
                { type: 'text', icon: Type, label: 'テキスト' },
                { type: 'image', icon: Image, label: '画像' },
                { type: 'button', icon: Square, label: 'ボタン' },
                { type: 'social', icon: Share2, label: 'ソーシャル' },
                { type: 'divider', icon: Minus, label: '区切り線' },
                { type: 'spacer', icon: Square, label: 'スペーサー' },
                { type: 'footer', icon: LayoutGrid, label: 'フッター' }
              ].map(({ type, icon, label }) => (
                <div key={type} className="space-y-1">
                  <DraggableComponentButton
                    type={type}
                    icon={icon}
                    label={label}
                  />
                  <Button
                    onClick={() => addComponent(type as EmailComponent['type'])}
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    disabled={components.length >= 3}
                  >
                    <Plus size={12} className="mr-1" />
                    追加 {components.length >= 3 && '(上限)'}
                  </Button>
                </div>
              ))}
              
              {/* カラムレイアウト専用セクション */}
              <div className="space-y-1">
                <DraggableComponentButton
                  type="columns"
                  icon={Columns}
                  label="カラムレイアウト"
                />
                <Button
                  onClick={() => setShowColumnTemplates(!showColumnTemplates)}
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  disabled={components.length >= 3}
                >
                  <Plus size={12} className="mr-1" />
                  カラム選択 {components.length >= 3 && '(上限)'}
                </Button>
                {showColumnTemplates && components.length < 3 && (
                  <div className="ml-2 space-y-1">
                    <Button onClick={() => addColumnComponent(1)} variant="ghost" size="sm" className="w-full text-xs">1列</Button>
                    <Button onClick={() => addColumnComponent(2)} variant="ghost" size="sm" className="w-full text-xs">2列 (1:1)</Button>
                    <Button onClick={() => addColumnComponent(2, [2, 1])} variant="ghost" size="sm" className="w-full text-xs">2列 (2:1)</Button>
                    <Button onClick={() => addColumnComponent(3)} variant="ghost" size="sm" className="w-full text-xs">3列</Button>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                アクション
              </Label>
              <Button
                onClick={exportHtml}
                className="w-full justify-start"
                size="sm"
              >
                <Download size={16} className="mr-2" />
                HTML エクスポート
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".html"
                onChange={importHtml}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="w-full justify-start"
                size="sm"
              >
                <Upload size={16} className="mr-2" />
                HTML インポート
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* エディター */}
      <div className="flex-1 flex">
        <div className="flex-1 p-6 overflow-y-auto bg-gray-100">
          <Card className="max-w-3xl mx-auto bg-white shadow-sm">
            <CardContent className="p-0">
                <EditorDropZone>
                  <SortableContext
                    items={components.map(comp => comp.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {components.map((component) => (
                      <SortableItem
                        key={component.id}
                        id={component.id}
                        component={component}
                        isSelected={selectedId === component.id}
                        onSelect={setSelectedId}
                        onUpdate={updateComponent}
                        onDelete={deleteComponent}
                      />
                    ))}
                  </SortableContext>

                  {components.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 text-gray-500">
                      <Plus size={48} className="mb-4 text-gray-400" />
                      <p className="text-lg font-medium">コンポーネントを追加</p>
                      <p className="text-sm">左のパネルからドラッグ or 追加ボタンをクリック</p>
                    </div>
                  )}
                </EditorDropZone>
                
                <DragOverlay>
                  {activeId ? (
                    <Card className="p-4 shadow-lg opacity-80">
                      <GripVertical className="w-4 h-4 text-muted-foreground" />
                    </Card>
                  ) : null}
                </DragOverlay>
            </CardContent>
          </Card>
        </div>

        {/* プロパティパネル */}
        {selectedComponent && (
          <div className="w-80 border-l bg-white border-gray-200" data-testid="properties-panel">
            <Card className="h-full rounded-none border-0 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center text-base">
                  <Settings size={16} className="mr-2" />
                  プロパティ
                </CardTitle>
              </CardHeader>
              <CardContent className="overflow-y-auto">
                <PropertyPanel 
                  component={selectedComponent}
                  onUpdate={(data) => updateComponent(selectedComponent.id, data)}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
    </DndContext>
  );
}

function PropertyPanel({ component, onUpdate }: { component: EmailComponent; onUpdate: (data: any) => void }) {
  const handleChange = (key: string, value: any) => {
    onUpdate({ ...component.data, [key]: value });
  };

  const NumberInput = ({ label, value, unit = 'px', onChange }: any) => (
    <div className="space-y-2">
      <Label className="text-sm">{label}</Label>
      <div className="flex items-center space-x-1">
        <Input
          type="number"
          value={parseInt(value) || 0}
          onChange={(e) => onChange(e.target.value + unit)}
          className="flex-1 h-8 text-xs"
        />
        <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded text-center min-w-[28px] shrink-0">{unit}</span>
        <div className="flex space-x-0.5 shrink-0">
          <Button 
            size="sm"
            variant="outline"
            onClick={() => onChange((parseInt(value) - 1) + unit)}
            className="w-6 h-6 p-0 text-xs"
          >−</Button>
          <Button 
            size="sm"
            variant="outline"
            onClick={() => onChange((parseInt(value) + 1) + unit)}
            className="w-6 h-6 p-0 text-xs"
          >+</Button>
        </div>
      </div>
    </div>
  );

  const CompactNumberInput = ({ label, value, unit = 'px', onChange }: any) => (
    <div className="space-y-1">
      <Label className="text-xs text-center block">{label}</Label>
      <div className="flex items-center justify-center">
        <Input
          type="number"
          value={parseInt(value) || 0}
          onChange={(e) => onChange(e.target.value + unit)}
          className="w-16 h-7 text-xs text-center"
        />
      </div>
      <div className="text-xs text-gray-600 text-center">{unit}</div>
    </div>
  );

  const ColorInput = ({ label, value, onChange }: any) => (
    <div className="space-y-2">
      <Label className="text-sm">{label}</Label>
      <div className="flex items-center space-x-2">
        <div 
          className="w-8 h-8 rounded border cursor-pointer shadow-sm shrink-0"
          style={{ backgroundColor: value }}
          onClick={() => document.getElementById(`color-${label}`)?.click()}
        />
        <div className="flex-1 text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
          {value}
        </div>
        <input
          id={`color-${label}`}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-0 h-0 opacity-0"
        />
      </div>
    </div>
  );

  const SelectInput = ({ label, value, options, onChange }: any) => (
    <div className="space-y-2">
      <Label className="text-sm">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full h-8 bg-white border border-gray-300">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-white border border-gray-300">
          {options.map((opt: any) => (
            <SelectItem key={opt.value} value={opt.value} className="bg-white hover:bg-gray-100">
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  const SectionHeader = ({ title, isExpanded = true, onToggle }: any) => (
    <div 
      className="flex items-center space-x-2 py-3 cursor-pointer hover:bg-gray-100 -mx-3 px-3 rounded-md"
      onClick={onToggle}
    >
      <Settings size={14} className="text-gray-500" />
      <h4 className="text-sm font-semibold flex-1">{title}</h4>
      <span className={`transform transition-transform text-gray-500 ${isExpanded ? 'rotate-90' : ''}`}>
        ▶
      </span>
    </div>
  );

  switch (component.type) {
    case 'text':
      return (
        <div className="space-y-4">
          <SectionHeader title="Text Options" />
          <div className="space-y-3 pl-4">
            <SelectInput 
              label="Font Family"
              value={component.data.fontFamily || 'Arial'}
              options={[
                { value: 'Arial', label: 'Arial' },
                { value: 'Georgia', label: 'Georgia' },
                { value: 'Times New Roman', label: 'Times' },
                { value: 'Verdana', label: 'Verdana' },
                { value: 'Helvetica', label: 'Helvetica' }
              ]}
              onChange={(v: string) => handleChange('fontFamily', v)}
            />
            <NumberInput
              label="Font Size"
              value={component.data.fontSize || '16px'}
              onChange={(v: string) => handleChange('fontSize', v)}
            />
            <NumberInput
              label="Line Height"
              value={component.data.lineHeight || '120%'}
              unit="%"
              onChange={(v: string) => handleChange('lineHeight', v)}
            />
            <NumberInput
              label="Letter Spacing"
              value={component.data.letterSpacing || '0px'}
              onChange={(v: string) => handleChange('letterSpacing', v)}
            />
            <ColorInput
              label="Text Color"
              value={component.data.color || '#000000'}
              onChange={(v: string) => handleChange('color', v)}
            />
            <SelectInput 
              label="Font Weight"
              value={component.data.fontWeight || 'normal'}
              options={[
                { value: 'normal', label: 'Normal' },
                { value: 'bold', label: 'Bold' },
                { value: '300', label: 'Light' },
                { value: '600', label: 'Semi Bold' }
              ]}
              onChange={(v: string) => handleChange('fontWeight', v)}
            />
          </div>

          <SectionHeader title="Spacing" />
          <div className="space-y-3 pl-4">
            <div className="grid grid-cols-2 gap-2">
              <CompactNumberInput
                label="Top"
                value={component.data.paddingTop || '10px'}
                onChange={(v: string) => handleChange('paddingTop', v)}
              />
              <CompactNumberInput
                label="Right"
                value={component.data.paddingRight || '10px'}
                onChange={(v: string) => handleChange('paddingRight', v)}
              />
              <CompactNumberInput
                label="Bottom"
                value={component.data.paddingBottom || '10px'}
                onChange={(v: string) => handleChange('paddingBottom', v)}
              />
              <CompactNumberInput
                label="Left"
                value={component.data.paddingLeft || '10px'}
                onChange={(v: string) => handleChange('paddingLeft', v)}
              />
            </div>
            <div className="flex space-x-1 justify-center">
              {[
                { value: 'left', icon: '⟵', label: '左揃え' },
                { value: 'center', icon: '⬌', label: '中央' },
                { value: 'right', icon: '⟶', label: '右揃え' },
                { value: 'justify', icon: '⧉', label: '両端' }
              ].map(({ value, icon, label }) => (
                <Button
                  key={value}
                  onClick={() => handleChange('textAlign', value)}
                  variant={component.data.textAlign === value ? "default" : "outline"}
                  size="sm"
                  className="px-2 py-1 h-8 text-xs"
                  title={label}
                >
                  {icon}
                </Button>
              ))}
            </div>
          </div>
        </div>
      );
    case 'button':
      return (
        <div className="space-y-4">
          <SectionHeader title="Action" />
          <div className="space-y-3 pl-4">
            <SelectInput 
              label="Action Type"
              value={component.data.actionType || 'link'}
              options={[
                { value: 'link', label: 'Open Website' },
                { value: 'email', label: 'Send Email' },
                { value: 'phone', label: 'Call Phone' }
              ]}
              onChange={(v: string) => handleChange('actionType', v)}
            />
            <div>
              <Label className="text-sm mb-2 block">URL</Label>
              <Input
                type="url"
                value={component.data.url || ''}
                onChange={(e) => handleChange('url', e.target.value)}
                placeholder="https://example.com"
                className="w-full"
              />
            </div>
            <SelectInput 
              label="Target"
              value={component.data.target || '_blank'}
              options={[
                { value: '_blank', label: 'New Tab' },
                { value: '_self', label: 'Same Tab' }
              ]}
              onChange={(v: string) => handleChange('target', v)}
            />
          </div>

          <SectionHeader title="Button Options" />
          <div className="space-y-3 pl-4">
            <ColorInput
              label="Background Color"
              value={component.data.backgroundColor || '#007bff'}
              onChange={(v: string) => handleChange('backgroundColor', v)}
            />
            <ColorInput
              label="Text Color"
              value={component.data.color || '#ffffff'}
              onChange={(v: string) => handleChange('color', v)}
            />
            <NumberInput
              label="Font Size"
              value={component.data.fontSize || '16px'}
              onChange={(v: string) => handleChange('fontSize', v)}
            />
            <SelectInput 
              label="Font Weight"
              value={component.data.fontWeight || 'normal'}
              options={[
                { value: 'normal', label: 'Normal' },
                { value: 'bold', label: 'Bold' },
                { value: '600', label: 'Semi Bold' }
              ]}
              onChange={(v: string) => handleChange('fontWeight', v)}
            />
            <NumberInput
              label="Line Height"
              value={component.data.lineHeight || '120%'}
              unit="%"
              onChange={(v: string) => handleChange('lineHeight', v)}
            />
          </div>

          <SectionHeader title="Border" />
          <div className="space-y-3 pl-4">
            <NumberInput
              label="Border Width"
              value={component.data.borderWidth || '0px'}
              onChange={(v: string) => handleChange('borderWidth', v)}
            />
            <ColorInput
              label="Border Color"
              value={component.data.borderColor || '#007bff'}
              onChange={(v: string) => handleChange('borderColor', v)}
            />
            <NumberInput
              label="Border Radius"
              value={component.data.borderRadius || '4px'}
              onChange={(v: string) => handleChange('borderRadius', v)}
            />
          </div>

          <SectionHeader title="Padding" />
          <div className="space-y-3 pl-4">
            <div className="grid grid-cols-2 gap-2">
              <CompactNumberInput
                label="Top"
                value={component.data.paddingTop || '12px'}
                onChange={(v: string) => handleChange('paddingTop', v)}
              />
              <CompactNumberInput
                label="Right"
                value={component.data.paddingRight || '24px'}
                onChange={(v: string) => handleChange('paddingRight', v)}
              />
              <CompactNumberInput
                label="Bottom"
                value={component.data.paddingBottom || '12px'}
                onChange={(v: string) => handleChange('paddingBottom', v)}
              />
              <CompactNumberInput
                label="Left"
                value={component.data.paddingLeft || '24px'}
                onChange={(v: string) => handleChange('paddingLeft', v)}
              />
            </div>
          </div>
        </div>
      );
    case 'image':
      return (
        <div className="space-y-4">
          <SectionHeader title="Image Options" />
          <div className="space-y-3 pl-4">
            <div>
              <Label className="text-sm mb-2 block">Alt Text</Label>
              <Input
                type="text"
                value={component.data.alt || ''}
                onChange={(e) => handleChange('alt', e.target.value)}
                placeholder="Image description"
                className="w-full"
              />
            </div>
            <NumberInput
              label="Width"
              value={component.data.width || 'auto'}
              onChange={(v: string) => handleChange('width', v)}
            />
            <NumberInput
              label="Height"
              value={component.data.height || 'auto'}
              onChange={(v: string) => handleChange('height', v)}
            />
          </div>
        </div>
      );
    case 'divider':
      return (
        <div className="space-y-4">
          <SectionHeader title="Divider Options" />
          <div className="space-y-3 pl-4">
            <NumberInput
              label="Height"
              value={component.data.height || '1px'}
              onChange={(v: string) => handleChange('height', v)}
            />
            <ColorInput
              label="Color"
              value={component.data.color || '#cccccc'}
              onChange={(v: string) => handleChange('color', v)}
            />
          </div>
        </div>
      );
    case 'spacer':
      return (
        <div className="space-y-4">
          <SectionHeader title="Spacer Options" />
          <div className="space-y-3 pl-4">
            <NumberInput
              label="Height"
              value={component.data.height || '20px'}
              onChange={(v: string) => handleChange('height', v)}
            />
          </div>
        </div>
      );
    case 'header':
      return (
        <div className="space-y-4">
          <SectionHeader title="Header Options" />
          <div className="space-y-3 pl-4">
            <NumberInput
              label="Font Size"
              value={component.data.fontSize || '24px'}
              onChange={(v: string) => handleChange('fontSize', v)}
            />
            <ColorInput
              label="Text Color"
              value={component.data.color || '#000000'}
              onChange={(v: string) => handleChange('color', v)}
            />
            <ColorInput
              label="Background"
              value={component.data.backgroundColor || '#f8f9fa'}
              onChange={(v: string) => handleChange('backgroundColor', v)}
            />
            <div>
              <Label className="text-sm mb-2 block">Subtitle</Label>
              <Input
                value={component.data.subtitle || ''}
                onChange={(e) => handleChange('subtitle', e.target.value)}
                placeholder="サブタイトル（省略可）"
              />
            </div>
          </div>
        </div>
      );
    case 'footer':
      return (
        <div className="space-y-4">
          <SectionHeader title="Footer Options" />
          <div className="space-y-3 pl-4">
            <ColorInput
              label="Text Color"
              value={component.data.color || '#666666'}
              onChange={(v: string) => handleChange('color', v)}
            />
            <ColorInput
              label="Background"
              value={component.data.backgroundColor || '#f1f3f4'}
              onChange={(v: string) => handleChange('backgroundColor', v)}
            />
          </div>
        </div>
      );
    case 'social':
      return (
        <div className="space-y-4">
          <SectionHeader title="Social Links" />
          <div className="space-y-3 pl-4">
            {['facebook', 'twitter', 'instagram', 'linkedin'].map(social => (
              <div key={social}>
                <Label className="text-sm mb-2 block capitalize">{social} URL</Label>
                <Input
                  value={component.data[`${social}Url`] || ''}
                  onChange={(e) => handleChange(`${social}Url`, e.target.value)}
                  placeholder={`${social} リンク`}
                />
              </div>
            ))}
          </div>
        </div>
      );
    case 'columns':
      return (
        <div className="space-y-4">
          <SectionHeader title="Column Layout" />
          <div className="space-y-3 pl-4">
            <NumberInput
              label="Column Gap"
              value={component.data.gap || '20px'}
              onChange={(v: string) => handleChange('gap', v)}
            />
          </div>
        </div>
      );
    default:
      return <div className="text-sm text-gray-500">プロパティはありません</div>;
  }
}