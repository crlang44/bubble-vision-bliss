
import React from 'react';
import { AnnotationType } from '../utils/annotationUtils';
import { Square, Circle, MousePointer, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
      <div className="p-3 bg-white rounded-xl shadow-md">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Annotation Tools</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onSelectTool(selectedTool === 'rectangle' ? null : 'rectangle')}
            className={`${selectedTool === 'rectangle' ? 'annotation-active' : ''}`}
          >
            <Square className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => onSelectTool(selectedTool === 'polygon' ? null : 'polygon')}
            className={`${selectedTool === 'polygon' ? 'annotation-active' : ''}`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M12 2L3 9l9 7 9-7-9-7z" />
              <path d="M3 9v10l9 4 9-4V9" />
            </svg>
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => onSelectTool(selectedTool === 'point' ? null : 'point')}
            className={`${selectedTool === 'point' ? 'annotation-active' : ''}`}
          >
            <Circle className="h-4 w-4" />
          </Button>
          
          <div className="border-r border-gray-300 mx-1"></div>
          
          <Button
            variant="outline"
            size="icon"
            onClick={onClearAnnotations}
            className="text-gray-500 hover:text-red-500"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="p-3 bg-white rounded-xl shadow-md">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Annotation Label</h3>
        <div className="flex flex-wrap gap-2">
          {labels.map((label) => (
            <Button
              key={label}
              variant="outline"
              size="sm"
              onClick={() => onLabelChange(label)}
              className={`text-xs ${currentLabel === label ? 'annotation-active' : ''}`}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>
      
      <div className="p-3 bg-white rounded-xl shadow-md">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Instructions</h3>
        <p className="text-xs text-gray-600">
          {selectedTool === 'rectangle' && 'Click and drag to create a rectangle annotation.'}
          {selectedTool === 'polygon' && 'Click to add points, double click to complete the polygon.'}
          {selectedTool === 'point' && 'Click to place a point annotation.'}
          {!selectedTool && 'Select a tool to start annotating.'}
        </p>
      </div>
    </div>
  );
};

export default AnnotationTools;
