'use client';

import React, { useEffect, useState, useRef } from 'react';

// Simple polyfill for React 18's useId hook
// This helps when the library tries to access React.useId before it's available
if (typeof React !== 'undefined' && !React.useId) {
  let id = 0;
  React.useId = () => `:r${id++}:`;
}

import { 
  DragDropContext, 
  Droppable, 
  Draggable,
  DropResult,
  DroppableProvided,
  DraggableProvided
} from '@hello-pangea/dnd';

// Simple NoSSR wrapper component
const NoSSR: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  if (!isMounted) {
    return null;
  }
  
  return <>{children}</>;
};

// Wrapper component interface
interface DragDropWrapperProps {
  children?: React.ReactNode;
  onDragEnd: (result: DropResult) => void;
  droppableId: string;
  items: Array<{id: string; content: React.ReactNode}>;
}

/**
 * Client-side only wrapper for @hello-pangea/dnd components to prevent hydration issues
 */
const DragDropWrapper: React.FC<DragDropWrapperProps> = ({ 
  children, 
  onDragEnd, 
  droppableId,
  items 
}) => {
  // Track component mounting state
  const [isMounted, setIsMounted] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  // Use ref to track if we're in browser environment
  const isClientRef = useRef<boolean | null>(null);
  
  // Initialization in render vs useEffect to ensure immediate availability
  if (typeof window !== 'undefined' && isClientRef.current === null) {
    isClientRef.current = true;
  }
  
  // Effect to handle component mounting state
  useEffect(() => {
    // A longer delay to ensure we're well past hydration
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 100);
    
    return () => {
      clearTimeout(timer);
      setIsMounted(false);
    };
  }, []);

  // Error handler for the drag-drop context
  const handleError = (error: Error) => {
    console.error('Error in DragDropWrapper:', error);
    setHasError(true);
  };

  // If not in client or not mounted or has error, render a placeholder version
  if (!isClientRef.current || !isMounted || hasError) {
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
        {hasError && (
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

  // Wrap the drag-drop functionality in an error boundary
  try {
    // Wrap in NoSSR component to completely disable SSR
    return (
      <NoSSR>
        <div data-testid="dnd-wrapper">
          {/* Key forces re-render after hydration */}
          <DragDropContext key={`drag-drop-context-${droppableId}`} onDragEnd={onDragEnd}>
            <Droppable droppableId={droppableId}>
              {(provided: DroppableProvided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  data-testid="droppable-container"
                >
                  {items.map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                      {(provided: DraggableProvided) => (
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
          </DragDropContext>
          {children}
        </div>
      </NoSSR>
    );
  } catch (error) {
    console.error('Error rendering DragDropWrapper:', error);
    setHasError(true);
    
    // Fallback UI when an error occurs
    return (
      <div data-testid="dnd-error" style={{ minHeight: '200px' }}>
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
      </div>
    );
  }
};

export default DragDropWrapper; 