import React from 'react';
import { OceanImage } from '../data/oceanImages';
import { Waves, BadgePlus, AlertCircle } from 'lucide-react';

interface ImageSelectorProps {
  images: OceanImage[];
  onSelectImage: (image: OceanImage) => void;
  selectedImageId: string | null;
  inSidebar?: boolean;
}

const ImageSelector: React.FC<ImageSelectorProps> = ({ 
  images, 
  onSelectImage,
  selectedImageId,
  inSidebar = false
}) => {
  // Filter out images with zero annotations
  const validImages = images.filter(img => img.targetAnnotations.length > 0);
  const hasInvalidImages = images.length !== validImages.length;
  
  return (
    <div className={`${inSidebar ? '' : 'bg-white rounded-xl shadow-lg'} p-4 flex flex-col h-[600px]`}>
      {!inSidebar && (
        <h3 className="text-lg font-bold text-ocean-dark flex items-center gap-2 mb-4 flex-shrink-0">
          <Waves className="text-ocean-medium" /> 
          Images to annotate
        </h3>
      )}
      
      {hasInvalidImages && (
        <div className="text-xs text-amber-700 bg-amber-50 p-2 rounded-md mb-3 flex items-start flex-shrink-0">
          <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0 mt-0.5" />
          <span>Some images without annotations were filtered out.</span>
        </div>
      )}
      
      {/* Scrollable container with fixed height parent */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 gap-3 pb-4 px-1 pt-1">
          {validImages.length > 0 ? (
            validImages.map((image) => (
              <div 
                key={image.id}
                onClick={() => onSelectImage(image)}
                className={`flex cursor-pointer rounded-lg overflow-hidden hover:shadow-md transition-all ${
                  selectedImageId === image.id ? 'ring-2 ring-ocean-medium' : 'hover:bg-gray-50'
                }`}
              >
                <div className="w-24 h-24 flex-shrink-0 bg-gray-100">
                  <img 
                    src={image.imagePath} 
                    alt={image.title}
                    className="w-full h-full object-fill"
                    loading="lazy"
                  />
                </div>
                <div className="px-4 py-3 flex-1 min-w-0">
                  <h4 className="font-medium text-sm mb-2 truncate">{image.title}</h4>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap
                      ${image.difficulty === 'easy' ? 'bg-green-100 text-green-800' : 
                        image.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}
                    >
                      {image.difficulty}
                    </span>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {image.targetAnnotations.length} annotations
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center p-4 text-gray-500">
              No images with annotations available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageSelector;
