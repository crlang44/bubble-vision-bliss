import React, { useState, useEffect } from 'react';
import BubbleBackground from '../components/BubbleBackground';
import Instructions from '../components/Instructions';
import Canvas from '../components/Canvas';
import AnnotationTools from '../components/AnnotationTools';
import ScoreBoard from '../components/ScoreBoard';
import Timer from '../components/Timer';
import ImageSelector from '../components/ImageSelector';
import { Annotation, AnnotationType } from '../utils/annotationUtils';
import { oceanImages, OceanImage } from '../data/oceanImages';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Fish, CheckCircle, RefreshCcw, Trophy } from 'lucide-react';

const Index = () => {
  const [showInstructions, setShowInstructions] = useState(true);
  const [selectedTool, setSelectedTool] = useState<AnnotationType | null>(null);
  const [currentLabel, setCurrentLabel] = useState('Whale');
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedImage, setSelectedImage] = useState<OceanImage | null>(null);
  const [timeBonus, setTimeBonus] = useState(50);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [availableLabels, setAvailableLabels] = useState<string[]>(['Whale', 'Fish', 'Coral']);
  
  useEffect(() => {
    if (oceanImages.length > 0 && !selectedImage) {
      setSelectedImage(oceanImages[0]);
    }
  }, []);
  
  useEffect(() => {
    if (!selectedImage) return;
    
    const labels = selectedImage.targetAnnotations.map(annotation => annotation.label);
    const allLabels = [...new Set([...labels, 'Fish', 'Coral', 'Rock', 'Seaweed', 'Bubbles'])];
    setAvailableLabels(allLabels);
    
    setAnnotations([]);
    setGameComplete(false);
    setTimeBonus(100);
    
    if (labels.length > 0) {
      setCurrentLabel(labels[0]);
    }
    
    setIsTimerRunning(true);
  }, [selectedImage]);
  
  const handleSelectTool = (tool: AnnotationType | null) => {
    setSelectedTool(tool);
  };
  
  const handleClearAnnotations = () => {
    setAnnotations([]);
    toast('All annotations cleared');
  };
  
  const handleAnnotationComplete = (annotation: Annotation) => {
    setAnnotations([...annotations, annotation]);
    toast(`Added ${annotation.label} annotation`);
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
  
  const handleSubmit = () => {
    if (!selectedImage) return;
    
    setIsTimerRunning(false);
    setGameComplete(true);
    
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
  
  const handlePlayAgain = () => {
    setGameComplete(false);
    setAnnotations([]);
    setTimeBonus(50);
    setIsTimerRunning(true);
  };
  
  const handleNewImage = () => {
    const currentIndex = oceanImages.findIndex(img => img.id === selectedImage?.id);
    const nextIndex = (currentIndex + 1) % oceanImages.length;
    setSelectedImage(oceanImages[nextIndex]);
    setAnnotations([]);
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
          
          <Button
            variant="outline"
            onClick={() => setShowInstructions(true)}
            className="bg-white/80 hover:bg-white"
          >
            How to Play
          </Button>
        </header>
        
        {showInstructions && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Instructions onClose={() => setShowInstructions(false)} />
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-1">
            <ImageSelector 
              images={oceanImages} 
              onSelectImage={handleImageSelect} 
              selectedImageId={selectedImage?.id || null}
            />
          </div>
          
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white rounded-xl p-3 shadow-md">
              <Timer 
                duration={120}
                onTimeUp={handleTimeUp}
                isRunning={isTimerRunning && !gameComplete}
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
                />
                
                <div className="p-4 bg-white rounded-xl shadow-md text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Trophy className="text-yellow-500" />
                    <h3 className="font-bold text-ocean-dark">Keep Playing!</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Try different images to improve your annotation skills.
                  </p>
                  <Button className="btn-ocean w-full" onClick={handleNewImage}>
                    Next Challenge
                  </Button>
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
