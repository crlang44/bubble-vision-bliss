import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogPortal,
  DialogOverlay
} from '@/components/ui/dialog';
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useIsTablet } from '@/hooks/use-mobile';
import { CheckCircle, Fish, RefreshCcw, Trophy, Zap, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import Canvas from '../components/Canvas';
import ScoreBoard from '../components/ScoreBoard';
import Timer from '../components/Timer';
import { OceanImage, getProgressiveImageSet, getAllLabelsFromImageSet } from '../data/oceanImages';
import { routes } from '../routes';
import { Annotation, AnnotationType, calculateScore, labelColors } from '../utils/annotationUtils';
import GameLayout from '../components/GameLayout';
import { cn } from '@/lib/utils';

// Custom DialogContent without close button
const GameCompletionDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPortal>
));
GameCompletionDialogContent.displayName = "GameCompletionDialogContent";

const OceanAnnotationGamePage = () => {
  const isTablet = useIsTablet();

  const [showInstructions, setShowInstructions] = useState(() => {
    return localStorage.getItem('hasSeenInstructions') !== 'true';
  });
  const [hasSeenInstructions, setHasSeenInstructions] = useState(() => {
    return localStorage.getItem('hasSeenInstructions') === 'true';
  });
  const [selectedTool, setSelectedTool] = useState<AnnotationType>('rectangle');
  const [currentLabel, setCurrentLabel] = useState('Great White Shark');
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedImage, setSelectedImage] = useState<OceanImage | null>(null);
  const [timeBonus, setTimeBonus] = useState(15);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [imageSubmitted, setImageSubmitted] = useState(false);
  const [availableLabels, setAvailableLabels] = useState<string[]>(['Kelp', 'Great White Shark']);
  const [showGroundTruth, setShowGroundTruth] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [currentImages, setCurrentImages] = useState<OceanImage[]>([]);
  const [cumulativeScore, setCumulativeScore] = useState(0);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [annotatedImages, setAnnotatedImages] = useState<Set<string>>(new Set());
  // New state for tracking best score
  const [bestScore, setBestScore] = useState<number>(() => {
    const storedBestScore = localStorage.getItem('oceanAnnotationBestScore');
    return storedBestScore ? parseInt(storedBestScore, 10) : 0;
  });
  // Modified: Always start as false on page refresh
  const [hasShownFirstAnnotationTip, setHasShownFirstAnnotationTip] = useState<boolean>(false);
  // Track if user has started annotating
  const [hasStartedAnnotating, setHasStartedAnnotating] = useState(false);
  // Track timer reset key to force timer component to reset
  const [timerResetKey, setTimerResetKey] = useState(0);
  // Track if the game has started
  const [gameStarted, setGameStarted] = useState(false);

  const TIMER_DURATION = 30; // 1 minute in seconds

  // Load initial images based on round and set available labels from the entire set
  useEffect(() => {
    // Get images for the current round, ensuring they all have annotations
    const imageSet = getProgressiveImageSet(currentRound);
    const validImages = imageSet.filter(img => img.targetAnnotations.length > 0);
    setCurrentImages(validImages);

    // Set available labels from all images in the current set
    if (validImages.length > 0) {
      const allLabels = getAllLabelsFromImageSet(validImages);
      setAvailableLabels(allLabels);
      
      // Set default current label to the first available label
      if (allLabels.length > 0) {
        setCurrentLabel(allLabels[0]);
      }
    }

    // Only select an image if we have valid images and no image is currently selected
    if (validImages.length > 0 && !selectedImage) {
      setSelectedImage(validImages[0]);
    }
  }, [currentRound]);

  useEffect(() => {
    if (!selectedImage) return;

    setAnnotations([]);
    setImageSubmitted(false);
    setTimeBonus(25); // Set initial time bonus to a lower value
    setIsTimerRunning(true);
    setHasStartedAnnotating(false);
  }, [selectedImage, showInstructions]);

  // Check if all images have been annotated
  useEffect(() => {
    if (currentImages.length > 0 && annotatedImages.size >= currentImages.length) {
      // Add a delay before showing the completion dialog (2 seconds)
      setTimeout(() => {
        setShowCompletionDialog(true);
        setIsTimerRunning(false); // Stop the timer when game is complete

        // Update best score if current cumulative score is higher
        if (cumulativeScore > bestScore) {
          setBestScore(cumulativeScore);
          localStorage.setItem('oceanAnnotationBestScore', cumulativeScore.toString());
        }
      }, 2000);
    }
  }, [annotatedImages, currentImages, cumulativeScore, bestScore]);

  const handleClearAnnotations = () => {
    setAnnotations([]);
    // toast('All annotations cleared'); // Commented out
  };

  const handleAnnotationComplete = (annotation: Annotation) => {
    // Check if this is an update to an existing annotation
    const existingIndex = annotations.findIndex(a => a.id === annotation.id);
    
    if (existingIndex !== -1) {
      // Update existing annotation
      const newAnnotations = [...annotations];
      newAnnotations[existingIndex] = annotation;
      setAnnotations(newAnnotations);
    } else {
      // Add new annotation
      const newAnnotations = [...annotations, annotation];
      setAnnotations(newAnnotations);

      // Show first annotation tip if it's the first annotation for this session
      if (newAnnotations.length === 1 && !hasShownFirstAnnotationTip) {
        setHasShownFirstAnnotationTip(true);
      }
    }
  };

  const handleLabelChange = (label: string) => {
    setCurrentLabel(label);
  };

  const handleImageSelect = (image: OceanImage) => {
    if (image.id !== selectedImage?.id) {
      setSelectedImage(image);
      setAnnotations([]);
      setIsTimerRunning(false);
    }
  };

  const handleTimeUp = () => {
    setIsTimerRunning(false);
    handleSubmit();
    // Show completion dialog when timer runs out
    setShowCompletionDialog(true);

    // Update best score if current cumulative score is higher
    if (cumulativeScore > bestScore) {
      setBestScore(cumulativeScore);
      localStorage.setItem('oceanAnnotationBestScore', cumulativeScore.toString());
    }
  };

  // Calculate time bonus as a percentage of remaining time
  const handleTimerUpdate = (timeLeft: number) => {
    // Calculate bonus as a percentage of time left, capped at 25 points
    const maxBonus = 25;
    const calculatedBonus = Math.floor((timeLeft / TIMER_DURATION) * maxBonus);
    setTimeBonus(calculatedBonus);
  };

  const handleSubmit = () => {
    if (!selectedImage) return;

    // Pause the timer when submitting
    setIsTimerRunning(false);
    console.log("Submit clicked, timer paused");

    setImageSubmitted(true);
    setShowGroundTruth(true);

    // Mark this image as annotated
    if (selectedImage.id) {
      setAnnotatedImages(prev => new Set([...prev, selectedImage.id]));
    }

    // Skip feedback if there are no annotations or only one target
    if (annotations.length === 0 || selectedImage.targetAnnotations.length <= 1) {
      return;
    }

    // More accurate scoring - match each target annotation with user annotations
    // and verify not just labels but also positions
    let allTargetsFound = true;
    let foundCount = 0;
    let totalTargets = selectedImage.targetAnnotations.length;

    // Check each target annotation
    for (const targetAnnotation of selectedImage.targetAnnotations) {
      // Find any user annotation that matches this target
      let foundMatch = false;

      for (const userAnnotation of annotations) {
        // Check if label matches first
        if (userAnnotation.label === targetAnnotation.label) {
          // Check if the positions overlap with reasonable accuracy
          const score = calculateScore(userAnnotation, targetAnnotation);
          console.log(`Checking match for ${targetAnnotation.label}: Score ${score}`);
          // Consider a match if score is above threshold (1%)
          if (score >= 1) {
            foundMatch = true;
            foundCount++;
            break;
          }
        }
      }

      if (!foundMatch) {
        allTargetsFound = false;
      }
    }

    // Show appropriate feedback only for images with multiple targets
    if (totalTargets > 1) {
      if (allTargetsFound) {
        // toast.success('Great job! You found all the targets!'); // Commented out
      } else if (foundCount > 0) {
        // If user found some but not all targets
        const missedCount = totalTargets - foundCount;
        // toast.error(`You found ${foundCount} target${foundCount > 1 ? 's' : ''}, but missed ${missedCount} target${missedCount > 1 ? 's' : ''}!`); // Commented out
      } else {
        // If user found none of the targets
        // toast.error(`You missed all ${totalTargets} targets!`); // Commented out
      }
    }
  };

  const handleScoreUpdate = (score: number) => {
    setFinalScore(score);
    setCumulativeScore(prevScore => prevScore + score);
  };

  const handlePlayAgain = () => {
    // Reset all game state
    setImageSubmitted(false);
    setAnnotations([]);
    setTimeBonus(25); // Reset to a lower initial time bonus
    setShowGroundTruth(false);
    setShowCompletionDialog(false);
    // Reset cumulative score and annotated images when trying again
    setCumulativeScore(0);
    setAnnotatedImages(new Set());
    // Select the first image
    if (currentImages.length > 0) {
      setSelectedImage(currentImages[0]);
    }
    // Reset timer state but don't start it yet - wait for Start Game
    setIsTimerRunning(false);
    setHasStartedAnnotating(false);
    setGameStarted(false);
    // Increment timer key to force timer component to reset
    setTimerResetKey(prev => prev + 1);
  };

  const handleNewImage = () => {
    if (!selectedImage) return;

    const currentIndex = currentImages.findIndex(img => img.id === selectedImage.id);
    const nextIndex = (currentIndex + 1) % currentImages.length;

    // If this is the last image and all have been annotated, don't allow selecting a new one
    if (currentIndex === currentImages.length - 1 && annotatedImages.size >= currentImages.length) {
      // toast.info("You've completed all images!"); // Commented out
      return;
    }

    setSelectedImage(currentImages[nextIndex]);
    setAnnotations([]);
    setShowGroundTruth(false);
    // Start the timer again when moving to the next image
    setIsTimerRunning(true);
  };

  const handleGoToQuickIDGame = () => {
    window.location.href = routes.quickId;
  };

  // Determine if we've reached the last image
  const isLastImage = selectedImage &&
    currentImages.findIndex(img => img.id === selectedImage.id) === currentImages.length - 1;
  const allImagesAnnotated = currentImages.length > 0 &&
    annotatedImages.size >= currentImages.length;

  // Add a console log to debug timer state changes
  useEffect(() => {
    console.log("Timer running state changed:", isTimerRunning);
  }, [isTimerRunning]);

  return (
    <GameLayout
      pageType="annotation"
      bestScore={bestScore}
      setShowInstructions={setShowInstructions}
    >
      {/* Instructions Dialog */}
      <Dialog
        open={showInstructions}
        onOpenChange={(open) => {
          if (!open) {
            setShowInstructions(false);
            setHasSeenInstructions(true);
            localStorage.setItem('hasSeenInstructions', 'true');
            setIsTimerRunning(false);
          }
        }}
      >
        <DialogContent className="bg-white max-w-lg w-full shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-ocean-dark flex items-center gap-2">
              <Fish className="h-8 w-8" />
              Ocean Explorer Challenge
            </DialogTitle>
            <DialogDescription className="text-gray-700">
              Become an ocean scientist! 🐋
            </DialogDescription>
          </DialogHeader>
          <div className="bg-blue-50 p-4 rounded-lg">
            <ul className="list-disc pl-5 text-gray-700 space-y-2">
              <li>🎯 Find and draw boxes around ocean creatures</li>
              <li>🏷️ Pick the right name for each creature</li>
              <li>⏰ Race against the clock!</li>
              <li>⭐ Get bonus points for speed and accuracy</li>
            </ul>
          </div>
          <DialogFooter>
            <Button
              className="w-full bg-ocean-dark hover:bg-ocean-darker text-white text-lg py-6"
              onClick={() => {
                setShowInstructions(false);
                setHasSeenInstructions(true);
                localStorage.setItem('hasSeenInstructions', 'true');
                setIsTimerRunning(false);
              }}
            >
              Let's Explore! 🌊
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Main Content */}
      {!gameStarted && !showInstructions && (
        <div className="flex justify-center">
          <div className="w-full max-w-4xl relative aspect-[16/9] bg-white rounded-xl shadow-lg overflow-hidden flex items-center justify-center">
            <div className="flex items-center justify-center h-full">
              <div className="p-8 text-center">
                <Fish className="h-20 w-20 text-ocean-dark mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-ocean-dark mb-4">
                  Ready to Explore the Ocean? 🌊
                </h2>
                <p className="text-gray-700 mb-6 text-lg">
                  Draw boxes around amazing ocean creatures and become a marine scientist!
                </p>
                <Button
                  className="bg-ocean-dark hover:bg-ocean-darker text-white text-xl px-8 py-6 h-auto animate-pulse"
                  onClick={() => {
                    setGameStarted(true);
                    setIsTimerRunning(true);
                  }}
                >
                  Start Adventure! 🚀
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {gameStarted && !showInstructions && (
        <div className="flex justify-center">
          <div className="w-full max-w-6xl space-y-4">
            <div className="bg-white rounded-xl p-3 shadow-md">
              <Timer
                key={timerResetKey}
                duration={TIMER_DURATION}
                onTimeUp={handleTimeUp}
                isRunning={isTimerRunning && !showInstructions}
                onTimerUpdate={handleTimerUpdate}
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1 relative aspect-[16/9] bg-white rounded-xl shadow-lg overflow-hidden flex items-center justify-center">
                {selectedImage ? (
                  <Canvas
                    imageUrl={selectedImage.imagePath}
                    selectedTool={selectedTool}
                    currentLabel={currentLabel}
                    onAnnotationComplete={handleAnnotationComplete}
                    annotations={annotations}
                    onAnnotationUpdate={setAnnotations}
                    targetAnnotations={selectedImage.targetAnnotations}
                    showGroundTruth={showGroundTruth}
                    onToggleGroundTruth={() => setShowGroundTruth(!showGroundTruth)}
                    originalWidth={selectedImage.originalWidth}
                    originalHeight={selectedImage.originalHeight}
                    disabled={imageSubmitted}
                    availableLabels={availableLabels}
                    onLabelChange={handleLabelChange}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p>Please select an image</p>
                  </div>
                )}
              </div>
              <div className="w-80 bg-white rounded-xl p-4 shadow-md flex flex-col justify-between">
                {/* Annotation Tools or ScoreBoard */}
                {!imageSubmitted && selectedImage ? (
                  <div className="flex flex-col gap-3">
                    <p className="text-sm text-gray-700 text-center">
                      Drag to draw boxes around objects in the image. <br />
                    </p>
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-wrap gap-2 justify-center">
                        {availableLabels.map((label) => (
                          <Button
                            key={label}
                            variant="outline"
                            size="sm"
                            onClick={() => handleLabelChange(label)}
                            className={`text-xs ${currentLabel === label
                                ? `bg-${labelColors[label]?.slice(1)}/20 border-${labelColors[label]?.slice(1)}/30 text-${labelColors[label]?.slice(1)}`
                                : ''
                              }`}
                            style={{
                              borderColor: currentLabel === label ? labelColors[label] : undefined,
                              color: currentLabel === label ? labelColors[label] : undefined
                            }}
                          >
                            {label}
                          </Button>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClearAnnotations}
                        className="text-gray-500 hover:text-red-500 flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Clear All
                      </Button>
                    </div>
                    <p className="text-sm text-gray-700 text-center">
                      Make sure to select the correct type.
                    </p>
                  </div>
                ) : (
                  <div className="flex justify-center">
                    <ScoreBoard
                      userAnnotations={annotations}
                      targetAnnotations={selectedImage?.targetAnnotations || []}
                      timeBonus={timeBonus}
                      isComplete={imageSubmitted}
                      cumulativeScore={cumulativeScore}
                      onScoreChange={handleScoreUpdate}
                    />
                  </div>
                )}
                {/* Submit/Next/Replay Buttons */}
                <div className="flex flex-col gap-2 mt-4">
                  {!imageSubmitted ? (
                    <Button
                      onClick={handleSubmit}
                      className="btn-coral flex items-center gap-1 justify-center"
                      disabled={!selectedImage || annotations.length === 0}
                    >
                      <CheckCircle className="h-4 w-4" /> Submit
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={handleNewImage}
                        className="btn-coral flex items-center gap-1 justify-center"
                        disabled={isLastImage && allImagesAnnotated}
                      >
                        <Fish className="h-4 w-4" />
                        {isLastImage && allImagesAnnotated ? 'All Images Complete!' : 'Next Image'}
                      </Button>
                      {isLastImage && allImagesAnnotated && (
                        <Button
                          onClick={handlePlayAgain}
                          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white flex items-center gap-1 justify-center"
                        >
                          <RefreshCcw className="h-4 w-4" /> Replay
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Game Completion Dialog */}
      <Dialog
        open={showCompletionDialog}
        onOpenChange={(open) => {
          setShowCompletionDialog(open);
        }}
      >
        <GameCompletionDialogContent
          onInteractOutside={(e) => {
            e.preventDefault();
          }}
          className="bg-gradient-to-b from-blue-50 to-white border-blue-200 max-w-md"
        >
          <DialogHeader>
            <DialogTitle className="text-2xl text-center flex items-center justify-center gap-2">
              <Trophy className="text-yellow-500 h-6 w-6" />
              Game Complete!
            </DialogTitle>
            <DialogDescription className="text-center text-gray-700 mt-2">
              You've completed the ocean annotation challenge!
            </DialogDescription>
          </DialogHeader>
          <div className="text-center">
            {cumulativeScore >= 100 ? (
              <p className="text-green-600 font-medium">Amazing job! You're an annotation expert!</p>
            ) : cumulativeScore >= 70 ? (
              <p className="text-blue-600 font-medium">Good work! Keep practicing to improve!</p>
            ) : (
              <p className="text-amber-600 font-medium">Nice try! Practice makes perfect!</p>
            )}
          </div>
          <div className="py-4 flex flex-col items-center">
            {/* Current score display */}
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
          </div>
          <DialogFooter className="flex flex-col gap-2">
            <Button
              className="w-full"
              variant="outline"
              onClick={handleGoToQuickIDGame}
            >
              <Zap className="h-4 w-4 mr-2" /> Play Quick ID
            </Button>
            <Button
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
              onClick={handlePlayAgain}
            >
              <RefreshCcw className="h-4 w-4 mr-2" /> Play Again
            </Button>
          </DialogFooter>
        </GameCompletionDialogContent>
      </Dialog>
    </GameLayout>
  );
};

export default OceanAnnotationGamePage;
