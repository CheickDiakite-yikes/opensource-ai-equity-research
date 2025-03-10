
import { useState, useEffect } from "react";

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    // Initial check
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    
    // Add listener for changes
    const listener = () => {
      setMatches(media.matches);
    };
    
    // Use addEventListener in modern browsers
    media.addEventListener("change", listener);
    
    // Clean up listener on unmount
    return () => {
      media.removeEventListener("change", listener);
    };
  }, [matches, query]);

  return matches;
}

// Add useIsMobile as a convenience wrapper around useMediaQuery
export function useIsMobile() {
  return useMediaQuery("(max-width: 640px)");
}
