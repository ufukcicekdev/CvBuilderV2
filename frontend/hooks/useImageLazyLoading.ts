import { useEffect } from 'react';

/**
 * Hook to implement lazy loading of images
 * Uses Intersection Observer API to load images only when they are about to enter the viewport
 */
export default function useImageLazyLoading() {
  useEffect(() => {
    // Check if Intersection Observer is supported
    if ('IntersectionObserver' in window) {
      const lazyImages = document.querySelectorAll('img[data-src]');
      
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            img.src = img.dataset.src || '';
            
            // If there's also a data-srcset attribute, set that too
            if (img.dataset.srcset) {
              img.srcset = img.dataset.srcset;
            }
            
            // Remove the data attributes as they're no longer needed
            img.removeAttribute('data-src');
            img.removeAttribute('data-srcset');
            
            // Stop observing the image after it's loaded
            observer.unobserve(img);
          }
        });
      }, {
        // Start loading the image when it's 50px from entering the viewport
        rootMargin: '50px 0px',
        threshold: 0.01
      });
      
      // Observe all images with data-src attribute
      lazyImages.forEach((image) => {
        imageObserver.observe(image);
      });
      
      // Cleanup function
      return () => {
        lazyImages.forEach((image) => {
          imageObserver.unobserve(image);
        });
      };
    } else {
      // Fallback for browsers that don't support Intersection Observer
      const lazyLoadImages = () => {
        const lazyImages = document.querySelectorAll('img[data-src]');
        
        lazyImages.forEach((img: Element) => {
          const htmlImg = img as HTMLImageElement;
          htmlImg.src = htmlImg.dataset.src || '';
          htmlImg.removeAttribute('data-src');
          
          if (htmlImg.dataset.srcset) {
            htmlImg.srcset = htmlImg.dataset.srcset;
            htmlImg.removeAttribute('data-srcset');
          }
        });
      };
      
      // Load all images immediately
      lazyLoadImages();
    }
  }, []);
} 