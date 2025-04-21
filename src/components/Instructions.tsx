
import React from 'react';
import { Button } from "../components/ui/button";
import { Fish, Target, CheckCircle } from "lucide-react";

interface InstructionsProps {
  onClose: () => void;
}

const Instructions: React.FC<InstructionsProps> = ({ onClose }) => {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-ocean-dark mb-4 flex items-center gap-2">
        <Fish className="text-coral" /> Ocean Annotation Game
      </h2>
      
      <div className="space-y-4 mb-6">
        <p className="text-gray-700">
          Welcome to the Ocean Annotation Game! In this game, you'll practice annotation skills 
          used in computer vision by identifying and annotating objects in ocean-themed images.
        </p>
        
        <div className="bg-blue-50 rounded-lg p-3">
          <h3 className="font-semibold text-ocean-dark mb-2 flex items-center gap-1">
            <Target className="text-ocean-dark h-5 w-5" /> How to Play:
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Select an annotation tool (rectangle, polygon, or point)</li>
            <li>Annotate the requested objects in the image</li>
            <li>Label your annotations appropriately</li>
            <li>Submit your annotations before the timer runs out</li>
            <li>Earn points based on the accuracy of your annotations</li>
          </ol>
        </div>

        <div className="bg-green-50 rounded-lg p-3">
          <h3 className="font-semibold text-ocean-dark mb-2 flex items-center gap-1">
            <CheckCircle className="text-seaweed h-5 w-5" /> Scoring:
          </h3>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li>Correct object identification: 20 points</li>
            <li>Accurate annotation placement: up to 80 points</li>
            <li>Time bonus: up to 50 points</li>
          </ul>
        </div>
      </div>
      
      <div className="flex justify-center">
        <Button 
          onClick={onClose}
          className="btn-ocean"
        >
          Let's Start Annotating!
        </Button>
      </div>
    </div>
  );
};

export default Instructions;
