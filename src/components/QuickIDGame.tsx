import React, { useState, useEffect, useRef } from 'react';
import BubbleBackground from '../components/BubbleBackground';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Fish, CheckCircle, RefreshCcw, Trophy, Clock, AlertTriangle } from 'lucide-react';
import { routes } from '../routes';

// Import images
import sharkClear from '../data/images/shark_clear.jpg';
import kelpClear from '../data/images/kelp_clear.jpg';
import dolphinClear from '../data/images/dolphin_clear.jpg';
import sharkMedium from '../data/images/shark_medium.jpg';
import kelpMedium from '../data/images/kelp_medium.jpg';
import dolphinMedium from '../data/images/dolphin_medium.jpg';
import sharkHard from '../data/images/shark_hard.jpg';
import kelpHard from '../data/images/kelp_hard.jpg';
import dolphinHard from '../data/images/dolphin_hard.jpg';

// Game image interface
interface GameImage {
  id: string;
  imagePath: string;
  correctAnswer: 'shark' | 'kelp' | 'dolphin';
}

// Sample game images - you'll replace these with your actual images
const gameImages: GameImage[] = [
  // Easy images (shown first)
  { id: '1', imagePath: sharkClear, correctAnswer: 'shark' },
  { id: '2', imagePath: kelpClear, correctAnswer: 'kelp' },
  { id: '3', imagePath: dolphinClear, correctAnswer: 'dolphin' },
  
  // Medium difficulty
  { id: '4', imagePath: sharkMedium, correctAnswer: 'shark' },
  { id: '5', imagePath: kelpMedium, correctAnswer: 'kelp' },
  { id: '6', imagePath: dolphinMedium, correctAnswer: 'dolphin' },
  
  // Hard (obscured/ambiguous)
  { id: '7', imagePath: sharkHard, correctAnswer: 'shark' },
  { id: '8', imagePath: kelpHard, correctAnswer: 'kelp' },
  { id: '9', imagePath: dolphinHard, correctAnswer: 'dolphin' },
];

