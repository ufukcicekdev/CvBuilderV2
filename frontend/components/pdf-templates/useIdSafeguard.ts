'use client';

import React from 'react';

/**
 * Safeguards against React.useId issues in server-side rendering
 * or during hydration with libraries that depend on useId.
 * 
 * This should be imported and called at the top level of any component
 * that uses libraries depending on React.useId, like drag-and-drop libraries.
 */
export function patchReactUseId(): void {
  // Only run in the browser
  if (typeof window === 'undefined') return;
  
  // Add a useId implementation if it's missing
  if (!React.useId) {
    let id = 0;
    console.info('Patching React.useId with a mock implementation');
    (React as any).useId = () => `:r${id++}:`;
  }
}

/**
 * Safely generates an ID that works both on the server and client.
 * Use this instead of React.useId() in components that need to work
 * in both environments.
 */
export function safeId(prefix: string = 'id'): string {
  // Use a timestamp + random number to create a unique ID
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

// Create a named object for export to avoid ESLint warning
const safeGuardUtils = { 
  patchReactUseId, 
  safeId 
};

export default safeGuardUtils; 