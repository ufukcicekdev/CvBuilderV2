/**
 * Performance optimization utility functions
 * Agresif optimizasyon için güncellendi
 */

// Advanced performance optimization utilities
import type { NextWebVitalsMetric } from 'next/app';

/**
 * Initializes performance optimizations for the application
 */
export const initializePerformanceOptimizations = (): void => {
  if (typeof window === 'undefined') return;
  
  // Start immediate critical optimizations
  optimizeCriticalRenderingPath();
  preloadCriticalAssets();
  optimizeCriticalElements();
  
  // Register performance marker
  if ('performance' in window) {
    window.performance.mark('app-init');
  }
  
  // When DOM content is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      optimizeAfterDOM();
    });
  } else {
    optimizeAfterDOM();
  }
  
  // When everything is loaded
  window.addEventListener('load', () => {
    optimizeAfterLoad();
    
    // Run aggressive optimizations after initial page load
    setTimeout(() => {
      optimizeImages();
      optimizeFonts();
      deferNonCriticalResources();
      optimizeAnimations();
      detectAndFixLayoutShifts();
      optimizeLargestContentfulPaint();
    }, 50);
  });
};

/**
 * Preload critical assets
 */
function preloadCriticalAssets(): void {
  // Define critical assets to preload
  const criticalAssets = [
    { url: '/logo.svg', type: 'image/svg+xml', as: 'image' },
    { url: '/og-image.svg', type: 'image/svg+xml', as: 'image' }
  ];
  
  // Create preload for each critical asset
  criticalAssets.forEach(asset => {
    // Check if preload already exists
    if (document.querySelector(`link[rel="preload"][href="${asset.url}"]`)) return;
    
    const preloadLink = document.createElement('link');
    preloadLink.rel = 'preload';
    preloadLink.href = asset.url;
    preloadLink.as = asset.as;
    preloadLink.type = asset.type;
    document.head.appendChild(preloadLink);
    
    // For SVG images, also add them to the body to ensure browser has them in cache
    if (asset.url.endsWith('.svg') && asset.type === 'image/svg+xml') {
      const img = new Image();
      img.src = asset.url;
      img.style.position = 'absolute';
      img.style.opacity = '0';
      img.style.pointerEvents = 'none';
      img.style.width = '1px';
      img.style.height = '1px';
      img.onload = () => {
        // Remove after loading
        if (img.parentNode) {
          img.parentNode.removeChild(img);
        }
      };
      
      // Add to body temporarily to force loading
      if (document.body) {
        document.body.appendChild(img);
      }
    }
  });
}

/**
 * Optimize critical elements immediately
 */
function optimizeCriticalElements(): void {
  // Inline critical CSS
  const criticalCSS = `
    .hero-section {
      background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
      padding: 48px 0;
      min-height: 600px;
      overflow: hidden;
      position: relative;
    }
    @media (max-width: 768px) {
      .hero-section {
        padding: 32px 0;
        min-height: 800px;
      }
    }
    
    .hero-image-wrapper {
      position: relative;
      height: 500px;
      width: 100%;
    }
    @media (max-width: 768px) {
      .hero-image-wrapper {
        height: 300px;
      }
    }
    
    .critical-image {
      width: 100%;
      height: 100%;
      object-fit: contain;
      background-color: transparent;
    }
    
    svg, .svg-icon, img[src$=".svg"] {
      background-color: transparent !important;
    }
  `;
  
  // Add critical CSS to head
  const styleEl = document.createElement('style');
  styleEl.textContent = criticalCSS;
  document.head.appendChild(styleEl);
  
  // Set eager loading for critical images
  document.querySelectorAll('img.critical-image').forEach(img => {
    const imgElement = img as HTMLImageElement;
    imgElement.loading = 'eager';
    imgElement.decoding = 'async';
    
    // Force hero image to load if it's an SVG
    if (imgElement.src.endsWith('.svg')) {
      // Create a new image object to preload
      const preloadImg = new Image();
      preloadImg.src = imgElement.src;
      
      // When preloaded image is ready, ensure the visible one shows
      preloadImg.onload = () => {
        imgElement.style.visibility = 'visible';
        imgElement.style.opacity = '1';
      };
    }
  });
  
  // Fix layout shifts by setting explicit dimensions
  const heroSection = document.querySelector('.hero-section');
  if (heroSection) {
    const isMobile = window.innerWidth < 768;
    (heroSection as HTMLElement).style.minHeight = isMobile ? '800px' : '600px';
  }
  
  // Fix hero image container
  const heroImageWrapper = document.querySelector('.hero-image-wrapper');
  if (heroImageWrapper) {
    const isMobile = window.innerWidth < 768;
    (heroImageWrapper as HTMLElement).style.height = isMobile ? '300px' : '500px';
  }
}

