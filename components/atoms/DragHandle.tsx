'use client';

import React from 'react';
import { GripVertical } from 'lucide-react';

interface DragHandleProps {
  className?: string;
}

export function DragHandle({ className = '' }: DragHandleProps) {
  return (
    <div className={`p-1 bg-gray-600 rounded cursor-grab active:cursor-grabbing ${className}`}>
      <GripVertical size={12} className="text-white" />
    </div>
  );
}