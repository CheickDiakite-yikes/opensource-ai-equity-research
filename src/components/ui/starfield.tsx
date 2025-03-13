
import React, { useEffect, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";

interface StarfieldProps {
  starsCount?: number;
  className?: string;
}

export const Starfield: React.FC<StarfieldProps> = ({ 
  starsCount = 100,
  className = ""
}) => {
  const { theme } = useTheme();
  const [stars, setStars] = useState<Array<{
    id: number;
    top: string;
    left: string;
    size: number;
    opacity: number;
    delay: number;
  }>>([]);

  useEffect(() => {
    if (theme === 'dark') {
      const newStars = Array.from({ length: starsCount }, (_, i) => ({
        id: i,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        size: Math.random() * 2 + 1, // 1-3px
        opacity: Math.random() * 0.7 + 0.3, // 0.3-1
        delay: Math.random() * 5, // 0-5s delay
      }));
      setStars(newStars);
    } else {
      setStars([]);
    }
  }, [theme, starsCount]);

  if (theme !== 'dark') return null;

  return (
    <div className={`fixed inset-0 pointer-events-none z-[-1] overflow-hidden ${className}`}>
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white animate-twinkle"
          style={{
            top: star.top,
            left: star.left,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}
    </div>
  );
};