/**
 * Optimizations to run after DOM is loaded but before all resources
 */
function optimizeAfterDOM(): void {
  // Defer non-critical images
  deferNonCriticalImages();
  
  // Disable animations until page is interactive
  disableAnimationsTemporarily();
}

/**
 * Defer non-critical images
 */
function deferNonCriticalImages(): void {
  document.querySelectorAll('img:not(.critical-image)').forEach(img => {
    if ((img as HTMLImageElement).loading !== 'eager') {
      (img as HTMLImageElement).loading = 'lazy';
    }
  });
}

/**
 * Temporarily disable animations until page is fully loaded
 */
function disableAnimationsTemporarily(): void {
  const styleEl = document.createElement('style');
  styleEl.id = 'disable-animations';
  styleEl.textContent = `
    /* Sadece büyük animasyonları devre dışı bırak, ikonları etkileme */
    *:not(.critical-element):not(svg):not(.MuiSvgIcon-root):not(.MuiIcon-root):not([class*="icon"]):not([class*="Icon"]) {
      animation-duration: 0s !important;
    }
    
    /* Temel dönüşümleri ve geçişleri korunması gereken elementler dışında devre dışı bırak */
    *:not(.critical-element):not(svg):not(.MuiSvgIcon-root):not(.MuiIcon-root):not([class*="icon"]):not([class*="Icon"]) {
      transition-duration: 0s !important;
    }
    
    /* İkonlar ve SVG elementleri için özgün stiller koru */
    svg, .MuiSvgIcon-root, .MuiIcon-root, [class*="icon"], [class*="Icon"] {
      background-color: transparent !important;
    }
  `;
  document.head.appendChild(styleEl);
  
  // Re-enable animations after page is loaded
  window.addEventListener('load', () => {
    const disableStyle = document.getElementById('disable-animations');
    if (disableStyle && disableStyle.parentNode) {
      disableStyle.parentNode.removeChild(disableStyle);
    }
  });
}

/**
 * Optimizations to run after page is fully loaded
 */
function optimizeAfterLoad(): void {
  // Prefetch likely navigation destinations
  prefetchLinks();
  
  // Start monitoring performance metrics
  monitorPerformance();
  
  // Implement aggressive optimizations for LCP improvement
  optimizeLargestContentfulPaint();
  
  // Implement code splitting for delayed loading
  implementIntersectionObservers();
}

/**
 * Prefetch links that are likely to be clicked
 */
function prefetchLinks(): void {
  const importantLinks = ['/register', '/login', '/dashboard/create-cv', '/pricing'];
  
  // Prefetch important links
  importantLinks.forEach(url => {
    const prefetchLink = document.createElement('link');
    prefetchLink.rel = 'prefetch';
    prefetchLink.as = 'document';
    prefetchLink.href = url;
    document.head.appendChild(prefetchLink);
  });
  
  // Prefetch visible links
  setTimeout(() => {
    document.querySelectorAll('a[href^="/"]').forEach(link => {
      const rect = link.getBoundingClientRect();
      const isVisible = rect.top <= window.innerHeight && rect.bottom >= 0;
      
      if (isVisible) {
        const url = link.getAttribute('href');
        if (!url || importantLinks.includes(url)) return;
        
        const prefetchLink = document.createElement('link');
        prefetchLink.rel = 'prefetch';
        prefetchLink.as = 'document';
        prefetchLink.href = url;
        document.head.appendChild(prefetchLink);
      }
    });
  }, 1000);
}

/**
 * Monitor key performance metrics
 */
