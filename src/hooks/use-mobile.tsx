
import { useState, useEffect } from "react";

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => {
    // Initialize with correct value on mount
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const media = window.matchMedia(query);
      
      // Initial check
      if (media.matches !== matches) {
        setMatches(media.matches);
      }
      
      // Create handler function (prevents recreation on each render)
      const listener = (event: MediaQueryListEvent) => {
        setMatches(event.matches);
      };
      
      // Use addEventListener in modern browsers
      media.addEventListener("change", listener);
      
      // Clean up listener on unmount
      return () => {
        media.removeEventListener("change", listener);
      };
    }
  }, [query, matches]);

  return matches;
}

// Add useIsMobile as a convenience wrapper around useMediaQuery
export function useIsMobile() {
  return useMediaQuery("(max-width: 640px)");
}

// Add more utility media queries for responsive design
export function useIsTablet() {
  return useMediaQuery("(min-width: 641px) and (max-width: 1024px)");
}

export function useIsDesktop() {
  return useMediaQuery("(min-width: 1025px)");
}

// Detect touch devices
export function useIsTouchDevice() {
  const [isTouch, setIsTouch] = useState(false);
  
  useEffect(() => {
    const touchQuery = window.matchMedia('(hover: none) and (pointer: coarse)');
    setIsTouch(touchQuery.matches);
    
    const updateTouchStatus = (e: MediaQueryListEvent) => {
      setIsTouch(e.matches);
    };
    
    touchQuery.addEventListener('change', updateTouchStatus);
    return () => touchQuery.removeEventListener('change', updateTouchStatus);
  }, []);
  
  return isTouch;
}
