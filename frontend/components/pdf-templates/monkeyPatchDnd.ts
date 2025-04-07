'use client';

import React from 'react';

// This file contains a monkeypatch for @hello-pangea/dnd to prevent the "Cannot read properties of null (reading 'useId')" error
// It works by directly patching the library's imports and functions that use React.useId

// Keep track of whether the patch has been applied
let isPatchApplied = false;

// Function to generate a unique ID without using React.useId
const generateSafeId = () => `dnd-id-${Math.random().toString(36).substr(2, 9)}`;

export async function monkeyPatchDnd() {
  // Only patch once
  if (isPatchApplied) return;
  
  try {
    // Only run in the browser
    if (typeof window === 'undefined') return;
    
    // console.log('Applying monkeypatch to @hello-pangea/dnd...');
    
    // Import the module we need to patch
    const dndModule = await import('@hello-pangea/dnd');
    
    // Store original implementations
    const originalDragDropContext = dndModule.DragDropContext;
    
    // Create a wrapper for DragDropContext that doesn't use useId
    const SafeDragDropContext = (props: any) => {
      try {
        // Attempt to use the original component
        return originalDragDropContext(props);
      } catch (error) {
        // If it fails with a useId error, we'll monkey patch the library's internal functions
        // console.log('DragDropContext failed, applying emergency patch');
        
        // If we get here, the error is already happening, so now we apply a more invasive patch
        // This directly patches the internal function that calls useId
        if (dndModule.DragDropContext.toString().includes('useUniqueContextId')) {
          // @ts-ignore - We need to modify the internal function for emergencies only
          dndModule.useUniqueContextId = () => generateSafeId();
          // console.log('Emergency patch applied to useUniqueContextId');
        }
        
        // Try again with the patched function
        return originalDragDropContext(props);
      }
    };
    
    // Replace the original with our safe version
    // @ts-ignore - We're replacing the library exports
    dndModule.DragDropContext = SafeDragDropContext;
    
    // Also try to modify the actual module in the import cache
    if (typeof require !== 'undefined' && require.cache) {
      try {
        const modulePath = Object.keys(require.cache).find(
          (key) => key.includes('@hello-pangea/dnd')
        );
        
        if (modulePath && require.cache[modulePath]) {
          const cachedModule = require.cache[modulePath];
          if (cachedModule.exports) {
            cachedModule.exports.DragDropContext = SafeDragDropContext;
            // console.log('Patched module in require cache');
          }
        }
      } catch (e) {
        // console.error('Failed to patch module in require cache:', e);
      }
    }
    
    // On top of that, we can patch the window React object directly
    if (window.React && !window.React.useId) {
      // @ts-ignore - Adding useId to global React
      window.React.useId = generateSafeId;
      // console.log('Patched global React.useId');
    }
    
    isPatchApplied = true;
    // console.log('Monkeypatch applied successfully');
  } catch (error) {
    // console.error('Failed to apply monkeypatch:', error);
  }
}

export function ensureReactUseId() {
  if (typeof window === 'undefined') return;
  
  try {
    // If React is available on the window object
    if (window.React) {
      // Only add useId if it doesn't exist
      if (!window.React.useId) {
        // @ts-ignore - Adding useId to global React
        window.React.useId = () => generateSafeId();
        // console.log('Added missing useId to global React');
      }
    }
    
    // For good measure, ensure React has useId available
    if (!React.useId) {
      // @ts-ignore - Adding useId to React
      React.useId = () => generateSafeId();
      // console.log('Added missing useId to React');
    }
  } catch (error) {
    // console.error('Failed to ensure React.useId:', error);
  }
}

// Export a more specific function to fix the DragDropContext directly
export async function fixDragDropContext() {
  if (typeof window === 'undefined') return;
  try {
    const dndModule = await import('@hello-pangea/dnd');
    const contextProto = Object.getPrototypeOf(dndModule.DragDropContext);
    
    // If we can find the render method
    if (contextProto && contextProto.render) {
      const originalRender = contextProto.render;
      
      // Replace it with a safer version
      contextProto.render = function safeRender(...args: any[]) {
        try {
          // Ensure React.useId exists before rendering
          ensureReactUseId();
          
          // Try the original render
          return originalRender.apply(this, args);
        } catch (error) {
          // console.error('Error in DragDropContext render, using fallback:', error);
          
          // Provide a fallback that just renders children
          return this.props.children;
        }
      };
      
      // console.log('Fixed DragDropContext render method');
    }
  } catch (error) {
    // console.error('Failed to fix DragDropContext:', error);
  }
}

// Call the monkeypatch immediately if in the browser
if (typeof window !== 'undefined') {
  // Patch as soon as possible
  monkeyPatchDnd();
  
  // Also patch when the page is fully loaded
  window.addEventListener('load', () => {
    monkeyPatchDnd();
    fixDragDropContext();
  });
  
  // And after a short delay to make sure all modules are loaded
  setTimeout(() => {
    monkeyPatchDnd();
    fixDragDropContext();
  }, 500);
} 