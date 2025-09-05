'use client';

import React, { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  useDraggable,
  useDroppable,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';

function DraggableBox({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    data: { type: 'test' }
  });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="w-20 h-20 bg-blue-500 text-white flex items-center justify-center cursor-grab active:cursor-grabbing rounded border-2 border-blue-600"
    >
      {children}
    </div>
  );
}

function DroppableArea({ children }: { children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'test-droppable',
  });

  return (
    <div
      ref={setNodeRef}
      className={`w-64 h-64 border-2 border-dashed ${
        isOver ? 'border-green-500 bg-green-100' : 'border-gray-400 bg-gray-100'
      } flex items-center justify-center rounded`}
    >
      {children}
    </div>
  );
}

export function TestDragDrop() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [droppedItems, setDroppedItems] = useState<string[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    console.log('Test drag started:', event.active.id);
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    console.log('Test drag ended:', { active: active.id, over: over?.id });
    
    setActiveId(null);
    
    if (over && over.id === 'test-droppable') {
      setDroppedItems(prev => [...prev, active.id as string]);
    }
  };

  return (
    <div className="p-8 bg-white border-2 border-red-500 rounded">
      <h3 className="text-lg font-bold mb-4 text-red-600">Drag & Drop Test</h3>
      
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-8">
          <div>
            <h4 className="text-sm font-medium mb-2">Draggable Items:</h4>
            <div className="space-y-2">
              <DraggableBox id="test-1">Test 1</DraggableBox>
              <DraggableBox id="test-2">Test 2</DraggableBox>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Drop Zone:</h4>
            <DroppableArea>
              {droppedItems.length === 0 ? (
                <p className="text-gray-500">Drop here!</p>
              ) : (
                <div>
                  <p className="text-green-600">Dropped:</p>
                  {droppedItems.map((item, idx) => (
                    <p key={idx} className="text-sm">{item}</p>
                  ))}
                </div>
              )}
            </DroppableArea>
          </div>
        </div>
      </DndContext>
    </div>
  );
}