'use client';

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

interface DraggableItemProps {
  id: string;
  type: string;
  children: React.ReactNode;
  data?: any;
}

export function DraggableItem({ id, type, children, data }: DraggableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id,
    data: { type, ...data }
  });

  console.log('DraggableItem created:', { id, type, isDragging });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="cursor-grab active:cursor-grabbing"
      {...listeners}
      {...attributes}
    >
      {children}
    </div>
  );
}