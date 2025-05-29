import { TargetAnnotation } from "../utils/annotationUtils";
import annotationsData from './annotations/instances_default.json';

// Dynamic imports for images
import DJI_0998_000002 from './images/DJI_0998_000002.jpg';
import DJI_0998_000006 from './images/DJI_0998_000006.jpg';
import DJI_0998_000035 from './images/DJI_0998_000035.jpg';
import DJI_0998_000055 from './images/DJI_0998_000055.jpg';
import DJI_0998_000124 from './images/DJI_0998_000124.jpg';
import DJI_0998_000125 from './images/DJI_0998_000125.jpg';
import DJI_0998_000139 from './images/DJI_0998_000139.jpg';
import DJI_0998_000144 from './images/DJI_0998_000144.jpg';
import DJI_0998_000308 from './images/DJI_0998_000308.jpg';
import DJI_0998_000312 from './images/DJI_0998_000312.jpg';
import DJI_0998_000334 from './images/DJI_0998_000334.jpg';

// Image mapping
const imageMap: Record<string, string> = {
  "DJI_0998_000002.jpg": DJI_0998_000002,
  "DJI_0998_000006.jpg": DJI_0998_000006,
  "DJI_0998_000035.jpg": DJI_0998_000035,
  "DJI_0998_000055.jpg": DJI_0998_000055,
  "DJI_0998_000124.jpg": DJI_0998_000124,
  "DJI_0998_000125.jpg": DJI_0998_000125,
  "DJI_0998_000139.jpg": DJI_0998_000139,
  "DJI_0998_000144.jpg": DJI_0998_000144,
  "DJI_0998_000308.jpg": DJI_0998_000308,
  "DJI_0998_000312.jpg": DJI_0998_000312,
  "DJI_0998_000334.jpg": DJI_0998_000334,
};

export interface OceanImage {
  id: string;
  title: string;
  imagePath: string;
  difficulty: 'easy' | 'medium' | 'hard';
  targetAnnotations: TargetAnnotation[];
  description: string;
  originalWidth?: number;  // Store original width from COCO data
  originalHeight?: number; // Store original height from COCO data
}

// Map category IDs to human-readable labels
const categoryMap: Record<number, string> = {
  1: 'Great White Shark',
  2: 'Kelp',
  3: 'Swimmer',
  4: 'Surfer',
  5: 'Dolphin',
  6: 'Bat Ray',
  7: 'Bird',
  8: 'Boat',
  9: 'Seal',
  10: 'Kayaker'
};

// Convert COCO annotations to our app's format
const convertAnnotations = (imageId: number): TargetAnnotation[] => {
  const imageAnnotations = annotationsData.annotations.filter(ann => ann.image_id === imageId);
  
  return imageAnnotations.map(annotation => {
    // COCO format bbox is [x, y, width, height]
    // Convert to our format which uses two points [top-left, bottom-right]
    const [x, y, width, height] = annotation.bbox;
    
    return {
      id: `ann_${annotation.id}`,
      type: 'rectangle',
      coordinates: [
        { x, y }, // Top left corner
        { x: x + width, y: y + height } // Bottom right corner
      ],
      label: categoryMap[annotation.category_id] || `Category ${annotation.category_id}`
    };
  });
};

// Find original dimensions for an image from COCO data
const getImageDimensions = (imageId: number): { width: number, height: number } => {
  const imageData = annotationsData.images.find(img => img.id === imageId);
  return {
    width: imageData?.width || 2688, // Default width from COCO data
    height: imageData?.height || 1512 // Default height from COCO data
  };
};

// Generate a description based on annotations
const generateDescription = (annotations: TargetAnnotation[]): string => {
  return "Tap and drag to draw a bounding box.";
};

// Generate difficulty based on number of annotations
const generateDifficulty = (annotations: TargetAnnotation[]): 'easy' | 'medium' | 'hard' => {
  if (annotations.length <= 2) return 'easy';
  if (annotations.length <= 5) return 'medium';
  return 'hard';
};