function monitorPerformance(): void {
  if (!('PerformanceObserver' in window)) return;

  // Observe LCP (Largest Contentful Paint)
  try {
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1] as any;
      
      if (lastEntry) {
        const lcpTime = Math.round(lastEntry.startTime);
        console.log(`LCP: ${lcpTime}ms`);
        
        // Log LCP element
        if (lastEntry.element) {
          console.log('LCP element:', lastEntry.element);
        }
        
        // Send to analytics
        if ('gtag' in window) {
          (window as any).gtag('event', 'web_vitals', {
            event_category: 'Web Vitals',
            event_label: 'LCP',
            value: lcpTime,
            non_interaction: true
          });
        }
      }
    }).observe({ type: 'largest-contentful-paint', buffered: true });
  } catch (e) {
    console.error('Error monitoring LCP', e);
  }

  // Observe CLS (Cumulative Layout Shift)
  try {
    let clsValue = 0;
    let clsEntries: any[] = [];
    
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries() as any[]) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          clsEntries.push({
            value: entry.value,
            time: entry.startTime,
            source: entry.sources || []
          });
        }
      }
      
      console.log(`Current CLS: ${clsValue.toFixed(3)}`);
      
      // If CLS is high, log detailed information about sources
      if (clsValue > 0.1 && clsEntries.length > 0) {
        console.warn('CLS is high. Layout shift sources:', clsEntries);
      }
      
      // Send to analytics
      if ('gtag' in window) {
        (window as any).gtag('event', 'web_vitals', {
          event_category: 'Web Vitals',
          event_label: 'CLS',
          value: Math.round(clsValue * 1000),
          non_interaction: true
        });
      }
    }).observe({ type: 'layout-shift', buffered: true });
  } catch (e) {
    console.error('Error monitoring CLS', e);
  }
}

/**
 * Optimize the critical rendering path
 */
function optimizeCriticalRenderingPath(): void {
  if (typeof window === 'undefined') return;
  
  // Preload critical resources
  preloadCriticalResources();
  
  // Add resource hints for better performance
  addResourceHints();
  
  // Identify and mark critical content
  markCriticalContent();
  
  // Set up observer to monitor LCP element
  observeLargestContentfulPaint();
  
  // Inject performance CSS
  injectPerformanceCSS();
  
  // Use font-display: swap via CSS instead of direct property
  const fontStyleEl = document.createElement('style');
  fontStyleEl.textContent = `
    @font-face {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      font-display: swap;
    }
  `;
  document.head.appendChild(fontStyleEl);
  
  // Block CSS rendering for non-critical styles
  const links = document.querySelectorAll('link[rel="stylesheet"]:not([data-critical="true"])');
  links.forEach(link => {
    (link as HTMLLinkElement).media = 'print';
    setTimeout(() => {
      (link as HTMLLinkElement).media = 'all';
    }, 500);
  });
}

/**
 * Preload critical resources
 */
function preloadCriticalResources() {
  if (typeof window === 'undefined') return;

  const criticalResources = [
    { url: '/logo.svg', type: 'image' },
    { url: '/og-image.svg', type: 'image' },
    { url: '/fonts/main-font.woff2', type: 'font' }
  ];

  criticalResources.forEach(resource => {
    if (document.querySelector(`link[href="${resource.url}"]`)) return;

    const preloadLink = document.createElement('link');
    preloadLink.rel = 'preload';
    preloadLink.href = resource.url;
    preloadLink.as = resource.type;
    
    if (resource.type === 'font') {
      preloadLink.setAttribute('crossorigin', 'anonymous');
      preloadLink.setAttribute('type', 'font/woff2');
    } else if (resource.type === 'image' && resource.url.endsWith('.svg')) {
      preloadLink.setAttribute('type', 'image/svg+xml');
    }
    
    document.head.appendChild(preloadLink);
  });
}

/**
 * Add resource hints for common third-party domains
 */
