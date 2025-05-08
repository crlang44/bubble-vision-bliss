
import React from 'react';
import { HoverCard, HoverCardTrigger, HoverCardContent } from './ui/hover-card';
import { Square, Target } from 'lucide-react';

interface AnnotationScoreVisualProps {
  className?: string;
}

const AnnotationScoreVisual: React.FC<AnnotationScoreVisualProps> = ({ className = '' }) => {
  return (
    <div className={`bg-white p-4 rounded-lg shadow-md ${className}`}>
      <h3 className="text-lg font-medium text-ocean-dark mb-3 flex items-center gap-2">
        <Target className="h-5 w-5 text-ocean-medium" />
        Annotation Precision Guide
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Loose annotation example */}
        <HoverCard>
          <HoverCardTrigger asChild>
            <div className="relative cursor-help border-2 border-dashed border-red-400 rounded-md p-4 bg-gray-50">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  {/* The target object */}
                  <div className="w-10 h-10 bg-blue-500 rounded-full mx-auto" />
                  
                  {/* The loose annotation */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-2 border-red-400 rounded-md"></div>
                </div>
              </div>
              <div className="h-20"></div>
              <p className="text-center text-sm mt-2 font-medium text-red-500">Loose Annotation</p>
              <p className="text-center text-xl font-bold text-red-500">60% Score</p>
            </div>
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Loose Annotation</h4>
              <p className="text-sm">
                When your annotation is too large and includes extra space around the object,
                you'll receive a lower score. The algorithm rewards precision!
              </p>
            </div>
          </HoverCardContent>
        </HoverCard>
        
        {/* Tight annotation example */}
        <HoverCard>
          <HoverCardTrigger asChild>
            <div className="relative cursor-help border-2 border-dashed border-green-500 rounded-md p-4 bg-gray-50">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  {/* The target object */}
                  <div className="w-10 h-10 bg-blue-500 rounded-full mx-auto" />
                  
                  {/* The tight annotation */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-11 h-11 border-2 border-green-500 rounded-md"></div>
                </div>
              </div>
              <div className="h-20"></div>
              <p className="text-center text-sm mt-2 font-medium text-green-500">Tight Annotation</p>
              <p className="text-center text-xl font-bold text-green-500">95% Score</p>
            </div>
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Tight Annotation</h4>
              <p className="text-sm">
                When your annotation closely matches the object's boundaries,
                you'll receive a higher score. Aim for precision while maintaining speed!
              </p>
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>
      
      <div className="mt-4 bg-blue-50 p-3 rounded-md border border-blue-100 text-sm text-blue-700">
        <p className="flex items-center gap-1">
          <Square className="h-4 w-4 text-ocean-medium" />
          <span className="font-medium">Pro Tip:</span> Balance speed and precision for maximum points!
        </p>
      </div>
    </div>
  );
};

export default AnnotationScoreVisual;
