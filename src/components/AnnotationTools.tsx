
import React from 'react';
import { AnnotationType } from '../utils/annotationUtils';
import { Square, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsTouch } from '../hooks/use-mobile';

interface AnnotationToolsProps {
  selectedTool: AnnotationType | null;
  onSelectTool: (tool: AnnotationType | null) => void;
  onClearAnnotations: () => void;
  currentLabel: string;
  onLabelChange: (label: string) => void;
  labels: string[];
}

const AnnotationTools: React.FC<AnnotationToolsProps> = ({
  selectedTool,
  onSelectTool,
  onClearAnnotations,
  currentLabel,
  onLabelChange,
  labels
}) => {
  const isTouch = useIsTouch();
  
  return (
    <div className={`flex flex-col gap-4 tablet-gap-6 ${isTouch ? 'touch-device' : ''}`}>
      <div className="p-3 tablet-p-6 bg-white rounded-xl shadow-md">
        <h3 className="text-sm font-semibold tablet-text-base text-gray-700 mb-3">Annotation Tools</h3>
        <div className="flex gap-2 tablet-gap-4">
          <Button
            variant="outline"
            size={isTouch ? "default" : "icon"}
            onClick={() => onSelectTool(selectedTool === 'rectangle' ? null : 'rectangle')}
            className={`${selectedTool === 'rectangle' ? 'annotation-active' : ''} ${isTouch ? 'min-h-[48px] min-w-[48px]' : ''}`}
          >
            <Square className={`${isTouch ? 'h-5 w-5 mr-1' : 'h-4 w-4'}`} />
            {isTouch && "Rectangle"}
          </Button>
          
          <div className="border-r border-gray-300 mx-1"></div>
          
          <Button
            variant="outline"
            size={isTouch ? "default" : "icon"}
            onClick={onClearAnnotations}
            className={`text-gray-500 hover:text-red-500 ${isTouch ? 'min-h-[48px]' : ''}`}
          >
            <Trash2 className={`${isTouch ? 'h-5 w-5 mr-1' : 'h-4 w-4'}`} />
            {isTouch && "Clear"}
          </Button>
        </div>
      </div>
      
      <div className="p-3 tablet-p-6 bg-white rounded-xl shadow-md">
        <h3 className="text-sm font-semibold tablet-text-base text-gray-700 mb-3">Annotation Label</h3>
        <div className="flex flex-wrap gap-2 tablet-gap-3">
          {labels.map((label) => (
            <Button
              key={label}
              variant="outline"
              size={isTouch ? "default" : "sm"}
              onClick={() => onLabelChange(label)}
              className={`${isTouch ? 'text-sm py-2 px-3' : 'text-xs'} ${currentLabel === label ? 'annotation-active' : ''}`}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>
      
      <div className="p-3 tablet-p-6 bg-white rounded-xl shadow-md">
        <h3 className="text-sm font-semibold tablet-text-base text-gray-700 mb-2">Instructions</h3>
        <p className={`${isTouch ? 'text-sm' : 'text-xs'} text-gray-600`}>
          {selectedTool === 'rectangle' && 'Click and drag to create a rectangle annotation.'}
          {!selectedTool && 'Select a tool to start annotating.'}
        </p>
      </div>
    </div>
  );
};

export default AnnotationTools;
