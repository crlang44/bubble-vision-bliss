
import React, { useState, useEffect } from 'react';
import BubbleBackground from '../components/BubbleBackground';
import Instructions from '../components/Instructions';
import Canvas from '../components/Canvas';
import AnnotationTools from '../components/AnnotationTools';
import ScoreBoard from '../components/ScoreBoard';
import Timer from '../components/Timer';
import ImageSelector from '../components/ImageSelector';
import { Annotation, AnnotationType, calculateScore } from '../utils/annotationUtils';
import { oceanImages, OceanImage, getProgressiveImageSet } from '../data/oceanImages';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { routes, navigateTo } from '../routes'; // Add this import
import { Fish, CheckCircle, RefreshCcw, Trophy, ArrowRight, BarChart } from 'lucide-react';

const Index = () => {
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
  const [timeBonus, setTimeBonus] = useState(15); // Reduced from 50 to 15
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [availableLabels, setAvailableLabels] = useState<string[]>(['Whale', 'Fish', 'Coral']);
  const [showGroundTruth, setShowGroundTruth] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [currentImages, setCurrentImages] = useState<OceanImage[]>([]);
  const [cumulativeScore, setCumulativeScore] = useState(() => {
    const savedScore = localStorage.getItem('cumulativeScore');
    return savedScore ? parseInt(savedScore) : 0;
  });
  const TIMER_DURATION = 120; // 2 minutes in seconds
  
  // Save cumulative score to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cumulativeScore', cumulativeScore.toString());
  }, [cumulativeScore]);
  
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
    
    if (!showInstructions) {
      setIsTimerRunning(true);
    }
  }, [selectedImage, showInstructions]);
  
  const handleSelectTool = (tool: AnnotationType | null) => {
    setSelectedTool(tool);
  };
  
  const handleClearAnnotations = () => {
    setAnnotations([]);
    toast('All annotations cleared');
  };
  
  const handleAnnotationComplete = (annotation: Annotation) => {
    setAnnotations([...annotations, annotation]);
    // Removed toast notification for annotation added
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
    
    setIsTimerRunning(false);
    setGameComplete(true);
    setShowGroundTruth(true);
    
    const foundAllTargets = selectedImage.targetAnnotations.every(target => 
      annotations.some(annotation => annotation.label === target.label)
    );
    
    if (foundAllTargets) {
      toast.success('Great job! You found all the targets!');
    } else {
      const missingCount = selectedImage.targetAnnotations.filter(target => 
        !annotations.some(annotation => annotation.label === target.label)
      ).length;
      
      toast.error(`You missed ${missingCount} target${missingCount > 1 ? 's' : ''}!`);
    }
  };
  
  const handleScoreUpdate = (score: number) => {
    setCumulativeScore(prevScore => prevScore + score);
  };
  
  const handleResetCumulativeScore = () => {
    setCumulativeScore(0);
    toast.success('Cumulative score has been reset to 0');
  };
  
  const handlePlayAgain = () => {
    setGameComplete(false);
    setAnnotations([]);
    setTimeBonus(25); // Reset to a lower initial time bonus
    setIsTimerRunning(true);
    setShowGroundTruth(false);
  };
  
  const handleNewImage = () => {
    const currentIndex = currentImages.findIndex(img => img.id === selectedImage?.id);
    const nextIndex = (currentIndex + 1) % currentImages.length;
    setSelectedImage(currentImages[nextIndex]);
    setAnnotations([]);
    setShowGroundTruth(false);
  };
  
  const handleNextRound = () => {
    const nextRound = currentRound + 1;
    setCurrentRound(nextRound);
    setAnnotations([]);
    setShowGroundTruth(false);
    
    const newImageSet = getProgressiveImageSet(nextRound);
    const validImages = newImageSet.filter(img => img.targetAnnotations.length > 0);
    setCurrentImages(validImages);
    
    if (validImages.length > 0) {
      setSelectedImage(validImages[0]);
    }
    
    toast.success(`Starting Round ${nextRound} - Difficulty increased!`);
  };
  
  return (
    <div className="min-h-screen bg-ocean-gradient relative">
      <BubbleBackground bubbleCount={30} />
      
      <div className="container mx-auto py-6 px-4 relative z-10">
        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Fish className="text-coral h-8 w-8" />
            <h1 className="text-2xl md:text-3xl font-bold text-white">Ocean Annotation</h1>
          </div>
          
          <div className="flex gap-2 items-center">
            <div className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium">
              Round {currentRound}
            </div>
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
                <RotateCcw className="h-3 w-3" />
              </Button>
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
            <Button
              variant="outline"
              onClick={() => window.location.href = '/ground-truth-editor'}
              className="bg-white/80 hover:bg-white"
            >
              Ground Truth Editor
            </Button>
          </div>
        </header>
        
        {showInstructions && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Instructions onClose={() => {
              setShowInstructions(false);
              setHasSeenInstructions(true);
              localStorage.setItem('hasSeenInstructions', 'true');
              setIsTimerRunning(true);
            }} />
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-1">
            <ImageSelector 
              images={currentImages} 
              onSelectImage={handleImageSelect} 
              selectedImageId={selectedImage?.id || null}
            />
          </div>
          
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white rounded-xl p-3 shadow-md">
              <Timer 
                duration={TIMER_DURATION}
                onTimeUp={handleTimeUp}
                isRunning={isTimerRunning && !gameComplete}
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
                    onClick={handlePlayAgain}
                    className="btn-ocean flex items-center gap-1"
                  >
                    <RefreshCcw className="h-4 w-4" /> Try Again
                  </Button>
                  <Button 
                    onClick={handleNewImage}
                    className="btn-coral flex items-center gap-1"
                  >
                    <Fish className="h-4 w-4" /> New Image
                  </Button>
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
                
                <div className="p-4 bg-white rounded-xl shadow-md text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Trophy className="text-yellow-500" />
                    <h3 className="font-bold text-ocean-dark">Keep Playing!</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Try different images to improve your annotation skills.
                  </p>
                  
                  <div className="flex flex-col gap-2">
                    <Button className="btn-ocean w-full" onClick={handleNewImage}>
                      Next Image
                    </Button>
                    
                    <Button 
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white" 
                      onClick={handleNextRound}
                    >
                      <div className="flex items-center gap-1">
                        <span>Next Round</span>
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <footer className="mt-8 text-center text-white/80 text-sm">
          <p>Ocean Annotation Game - A fun way to learn computer vision annotation techniques</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