const QuickIDGame = () => {
  // Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [timePerImage, setTimePerImage] = useState(2000); // Start with 2 seconds per image
  const [timeRemaining, setTimeRemaining] = useState(60); // 1 minute gameplay
  const [showInstructions, setShowInstructions] = useState(() => {
    return localStorage.getItem('hasSeenQuickIDInstructions') !== 'true';
  });
  // Add animation key state to force timer bar animation restart
  const [animationKey, setAnimationKey] = useState(0);
  // Add feedback state for showing checkmark/X
  const [showFeedback, setShowFeedback] = useState<'correct' | 'incorrect' | null>(null);
  
  // Refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const gameTimerRef = useRef<NodeJS.Timeout | null>(null);
  const imageTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Initialize game
  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setCurrentImageIndex(0);
    setScore(0);
    setTotalAttempts(0);
    setTimePerImage(5000); // Start with 5 seconds
    setTimeRemaining(60);
    setAnimationKey(0); // Reset animation key
    
    // Start the game timer (60 seconds)
    gameTimerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Set the first image timeout
    setImageTimer();
  };
  
  // Set timer for current image
  const setImageTimer = () => {
    // Clear any existing timer
    if (imageTimerRef.current) {
      clearTimeout(imageTimerRef.current);
    }
    
    // Increment animation key to force restart of animation
    setAnimationKey(prev => prev + 1);
    
    // Set new timer for current image
    imageTimerRef.current = setTimeout(() => {
      // Time's up for this image - count as incorrect
      handleAnswer('timeout');
    }, timePerImage);
  };
  
  // Handle player's answer
  const handleAnswer = (answer: 'shark' | 'kelp' | 'dolphin' | 'timeout') => {
    // Clear the current image timer
    if (imageTimerRef.current) {
      clearTimeout(imageTimerRef.current);
    }
    
    const currentImage = gameImages[currentImageIndex];
    let isCorrect = false;
    
    if (answer !== 'timeout') {
      setTotalAttempts(prev => prev + 1);
      isCorrect = answer === currentImage.correctAnswer;
      
      if (isCorrect) {
        setScore(prev => prev + 1);
        setShowFeedback('correct');
        toast.success('Correct!', { duration: 300 });
      } else {
        setShowFeedback('incorrect');
        toast.error('Incorrect!', { duration: 300 });
      }
    } else {
      // Timeout counts as an attempt
      setTotalAttempts(prev => prev + 1);
      setShowFeedback('incorrect');
      toast.error('Too slow!', { duration: 300 });
    }
    
    // Show feedback for a short time before moving to next image
    setTimeout(() => {
      setShowFeedback(null);
      
      // Move to next image or end game if no more images
      const nextIndex = currentImageIndex + 1;
      
      if (nextIndex < gameImages.length) {
        setCurrentImageIndex(nextIndex);
        
        // Gradually decrease time per image as game progresses
        // From 5 seconds to 0.5 seconds over the course of the game
        const progress = nextIndex / gameImages.length;
        const newTimePerImage = 5000 - (progress * 4500);
        setTimePerImage(Math.max(500, newTimePerImage));
        
        // Set timer for next image
        setImageTimer();
      } else {
        // Cycle back to the beginning if we run out of images
        setCurrentImageIndex(0);
        setImageTimer();
      }
    }, 500); // Show feedback for 500ms
  };
  
  // End the game
  const endGame = () => {
    setGameOver(true);
    setGameStarted(false);
    
    // Clear all timers
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current);
    }
    
    if (imageTimerRef.current) {
      clearTimeout(imageTimerRef.current);
    }
    
    // Show final score
    const accuracy = totalAttempts > 0 ? Math.round((score / totalAttempts) * 100) : 0;
    toast.success(`Game Over! Your accuracy: ${accuracy}%`);
  };
  
  // Clean up timers when component unmounts
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
      if (imageTimerRef.current) clearTimeout(imageTimerRef.current);
    };
  }, []);
  
  // Instructions component
  const Instructions = ({ onClose }: { onClose: () => void }) => (
    <div className="bg-white rounded-xl p-6 max-w-lg w-full shadow-xl">
      <h2 className="text-2xl font-bold text-ocean-dark mb-4">Quick ID Challenge</h2>
      
      <div className="space-y-4 mb-6">
        <p className="text-gray-700">
          Test your quick identification skills! You'll be shown a series of ocean images and must 
          quickly identify whether each contains a shark, kelp, or dolphin.
        </p>
        
        <div className="bg-blue-50 p-3 rounded-lg">
          <h3 className="font-bold text-ocean-dark mb-2">How to Play:</h3>
          <ul className="list-disc pl-5 text-gray-700 space-y-2">
            <li>Click the correct button (shark, kelp, or dolphin) for each image</li>
            <li>Correct answers show a green checkmark</li>
            <li>Wrong answers show a red X</li>
            <li>No response in time counts as incorrect</li>
            <li>The game starts slow and gets progressively faster</li>
            <li>The game lasts for 60 seconds</li>
          </ul>
        </div>
      </div>
      
      <Button 
        className="w-full bg-ocean-dark hover:bg-ocean-darker text-white"
        onClick={onClose}
      >
        Let's Play!
      </Button>
    </div>
  );
  
  return (
    <div className="min-h-screen bg-ocean-gradient relative">
      <BubbleBackground bubbleCount={30} />
      
      <div className="container mx-auto py-6 px-4 relative z-10">
        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Fish className="text-coral h-8 w-8" />
            <h1 className="text-2xl md:text-3xl font-bold text-white">Quick ID Challenge</h1>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowInstructions(true)}
              className="bg-white/80 hover:bg-white"
            >
              How to Play
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.href = routes.home}
              className="bg-white/80 hover:bg-white"
            >
              Ocean Annotation
            </Button>
          </div>
        </header>
        
        {/* Instructions Modal */}
        {showInstructions && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Instructions onClose={() => {
              setShowInstructions(false);
              localStorage.setItem('hasSeenQuickIDInstructions', 'true');
              if (!gameStarted && !gameOver) {
                startGame();
              }
            }} />
          </div>
        )}
        
        <div className="max-w-4xl mx-auto">
          {/* Game Timer */}
          <div className="bg-white rounded-xl p-3 shadow-md mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="text-ocean-dark h-5 w-5" />
                <span className="font-semibold">Time Remaining:</span>
              </div>
              <div className="text-xl font-bold text-ocean-dark">
                {timeRemaining} seconds
              </div>
            </div>
            {gameStarted && (
              <div className="w-full bg-gray-200 h-2 rounded-full mt-2">
                <div 
                  className="bg-ocean-dark h-2 rounded-full transition-all duration-1000" 
                  style={{ width: `${(timeRemaining / 60) * 100}%` }}
                ></div>
              </div>
            )}
          </div>
          
          {/* Game Area */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-4">
            {gameStarted ? (
              <div className="p-4 flex flex-col items-center">
                {/* Current image */}
                <div className="relative h-[350px] w-full flex items-center justify-center bg-gray-100 rounded-lg mb-6">
                  <img 
                    src={gameImages[currentImageIndex].imagePath} 
                    alt="Identify this" 
                    className="max-h-full max-w-full object-contain"
                  />
                  
                  {/* Feedback overlay */}
                  {showFeedback && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      {showFeedback === 'correct' ? (
                        <div className="bg-green-500 rounded-full p-10">
                          <CheckCircle className="h-24 w-24 text-white" />
                        </div>
                      ) : (
                        <div className="bg-red-500 rounded-full p-10">
                          <AlertTriangle className="h-24 w-24 text-white" />
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Timer indicator with key to force animation restart */}
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-200">
                    <div 
                      key={animationKey}
                      className="h-full bg-ocean-dark"
                      style={{ 
                        width: '100%',
                        animation: `shrink ${timePerImage/1000}s linear forwards` 
                      }}
                    ></div>
                  </div>
                </div>
                
                {/* Answer buttons */}
                <div className="grid grid-cols-3 gap-4 w-full max-w-xl">
                  <Button 
                    className="h-16 text-lg bg-blue-500 hover:bg-blue-600 text-white" 
                    onClick={() => handleAnswer('shark')}
                  >
                    Shark
                  </Button>
                  <Button 
                    className="h-16 text-lg bg-green-500 hover:bg-green-600 text-white" 
                    onClick={() => handleAnswer('kelp')}
                  >
                    Kelp
                  </Button>
                  <Button 
                    className="h-16 text-lg bg-purple-500 hover:bg-purple-600 text-white" 
                    onClick={() => handleAnswer('dolphin')}
                  >
                    Dolphin
                  </Button>
                </div>
              </div>
            ) : gameOver ? (
              <div className="p-8 text-center">
                <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-ocean-dark mb-2">Game Over!</h2>
                
                <div className="bg-blue-50 p-4 rounded-lg max-w-md mx-auto mb-6">
                  <div className="text-4xl font-bold text-ocean-dark mb-2">
                    {totalAttempts > 0 ? Math.round((score / totalAttempts) * 100) : 0}%
                  </div>
                  <p className="text-gray-700">Accuracy</p>
                  
                  <div className="flex justify-between mt-4 text-sm text-gray-700">
                    <div>Correct: <span className="font-bold text-green-600">{score}</span></div>
                    <div>Total: <span className="font-bold">{totalAttempts}</span></div>
                  </div>
                </div>
                
                <Button
                  className="bg-ocean-dark hover:bg-ocean-darker text-white text-lg px-8 py-6 h-auto"
                  onClick={startGame}
                >
                  <RefreshCcw className="h-5 w-5 mr-2" /> Play Again
                </Button>
              </div>
            ) : (
              <div className="p-8 text-center">
                <Fish className="h-16 w-16 text-ocean-dark mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-ocean-dark mb-4">Ready to Test Your Quick ID Skills?</h2>
                <p className="text-gray-700 mb-6">
                  Identify sharks, kelp, and dolphins as quickly as possible!
                </p>
                <Button
                  className="bg-ocean-dark hover:bg-ocean-darker text-white text-lg px-8 py-6 h-auto"
                  onClick={startGame}
                >
                  Start Game
                </Button>
              </div>
            )}
          </div>
          
          {/* Score card (only visible during gameplay) */}
          {gameStarted && (
            <div className="bg-white rounded-xl p-4 shadow-md">
              <h3 className="font-bold text-ocean-dark mb-2">Current Score</h3>
              <div className="flex justify-between">
                <div>
                  <span className="text-gray-700">Correct:</span> 
                  <span className="font-bold text-green-600 ml-1">{score}</span>
                </div>
                <div>
                  <span className="text-gray-700">Attempts:</span> 
                  <span className="font-bold ml-1">{totalAttempts}</span>
                </div>
                <div>
                  <span className="text-gray-700">Accuracy:</span> 
                  <span className="font-bold text-ocean-dark ml-1">
                    {totalAttempts > 0 ? Math.round((score / totalAttempts) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <footer className="mt-8 text-center text-white/80 text-sm">
          <p>Quick ID Challenge - Test your ocean creature identification skills!</p>
          
          {/* Return to Index button at bottom of page */}
          <div className="mt-4">
            <Button
              variant="outline"
              onClick={() => window.location.href = routes.home}
              className="bg-white/20 hover:bg-white/40 text-white"
            >
              Return to Ocean Annotation
            </Button>
          </div>
        </footer>
        
        {/* CSS for animation */}
        <style>{`
          @keyframes shrink {
            from { width: 100%; }
            to { width: 0%; }
          }
        `}</style>
      </div>
    </div>
  );
};

export default QuickIDGame;
