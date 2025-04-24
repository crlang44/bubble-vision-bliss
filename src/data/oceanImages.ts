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
}

// Map category IDs to human-readable labels
const categoryMap: Record<number, string> = {
  1: 'Great White Shark',
  2: 'Kelp',
  3: 'Human',
  4: 'Surfer',
  5: 'Dolphin',
  6: 'Bat Ray',
  7: 'Bird',
  8: 'Boat',
  9: 'Seal',
  10: 'Kayaker'
};

// Convert COCO format annotations to our app's TargetAnnotation format
const convertCocoAnnotationsToTargetAnnotations = (imageId: number): TargetAnnotation[] => {
  const imageAnnotations = annotationsData.annotations.filter(
    annotation => annotation.image_id === imageId && annotation.bbox && annotation.bbox.length >= 4
  );

  return imageAnnotations.map(annotation => {
    // COCO format bbox is [x, y, width, height]
    // Convert to our format which uses two points [top-left, bottom-right]
    const [x, y, width, height] = annotation.bbox;
    
    return {
      id: `ann_${annotation.id}`,
      type: 'rectangle',
      coordinates: [
        { x, y },
        { x: x + width, y: y + height }
      ],
      label: categoryMap[annotation.category_id] || `Category ${annotation.category_id}`
    };
  });
};

// Generate a description based on annotations
const generateDescription = (annotations: TargetAnnotation[]): string => {
  const categories = [...new Set(annotations.map(a => a.label))];
  if (categories.length === 0) return "Ocean scene.";
  
  if (categories.length === 1) {
    return `Ocean scene containing ${categories[0].toLowerCase()}.`;
  }
  
  const lastCategory = categories.pop();
  return `Ocean scene containing ${categories.join(', ').toLowerCase()} and ${lastCategory?.toLowerCase()}.`;
};

// Generate difficulty based on number of annotations
const generateDifficulty = (annotations: TargetAnnotation[]): 'easy' | 'medium' | 'hard' => {
  if (annotations.length <= 2) return 'easy';
  if (annotations.length <= 5) return 'medium';
  return 'hard';
};

// List of available images in our data/images folder
const availableImages = Object.keys(imageMap);

// Generate ocean images from the local data
export const oceanImages: OceanImage[] = annotationsData.images
  .filter(image => availableImages.includes(image.file_name))
  .map(image => {
    const targetAnnotations = convertCocoAnnotationsToTargetAnnotations(image.id);
    
    return {
      id: `img_${image.id}`,
      title: `Ocean Image ${image.id}`,
      // Use the imported image URL
      imagePath: imageMap[image.file_name],
      difficulty: generateDifficulty(targetAnnotations),
      targetAnnotations,
      description: generateDescription(targetAnnotations)
    };
  });

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
    "description": "A majestic ocean scene. Can you annotate the marine life?"
  });
}