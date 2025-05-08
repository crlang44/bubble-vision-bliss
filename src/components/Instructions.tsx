
import React from 'react';
import { X, Check, Target, Square, Circle } from 'lucide-react';
import { Button } from './ui/button';
import AnnotationScoreVisual from './AnnotationScoreVisual';

interface InstructionsProps {
  onClose: () => void;
}

const Instructions: React.FC<InstructionsProps> = ({ onClose }) => {
  return (
    <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
      <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-ocean-dark">How to Play</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-6 w-6" />
          </Button>
        </div>
      </div>
      
      <div className="p-6 space-y-6">
        {/* Game objective */}
        <div>
          <h3 className="text-xl font-semibold text-ocean-dark mb-3 flex items-center gap-2">
            <Target className="h-5 w-5 text-ocean-medium" /> Game Objective
          </h3>
          <p>
            Create accurate annotations for ocean creatures and objects in the image. 
            Your goal is to identify and annotate all targets in each image as 
            precisely and quickly as possible.
          </p>
        </div>

        {/* New annotation scoring visual */}
        <AnnotationScoreVisual />
        
        {/* Game controls */}
        <div>
          <h3 className="text-xl font-semibold text-ocean-dark mb-3 flex items-center gap-2">
            <Square className="h-5 w-5 text-ocean-medium" /> Game Controls
          </h3>
          <div className="space-y-3">
            <div className="flex items-start">
              <div className="bg-blue-50 p-2 rounded mr-3">
                <Circle className="h-5 w-5 text-ocean-medium" />
              </div>
              <div>
                <p className="font-medium">Select an annotation tool</p>
                <p className="text-gray-600">Choose between Rectangle, Polygon, or Point tools to create your annotations.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-blue-50 p-2 rounded mr-3">
                <Circle className="h-5 w-5 text-ocean-medium" />
              </div>
              <div>
                <p className="font-medium">Choose a label</p>
                <p className="text-gray-600">Select the correct label for the object you're annotating.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-blue-50 p-2 rounded mr-3">
                <Circle className="h-5 w-5 text-ocean-medium" />
              </div>
              <div>
                <p className="font-medium">Draw annotations</p>
                <p className="text-gray-600">
                  For rectangles: Click and drag to create a box.<br />
                  For polygons: Click to add points, double-click to complete.<br />
                  For points: Click to place a point marker.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-blue-50 p-2 rounded mr-3">
                <Circle className="h-5 w-5 text-ocean-medium" />
              </div>
              <div>
                <p className="font-medium">Submit annotations</p>
                <p className="text-gray-600">Click "Submit" when you've annotated all targets in the image.</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Scoring */}
        <div>
          <h3 className="text-xl font-semibold text-ocean-dark mb-3 flex items-center gap-2">
            <Check className="h-5 w-5 text-ocean-medium" /> Scoring
          </h3>
          <p className="mb-3">
            Your score is based on annotation accuracy and completion time:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Accurate annotations earn more points (up to 100%)</li>
            <li>Remaining time adds a time bonus (up to 25 points)</li>
            <li>Aim for both speed and precision!</li>
          </ul>
        </div>
        
        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="text-center font-medium text-ocean-dark">
            Good luck and have fun annotating ocean images!
          </p>
        </div>
        
        <div className="flex justify-center">
          <Button onClick={onClose} className="bg-ocean-medium hover:bg-ocean-dark">
            Start Playing
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Instructions;
