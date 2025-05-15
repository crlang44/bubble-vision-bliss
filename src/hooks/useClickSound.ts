// src/hooks/useClickSound.ts
import { useEffect, useRef } from 'react';

export const useClickSound = () => {
  const clickSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize click sound
    clickSoundRef.current = new Audio('/sounds/click.mp3');
    clickSoundRef.current.volume = 0.5;
    clickSoundRef.current.load();

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Check if clicked element is a button
      if (
        target.tagName === 'BUTTON' ||
        target.closest('button') ||
        target.getAttribute('role') === 'button'
      ) {
        if (clickSoundRef.current) {
          clickSoundRef.current.currentTime = 0;
          clickSoundRef.current.play().catch(() => {});
        }
      }
    };

    // Add click listener to document
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);
};