function addResourceHints() {
  if (typeof window === 'undefined') return;
  
  const domains = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://www.googletagmanager.com'
  ];

  domains.forEach(domain => {
    // Add preconnect
    if (!document.querySelector(`link[rel="preconnect"][href="${domain}"]`)) {
      const preconnect = document.createElement('link');
      preconnect.rel = 'preconnect';
      preconnect.href = domain;
      preconnect.setAttribute('crossorigin', 'anonymous');
      document.head.appendChild(preconnect);
    }

    // Add dns-prefetch as fallback
    if (!document.querySelector(`link[rel="dns-prefetch"][href="${domain}"]`)) {
      const dnsPrefetch = document.createElement('link');
      dnsPrefetch.rel = 'dns-prefetch';
      dnsPrefetch.href = domain;
      document.head.appendChild(dnsPrefetch);
    }
  });
}

/**
 * Mark critical content to prioritize rendering
 */
function markCriticalContent() {
  if (typeof window === 'undefined') return;

  // Mark hero section as critical
  const heroSection = document.querySelector('.hero-section');
  if (heroSection) {
    heroSection.setAttribute('data-critical', 'true');
    
    // Find potential LCP elements and mark them
    const potentialLcpElements = heroSection.querySelectorAll('img, h1, .hero-text, .hero-cta');
    potentialLcpElements.forEach(element => {
      element.setAttribute('data-critical', 'true');
      
      // For images, ensure they have explicit dimensions
      if (element.tagName === 'IMG') {
        const img = element as HTMLImageElement;
        if (!img.width) img.width = 600;
        if (!img.height) img.height = 400;
        img.classList.add('critical-image');
        
        // Force load priority
        img.loading = 'eager';
        img.setAttribute('fetchpriority', 'high');
      }
    });
  }
}

/**
 * Optimize images for better performance
 */
function optimizeImages() {
  if (typeof window === 'undefined') return;

  // Wait a short period to let the initial render complete
  setTimeout(() => {
    // Create IntersectionObserver to lazy load images that are not in the viewport
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          
          // Skip already optimized images
          if (img.getAttribute('data-optimized') === 'true') return;
          
          // Skip critical images
          if (img.getAttribute('data-critical') === 'true') return;
          
          // For non-critical images, add lazy loading
          img.loading = 'lazy';
          
          // Add background color placeholders
          if (!img.style.backgroundColor) {
            img.style.backgroundColor = '#f0f0f0';
          }
          
          // Mark as optimized
          img.setAttribute('data-optimized', 'true');
          
          // Stop observing
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: '200px' // Start loading images 200px before they enter viewport
    });

    // Get all images except those already marked as critical
    const images = document.querySelectorAll('img:not([data-critical="true"])');
    images.forEach(img => imageObserver.observe(img));
    
    // Apply BlurHash or low-quality image placeholders
    applyBlurPlaceholders();
  }, 100);
}

/**
 * Apply blur placeholders for images
 */
function applyBlurPlaceholders() {
  if (typeof window === 'undefined') return;
  
  // This would integrate with a BlurHash library or similar
  // For now, just add a background color to actual images, not SVG or icons
  const images = document.querySelectorAll('img:not([data-optimized="true"]):not([src$=".svg"])');
  images.forEach(img => {
    const imgElement = img as HTMLImageElement;
    if (!imgElement.style.backgroundColor) {
      imgElement.style.backgroundColor = '#f0f0f0';
    }
  });
  
  // SVG images should have transparent background
  const svgImages = document.querySelectorAll('img[src$=".svg"]');
  svgImages.forEach(img => {
    const imgElement = img as HTMLImageElement;
    imgElement.style.backgroundColor = 'transparent';
  });
}

/**
 * Optimize font loading to prevent layout shifts
 */
