
import React, { useState, useEffect } from 'react';
import QuickIDGame from '../components/QuickIDGame';
import NavBar from '../components/NavBar';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trophy, RefreshCcw, Zap } from 'lucide-react';
import { routes } from '../routes';

const QuickIDGamePage: React.FC = () => {
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [allImagesAnnotated, setAllImagesAnnotated] = useState(false);
  
  // Set page title via document API
  useEffect(() => {
    document.title = "Quick ID Challenge - Ocean Explorer";
  }, []);

  // Show completion dialog only when all images are annotated
  useEffect(() => {
    if (allImagesAnnotated) {
      setShowCompletionDialog(true);
    }
  }, [allImagesAnnotated]);

  const handleGameComplete = (score: number, completed: boolean) => {
    setFinalScore(score);
    setAllImagesAnnotated(completed);
  };

  const handlePlayAgain = () => {
    setShowCompletionDialog(false);
    window.location.reload();
  };
  
  const handleGoToAnnotationGame = () => {
    window.location.href = routes.home;
  };

  return (
    <div className="min-h-screen bg-ocean-gradient relative">
      <div className="container mx-auto py-6 px-4 relative z-10">
        <NavBar />
        <QuickIDGame onGameComplete={handleGameComplete} />
      </div>

      {/* Game Completion Dialog */}
      <Dialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
        <DialogContent className="bg-gradient-to-b from-blue-50 to-white border-blue-200 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center flex items-center justify-center gap-2">
              <Trophy className="text-yellow-500 h-6 w-6" /> 
              Game Complete!
            </DialogTitle>
            <DialogDescription className="text-center text-gray-700 mt-2">
              You completed the Quick ID challenge!
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 flex flex-col items-center">
            <div className="bg-ocean-gradient p-6 rounded-lg shadow-inner w-full mb-4">
              <div className="text-center">
                <div className="text-white/80 mb-1">Your score</div>
                <div className="text-4xl font-bold text-white mb-2">{finalScore}</div>
              </div>
            </div>
            
            {finalScore >= 90 ? (
              <p className="text-green-600 font-medium">Amazing job! You're an ocean ID expert!</p>
            ) : finalScore >= 70 ? (
              <p className="text-blue-600 font-medium">Good work! Keep practicing to improve!</p>
            ) : (
              <p className="text-amber-600 font-medium">Nice try! Practice makes perfect!</p>
            )}
          </div>
          
          <DialogFooter className="flex flex-col gap-2 sm:flex-row">
            <Button 
              className="w-full sm:w-auto" 
              variant="outline" 
              onClick={handlePlayAgain}
            >
              <RefreshCcw className="h-4 w-4 mr-2" /> Try Again
            </Button>
            <Button 
              className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white" 
              onClick={handleGoToAnnotationGame}
            >
              <Zap className="h-4 w-4 mr-2" /> Try Ocean Annotation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuickIDGamePage;
