'use client';

import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, GripVertical } from 'lucide-react';
import { ImageComponent } from '../atoms/ImageComponent';

interface EmailComponent {
  id: string;
  type: string;
  data: any;
  gridPosition: { x: number; y: number };
}

interface SortableGridItemProps {
  component: EmailComponent;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onUpdate: (id: string, data: any) => void;
  onDelete: (id: string) => void;
}

export function SortableGridItem({
  component,
  isSelected,
  onSelect,
  onUpdate,
  onDelete
}: SortableGridItemProps) {
  const [isImageLoading, setIsImageLoading] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: component.id,
    data: { component }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleImageUpload = async (file: File) => {
    setIsImageLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        onUpdate(component.id, { ...component.data, src: data.url });
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsImageLoading(false);
    }
  };

  const renderComponent = () => {
    switch (component.type) {
      case 'text':
        return (
          <CardContent 
            style={{ 
              fontSize: component.data.fontSize || '16px',
              color: component.data.color || '#000000',
              textAlign: component.data.textAlign || 'left',
              fontWeight: component.data.fontWeight || 'normal',
              fontFamily: component.data.fontFamily || 'Arial',
              lineHeight: component.data.lineHeight || '120%',
              letterSpacing: component.data.letterSpacing || '0px',
              padding: '16px',
            }}
            contentEditable
            onBlur={(e) => onUpdate(component.id, { ...component.data, text: e.target.textContent })}
            suppressContentEditableWarning={true}
          >
            {component.data.text || 'テキストを入力してください'}
          </CardContent>
        );
      
      case 'image':
        return (
          <CardContent className="text-center p-4">
            <ImageComponent
              src={component.data.src}
              alt={component.data.alt}
              width={component.data.width}
              height={component.data.height}
              onUpdate={(data) => onUpdate(component.id, data)}
              onImageUpload={handleImageUpload}
              isLoading={isImageLoading}
            />
          </CardContent>
        );
      
      case 'button':
        return (
          <CardContent className="text-center p-4">
            <div
              style={{
                display: 'inline-block',
                backgroundColor: component.data.backgroundColor || '#007bff',
                color: component.data.color || '#ffffff',
                padding: '12px 24px',
                borderRadius: '4px',
                fontSize: component.data.fontSize || '16px',
                cursor: 'text',
                minHeight: '20px',
                minWidth: '60px'
              }}
              contentEditable
              onBlur={(e) => onUpdate(component.id, { ...component.data, text: e.target.textContent })}
              suppressContentEditableWarning={true}
            >
              {component.data.text || 'ボタンテキスト'}
            </div>
          </CardContent>
        );
      
      case 'divider':
        return (
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
        );
      
      case 'spacer':
        return (
          <CardContent 
            style={{ 
              height: component.data.height || '20px',
              backgroundColor: 'transparent'
            }}
          />
        );
      
      case 'header':
        return (
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
              onBlur={(e) => onUpdate(component.id, { ...component.data, title: e.target.textContent })}
              suppressContentEditableWarning={true}
            >
              {component.data.title || 'メールヘッダー'}
            </h1>
          </CardContent>
        );
      
      case 'footer':
        return (
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
              onBlur={(e) => onUpdate(component.id, { ...component.data, content: e.target.textContent })}
              suppressContentEditableWarning={true}
            >
              {component.data.content || 'フッター情報・配信停止リンクなど'}
            </div>
          </CardContent>
        );
      
      case 'social':
        return (
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
        );
      
      case 'columns':
        const columnCount = component.data.columnCount || 2;
        return (
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
                  onBlur={(e) => onUpdate(component.id, { ...component.data, [`column${col}`]: e.target.textContent })}
                  suppressContentEditableWarning={true}
                  className="min-h-[60px]"
                >
                  {component.data[`column${col}`] || `列 ${col} の内容`}
                </div>
              </div>
            ))}
          </CardContent>
        );
      
      default:
        return null;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`w-full h-full relative border-2 ${isSelected ? 'border-blue-500 shadow-lg' : 'border-transparent'} hover:border-blue-300 group transition-all duration-200`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(component.id);
      }}
    >
      <Card className="w-full h-full">
        {renderComponent()}
      </Card>

      {/* ドラッグハンドル */}
      <div 
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 p-1 bg-gray-600 rounded cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical size={12} className="text-white" />
      </div>
      
      {isSelected && (
        <div className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded shadow-md">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(component.id);
            }} 
            className="hover:bg-red-700 p-1 rounded"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}
    </div>
  );
}