function optimizeFonts() {
  if (typeof window === 'undefined') return;

  // Add font-display: swap to all font faces
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @font-face {
      font-display: swap !important;
    }
    
    /* Apply system font fallback */
    body, h1, h2, h3, h4, h5, h6, p, span, div {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol" !important;
    }
    
    /* Only apply custom fonts when they are loaded */
    .fonts-loaded body, .fonts-loaded h1, .fonts-loaded h2, .fonts-loaded h3, 
    .fonts-loaded h4, .fonts-loaded h5, .fonts-loaded h6, .fonts-loaded p, 
    .fonts-loaded span, .fonts-loaded div {
      font-family: "CustomFont", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
    }
  `;
  document.head.appendChild(styleSheet);

  // Use Font Loading API to detect when fonts are loaded
  if ('FontFace' in window) {
    const fontTimeoutMs = 1000; // 1 second timeout for font loading
    
    try {
      document.fonts.ready.then(() => {
        document.documentElement.classList.add('fonts-loaded');
      }).catch(err => {
        console.error('Font loading error:', err);
        // Apply fallback font loading class anyway after timeout
        setTimeout(() => {
          document.documentElement.classList.add('fonts-loaded');
        }, fontTimeoutMs);
      });
      
      // Set a fallback timeout in case the promise doesn't resolve
      setTimeout(() => {
        if (!document.documentElement.classList.contains('fonts-loaded')) {
          document.documentElement.classList.add('fonts-loaded');
        }
      }, fontTimeoutMs);
    } catch (e) {
      // Browser doesn't support font loading API
      console.warn('Font Loading API not supported');
      // Apply class immediately to prevent prolonged wait
      document.documentElement.classList.add('fonts-loaded');
    }
  } else {
    // Fallback for browsers without Font Loading API
    document.documentElement.classList.add('fonts-loaded');
  }
}

/**
 * Defer non-critical resources
 */
function deferNonCriticalResources() {
  if (typeof window === 'undefined') return;

  // Create a small delay to let critical content render first
  setTimeout(() => {
    // Find and defer non-critical scripts
    const scripts = document.querySelectorAll('script:not([data-critical="true"])');
    scripts.forEach(script => {
      const scriptElement = script as HTMLScriptElement;
      if (scriptElement.src && !scriptElement.async && !scriptElement.defer) {
        const deferredScript = document.createElement('script');
        deferredScript.src = scriptElement.src;
        deferredScript.defer = true;
        document.body.appendChild(deferredScript);
        scriptElement.remove();
      }
    });

    // Load non-critical CSS asynchronously
    const nonCriticalStyles = [
      '/styles/animations.css',
      '/styles/effects.css'
    ];

    nonCriticalStyles.forEach(stylesheet => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = stylesheet;
      link.media = 'print';
      link.onload = () => {
        link.media = 'all';
      };
      document.head.appendChild(link);
    });
  }, 200);
}

/**
 * Optimize animations to reduce CPU usage and layout shifts
 */
function optimizeAnimations() {
  if (typeof window === 'undefined') return;

  // Disable animations until page is fully loaded
  document.documentElement.classList.add('no-animations');
  
  // Enable animations after everything else is loaded
  setTimeout(() => {
    document.documentElement.classList.remove('no-animations');
    document.documentElement.classList.add('animations-enabled');
    
    // Add optimization for animations
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
      .no-animations *:not(svg):not(.MuiSvgIcon-root):not(.MuiIcon-root):not([class*="icon"]):not([class*="Icon"]) {
        animation: none !important;
        transition: none !important;
      }
      
      /* Hardware acceleration for animations */
      .animations-enabled .animated {
        will-change: transform;
        transform: translateZ(0);
      }
      
      /* Reduce animation complexity on mobile */
      @media (max-width: 768px) {
        .animations-enabled .animated {
          animation-duration: 50% !important;
        }
      }
      
      /* SVG elemanları ve ikonlar için özel stiller */
      svg, .MuiSvgIcon-root, .MuiIcon-root {
        background-color: transparent !important;
      }
    `;
    document.head.appendChild(styleSheet);
  }, 1500); // Wait longer for animations to ensure everything else is loaded
}

/**
 * Observer for LCP (Largest Contentful Paint)
 */
