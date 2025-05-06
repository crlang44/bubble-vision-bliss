
import React from 'react';
import { Trophy, RefreshCcw, Zap } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface GameCompletionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cumulativeScore: number;
  bestScore: number;
  onPlayAgain: () => void;
  onGoToQuickIDGame: () => void;
  allImagesAnnotated: boolean;
}

const GameCompletionDialog: React.FC<GameCompletionDialogProps> = ({ 
  open, 
  onOpenChange,
  cumulativeScore,
  bestScore,
  onPlayAgain,
  onGoToQuickIDGame,
  allImagesAnnotated
}) => {
  return (
    <Dialog 
      open={open} 
      onOpenChange={(open) => {
        if (!open && allImagesAnnotated) {
          // If closing the dialog and all images are annotated, reset for a new game
          onOpenChange(open);
        } else {
          onOpenChange(open);
        }
      }}
    >
      <DialogContent className="bg-gradient-to-b from-blue-50 to-white border-blue-200 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center flex items-center justify-center gap-2">
            <Trophy className="text-yellow-500 h-6 w-6" /> 
            Game Complete!
          </DialogTitle>
          <DialogDescription className="text-center text-gray-700 mt-2">
            You completed the ocean annotation challenge!
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 flex flex-col items-center">
          <div className="bg-ocean-gradient p-6 rounded-lg shadow-inner w-full mb-4">
            <div className="text-center">
              <div className="text-white/80 mb-1">Your score</div>
              <div className="text-4xl font-bold text-white mb-2">{cumulativeScore}</div>
              <div className="text-white/80 text-sm">Total points earned</div>
            </div>
          </div>
          
          {/* Best score display */}
          {bestScore > 0 && (
            <div className="bg-yellow-100 p-3 rounded-lg mb-4 w-full">
              <div className="text-center">
                <div className="text-yellow-800 font-medium mb-1 flex items-center justify-center gap-1">
                  <Trophy className="h-4 w-4 text-yellow-600" /> Best Score
                </div>
                <div className="text-2xl font-bold text-yellow-700">{bestScore}</div>
              </div>
            </div>
          )}
          
          {cumulativeScore >= 100 ? (
            <p className="text-green-600 font-medium">Amazing job! You're an annotation expert!</p>
          ) : cumulativeScore >= 70 ? (
            <p className="text-blue-600 font-medium">Good work! Keep practicing to improve!</p>
          ) : (
            <p className="text-amber-600 font-medium">Nice try! Practice makes perfect!</p>
          )}
        </div>
        
        <DialogFooter className="flex flex-col gap-2 sm:flex-row">
          <Button 
            className="w-full sm:w-auto" 
            variant="outline" 
            onClick={onPlayAgain}
          >
            <RefreshCcw className="h-4 w-4 mr-2" /> Try Again
          </Button>
          <Button 
            className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white" 
            onClick={onGoToQuickIDGame}
          >
            <Zap className="h-4 w-4 mr-2" /> Try Quick ID Game
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GameCompletionDialog;
