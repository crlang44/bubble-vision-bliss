
import React from 'react';
import { Fish, Trophy, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { routes } from '../routes';

interface GameHeaderProps {
  cumulativeScore: number;
  bestScore: number;
  onResetScore: () => void;
  onShowInstructions: () => void;
}

const GameHeader: React.FC<GameHeaderProps> = ({
  cumulativeScore,
  bestScore,
  onResetScore,
  onShowInstructions
}) => {
  return (
    <header className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-2">
        <Fish className="text-coral h-8 w-8" />
        <h1 className="text-2xl md:text-3xl font-bold text-white">Ocean Annotation</h1>
      </div>
      
      <div className="flex gap-2 items-center">
        {/* Score display with best score addition */}
        <div className="flex gap-2">
          {/* Current score display */}
          <div className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
            <Trophy className="h-4 w-4" />
            <span>Score: {cumulativeScore}</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-5 w-5 text-white hover:bg-white/20 ml-1" 
              onClick={onResetScore}
              title="Reset Score"
            >
              <RefreshCcw className="h-3 w-3" />
            </Button>
          </div>
          
          {/* Best score display in header */}
          {bestScore > 0 && (
            <div className="bg-yellow-100/30 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
              <Trophy className="h-4 w-4 text-yellow-300" />
              <span>Best: {bestScore}</span>
            </div>
          )}
        </div>
        
        <Button
          variant="outline"
          onClick={onShowInstructions}
          className="bg-white/80 hover:bg-white"
        >
          How to Play
        </Button>
        <Button
          variant="outline"
          onClick={() => window.location.href = '/quick-id-game'}
          className="bg-white/80 hover:bg-white"
        >
          Quick ID Game
        </Button>
      </div>
    </header>
  );
};

export default GameHeader;
