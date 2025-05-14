import React, { useState, useEffect, useRef } from "react";
import BubbleBackground from "../components/BubbleBackground";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Fish,
  CheckCircle,
  RefreshCcw,
  Trophy,
  Clock,
  AlertTriangle,
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
  onGameComplete?: (score: number, allComplete: boolean) => void;
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

// Preload images for faster switching
const preloadImages = () => {
  gameImages.forEach((image) => {
    const img = new Image();
    img.src = image.imagePath;
  });
};

const QuickIDGame: React.FC<QuickIDGameProps> = ({ onGameComplete }) => {
  // Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [timePerImage, setTimePerImage] = useState(5000); // Start with 5 seconds per image
  const [timeRemaining, setTimeRemaining] = useState(60); // 1 minute gameplay
  const [currentImageStartTime, setCurrentImageStartTime] = useState(0); // Track when current image started
  const [showInstructions, setShowInstructions] = useState(() => {
    return localStorage.getItem("hasSeenQuickIDInstructions") !== "true";
  });
  // Add animation key state to force timer bar animation restart
  const [animationKey, setAnimationKey] = useState(0);
  // Add feedback state for showing checkmark/X
  const [showFeedback, setShowFeedback] = useState<
    "correct" | "incorrect" | null
  >(null);
  // Track if all images have been seen at least once
  const [seenImages, setSeenImages] = useState<Set<string>>(new Set());
  const [allImagesSeen, setAllImagesSeen] = useState(false);
  // Add state for next image preloading
  const [nextImagePreloaded, setNextImagePreloaded] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);

  // Refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const gameTimerRef = useRef<NodeJS.Timeout | null>(null);
  const imageTimerRef = useRef<NodeJS.Timeout | null>(null);
  const nextImageRef = useRef<HTMLImageElement | null>(null);

  // Preload all images when component mounts
  useEffect(() => {
    preloadImages();
  }, []);

  // Check if all images have been seen
  useEffect(() => {
    if (seenImages.size === gameImages.length && !allImagesSeen) {
      setAllImagesSeen(true);
    }
  }, [seenImages, allImagesSeen]);

  // Preload next image whenever current image index changes
  useEffect(() => {
    if (!gameStarted) return;

    // Calculate the next image index
    const nextIndex = (currentImageIndex + 1) % gameImages.length;
    const nextImage = gameImages[nextIndex];

    // Create an image element for preloading
    if (!nextImageRef.current) {
      nextImageRef.current = new Image();
    }

    // Set up onload handler
    nextImageRef.current.onload = () => {
      setNextImagePreloaded(true);
    };

    // Set the src to trigger preloading
    nextImageRef.current.src = nextImage.imagePath;

    return () => {
      // Clean up onload handler
      if (nextImageRef.current) {
        nextImageRef.current.onload = null;
      }
    };
  }, [currentImageIndex, gameStarted]);

  // Initialize game
  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setCurrentImageIndex(0);
    setScore(0);
    setTotalAttempts(0);
    setCorrectAnswersCount(0);
    setTimePerImage(5000); // Start with 5 seconds
    setTimeRemaining(60);
    setAnimationKey(0); // Reset animation key
    setSeenImages(new Set());
    setAllImagesSeen(false);
    setIsImageLoading(false);

    // Start the game timer (60 seconds)
    gameTimerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Set the first image timeout
    setImageTimer(5000); // Pass initial 5 seconds
  };

  // Set timer for current image
  const setImageTimer = (delayMs: number) => {
    // Clear any existing timer
    if (imageTimerRef.current) {
      clearTimeout(imageTimerRef.current);
      imageTimerRef.current = null;
    }

    // Increment animation key to force restart of animation
    setAnimationKey((prev) => prev + 1);

    // Record the start time for this image
    setCurrentImageStartTime(Date.now());

    // Set new timer for current image
    imageTimerRef.current = setTimeout(() => {
      // Time's up for this image - count as incorrect
      handleAnswer("timeout");
    }, delayMs);
  };

  // Move to the next image
  const moveToNextImage = () => {
    // Move to next image or end game if no more images
    const nextIndex = (currentImageIndex + 1) % gameImages.length;

    // Set next image
    setCurrentImageIndex(nextIndex);

    // Gradually decrease time per image as the game timer (timeRemaining) nears the end.
    // Starts at 5 seconds, goes down to 2 seconds.
    const initialGameDurationSeconds = 60;
    const maxTimePerImageMs = 5000;
    const minTimePerImageMs = 2000;

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

    // Set timer for next image
    setImageTimer(newDelayMs); // Pass calculated delay directly
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
      toast.error("Too slow!", { duration: 300 });
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
        toast.success(`Correct! +${pointsEarned} points`, { duration: 300 });
      } else {
        setShowFeedback("incorrect");
        toast.error("Incorrect!", { duration: 300 });
      }

      // For explicit answers (correct or incorrect), show feedback overlay for a short duration.
      setTimeout(() => {
        setShowFeedback(null);
        moveToNextImage();
      }, 200);
    }
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

    // Calculate final score
    const accuracy =
      totalAttempts > 0
        ? Math.round((correctAnswersCount / totalAttempts) * 100)
        : 0;

    // Call the onGameComplete callback if provided
    if (onGameComplete) {
      onGameComplete(accuracy, allImagesSeen);
    }

    // Show toast with score
    toast.success(
      `Game Over! You scored ${score} points with ${accuracy}% accuracy!`
    );
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
      <h2 className="text-2xl font-bold text-ocean-dark mb-4">
        Quick ID Challenge
      </h2>

      <div className="space-y-4 mb-6">
        <p className="text-gray-700">
          Test your quick identification skills! You'll be shown a series of
          ocean images and must quickly identify whether each contains a shark,
          kelp, or dolphin.
        </p>

        <div className="bg-blue-50 p-3 rounded-lg">
          <h3 className="font-bold text-ocean-dark mb-2">How to Play:</h3>
          <ul className="list-disc pl-5 text-gray-700 space-y-2">
            <li>
              Click the correct button (shark, kelp, or dolphin) for each image
            </li>
            <li>
              Earn up to 10 points for each correct answer - the faster you
              answer, the more points you get!
            </li>
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
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Quick ID Challenge
            </h1>
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
              onClick={() => (window.location.href = routes.home)}
              className="bg-white/80 hover:bg-white"
            >
              Ocean Annotation
            </Button>
          </div>
        </header>

        {/* Instructions Modal */}
        {showInstructions && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
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
                {/* Current image with improved loading */}
                <div className="relative h-[350px] w-full flex items-center justify-center bg-gray-100 rounded-lg mb-6">
                  {/* Actual image (with hidden previous image to prevent flicker) */}
                  <img
                    key={gameImages[currentImageIndex].id} // Add key to force re-render
                    src={gameImages[currentImageIndex].imagePath}
                    alt="Identify this"
                    className="max-h-full max-w-full object-cover transition-opacity duration-200 h-full w-full"
                    style={{ opacity: 1 }}
                    onLoad={() => setIsImageLoading(false)}
                  />

                  {/* Feedback overlay */}
                  {showFeedback && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-10">
                      {showFeedback === "correct" ? (
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
                        width: "100%",
                        animation: `shrink ${
                          timePerImage / 1000
                        }s linear forwards`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Answer buttons */}
                <div className="grid grid-cols-3 gap-4 w-full max-w-xl">
                  <Button
                    className="h-16 text-lg bg-blue-500 hover:bg-blue-600 text-white"
                    onClick={() => handleAnswer("shark")}
                  >
                    Shark
                  </Button>
                  <Button
                    className="h-16 text-lg bg-green-500 hover:bg-green-600 text-white"
                    onClick={() => handleAnswer("kelp")}
                  >
                    Kelp
                  </Button>
                  <Button
                    className="h-16 text-lg bg-purple-500 hover:bg-purple-600 text-white"
                    onClick={() => handleAnswer("dolphin")}
                  >
                    Dolphin
                  </Button>
                </div>
              </div>
            ) : gameOver ? (
              <div className="p-8 text-center">
                <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-ocean-dark mb-2">
                  Game Over!
                </h2>

                <div className="bg-blue-50 p-4 rounded-lg max-w-md mx-auto mb-6">
                  <div className="text-5xl font-bold text-ocean-dark mb-2">
                    {score}
                  </div>
                  <p className="text-gray-700">Total Points</p>

                  <div className="mt-4 text-sm text-gray-700">
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
                  className="bg-ocean-dark hover:bg-ocean-darker text-white text-lg px-8 py-6 h-auto"
                  onClick={startGame}
                >
                  <RefreshCcw className="h-5 w-5 mr-2" /> Play Again
                </Button>
              </div>
            ) : (
              <div className="p-8 text-center">
                <Fish className="h-16 w-16 text-ocean-dark mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-ocean-dark mb-4">
                  Ready to Test Your Quick ID Skills?
                </h2>
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
            </div>
          )}
        </div>

        <footer className="mt-8 text-center text-white/80 text-sm">
          <p>
            Quick ID Challenge - Test your ocean creature identification skills!
          </p>

          {/* Return to Index button at bottom of page */}
          <div className="mt-4">
            <Button
              variant="outline"
              onClick={() => (window.location.href = routes.home)}
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
