'use client';

import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { patchReactUseId } from './useIdSafeguard';

// Patch React.useId as early as possible at the module level
patchReactUseId();

// This is a special component that only renders DragDropContext
// when we're 100% sure it's safe to do so
const DnDSafeContext: React.FC<{
  onDragEnd: (result: any) => void;
  children: React.ReactNode;
}> = ({ onDragEnd, children }) => {
  const [DndComponents, setDndComponents] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  // First useEffect just to confirm we're client-side
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Second useEffect to load the DnD components after a delay
  useEffect(() => {
    if (!isMounted) return;
    
    let mounted = true;
    
    // Patch React.useId again in the effect just to be super safe
    patchReactUseId();
    
    // Delay for 1 full second to ensure hydration is complete
    const timer = setTimeout(async () => {
      if (!mounted) return;
      
      try {
        // Try to safely patch React at the global level as well
        if (typeof window !== 'undefined' && window.React && !window.React.useId) {
          (window.React as any).useId = () => `id-${Math.random().toString(36).substr(2, 9)}`;
        }
        
        // Dynamically import the drag-drop modules
        const dndModule = await import('@hello-pangea/dnd');
        
        if (mounted) {
          // One more useId patch attempt just before we use the components
          patchReactUseId();
          
          // Set components and loading state
          setDndComponents({
            DragDropContext: dndModule.DragDropContext,
            Droppable: dndModule.Droppable,
            Draggable: dndModule.Draggable,
          });
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Failed to load drag-drop modules:", err);
        if (mounted) {
          setHasError(true);
          setIsLoading(false);
        }
      }
    }, 1000);
    
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [isMounted]);
  
  // If not yet mounted or still loading, show a loading indicator
  if (!isMounted || isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
        <CircularProgress size={24} sx={{ mr: 2 }} />
        <Typography>Loading drag and drop functionality...</Typography>
      </Box>
    );
  }
  
  // If there was an error loading the components, show a simple version without drag-drop
  if (hasError || !DndComponents) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="text.secondary" gutterBottom>
          Drag and drop functionality is unavailable
        </Typography>
        <Box sx={{ opacity: 0.8 }}>{children}</Box>
      </Box>
    );
  }
  
  // It's safe to render the DragDropContext now
  const { DragDropContext } = DndComponents;
  
  try {
    return (
      <DragDropContext onDragEnd={onDragEnd}>
        {children}
      </DragDropContext>
    );
  } catch (error) {
    console.error("Error rendering DragDropContext:", error);
    // Final fallback if something still goes wrong at render time
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error" gutterBottom>
          There was an error rendering the template editor
        </Typography>
        <Box sx={{ opacity: 0.8 }}>{children}</Box>
      </Box>
    );
  }
};

export default DnDSafeContext; 