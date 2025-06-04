import React from 'react';
import NavBar from './NavBar';
import BubbleBackground from './BubbleBackground';

interface GameLayoutProps {
  pageType: 'annotation' | 'quickId';
  bestScore: number;
  setShowInstructions: (show: boolean) => void;
  children: React.ReactNode;
}

const GameLayout: React.FC<GameLayoutProps> = ({
  pageType,
  bestScore,
  setShowInstructions,
  children
}) => {
  return (
    <div className="min-h-screen bg-ocean-gradient relative">
      <div className="container mx-auto px-4 pt-4 relative z-50">
        <NavBar
          pageType={pageType}
          bestScore={bestScore}
          setShowInstructions={setShowInstructions}
        />
      </div>

      <BubbleBackground bubbleCount={30} />

      <div className="container mx-auto py-0 px-4 relative z-10">
        {children}
      </div>
    </div>
  );
};

export default GameLayout; 