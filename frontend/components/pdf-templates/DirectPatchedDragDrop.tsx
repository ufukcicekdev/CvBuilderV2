'use client';

import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { monkeyPatchDnd, ensureReactUseId, fixDragDropContext } from './monkeyPatchDnd';

// Apply the monkeypatch as early as possible
if (typeof window !== 'undefined') {
  ensureReactUseId();
  monkeyPatchDnd();
}

// This component completely bypasses the useId issue by using our monkeypatched versions
// It's a last resort for when all other approaches fail
const DirectPatchedDragDrop: React.FC<{
  onDragEnd: (result: any) => void;
  droppableId: string;
  items: Array<{id: string; content: React.ReactNode}>;
  children?: React.ReactNode;
}> = ({ children, onDragEnd, droppableId, items }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [dndComponents, setDndComponents] = useState<any>(null);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    let mounted = true;
    
    // Apply all our patches
    ensureReactUseId();
    monkeyPatchDnd();
    fixDragDropContext();
    
    // Wait a full 2 seconds before even attempting to load the dnd components
    const timer = setTimeout(async () => {
      if (!mounted) return;
      
      try {
        // Make another attempt to fix all issues
        await monkeyPatchDnd();
        await fixDragDropContext();
        
        // Now import the patched modules
        const dndModule = await import('@hello-pangea/dnd');
        
        if (mounted) {
          setDndComponents({
            DragDropContext: dndModule.DragDropContext,
            Droppable: dndModule.Droppable,
            Draggable: dndModule.Draggable
          });
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Failed to load drag-drop components:', error);
        if (mounted) {
          setError(error as Error);
          setIsLoading(false);
        }
      }
    }, 2000);
    
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, []);
  
  // Loading state
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
        <CircularProgress size={24} sx={{ mr: 2 }} />
        <Typography>Loading drag and drop functionality...</Typography>
      </Box>
    );
  }
  
  // Error state
  if (error || !dndComponents) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error" gutterBottom>
          Drag and drop functionality is unavailable
        </Typography>
        <Typography color="text.secondary" variant="body2" sx={{ mb: 2 }}>
          {error?.message && `Error: ${error.message}`}
        </Typography>
        <Box sx={{ opacity: 0.8 }}>
          {items.map((item) => (
            <Box 
              key={item.id} 
              sx={{ 
                p: 2, 
                my: 1, 
                bgcolor: 'background.paper',
                border: '1px solid #e0e0e0',
                borderRadius: 1
              }}
            >
              {item.content}
            </Box>
          ))}
        </Box>
      </Box>
    );
  }
  
  // If we got here, we have the components
  const { DragDropContext, Droppable, Draggable } = dndComponents;
  
  try {
    // Wrap all the rendering logic in a try/catch
    return (
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId={droppableId}>
          {(provided: any) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              style={{ padding: '8px' }}
            >
              {items.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(provided: any) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{
                        ...provided.draggableProps.style,
                        marginBottom: '8px'
                      }}
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
        {children}
      </DragDropContext>
    );
  } catch (renderError) {
    console.error('Error in DirectPatchedDragDrop render:', renderError);
    
    // Emergency fallback if the drag-drop components fail to render
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error" gutterBottom>
          Template builder encountered an error
        </Typography>
        <Box sx={{ opacity: 0.8 }}>
          {items.map((item) => (
            <Box 
              key={item.id} 
              sx={{ 
                p: 2, 
                my: 1, 
                bgcolor: 'background.paper',
                border: '1px solid #e0e0e0',
                borderRadius: 1
              }}
            >
              {item.content}
            </Box>
          ))}
        </Box>
      </Box>
    );
  }
};

export default DirectPatchedDragDrop; 