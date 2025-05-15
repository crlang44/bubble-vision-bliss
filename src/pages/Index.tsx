import React, { useState, useEffect } from 'react';
import BubbleBackground from '../components/BubbleBackground';
import Instructions from '../components/Instructions';
import Canvas from '../components/Canvas';
import AnnotationTools from '../components/AnnotationTools';
import ScoreBoard from '../components/ScoreBoard';
import Timer from '../components/Timer';
import ImageSelector from '../components/ImageSelector';
import AnnotationScoreVisual from '../components/AnnotationScoreVisual';
import { Annotation, AnnotationType, calculateScore } from '../utils/annotationUtils';
import { oceanImages, OceanImage, getProgressiveImageSet } from '../data/oceanImages';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { routes, navigateTo } from '../routes';
import { Fish, CheckCircle, RefreshCcw, Trophy, Zap } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { useIsTablet } from '@/hooks/use-mobile';
import TabletSidebar from '@/components/TabletSidebar';
import TabletSidebarTrigger from '@/components/TabletSidebarTrigger';
import { SidebarProvider } from '@/components/ui/sidebar';

const Index = () => {
  const isTablet = useIsTablet();
  
  const [showInstructions, setShowInstructions] = useState(() => {
    return localStorage.getItem('hasSeenInstructions') !== 'true';
  });
  const [hasSeenInstructions, setHasSeenInstructions] = useState(() => {
    return localStorage.getItem('hasSeenInstructions') === 'true';
  });
  const [selectedTool, setSelectedTool] = useState<AnnotationType | null>('rectangle');
  const [currentLabel, setCurrentLabel] = useState('Whale');
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedImage, setSelectedImage] = useState<OceanImage | null>(null);
  const [timeBonus, setTimeBonus] = useState(15);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [availableLabels, setAvailableLabels] = useState<string[]>(['Whale', 'Fish', 'Coral']);
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
  
  const TIMER_DURATION = 60; // 1 minute in seconds
  
  const [isTimerStuck, setIsTimerStuck] = useState(false);
  const [isGameStuck, setIsGameStuck] = useState(false);
  const [isToolsStuck, setIsToolsStuck] = useState(false);
  
  // Load initial images based on round
  useEffect(() => {
    // Get images for the current round, ensuring they all have annotations
    const imageSet = getProgressiveImageSet(currentRound);
    const validImages = imageSet.filter(img => img.targetAnnotations.length > 0);
    setCurrentImages(validImages);
    
    // Only select an image if we have valid images and no image is currently selected
    if (validImages.length > 0 && !selectedImage) {
      setSelectedImage(validImages[0]);
    }
  }, [currentRound]);
  
  useEffect(() => {
    if (!selectedImage) return;
    
    const labels = selectedImage.targetAnnotations.map(annotation => annotation.label);
    const allLabels = [...new Set([...labels, 'Fish', 'Coral', 'Rock', 'Seaweed', 'Bubbles'])];
    setAvailableLabels(allLabels);
    
    setAnnotations([]);
    setGameComplete(false);
    setTimeBonus(25); // Set initial time bonus to a lower value
    
    if (labels.length > 0) {
      setCurrentLabel(labels[0]);
    }
    
    // Don't start timer automatically - wait for first annotation
    setIsTimerRunning(false);
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
  
  const handleSelectTool = (tool: AnnotationType | null) => {
    setSelectedTool(tool);
  };
  
  const handleClearAnnotations = () => {
    setAnnotations([]);
    toast('All annotations cleared');
  };
  
  const handleAnnotationComplete = (annotation: Annotation) => {
    const newAnnotations = [...annotations, annotation];
    setAnnotations(newAnnotations);
    
    // Start timer on first annotation
    if (!hasStartedAnnotating && !showInstructions) {
      setHasStartedAnnotating(true);
      setIsTimerRunning(true);
    }
    
    // Show first annotation tip if it's the first annotation for this session
    if (newAnnotations.length === 1 && !hasShownFirstAnnotationTip) {
      // Use a timeout to show the tip after the annotation is complete
      // setTimeout(() => {
      //   toast.info(
      //     <div className="border border-blue-100 rounded-lg bg-blue-50/50 p-4">
      //       <h3 className="text-lg font-semibold text-ocean-medium mb-3">Precision Matters!</h3>
      //       <AnnotationScoreVisual className="mb-2" />
      //       <p className="text-sm tablet-text-base text-blue-700 mt-3">
      //         Draw tight boundaries around objects to maximize your score, but remember to complete all your annotations before time runs out!
      //       </p>
      //     </div>,
      //     {
      //       duration: 6000,
      //       position: 'top-center',
      //       style: {
      //         width: '500px',
      //         maxWidth: '90vw',
      //         margin: '0 auto'
      //       }
      //     }
      //   );
        
      //   // Mark that we've shown the tip for this session only
      //   setHasShownFirstAnnotationTip(true);
      //   // Removed localStorage save
      // }, 500);
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
    
    // Don't pause the timer when submitting
    // DO NOT add any code here that would stop the timer
    console.log("Submit clicked, timer should keep running");
    
    setGameComplete(true);
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
        toast.success('Great job! You found all the targets!');
      } else if (foundCount > 0) {
        // If user found some but not all targets
        const missedCount = totalTargets - foundCount;
        toast.error(`You found ${foundCount} target${foundCount > 1 ? 's' : ''}, but missed ${missedCount} target${missedCount > 1 ? 's' : ''}!`);
      } else {
        // If user found none of the targets
        toast.error(`You missed all ${totalTargets} targets!`);
      }
    }
  };
  
  const handleScoreUpdate = (score: number) => {
    setFinalScore(score);
    setCumulativeScore(prevScore => prevScore + score);
  };
  
  const handleResetCumulativeScore = () => {
    setCumulativeScore(0);
    toast.success('Cumulative score has been reset to 0');
  };
  
  const handlePlayAgain = () => {
    // Reset all game state
    setGameComplete(false);
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
    // Reset timer state but don't start it yet - wait for first annotation
    setIsTimerRunning(false);
    setHasStartedAnnotating(false);
    // Increment timer key to force timer component to reset
    setTimerResetKey(prev => prev + 1);
  };
  
  const handleNewImage = () => {
    if (!selectedImage) return;
    
    const currentIndex = currentImages.findIndex(img => img.id === selectedImage.id);
    const nextIndex = (currentIndex + 1) % currentImages.length;
    
    // If this is the last image and all have been annotated, don't allow selecting a new one
    if (currentIndex === currentImages.length - 1 && annotatedImages.size >= currentImages.length) {
      toast.info("You've completed all images!");
      return;
    }
    
    setSelectedImage(currentImages[nextIndex]);
    setAnnotations([]);
    setShowGroundTruth(false);
  };
  
  const handleGoToQuickIDGame = () => {
    window.location.href = routes.quickIdGame;
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
    <div className="min-h-screen bg-ocean-gradient relative">
      <BubbleBackground bubbleCount={30} />
      
      {isTablet && (
        <SidebarProvider defaultOpen={false}>
          <TabletSidebar
            images={currentImages}
            onSelectImage={handleImageSelect}
            selectedImageId={selectedImage?.id || null}
          />
          <TabletSidebarTrigger />
        </SidebarProvider>
      )}
      
      <div className="container mx-auto py-6 px-4 relative z-10">
        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <img src="/lovable-uploads/c5bd120b-ed39-4828-9d92-541b6aef9cf9.png" alt="Organization Logo" className="h-10 w-auto" />
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
                  onClick={handleResetCumulativeScore}
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
              onClick={() => setShowInstructions(true)}
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
        
        {showInstructions && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Instructions onClose={() => {
              setShowInstructions(false);
              setHasSeenInstructions(true);
              localStorage.setItem('hasSeenInstructions', 'true');
              // Don't start timer when closing instructions - wait for first annotation
              setIsTimerRunning(false);
            }} />
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {!isTablet && (
            <div className="lg:col-span-1">
              <ImageSelector 
                images={currentImages} 
                onSelectImage={handleImageSelect} 
                selectedImageId={selectedImage?.id || null}
              />
            </div>
          )}
          
          <div className={`${isTablet ? 'col-span-full' : 'lg:col-span-3'} space-y-4`}>
            <div className="bg-white rounded-xl p-3 shadow-md">
              <Timer 
                key={timerResetKey}
                duration={TIMER_DURATION}
                onTimeUp={handleTimeUp}
                isRunning={isTimerRunning && !showInstructions}
                onTimerUpdate={handleTimerUpdate}
              />
            </div>
            
            <div className="h-[450px] bg-white rounded-xl shadow-lg overflow-hidden">
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
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p>Please select an image</p>
                </div>
              )}
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-md flex justify-between items-center">
              <p className="text-sm text-gray-700">
                {selectedImage?.description || 'Select an image to get started'}
              </p>
              
              {!gameComplete ? (
                <Button 
                  onClick={handleSubmit}
                  className="btn-coral flex items-center gap-1"
                  disabled={!selectedImage || annotations.length === 0}
                >
                  <CheckCircle className="h-4 w-4" /> Submit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button 
                    onClick={handleNewImage}
                    className="btn-coral flex items-center gap-1"
                    disabled={isLastImage && allImagesAnnotated}
                  >
                    <Fish className="h-4 w-4" /> 
                    {isLastImage && allImagesAnnotated ? 'All Images Complete!' : 'Next Image'}
                  </Button>
                  {isLastImage && allImagesAnnotated && (
                    <Button 
                      onClick={handlePlayAgain}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white flex items-center gap-1"
                    >
                      <RefreshCcw className="h-4 w-4" /> Replay
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="lg:col-span-1">
            {!gameComplete ? (
              <AnnotationTools
                selectedTool={selectedTool}
                onSelectTool={handleSelectTool}
                onClearAnnotations={handleClearAnnotations}
                currentLabel={currentLabel}
                onLabelChange={handleLabelChange}
                labels={availableLabels}
              />
            ) : (
              <div className="space-y-4">
                <ScoreBoard 
                  userAnnotations={annotations}
                  targetAnnotations={selectedImage?.targetAnnotations || []}
                  timeBonus={timeBonus}
                  isComplete={gameComplete}
                  cumulativeScore={cumulativeScore}
                  onScoreChange={handleScoreUpdate}
                />
              </div>
            )}
          </div>
        </div>
        
        <footer className="mt-8 text-center text-white/80 text-sm">
          <p>Ocean Annotation Game - A fun way to learn computer vision annotation techniques</p>
        </footer>
      </div>

      {/* Game Completion Dialog */}
      <Dialog 
        open={showCompletionDialog} 
        onOpenChange={(open) => {
          if (!open && allImagesAnnotated) {
            // If closing the dialog and all images are annotated, reset for a new game
            setAnnotatedImages(new Set());
          }
          setShowCompletionDialog(open);
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
              onClick={handlePlayAgain}
            >
              <RefreshCcw className="h-4 w-4 mr-2" /> Try Again
            </Button>
            <Button 
              className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white" 
              onClick={handleGoToQuickIDGame}
            >
              <Zap className="h-4 w-4 mr-2" /> Try Quick ID Game
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
