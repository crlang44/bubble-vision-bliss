import React, { useState, useEffect, useRef } from "react";
import BubbleBackground from "../components/BubbleBackground";
import { Button } from "@/components/ui/button";
import {
  Fish,
  CheckCircle,
  RefreshCcw,
  Trophy,
  Clock,
  AlertTriangle,
  MousePointer,
  Timer,
  Sparkles,
  X,
  Target,
} from "lucide-react";
import { routes } from "../routes";
import { Skeleton } from "@/components/ui/skeleton";

// Import images
import sharkClear from "../data/images/shark_clear.jpg";
import kelpClear from "../data/images/kelp_clear.jpg";
import dolphinClear from "../data/images/dolphin_clear.jpg";
import sharkMedium from "../data/images/shark_medium.jpg";
import kelpMedium from "../data/images/kelp_medium.jpg";
import dolphinMedium from "../data/images/dolphin_medium.jpg";
import sharkHard from "../data/images/shark_hard.jpg";
import kelpHard from "../data/images/kelp_hard.jpg";
import dolphinHard from "../data/images/dolphin_hard.jpg";

// New images
import dolphinHard2 from "../data/images/dolphin_hard2.jpeg";
import dolphinHard3 from "../data/images/dolphin_hard3.avif";
import dolphinMedium2 from "../data/images/dolphin_medium2.jpg";
import kelpEasy2 from "../data/images/kelp_easy2.jpeg";
import kelpMedium2 from "../data/images/kelp_medium2.jpeg";
import kelpMedium3 from "../data/images/kelp_medium3.webp";
import sharkHard2 from "../data/images/shark_hard2.avif";
import sharkMedium2 from "../data/images/shark_medium2.jpg";
import sharkMedium3 from "../data/images/shark_medium3.webp";

// Game image interface
interface GameImage {
  id: string;
  imagePath: string;
  correctAnswer: "shark" | "kelp" | "dolphin";
}

interface QuickIDGameProps {
  onGameComplete?: (score: number, accuracy: number, allComplete: boolean) => void;
  showInstructions?: boolean;
  setShowInstructions?: (show: boolean) => void;
  resetGameRef?: React.MutableRefObject<(() => void) | null>;
}

// Sample game images - you'll replace these with your actual images
const gameImages: GameImage[] = [
  // Easy images (shown first)
  { id: "1", imagePath: sharkClear, correctAnswer: "shark" },
  { id: "2", imagePath: kelpClear, correctAnswer: "kelp" },
  { id: "3", imagePath: dolphinClear, correctAnswer: "dolphin" },
  { id: "10", imagePath: kelpEasy2, correctAnswer: "kelp" }, // New Easy

  // Medium difficulty
  { id: "4", imagePath: sharkMedium, correctAnswer: "shark" },
  { id: "5", imagePath: kelpMedium, correctAnswer: "kelp" },
  { id: "6", imagePath: dolphinMedium, correctAnswer: "dolphin" },
  { id: "11", imagePath: dolphinMedium2, correctAnswer: "dolphin" }, // New Medium
  { id: "12", imagePath: kelpMedium2, correctAnswer: "kelp" }, // New Medium
  { id: "13", imagePath: kelpMedium3, correctAnswer: "kelp" }, // New Medium
  { id: "14", imagePath: sharkMedium2, correctAnswer: "shark" }, // New Medium
  { id: "15", imagePath: sharkMedium3, correctAnswer: "shark" }, // New Medium

  // Hard (obscured/ambiguous)
  { id: "7", imagePath: sharkHard, correctAnswer: "shark" },
  { id: "8", imagePath: kelpHard, correctAnswer: "kelp" },
  { id: "9", imagePath: dolphinHard, correctAnswer: "shark" }, // Note: Original dolphinHard was a shark
  { id: "16", imagePath: dolphinHard2, correctAnswer: "dolphin" }, // New Hard
  { id: "17", imagePath: dolphinHard3, correctAnswer: "dolphin" }, // New Hard
  { id: "18", imagePath: sharkHard2, correctAnswer: "shark" }, // New Hard
];

// No image cache needed - we're using DOM elements with display toggling