function observeLargestContentfulPaint() {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

  try {
    let lcpElement: Element | null = null;
    let largestPaintSize = 0;
    
    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1] as any;
      
      // Check if this is a larger paint than previously recorded
      if (lastEntry.size > largestPaintSize) {
        largestPaintSize = lastEntry.size;
        lcpElement = lastEntry.element;
        
        if (lcpElement) {
          // Mark the LCP element
          lcpElement.setAttribute('data-lcp', 'true');
          
          // Add high priority loading
          if (lcpElement.tagName === 'IMG') {
            const img = lcpElement as HTMLImageElement;
            img.loading = 'eager';
            img.setAttribute('fetchpriority', 'high');
          }
          
          console.info('[Performance] LCP element identified:', lcpElement);
        }
      }
    });
    
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    
    // Disconnect after 5 seconds as LCP should happen before then
    setTimeout(() => {
      lcpObserver.disconnect();
      
      // If LCP element was found, optimize it further
      if (lcpElement) {
        optimizeSpecificElement(lcpElement);
      }
    }, 5000);
  } catch (e) {
    console.warn('[Performance] LCP observation failed:', e);
  }
}

/**
 * Optimize a specific element after it's identified as important
 */
function optimizeSpecificElement(element: Element) {
  // Apply specific optimizations based on element type
  if (element.tagName === 'IMG') {
    const img = element as HTMLImageElement;
    
    // Ensure dimensions are explicitly set
    if (!img.width || !img.height) {
      const rect = img.getBoundingClientRect();
      img.width = rect.width;
      img.height = rect.height;
    }
    
    // Force loading priority
    img.loading = 'eager';
    img.setAttribute('fetchpriority', 'high');
  }
}

/**
 * Detect and fix potential layout shifts
 */
function detectAndFixLayoutShifts() {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

  try {
    let cumulativeLayoutShift = 0;
    let layoutShiftElements: Element[] = [];
    
    const clsObserver = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries() as any[]) {
        // Skip small shifts
        if (!entry.hadRecentInput && entry.value >= 0.01) {
          cumulativeLayoutShift += entry.value;
          
          // Log layout shift
          console.info(`[Performance] Layout shift: ${entry.value.toFixed(4)}, Total CLS: ${cumulativeLayoutShift.toFixed(4)}`);
          
          // Attempt to identify elements causing shifts
          if (entry.sources && entry.sources.length) {
            for (const source of entry.sources) {
              if (source.node) {
                layoutShiftElements.push(source.node);
                console.info('[Performance] Layout shift caused by:', source.node, `(${source.node.tagName})`);
                
                // Apply immediate fixes if possible
                fixLayoutShiftingElement(source.node);
              }
            }
          }
        }
      }
    });
    
    clsObserver.observe({ type: 'layout-shift', buffered: true });
    
    // After 10 seconds, analyze all collected layout shifting elements
    setTimeout(() => {
      clsObserver.disconnect();
      
      if (layoutShiftElements.length > 0) {
        console.info(`[Performance] Total CLS: ${cumulativeLayoutShift.toFixed(4)}, Problem elements: ${layoutShiftElements.length}`);
        
        // Apply fixes to commonly shifting elements
        const elementTypes = layoutShiftElements.reduce((acc, el) => {
          const tagName = el.tagName.toLowerCase();
          acc[tagName] = (acc[tagName] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        console.info('[Performance] Elements causing shifts:', elementTypes);
        
        // Apply global fixes based on most problematic elements
        applyGlobalLayoutShiftFixes(elementTypes);
      }
    }, 10000);
  } catch (e) {
    console.warn('[Performance] CLS observation failed:', e);
  }
}

/**
 * Fix a specific element that causes layout shifts
 */
function fixLayoutShiftingElement(element: Element) {
  const tagName = element.tagName.toLowerCase();
  
  if (tagName === 'img') {
    const img = element as HTMLImageElement;
    
    // Ensure dimensions are set
    if (!img.width || !img.height) {
      const rect = img.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        img.width = rect.width;
        img.height = rect.height;
        img.style.aspectRatio = `${rect.width} / ${rect.height}`;
      }
    }
    
    // Add placeholder color
    if (!img.style.backgroundColor) {
      img.style.backgroundColor = '#f0f0f0';
    }
  } else if (tagName === 'div' || tagName === 'section') {
    // For containers, set min-height if possible
    const rect = element.getBoundingClientRect();
    if (rect.height > 0) {
      (element as HTMLElement).style.minHeight = `${rect.height}px`;
    }
  }
}

/**
 * Apply global fixes for layout shifts based on problematic element types
 */
