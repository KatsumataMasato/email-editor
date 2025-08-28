'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';

interface DeleteButtonProps {
  onDelete: () => void;
  className?: string;
}

export function DeleteButton({ onDelete, className = '' }: DeleteButtonProps) {
  return (
    <div className={`bg-red-600 text-white p-1 rounded shadow-md ${className}`}>
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }} 
        className="hover:bg-red-700 p-1 rounded"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}