// List of available images in our data/images folder
const availableImages = Object.keys(imageMap);

// Map filenames to their IDs in the COCO dataset
const filenameToIdMap: Record<string, number> = {};
annotationsData.images.forEach(image => {
  filenameToIdMap[image.file_name] = image.id;
});

// Generate ocean images from the local data
export const oceanImages: OceanImage[] = availableImages.map((filename) => {
  // Find the image ID in the COCO dataset
  const imageId = filenameToIdMap[filename] || 0;
  
  // Get annotations for this image
  const targetAnnotations = imageId ? convertAnnotations(imageId) : [];
  
  // Get original image dimensions from COCO dataset
  const dimensions = imageId ? getImageDimensions(imageId) : { width: 2688, height: 1512 };
  
  // Log dimensions and annotation info for debugging
  console.log(`Image ${filename} - Original dimensions: ${dimensions.width}x${dimensions.height}`);
  console.log(`Image ${filename} - Annotations count: ${targetAnnotations.length}`);
  
  return {
    id: `img_${filename.replace('.jpg', '')}`,
    title: `Ocean Image ${filename}`,
    imagePath: imageMap[filename],
    difficulty: generateDifficulty(targetAnnotations),
    targetAnnotations,
    description: generateDescription(targetAnnotations),
    originalWidth: dimensions.width,
    originalHeight: dimensions.height
  };
});

// Group images by difficulty
export const imagesByDifficulty = {
  easy: oceanImages.filter(img => img.difficulty === 'easy' && img.targetAnnotations.length > 0),
  medium: oceanImages.filter(img => img.difficulty === 'medium' && img.targetAnnotations.length > 0),
  hard: oceanImages.filter(img => img.difficulty === 'hard' && img.targetAnnotations.length > 0)
};

// Helper function to get random elements from an array
const getRandomElements = <T>(array: T[], count: number): T[] => {
  // Make a copy of the array to avoid modifying the original
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  // Return the specified number of elements
  return shuffled.slice(0, Math.min(count, array.length));
};

// Function to get a random subset of images with specified difficulty distribution
export const getProgressiveImageSet = (round: number = 1, imagesPerRound: number = 6): OceanImage[] => {
  // Filter out images with zero annotations first
  const imagesWithAnnotations = oceanImages.filter(img => img.targetAnnotations.length > 0);
  
  // Group by difficulty (using only images with annotations)
  const easyImages = imagesWithAnnotations.filter(img => img.difficulty === 'easy');
  const mediumImages = imagesWithAnnotations.filter(img => img.difficulty === 'medium');
  const hardImages = imagesWithAnnotations.filter(img => img.difficulty === 'hard');
  
  // Always get 3 easy, 2 medium, 1 hard images randomly
  const selectedEasy = getRandomElements(easyImages, 3);
  const selectedMedium = getRandomElements(mediumImages, 2);
  const selectedHard = getRandomElements(hardImages, 1);
  
  // Combine images in order of difficulty (easy → medium → hard)
  return [...selectedEasy, ...selectedMedium, ...selectedHard];
};

// Default fallback data in case the JSON loading fails
if (oceanImages.length === 0) {
  console.warn("No valid images found in the annotations data, using fallback data");
  
  oceanImages.push({
    "id": "ocean1",
    "title": "Coral Reef",
    "imagePath": "https://images.unsplash.com/photo-1518877593221-1f28583780b4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
    "difficulty": "easy",
    "targetAnnotations": [
      {
        "id": "u5l057b",
        "type": "rectangle",
        "coordinates": [
          {
            "x": 125.515625,
            "y": 105
          },
          {
            "x": 400.515625,
            "y": 406
          }
        ],
        "label": "Whale"
      }
    ],
    "description": "A majestic ocean scene. Can you annotate the marine life?",
    "originalWidth": 1200,
    "originalHeight": 800
  });
}