function applyGlobalLayoutShiftFixes(elementTypes: Record<string, number>) {
  const styleSheet = document.createElement('style');
  let cssRules = '';
  
  // Add fixes for specific element types
  if (elementTypes['img'] > 0) {
    cssRules += `
      img:not([width]):not([height]) {
        aspect-ratio: 16/9;
        background-color: #f0f0f0;
      }
    `;
  }
  
  if (elementTypes['div'] > 0 || elementTypes['section'] > 0) {
    cssRules += `
      .hero-section, .feature-section, .testimonial-section {
        min-height: 300px;
      }
      
      @media (min-width: 768px) {
        .hero-section {
          min-height: 600px;
        }
        .feature-section {
          min-height: 400px;
        }
      }
    `;
  }
  
  if (elementTypes['button'] > 0) {
    cssRules += `
      button, .button, .MuiButton-root {
        min-height: 36px;
        min-width: 64px;
      }
    `;
  }
  
  if (cssRules) {
    styleSheet.textContent = cssRules;
    document.head.appendChild(styleSheet);
  }
}

/**
 * Reports web vitals to analytics
 * @param metric The performance metric to report
 */
export function reportWebVitals(metric: NextWebVitalsMetric): void {
  // Log during development
  if (process.env.NODE_ENV === 'development') {
    console.log(`Web Vital: ${metric.name} - ${metric.value}`);
  }

  // In production, send to analytics
  // TODO: Implement analytics reporting
  // Example: sendToAnalytics(metric);
}

/**
 * Optimize Largest Contentful Paint elements specifically
 * Added to target the 9.1s LCP metric seen in performance results
 */
function optimizeLargestContentfulPaint(): void {
  if (typeof window === 'undefined') return;
  
  // Find potential LCP elements
  const potentialLCPElements = document.querySelectorAll('img, video, h1, h2, .hero-section *, main > *:first-child, [class*="hero"], [class*="banner"]');
  
  potentialLCPElements.forEach(element => {
    // Apply specific optimizations to potential LCP elements
    if (element.tagName.toLowerCase() === 'img') {
      const img = element as HTMLImageElement;
      
      // Set priority loading for potentially large images
      img.loading = 'eager';
      img.decoding = 'async';
      
      // Add fetchpriority attribute for browsers that support it
      img.setAttribute('fetchpriority', 'high');
      
      // Ensure proper width/height are set to prevent layout shifts
      if (!img.width && !img.height && img.getAttribute('width') === null && img.getAttribute('height') === null) {
        // Set default dimensions to prevent CLS
        img.style.aspectRatio = '16/9';
      }
      
      // For SVG images, add direct inline SVG if possible
      if (img.src.endsWith('.svg')) {
        // Fetch and inline SVG for faster rendering
        fetch(img.src)
          .then(response => response.text())
          .then(svgText => {
            if (svgText.startsWith('<svg')) {
              const tempDiv = document.createElement('div');
              tempDiv.innerHTML = svgText;
              const svg = tempDiv.querySelector('svg');
              if (svg && img.parentNode) {
                // Copy dimensions
                const width = img.width || img.clientWidth;
                const height = img.height || img.clientHeight;
                svg.setAttribute('width', `${width}px`);
                svg.setAttribute('height', `${height}px`);
                
                // Replace img with SVG
                img.parentNode.replaceChild(svg, img);
              }
            }
          })
          .catch(() => {
            // If inline fails, ensure the image is still optimized
            img.style.visibility = 'visible';
          });
      }
    }
    
    // Apply specific styles for headers and text elements
    if (['h1', 'h2', 'p'].includes(element.tagName.toLowerCase())) {
      const textElement = element as HTMLElement;
      
      // Ensure text rendering is optimized
      textElement.style.textRendering = 'optimizeSpeed';
      
      // Prevent layout shifts by setting min-height
      if (textElement.tagName.toLowerCase() === 'h1') {
        textElement.style.minHeight = '40px';
      } else if (textElement.tagName.toLowerCase() === 'h2') {
        textElement.style.minHeight = '32px';
      }
    }
  });
  
  // Create an observer to track the actual LCP element
  if ('PerformanceObserver' in window) {
    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      if (entries.length > 0) {
        // Type the LCP entry properly to access element property
        const lcpEntry = entries[entries.length - 1] as PerformanceEntry & {
          element?: Element;
        };
        
        // Report LCP to analytics
        if (window.gtag) {
          window.gtag('event', 'web_vitals', {
            event_category: 'Web Vitals',
            event_action: 'LCP',
            event_value: Math.round(lcpEntry.startTime + lcpEntry.duration),
            event_label: lcpEntry.entryType,
            non_interaction: true,
          });
        }
        
        // Try to optimize this specific element even more
        if (lcpEntry.element) {
          // Apply super-priority optimizations to actual LCP element
          const lcpElement = lcpEntry.element;
          
          if (lcpElement.tagName.toLowerCase() === 'img') {
            const img = lcpElement as HTMLImageElement;
            
            // Force immediate display
            img.style.display = 'block';
            img.style.visibility = 'visible';
            
            // If source is an external URL, consider preconnect
            const imgUrl = new URL(img.src, window.location.origin);
            if (imgUrl.origin !== window.location.origin) {
              // Add preconnect for this domain
              const link = document.createElement('link');
              link.rel = 'preconnect';
              link.href = imgUrl.origin;
              link.crossOrigin = 'anonymous';
              document.head.appendChild(link);
            }
          }
          
          // Force the LCP element to be visible
          (lcpElement as HTMLElement).style.visibility = 'visible';
          (lcpElement as HTMLElement).style.opacity = '1';
          (lcpElement as HTMLElement).style.display = 'block';
        }
      }
      
      // Disconnect after getting the LCP
      lcpObserver.disconnect();
    });
    
    // Start observing
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
  }
}

