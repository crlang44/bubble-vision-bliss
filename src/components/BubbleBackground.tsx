
import React, { useEffect, useRef } from 'react';

interface BubbleBackgroundProps {
  bubbleCount?: number;
}

const BubbleBackground: React.FC<BubbleBackgroundProps> = ({ bubbleCount = 20 }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const containerWidth = container.offsetWidth;
    
    // Clear any existing bubbles
    const existingBubbles = container.querySelectorAll('.bubble');
    existingBubbles.forEach(bubble => bubble.remove());
    
    // Create new bubbles
    for (let i = 0; i < bubbleCount; i++) {
      const bubble = document.createElement('div');
      bubble.classList.add('bubble');
      
      // Random bubble properties
      const size = Math.random() * 60 + 10; // 10-70px
      const left = Math.random() * containerWidth;
      
      // Set bubble styles
      bubble.style.width = `${size}px`;
      bubble.style.height = `${size}px`;
      bubble.style.left = `${left}px`;
      bubble.style.bottom = `-${size}px`;
      bubble.style.opacity = '0';
      
      // Set animation properties
      const duration = Math.random() * 10 + 5; // 5-15s
      const delay = Math.random() * 15; // 0-15s delay
      
      bubble.style.animation = `bubble-float-${Math.ceil(Math.random() * 3)} ${duration}s ease-in ${delay}s infinite`;
      
      // Add bubble to container
      container.appendChild(bubble);
    }
    
    return () => {
      // Cleanup: remove all bubbles on unmount
      const bubbles = container.querySelectorAll('.bubble');
      bubbles.forEach(bubble => bubble.remove());
    };
  }, [bubbleCount]);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Bubbles are dynamically added here */}
    </div>
  );
};

export default BubbleBackground;
