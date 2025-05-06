
import React from 'react';
import { Fish, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Canvas from './Canvas';
import Timer from './Timer';
import { Annotation, TargetAnnotation } from '../utils/annotationUtils';
import { OceanImage } from '../data/oceanImages';

interface GameAreaProps {
  selectedImage: OceanImage | null;
  annotations: Annotation[];
  gameComplete: boolean;
  showGroundTruth: boolean;
  isTimerRunning: boolean;
  timeBonus: number;
  onAnnotationComplete: (annotation: Annotation) => void;
  onAnnotationsUpdate: (annotations: Annotation[]) => void;
  onToggleGroundTruth: () => void;
  onTimeUp: () => void;
  onTimerUpdate: (timeLeft: number) => void;
  onSubmit: () => void;
  onNewImage: () => void;
  isLastImage: boolean;
  allImagesAnnotated: boolean;
  timerDuration: number;
}

const GameArea: React.FC<GameAreaProps> = ({
  selectedImage,
  annotations,
  gameComplete,
  showGroundTruth,
  isTimerRunning,
  timeBonus,
  onAnnotationComplete,
  onAnnotationsUpdate,
  onToggleGroundTruth,
  onTimeUp,
  onTimerUpdate,
  onSubmit,
  onNewImage,
  isLastImage,
  allImagesAnnotated,
  timerDuration
}) => {
  return (
    <div className="lg:col-span-3 space-y-4">
      <div className="bg-white rounded-xl p-3 shadow-md">
        <Timer 
          duration={timerDuration}
          onTimeUp={onTimeUp}
          isRunning={isTimerRunning && !gameComplete}
          onTimerUpdate={onTimerUpdate}
        />
      </div>
      
      <div className="h-[450px] bg-white rounded-xl shadow-lg overflow-hidden">
        {selectedImage ? (
          <Canvas
            imageUrl={selectedImage.imagePath}
            selectedTool={null}
            currentLabel=""
            onAnnotationComplete={onAnnotationComplete}
            annotations={annotations}
            onAnnotationUpdate={onAnnotationsUpdate}
            targetAnnotations={selectedImage.targetAnnotations}
            showGroundTruth={showGroundTruth}
            onToggleGroundTruth={onToggleGroundTruth}
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
            onClick={onSubmit}
            className="btn-coral flex items-center gap-1"
            disabled={!selectedImage || annotations.length === 0}
          >
            <CheckCircle className="h-4 w-4" /> Submit
          </Button>
        ) : (
          <Button 
            onClick={onNewImage}
            className="btn-coral flex items-center gap-1"
            disabled={isLastImage && allImagesAnnotated}
          >
            <Fish className="h-4 w-4" /> 
            {isLastImage && allImagesAnnotated ? 'All Images Complete!' : 'New Image'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default GameArea;