/**
 * Implement Intersection Observers for lazy loading components
 * This helps reduce initial page load time
 */
function implementIntersectionObservers(): void {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;
  
  // Find non-critical sections that can be lazily enhanced
  const lazySections = document.querySelectorAll('.features-section, .pricing-section, .testimonials-section, footer, [class*="section"]:not(.hero-section)');
  
  // Create observer
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const section = entry.target;
        
        // Remove all optimization limitations once visible
        section.classList.add('section-visible');
        
        // Re-enable animations
        const elements = section.querySelectorAll('*');
        elements.forEach(el => {
          if (el instanceof HTMLElement) {
            el.style.animationDuration = '';
            el.style.transitionDuration = '';
          }
        });
        
        // Load any lazy-loaded images
        const lazyImages = section.querySelectorAll('img[loading="lazy"]');
        lazyImages.forEach(img => {
          if (img instanceof HTMLImageElement) {
            // Convert data-src to src if present
            if (img.dataset.src) {
              img.src = img.dataset.src;
              delete img.dataset.src;
            }
          }
        });
        
        // Stop observing this section
        observer.unobserve(section);
      }
    });
  }, {
    rootMargin: '200px', // Start loading 200px before it comes into viewport
    threshold: 0.1 // Trigger when 10% of the element is visible
  });
  
  // Start observing sections
  lazySections.forEach(section => {
    observer.observe(section);
  });
}

// Add stylesheet to help with layout shifts and implement performance CSS
function injectPerformanceCSS(): void {
  if (typeof document === 'undefined') return;
  
  const styleEl = document.createElement('style');
  styleEl.id = 'performance-css';
  styleEl.textContent = `
    /* Prevent layout shifts */
    img {
      aspect-ratio: attr(width) / attr(height);
    }
    
    /* Ensure all images have appropriate background */
    img:not([src]) {
      background-color: #f0f0f0;
    }
    
    /* Optimize transitions */
    .section-visible * {
      transition: opacity 0.3s ease-out, transform 0.3s ease-out !important;
    }
    
    /* Optimize font rendering */
    body {
      text-rendering: optimizeSpeed;
      -webkit-font-smoothing: antialiased;
    }
    
    /* Fix layout shift issues for specific elements */
    .hero-section {
      contain: layout style;
    }
    
    /* Layout containment for performance */
    .container, section, main, [class*="section"] {
      contain: content;
    }
    
    /* Optimize SVG rendering */
    svg {
      contain: strict;
      will-change: transform;
    }
  `;
  
  document.head.appendChild(styleEl);
}