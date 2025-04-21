/**
 * Performance optimization utility functions
 */

/**
 * Defers non-critical JavaScript
 * @param scriptUrl The URL of the script to defer
 * @param id Optional ID for the script tag
 * @param async Whether to load the script asynchronously (default: true)
 */
export const loadScriptDeferred = (scriptUrl: string, id?: string, async = true): void => {
  // Only run in browser
  if (typeof window === 'undefined') return;
  
  // Create a new script element
  const script = document.createElement('script');
  script.src = scriptUrl;
  script.async = async;
  if (id) script.id = id;
  
  // Append the script to the end of body to not block rendering
  window.addEventListener('load', () => {
    document.body.appendChild(script);
  });
};

/**
 * Prefetches a URL to improve perceived performance
 * @param url The URL to prefetch
 */
export const prefetchURL = (url: string): void => {
  // Only run in browser
  if (typeof window === 'undefined') return;
  
  // Create link element for prefetching
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = url;
  
  // Add to head
  document.head.appendChild(link);
};

/**
 * Removes unused CSS
 * @param cssSelector The CSS selector to check for usage
 */
export const removeUnusedCSS = (cssSelector: string): void => {
  // Only run in browser and in production
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'production') return;
  
  // Get all stylesheets
  const stylesheets = Array.from(document.styleSheets);
  
  stylesheets.forEach(stylesheet => {
    try {
      // Check if the stylesheet is accessible (same origin)
      const rules = Array.from(stylesheet.cssRules);
      
      rules.forEach((rule, index) => {
        if (rule instanceof CSSStyleRule && rule.selectorText === cssSelector) {
          // Check if the selector is used in the document
          if (!document.querySelector(cssSelector)) {
            // Remove the unused CSS rule
            stylesheet.deleteRule(index);
          }
        }
      });
    } catch (e) {
      // Cross-origin stylesheet, cannot access rules
      console.debug('Cannot access cross-origin stylesheet');
    }
  });
};

/**
 * Initialize performance optimizations
 */
export const initializePerformanceOptimizations = (): void => {
  // Only run in browser and in production
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'production') return;
  
  // Implement route-based code splitting by prefetching probable next pages
  document.querySelectorAll('a[href^="/"]:not([prefetch="false"])').forEach(link => {
    const href = link.getAttribute('href');
    if (href) prefetchURL(href);
  });
  
  // Register performance marks
  if ('performance' in window) {
    window.performance.mark('app-initialized');
    
    // Measure time to interactive
    if (document.readyState === 'complete') {
      window.performance.mark('time-to-interactive');
      window.performance.measure('TTI', 'navigationStart', 'time-to-interactive');
    } else {
      window.addEventListener('load', () => {
        setTimeout(() => {
          window.performance.mark('time-to-interactive');
          window.performance.measure('TTI', 'navigationStart', 'time-to-interactive');
        }, 100);
      });
    }
  }
}; 