
import React from 'react';
import { AnnotationType } from '../utils/annotationUtils';
import { Square, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

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
  return (
    <div className="flex flex-col gap-4">
      <div className="p-3 bg-ocean-light rounded-xl shadow-md">
        <h3 className="text-sm font-semibold text-ocean-dark mb-3">Annotation Tools</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onSelectTool(selectedTool === 'rectangle' ? null : 'rectangle')}
            className={`bg-white hover:bg-ocean-medium hover:text-white ${selectedTool === 'rectangle' ? 'bg-ocean-medium text-white' : ''}`}
          >
            <Square className="h-4 w-4" />
          </Button>
          
          <div className="border-r border-gray-300 mx-1"></div>
          
          <Button
            variant="outline"
            size="icon"
            onClick={onClearAnnotations}
            className="bg-white hover:bg-coral hover:text-white"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="p-3 bg-ocean-light rounded-xl shadow-md">
        <h3 className="text-sm font-semibold text-ocean-dark mb-3">Annotation Label</h3>
        <div className="flex flex-wrap gap-2">
          {labels.map((label) => (
            <Button
              key={label}
              variant="outline"
              size="sm"
              onClick={() => onLabelChange(label)}
              className={`text-xs bg-white hover:bg-ocean-medium hover:text-white ${currentLabel === label ? 'bg-ocean-medium text-white' : ''}`}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>
      
      <div className="p-3 bg-ocean-light rounded-xl shadow-md">
        <h3 className="text-sm font-semibold text-ocean-dark mb-2">Instructions</h3>
        <p className="text-xs text-gray-600">
          {selectedTool === 'rectangle' && 'Click and drag to create a rectangle annotation.'}
          {!selectedTool && 'Select a tool to start annotating.'}
        </p>
      </div>
    </div>
  );
};

export default AnnotationTools;
