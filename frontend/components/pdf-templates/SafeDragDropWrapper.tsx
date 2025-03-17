'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Box } from '@mui/material';
import { patchReactUseId } from './useIdSafeguard';
import DnDSafeContext from './DnDSafeContext';

// Patch React.useId as early as possible
patchReactUseId();

// Use a completely separate implementation that doesn't try to initialize DnD libraries
// until we're 100% sure we're on the client side
const SafeDragDropWrapper: React.FC<{
  children?: React.ReactNode;
  onDragEnd: (result: any) => void;
  droppableId: string;
  items: Array<{id: string; content: React.ReactNode}>;
}> = ({ children, onDragEnd, droppableId, items }) => {
  // Use state to track when we're safe to load drag-drop
  const [isDragDropSafe, setIsDragDropSafe] = useState(false);
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);
  const [dndModules, setDndModules] = useState<any>(null);
  const [error, setError] = useState<Error | null>(null);
  
  // Wait until we're definitely on the client side
  useEffect(() => {
    // Patch React.useId again in the effect to be extra safe
    patchReactUseId();
    
    let mounted = true;
    
    // 500ms delay to ensure we're definitely past hydration
    const timer = setTimeout(async () => {
      if (mounted) {
        try {
          // Dynamically import the drag-drop modules only when we're sure we're client-side
          // We only need Droppable and Draggable here since DragDropContext is handled by DnDSafeContext
          const { Droppable, Draggable } = await import('@hello-pangea/dnd');
          
          if (mounted) {
            setDndModules({ Droppable, Draggable });
            setHasAttemptedLoad(true);
            // Set a second delay before actually showing the DnD components
            setTimeout(() => {
              if (mounted) {
                setIsDragDropSafe(true);
              }
            }, 100);
          }
        } catch (err) {
          console.error("Failed to load drag-drop modules:", err);
          setError(err as Error);
          setHasAttemptedLoad(true);
        }
      }
    }, 500);
    
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, []);
  
  // Always render a placeholder while loading or if loading failed
  if (!isDragDropSafe || !dndModules || error) {
    return (
      <div data-testid="dnd-placeholder" style={{ minHeight: '200px' }}>
        <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '4px' }}>
          {items.map((item) => (
            <div key={item.id} style={{ 
              padding: '0.5rem', 
              margin: '0.5rem 0', 
              background: 'white',
              borderRadius: '4px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              {item.content}
            </div>
          ))}
        </div>
        {error && hasAttemptedLoad && (
          <div style={{ 
            padding: '0.5rem', 
            margin: '0.5rem 0', 
            background: '#ffebee',
            color: '#d32f2f',
            borderRadius: '4px',
            textAlign: 'center' 
          }}>
            There was an error loading the drag and drop functionality.
            The items are still displayed but cannot be reordered.
          </div>
        )}
      </div>
    );
  }
  
  // Now it's safe to use the DnD components
  const { Droppable, Draggable } = dndModules;
  
  return (
    <div data-testid="dnd-wrapper">
      <DnDSafeContext onDragEnd={onDragEnd}>
        <Droppable droppableId={droppableId}>
          {(provided: any) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              data-testid="droppable-container"
            >
              {items.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(provided: any) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      data-testid={`draggable-item-${item.id}`}
                    >
                      {item.content}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DnDSafeContext>
      {children}
    </div>
  );
};

export default SafeDragDropWrapper; 