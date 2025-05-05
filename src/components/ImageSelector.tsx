
import React from 'react';
import { OceanImage } from '../data/oceanImages';
import { Waves, BadgePlus, AlertCircle } from 'lucide-react';

interface ImageSelectorProps {
  images: OceanImage[];
  onSelectImage: (image: OceanImage) => void;
  selectedImageId: string | null;
}

const ImageSelector: React.FC<ImageSelectorProps> = ({ 
  images, 
  onSelectImage,
  selectedImageId 
}) => {
  // Filter out images with zero annotations
  const validImages = images.filter(img => img.targetAnnotations.length > 0);
  const hasInvalidImages = images.length !== validImages.length;
  
  return (
    <div className="bg-white rounded-xl p-4 shadow-lg">
      <h3 className="text-lg font-bold text-ocean-dark flex items-center gap-2 mb-4">
        <Waves className="text-ocean-medium" /> 
        Select an Image to Annotate
      </h3>
      
      {hasInvalidImages && (
        <div className="text-xs text-amber-700 bg-amber-50 p-2 rounded-md mb-3 flex items-start">
          <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0 mt-0.5" />
          <span>Some images without annotations were filtered out.</span>
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-3">
        {validImages.length > 0 ? (
          validImages.map((image) => (
            <div 
              key={image.id}
              onClick={() => onSelectImage(image)}
              className={`flex cursor-pointer rounded-lg overflow-hidden hover:shadow-md transition-all ${
                selectedImageId === image.id ? 'ring-2 ring-ocean-medium' : 'hover:bg-gray-50'
              }`}
            >
              <div className="w-20 h-20 flex-shrink-0">
                <img 
                  src={image.imagePath} 
                  alt={image.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="px-3 py-2 flex-1">
                <h4 className="font-medium text-sm">{image.title}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                    ${image.difficulty === 'easy' ? 'bg-green-100 text-green-800' : 
                      image.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    }`}
                  >
                    {image.difficulty}
                  </span>
                  <span className="text-xs text-gray-500">
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
        
        {/* Disabled "Add Your Own" option for simplicity */}
        <div className="flex items-center justify-center p-3 mt-2 border border-dashed border-gray-300 rounded-lg text-gray-400">
          <BadgePlus className="w-4 h-4 mr-2" />
          <span className="text-sm">Add Your Own (Coming Soon)</span>
        </div>
      </div>
    </div>
  );
};

export default ImageSelector;