const QuickIDGame: React.FC<QuickIDGameProps> = ({ 
  onGameComplete,
  showInstructions: externalShowInstructions,
  setShowInstructions: externalSetShowInstructions,
  resetGameRef
}) => {
  // Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [timePerImage, setTimePerImage] = useState(5000); // Start with 5 seconds per image
  const [timeRemaining, setTimeRemaining] = useState(30); // 1 minute gameplay
  const [currentImageStartTime, setCurrentImageStartTime] = useState(0); // Track when current image started
  
  // Use external state if provided, otherwise use local state
  const [internalShowInstructions, setInternalShowInstructions] = useState(() => {
    return localStorage.getItem("hasSeenQuickIDInstructions") !== "true";
  });
  
  // Use either external or internal state based on what's provided
  const showInstructions = externalShowInstructions !== undefined ? externalShowInstructions : internalShowInstructions;
  const setShowInstructions = externalSetShowInstructions || setInternalShowInstructions;
  // Add animation key state to force timer bar animation restart
  const [animationKey, setAnimationKey] = useState(0);
  // Add feedback state for showing checkmark/X
  const [showFeedback, setShowFeedback] = useState<
    "correct" | "incorrect" | null
  >(null);
  // Track if all images have been seen
  const [seenImages, setSeenImages] = useState<Set<string>>(new Set());
  const [allImagesSeen, setAllImagesSeen] = useState(false);
  // State for image loading
  const [isImageLoading, setIsImageLoading] = useState(true);
  // Fixed: Initialize bestScore as 0 if no saved score exists
  const [bestScore, setBestScore] = useState(() => {
    const saved = localStorage.getItem("quickIdBestScore");
    return saved ? parseInt(saved, 10) : 0;
  });
  const [isNewBestScore, setIsNewBestScore] = useState(false);
  // Store the final game score for display
  const [finalGameScore, setFinalGameScore] = useState(0);
  // Store whether the final game score was a new best
  const [finalGameWasNewBest, setFinalGameWasNewBest] = useState(false);

  // Refs
  const gameTimerRef = useRef<NodeJS.Timeout | null>(null);
  const imageTimerRef = useRef<NodeJS.Timeout | null>(null);
  // Use refs to track game state for timer
  const gameStateRef = useRef({
    score: 0,
    totalAttempts: 0,
    correctAnswersCount: 0,
    allImagesSeen: false,
  });

  // Sync state with ref
  useEffect(() => {
    gameStateRef.current.score = score;
    gameStateRef.current.totalAttempts = totalAttempts;
    gameStateRef.current.correctAnswersCount = correctAnswersCount;
    gameStateRef.current.allImagesSeen = allImagesSeen;
  }, [score, totalAttempts, correctAnswersCount, allImagesSeen]);

  // Check if all images have been seen
  useEffect(() => {
    if (seenImages.size === gameImages.length && !allImagesSeen) {
      setAllImagesSeen(true);
    }
  }, [seenImages, allImagesSeen]);

  // Handle image timer when image index changes or game starts
  useEffect(() => {
    if (gameStarted && !gameOver) {
      setImageTimer(timePerImage);
    }
  }, [currentImageIndex, gameStarted]); // Trigger when image changes or game starts

  // Reset loading state when current image changes
  useEffect(() => {
    if (!gameStarted) return;
    
    // Images are already in the DOM, just reset loading state
    // The actual loading state is handled by the onLoad handler in each image element
    setIsImageLoading(false);
    
  }, [currentImageIndex, gameStarted]);

  // Initialize game
  const startGame = () => {
    // Expose the startGame function through the ref if provided
    if (resetGameRef) {
      resetGameRef.current = startGame;
    }
    setGameStarted(true);
    setGameOver(false);
    setCurrentImageIndex(0);
    setScore(0);
    setTotalAttempts(0);
    setCorrectAnswersCount(0);
    setTimePerImage(5000); // Start with 5 seconds
    setTimeRemaining(30);
    setAnimationKey(0); // Reset animation key
    setSeenImages(new Set());
    setAllImagesSeen(false);
    setIsImageLoading(false);
    setIsNewBestScore(false); // Reset new best score flag

    // Reset the game state ref
    gameStateRef.current = {
      score: 0,
      totalAttempts: 0,
      correctAnswersCount: 0,
      allImagesSeen: false,
    };

    // Reload best score from localStorage to ensure it's up to date
    const savedBestScore = localStorage.getItem("quickIdBestScore");
    if (savedBestScore) {
      setBestScore(parseInt(savedBestScore, 10));
    }

    // Start the game timer (30 seconds)
    gameTimerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // The image timer will be set by the useEffect
  };

  // Set timer for current image
  const setImageTimer = (delayMs: number) => {
    // Clear any existing timer
    if (imageTimerRef.current) {
      clearTimeout(imageTimerRef.current);
      imageTimerRef.current = null;
    }

    // Only set a new timer if the game is still active
    if (gameStarted && !gameOver) {
      // Increment animation key to force restart of animation
      setAnimationKey((prev) => prev + 1);

      // Record the start time for this image
      setCurrentImageStartTime(Date.now());

      // Set new timer for current image
      imageTimerRef.current = setTimeout(() => {
        // Time's up for this image - count as incorrect
        handleAnswer("timeout");
      }, delayMs);
    }
  };

  // Move to the next image
  const moveToNextImage = () => {
    // Clear any existing timer first
    if (imageTimerRef.current) {
      clearTimeout(imageTimerRef.current);
      imageTimerRef.current = null;
    }

    // Briefly set loading state for opacity transition
    setIsImageLoading(true);
    
    // Move to next image
    const nextIndex = (currentImageIndex + 1) % gameImages.length;
    
    // Images are already in the DOM, just toggle visibility
    setIsImageLoading(false);

    // Set next image
    setCurrentImageIndex(nextIndex);

    // Gradually decrease time per image as the game timer (timeRemaining) nears the end.
    // Starts at 5 seconds, goes down to 1 seconds.
    const initialGameDurationSeconds = 30;
    const maxTimePerImageMs = 5000;
    const minTimePerImageMs = 500;

    // Calculate game progress based on timeRemaining (0.0 at start, ~1.0 towards end)
    // timeRemaining is in seconds.
    const gameProgress = Math.min(
      1,
      (initialGameDurationSeconds - timeRemaining) / initialGameDurationSeconds
    );

    // Interpolate timePerImage based on gameProgress
    const calculatedTimePerImageMs =
      maxTimePerImageMs -
      gameProgress * (maxTimePerImageMs - minTimePerImageMs);

    // Ensure the delay is within the defined min/max bounds
    const newDelayMs = Math.max(
      minTimePerImageMs,
      Math.min(maxTimePerImageMs, calculatedTimePerImageMs)
    );
    setTimePerImage(newDelayMs); // Update state for UI or other logic

    // Don't set the timer here - let useEffect handle it
  };

  // Handle player's answer
  const handleAnswer = (answer: "shark" | "kelp" | "dolphin" | "timeout") => {
    // Clear the current image timer
    if (imageTimerRef.current) {
      clearTimeout(imageTimerRef.current);
      imageTimerRef.current = null;
    }

    const currentImage = gameImages[currentImageIndex];

    // Mark this image as seen
    setSeenImages((prev) => new Set([...prev, currentImage.id]));
    setTotalAttempts((prev) => prev + 1); // Common for all outcomes, attempt is made

    if (answer === "timeout") {
      // For timeouts, move to the next image directly.
      // The "X" feedback overlay is skipped for a quicker transition; toast is sufficient.
      moveToNextImage();
    } else {
      const isCorrect = answer === currentImage.correctAnswer;
      if (isCorrect) {
        // Calculate points based on time remaining
        const elapsedTime = Date.now() - currentImageStartTime;
        const timeRatio = Math.max(0, 1 - elapsedTime / timePerImage);
        const pointsEarned = Math.round(10 * timeRatio);

        setScore((prev) => prev + pointsEarned);
        setCorrectAnswersCount((prev) => prev + 1);
        setShowFeedback("correct");
      } else {
        setShowFeedback("incorrect");
      }

      // For explicit answers (correct or incorrect), show feedback overlay for a short duration.
      setTimeout(() => {
        setShowFeedback(null);
        moveToNextImage();
      }, 200);
    }
  };

  // Fixed: End the game with proper best score handling
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

    // Use the ref to get the current values
    const currentScore = gameStateRef.current.score;
    const currentBestScore = bestScore;
    const totalAttemptsValue = gameStateRef.current.totalAttempts;
    const correctAnswersValue = gameStateRef.current.correctAnswersCount;
    const allImagesSeenValue = gameStateRef.current.allImagesSeen;
    
    // Set the final score for display
    setFinalGameScore(currentScore);
    
    if (currentScore > currentBestScore) {
      // Update best score immediately
      setBestScore(currentScore);
      setIsNewBestScore(true);
      setFinalGameWasNewBest(true); // Set this for the game over display
      localStorage.setItem("quickIdBestScore", currentScore.toString());
      
      // Show toast after a slight delay to ensure state is updated
      setTimeout(() => {
      }, 100);
    } else {
      setIsNewBestScore(false);
      setFinalGameWasNewBest(false);
    }

    // Calculate final accuracy
    const accuracy =
      totalAttemptsValue > 0
        ? Math.round((correctAnswersValue / totalAttemptsValue) * 100)
        : 0;

    // Call the onGameComplete callback if provided - pass both score and accuracy
    if (onGameComplete) {
      onGameComplete(currentScore, accuracy, allImagesSeenValue);
    }

    // Show final toast with score
    setTimeout(() => {
    }, 150);
  };

  // Instructions component
  const Instructions = ({ onClose }: { onClose: () => void }) => (
    <>
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          @keyframes twinkle {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          @keyframes slide-up {
            from { 
              opacity: 0;
              transform: translateY(20px);
            }
            to { 
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes slide-down {
            from { 
              opacity: 0;
              transform: translateY(-20px);
            }
            to { 
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-float {
            animation: float 3s ease-in-out infinite;
          }
          .animate-twinkle {
            animation: twinkle 2s ease-in-out infinite;
          }
          .animate-spin {
            animation: spin 8s linear infinite;
          }
          .animate-bounce {
            animation: bounce 2s ease-in-out infinite;
          }
          .animate-pulse {
            animation: pulse 2s ease-in-out infinite;
          }
          .animate-slide-up {
            animation: slide-up 0.5s ease-out forwards;
          }
          .animate-slide-down {
            animation: slide-down 0.5s ease-out forwards;
          }
          .animate-fade-in {
            animation: fade-in 0.5s ease-out forwards;
          }
        `}
      </style>
      <div className="bg-white rounded-xl p-6 max-w-lg w-full shadow-xl animate-fade-in">
        <div className="flex justify-between items-center mb-6 animate-slide-down">
          <h2 className="text-2xl font-bold text-ocean-dark">Quick ID Challenge 🦈</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-10 w-10 hover:scale-105 transition-transform">
            <X className="h-6 w-6" />
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 mb-6">
          {/* Step 1: Identify */}
          <div className="game-feature-card game-feature-card-blue">
            <div className="bg-blue-100 p-3 rounded-full animate-bounce">
              <MousePointer className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-700">Identify!</h3>
              <p className="text-blue-600 text-sm">Is it a shark, kelp, or dolphin? Click the matching button!</p>
            </div>
          </div>

          {/* Step 2: Be Quick */}
          <div className="game-feature-card game-feature-card-green">
            <div className="bg-green-100 p-3 rounded-full animate-spin">
              <Timer className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-700">Be Quick!</h3>
              <p className="text-green-600 text-sm">You have 5 seconds per image, and it gets faster! ⚡</p>
            </div>
          </div>

          {/* Step 3: Score Points */}
          <div className="game-feature-card game-feature-card-yellow">
            <div className="bg-yellow-100 p-3 rounded-full animate-float">
              <Trophy className="h-8 w-8 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-yellow-700">Score Points!</h3>
              <p className="text-yellow-600 text-sm">Get up to 10 points for each correct answer! The faster you are, the more points you get! 🏆</p>
            </div>
          </div>
        </div>

        {/* Pro Tips */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 animate-slide-up [animation-delay:300ms] hover:shadow-lg transition-all duration-300">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-purple-500 animate-twinkle" />
            <h3 className="text-lg font-semibold text-purple-700">Pro Tips!</h3>
          </div>
          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-center gap-2 hover:scale-105 transition-transform">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <p className="text-sm text-purple-600">= Correct answer! </p>
            </div>
            <div className="flex items-center gap-2 hover:scale-105 transition-transform">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <p className="text-sm text-purple-600">= Wrong answer or too slow!</p>
            </div>
            <div className="flex items-center gap-2 hover:scale-105 transition-transform">
              <Clock className="h-4 w-4 text-purple-500" />
              <p className="text-sm text-purple-600">Game lasts 30 seconds - how many can you get? ⏱️</p>
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-6 animate-slide-up [animation-delay:400ms]">
          <Button 
            onClick={onClose} 
            className="game-start-button"
          >
            Let's Play! 🚀
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <div className="game-container">
      {!gameStarted ? (
        <div className="flex items-center justify-center min-h-[80vh] animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl p-10 max-w-2xl w-full flex flex-col items-center">
            <div className="mb-8 animate-slide-down">
              <Clock className="h-20 w-20 text-ocean-dark" />
            </div>

            <h2 className="text-4xl font-bold text-ocean-dark mb-6 text-center animate-slide-down [animation-delay:200ms]">
              Quick ID Challenge! 🦈
            </h2>

            <div className="space-y-4 mb-8 w-full max-w-xl">
              <div className="game-feature-card game-feature-card-blue">
                <Clock className="game-feature-icon game-feature-icon-blue" />
                <span className="game-feature-text game-feature-text-blue">
                  Test your speed and accuracy
                </span>
              </div>
              <div className="game-feature-card game-feature-card-green">
                <Target className="game-feature-icon game-feature-icon-green" />
                <span className="game-feature-text game-feature-text-green">
                  Identify ocean creatures quickly
                </span>
              </div>
              <div className="game-feature-card game-feature-card-yellow">
                <Trophy className="game-feature-icon game-feature-icon-yellow" />
                <span className="game-feature-text game-feature-text-yellow">
                  Beat your high score
                </span>
              </div>
            </div>

            <button
              onClick={startGame}
              className="game-start-button"
            >
              Start Challenge
            </button>
          </div>
        </div>
      ) : (
        <div className="container mx-auto py-0 px-4 relative z-10">
          {/* Instructions Modal */}
          {showInstructions && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl p-6 max-w-lg w-full shadow-xl animate-fade-in">
                <Instructions
                  onClose={() => {
                    setShowInstructions(false);
                    localStorage.setItem("hasSeenQuickIDInstructions", "true");
                    if (!gameStarted && !gameOver) {
                      startGame();
                    }
                  }}
                />
              </div>
            </div>
          )}

          <div className="max-w-4xl mx-auto">
            {/* Instructions Modal */}
            {showInstructions && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-xl p-6 max-w-lg w-full shadow-xl animate-fade-in">
                  <Instructions
                    onClose={() => {
                      setShowInstructions(false);
                      localStorage.setItem("hasSeenQuickIDInstructions", "true");
                      if (!gameStarted && !gameOver) {
                        startGame();
                      }
                    }}
                  />
                </div>
              </div>
            )}

            {/* Game Timer - Only show when game has started */}
            {gameStarted && (
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
                <div className="w-full bg-gray-200 h-2 rounded-full mt-2">
                  <div
                    className="bg-ocean-dark h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${(timeRemaining / 30) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Game Area */}
            <div className="game-card">
              {gameStarted ? (
                <div className="p-4 flex flex-col items-center">
                  {/* Current image with preloaded images */}
                  <div className="relative h-[350px] w-full flex items-center justify-center bg-gray-100 rounded-lg mb-6 overflow-hidden">
                    {/* Render all images but only show the current one */}
                    {gameImages.map((image, index) => (
                      <div
                        key={image.id}
                        className="absolute inset-0 max-h-full max-w-full h-full w-full"
                        style={{
                          display: index === currentImageIndex ? 'block' : 'none',
                          opacity: isImageLoading ? 0 : 1,
                          transition: 'opacity 200ms ease-in-out'
                        }}
                      >
                        <img 
                          src={image.imagePath}
                          alt={`${image.correctAnswer} image`}
                          className="h-full w-full object-cover"
                          style={{ objectPosition: 'center' }}
                          onLoad={() => {
                            if (index === currentImageIndex) {
                              setIsImageLoading(false);
                            }
                          }}
                        />
                      </div>
                    ))}

                    {/* Feedback overlay */}
                    {showFeedback && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-10 animate-fade-in">
                        {showFeedback === "correct" ? (
                          <div className="bg-green-500 rounded-full p-10 animate-pulse-slow">
                            <CheckCircle className="h-24 w-24 text-white" />
                          </div>
                        ) : (
                          <div className="bg-red-500 rounded-full p-10 animate-pulse-slow">
                            <AlertTriangle className="h-24 w-24 text-white" />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Timer indicator with key to force animation restart */}
                    <div className="absolute bottom-0 left-0 right-0 h-2 bg-gray-200/50 backdrop-blur-sm">
                      <div
                        key={animationKey}
                        className="h-full bg-ocean-dark rounded-full"
                        style={{
                          width: "100%",
                          animation: `shrink ${timePerImage / 1000}s linear forwards`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Answer buttons */}
                  <div className="grid grid-cols-3 gap-4 w-full max-w-xl">
                    <Button
                      className="h-16 text-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:scale-105 transition-all duration-300"
                      onClick={() => handleAnswer("shark")}
                    >
                      Shark
                    </Button>
                    <Button
                      className="h-16 text-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:scale-105 transition-all duration-300"
                      onClick={() => handleAnswer("kelp")}
                    >
                      Kelp
                    </Button>
                    <Button
                      className="h-16 text-lg bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:scale-105 transition-all duration-300"
                      onClick={() => handleAnswer("dolphin")}
                    >
                      Dolphin
                    </Button>
                  </div>
                </div>
              ) : gameOver ? (
                <div className="game-over-screen">
                  <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4 animate-float" />
                  <h2 className="game-over-title">
                    Game Over!
                  </h2>

                  <div className="game-over-score">
                    <div className="text-5xl font-bold text-ocean-dark mb-2">
                      {finalGameScore}
                    </div>
                    <p className="text-gray-700">Total Points</p>

                    {/* Best Score Display */}
                    {finalGameWasNewBest ? (
                      <div className="game-over-new-best">
                        <p className="text-yellow-700 font-bold text-lg flex items-center justify-center gap-2">
                          <Trophy className="h-5 w-5" /> NEW BEST SCORE! 🏆
                        </p>
                      </div>
                    ) : (
                      <div className="mt-4">
                        <p className="text-gray-600">
                          Best Score: <span className="font-bold text-ocean-dark">{bestScore}</span>
                        </p>
                      </div>
                    )}

                    <div className="mt-4 text-sm text-gray-700 bg-white/50 p-3 rounded-lg">
                      <div className="flex justify-between mb-2">
                        <div>Accuracy:</div>
                        <div className="font-bold text-ocean-dark">
                          {totalAttempts > 0
                            ? Math.round(
                                (correctAnswersCount / totalAttempts) * 100
                              )
                            : 0}
                          %
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <div>Attempts:</div>
                        <div className="font-bold">{totalAttempts}</div>
                      </div>
                    </div>
                  </div>

                  <Button
                    className="game-over-button"
                    onClick={startGame}
                  >
                    <RefreshCcw className="h-5 w-5 mr-2" /> Play Again
                  </Button>
                </div>
              ) : null}
            </div>

            {/* Score card (only visible during gameplay) */}
            {gameStarted && (
              <div className="game-score-card">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-ocean-dark">Current Score</h3>
                  <div className="text-3xl font-bold text-ocean-dark">
                    {score}{" "}
                    <span className="text-sm font-normal text-gray-600">
                      points
                    </span>
                  </div>
                </div>
                <div className="flex justify-between mt-2">
                  <div>
                    <span className="text-gray-700">Correct:</span>
                    <span className="font-bold text-green-600 ml-1">
                      {totalAttempts > 0
                        ? Math.round((correctAnswersCount / totalAttempts) * 100)
                        : 0}
                      %
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-700">Attempts:</span>
                    <span className="font-bold ml-1">{totalAttempts}</span>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Best Score:</span>
                    <span className="font-bold text-ocean-dark">
                      {bestScore > 0 ? bestScore : "--"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CSS for animation */}
      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default QuickIDGame;
