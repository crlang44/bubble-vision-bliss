import React from 'react';
import { AnnotationType } from '../utils/annotationUtils';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsTouch, useIsAndroidTablet } from '../hooks/use-mobile';

interface AnnotationToolsProps {
  selectedTool: AnnotationType | null;
  onSelectTool: (tool: AnnotationType | null) => void;
  onClearAnnotations: () => void;
  currentLabel: string;
  onLabelChange: (label: string) => void;
  labels: string[];
  hideLabels?: boolean;
}

const AnnotationTools: React.FC<AnnotationToolsProps> = ({
  selectedTool,
  onSelectTool,
  onClearAnnotations,
  currentLabel,
  onLabelChange,
  labels,
  hideLabels = false
}) => {
  const isTouch = useIsTouch();
  const isAndroidTablet = useIsAndroidTablet();
  
  const touchClasses = isTouch ? 'touch-device' : '';
  const androidClasses = isAndroidTablet ? 'android-tablet' : '';
  
  return (
    <div className={`flex flex-col gap-4 tablet-gap-6 ${touchClasses} ${androidClasses} annotation-tools-container`}>
      <div className="p-3 tablet-p-6 bg-white rounded-xl shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold tablet-text-base text-gray-700">Annotation Tools</h3>
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
        
        {!hideLabels && (
          <>
            <h3 className="text-sm font-semibold tablet-text-base text-gray-700 mb-2">Annotation Label</h3>
            <div className="flex flex-wrap gap-2 tablet-gap-3">
              {labels.map((label) => (
                <Button
                  key={label}
                  variant="outline"
                  size={isTouch ? "default" : "sm"}
                  onClick={() => onLabelChange(label)}
                  className={`${isTouch ? 'text-sm py-2 px-3' : 'text-xs'} ${currentLabel === label ? 'annotation-active bg-blue-100' : ''}`}
                >
                  {label}
                </Button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AnnotationTools;
