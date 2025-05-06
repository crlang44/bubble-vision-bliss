
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Annotation } from '../utils/annotationUtils';
import { OceanImage, getProgressiveImageSet } from '../data/oceanImages';
import { toast } from 'sonner';

interface GameContextProps {
  // Game state
  selectedImage: OceanImage | null;
  annotations: Annotation[];
  gameComplete: boolean;
  showGroundTruth: boolean;
  isTimerRunning: boolean;
  timeBonus: number;
  currentLabel: string;
  selectedTool: 'rectangle' | 'polygon' | 'point' | null;
  showInstructions: boolean;
  cumulativeScore: number;
  bestScore: number;
  currentRound: number;
  currentImages: OceanImage[];
  availableLabels: string[];
  showCompletionDialog: boolean;
  finalScore: number;
  annotatedImages: Set<string>;
  hasSeenInstructions: boolean;
  isLastImage: boolean;
  allImagesAnnotated: boolean;
  
  // Actions
  setSelectedImage: (image: OceanImage | null) => void;
  setAnnotations: (annotations: Annotation[]) => void;
  setCurrentLabel: (label: string) => void;
  setSelectedTool: (tool: 'rectangle' | 'polygon' | 'point' | null) => void;
  setShowInstructions: (show: boolean) => void;
  handleInstructionsClosed: () => void;
  handleSelectTool: (tool: 'rectangle' | 'polygon' | 'point' | null) => void;
  handleClearAnnotations: () => void;
  handleLabelChange: (label: string) => void;
  handleAnnotationComplete: (annotation: Annotation) => void;
  handleImageSelect: (image: OceanImage) => void;
  handleTimeUp: () => void;
  handleTimerUpdate: (timeLeft: number) => void;
  handleSubmit: () => void;
  handleScoreUpdate: (score: number) => void;
  handleResetCumulativeScore: () => void;
  handlePlayAgain: () => void;
  handleNewImage: () => void;
  handleGoToQuickIDGame: () => void;
  toggleGroundTruth: () => void;
  setShowCompletionDialog: (show: boolean) => void;
}

const GameContext = createContext<GameContextProps | undefined>(undefined);

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
};

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  // Define all state variables
  const [showInstructions, setShowInstructions] = useState(() => {
    return localStorage.getItem('hasSeenInstructions') !== 'true';
  });
  const [hasSeenInstructions, setHasSeenInstructions] = useState(() => {
    return localStorage.getItem('hasSeenInstructions') === 'true';
  });
  const [selectedTool, setSelectedTool] = useState<'rectangle' | 'polygon' | 'point' | null>('rectangle');
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
  const [bestScore, setBestScore] = useState<number>(() => {
    const storedBestScore = localStorage.getItem('oceanAnnotationBestScore');
    return storedBestScore ? parseInt(storedBestScore, 10) : 0;
  });

  // Derived state
  const isLastImage = selectedImage && 
    currentImages.findIndex(img => img.id === selectedImage.id) === currentImages.length - 1;
  const allImagesAnnotated = currentImages.length > 0 && 
    annotatedImages.size >= currentImages.length;
  
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
  }, [currentRound, selectedImage]);
  
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
  
  // Check if all images have been annotated
  useEffect(() => {
    if (currentImages.length > 0 && annotatedImages.size >= currentImages.length) {
      // Add a delay before showing the completion dialog (2 seconds)
      setTimeout(() => {
        setShowCompletionDialog(true);
        
        // Update best score if current cumulative score is higher
        if (cumulativeScore > bestScore) {
          setBestScore(cumulativeScore);
          localStorage.setItem('oceanAnnotationBestScore', cumulativeScore.toString());
        }
      }, 2000);
    }
  }, [annotatedImages, currentImages, cumulativeScore, bestScore]);

  // Handler functions
  const handleSelectTool = (tool: 'rectangle' | 'polygon' | 'point' | null) => {
    setSelectedTool(tool);
  };
  
  const handleClearAnnotations = () => {
    setAnnotations([]);
    toast('All annotations cleared');
  };
  
  const handleLabelChange = (label: string) => {
    setCurrentLabel(label);
  };
  
  const handleAnnotationComplete = (annotation: Annotation) => {
    setAnnotations([...annotations, annotation]);
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
    const calculatedBonus = Math.floor((timeLeft / 120) * maxBonus);
    setTimeBonus(calculatedBonus);
  };
  
  const handleSubmit = () => {
    if (!selectedImage) return;
    
    // Don't pause the timer when submitting - remove setIsTimerRunning(false)
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
    setGameComplete(false);
    setAnnotations([]);
    setTimeBonus(25); // Reset to a lower initial time bonus
    setIsTimerRunning(true);
    setShowGroundTruth(false);
    setShowCompletionDialog(false);
    // Reset cumulative score and annotated images when trying again from completion dialog
    setCumulativeScore(0);
    setAnnotatedImages(new Set());
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
    window.location.href = '/quick-id-game';
  };
  
  const toggleGroundTruth = () => {
    setShowGroundTruth(!showGroundTruth);
  };
  
  const handleInstructionsClosed = () => {
    setShowInstructions(false);
    setHasSeenInstructions(true);
    localStorage.setItem('hasSeenInstructions', 'true');
    setIsTimerRunning(true);
  };

  const value = {
    // State
    selectedImage,
    annotations,
    gameComplete,
    showGroundTruth,
    isTimerRunning,
    timeBonus,
    currentLabel,
    selectedTool,
    showInstructions,
    cumulativeScore,
    bestScore,
    currentRound,
    currentImages,
    availableLabels,
    showCompletionDialog,
    finalScore,
    annotatedImages,
    hasSeenInstructions,
    isLastImage,
    allImagesAnnotated,
    
    // State setters
    setSelectedImage,
    setAnnotations,
    setCurrentLabel,
    setSelectedTool,
    setShowInstructions,
    
    // Action handlers
    handleInstructionsClosed,
    handleSelectTool,
    handleClearAnnotations,
    handleLabelChange,
    handleAnnotationComplete,
    handleImageSelect,
    handleTimeUp,
    handleTimerUpdate,
    handleSubmit,
    handleScoreUpdate,
    handleResetCumulativeScore,
    handlePlayAgain,
    handleNewImage,
    handleGoToQuickIDGame,
    toggleGroundTruth,
    setShowCompletionDialog
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
