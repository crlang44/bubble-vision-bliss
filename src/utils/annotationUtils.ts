export type AnnotationType = 'rectangle';
export type Coordinate = { x: number; y: number };

export interface Annotation {
  id: string;
  type: AnnotationType;
  coordinates: Coordinate[];
  label: string;
  color: string;
  isComplete: boolean;
  _displayCoordinates?: Coordinate[]; // Added for tracking display coordinates
}

export interface TargetAnnotation {
  id: string;
  type: AnnotationType;
  coordinates: Coordinate[];
  label: string;
}

// Calculate overlap between two rectangles with more lenient scoring
export const calculateRectOverlap = (rect1: Coordinate[], rect2: Coordinate[]): number => {
  if (rect1.length < 2 || rect2.length < 2) return 0;
  
  // For simplicity, we assume coordinates are in order: top-left, bottom-right
  const r1 = {
    left: Math.min(rect1[0].x, rect1[1].x),
    right: Math.max(rect1[0].x, rect1[1].x),
    top: Math.min(rect1[0].y, rect1[1].y),
    bottom: Math.max(rect1[0].y, rect1[1].y)
  };
  
  const r2 = {
    left: Math.min(rect2[0].x, rect2[1].x),
    right: Math.max(rect2[0].x, rect2[1].x),
    top: Math.min(rect2[0].y, rect2[1].y),
    bottom: Math.max(rect2[0].y, rect2[1].y)
  };
  
  // Check for obvious mismatches first - if rectangles are too far apart
  const maxDistance = 300; // Maximum distance to consider any possibility of a match
  const centerDist = Math.sqrt(
    Math.pow(((r1.left + r1.right) / 2) - ((r2.left + r2.right) / 2), 2) +
    Math.pow(((r1.top + r1.bottom) / 2) - ((r2.top + r2.bottom) / 2), 2)
  );
  
  // If centers are too far apart, don't consider them a match
  if (centerDist > maxDistance) {
    console.log(`Rectangles too far apart: ${centerDist} > ${maxDistance}`);
    return 0;
  }
  
  const xOverlap = Math.max(0, Math.min(r1.right, r2.right) - Math.max(r1.left, r2.left));
  const yOverlap = Math.max(0, Math.min(r1.bottom, r2.bottom) - Math.max(r1.top, r2.top));
  const overlapArea = xOverlap * yOverlap;
  
  const area1 = (r1.right - r1.left) * (r1.bottom - r1.top);
  const area2 = (r2.right - r2.left) * (r2.bottom - r2.top);
  
  // Calculate regular IoU (Intersection over Union)
  const regularIoU = overlapArea / (area1 + area2 - overlapArea);
  
  // More lenient scoring - apply a boost to the score
  // This gives partial credit even for imperfect overlaps
  const leniencyBoost = 0.3; // Boost factor (30% boost)
  let boostedScore = regularIoU * (1 + leniencyBoost);
  
  // Apply a minimum score if there's any overlap at all
  if (regularIoU > 0 && boostedScore < 0.2) {
    boostedScore = 0.2; // Minimum 20% score for any overlap
  }
  
  // Apply a proximity bonus for rectangles that are close but don't overlap
  if (regularIoU === 0) {
    // Check if rectangles are close (within 20% of the average size)
    const avgSize = (Math.sqrt(area1) + Math.sqrt(area2)) / 2;
    const proximity = 0.2 * avgSize;
    
    // Calculate distances between rectangles on each axis
    const xDistance = Math.max(0, Math.max(r1.left, r2.left) - Math.min(r1.right, r2.right));
    const yDistance = Math.max(0, Math.max(r1.top, r2.top) - Math.min(r1.bottom, r2.bottom));
    
    // If rectangles are close enough, assign a small score
    if (xDistance < proximity && yDistance < proximity) {
      boostedScore = 0.1; // 10% score for close proximity
    }
    
    // Give partial credit for annotations in the general area
    // This helps with large images where precision is harder
    if (centerDist < maxDistance / 2) {
      boostedScore = Math.max(boostedScore, 0.3); // At least 30% for being in right area
    }
  }
  
  // Cap at 1.0 maximum
  return Math.min(boostedScore, 1.0);
};

// Calculate distance between two points
export const calculatePointDistance = (p1: Coordinate, p2: Coordinate): number => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

// Score calculation based on annotation type and accuracy
export const calculateScore = (
  userAnnotation: Annotation,
  targetAnnotation: TargetAnnotation
): number => {
  if (userAnnotation.type !== targetAnnotation.type || userAnnotation.label !== targetAnnotation.label) {
    return 0;
  }

  // Debug coordinates
  console.log('Score calculation - User:', userAnnotation.coordinates);
  console.log('Score calculation - Target:', targetAnnotation.coordinates);

  // Score based on annotation type
  switch (userAnnotation.type) {
    case 'rectangle':
      const overlap = calculateRectOverlap(userAnnotation.coordinates, targetAnnotation.coordinates);
      console.log('Rectangle overlap calculation:', overlap);
      return Math.round(overlap * 100);
    
    default:
      return 0;
  }
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};
