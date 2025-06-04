
import React from 'react';
import { Button } from './ui/button';
import AnnotationScoreVisual from './AnnotationScoreVisual';
import { Popover, PopoverTrigger, PopoverContent } from './ui/popover';
import { Info, X } from 'lucide-react';
import { useIsTouch } from '../hooks/use-mobile';

interface InstructionsProps {
  onClose: () => void;
}

const Instructions: React.FC<InstructionsProps> = ({ onClose }) => {
  const isTouch = useIsTouch();
  
  return (
    <div className={`bg-white rounded-xl p-4 tablet-p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto ${isTouch ? 'touch-device' : ''}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-ocean-dark">How to Play Ocean Annotation</h2>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-10 w-10">
          <X className="h-6 w-6" />
        </Button>
      </div>
      
      <div className="space-y-4 tablet-gap-6">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-ocean-medium">Goal</h3>
          <p className="tablet-text-base">Identify and annotate ocean creatures and objects as accurately as possible within the time limit.</p>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-ocean-medium">Controls</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li className="tablet-text-base">Choose a label for the object you want to annotate</li>
            <li className="tablet-text-base">Using the annotation tool, draw on the image to create an annotation</li>
            <li className="tablet-text-base">Submit your annotations before time runs out</li>
          </ul>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-ocean-medium">Scoring</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li className="tablet-text-base">Points are awarded based on accuracy</li>
            <li className="tablet-text-base">Bonus points for completing annotations quickly</li>
            <li className="tablet-text-base">Higher scores for finding all targets in an image</li>
          </ul>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-ocean-medium">Tips</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li className="tablet-text-base">Look carefully for partially hidden or camouflaged objects</li>
            <li className="tablet-text-base">Balance speed and accuracy - both matter!</li>
            <li className="tablet-text-base">Try different image difficulty levels to improve</li>
          </ul>
        </div>
        
        <div className="flex justify-end">
          <Button onClick={onClose} className="bg-ocean-medium hover:bg-ocean-darker text-white h-12 px-6">
            Start Annotating!
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Instructions;
