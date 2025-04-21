
export type AnnotationType = 'rectangle' | 'polygon' | 'point';
export type Coordinate = { x: number; y: number };

export interface Annotation {
  id: string;
  type: AnnotationType;
  coordinates: Coordinate[];
  label: string;
  color: string;
  isComplete: boolean;
}

export interface TargetAnnotation {
  id: string;
  type: AnnotationType;
  coordinates: Coordinate[];
  label: string;
}

// Calculate overlap between two rectangles
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
  
  const xOverlap = Math.max(0, Math.min(r1.right, r2.right) - Math.max(r1.left, r2.left));
  const yOverlap = Math.max(0, Math.min(r1.bottom, r2.bottom) - Math.max(r1.top, r2.top));
  const overlapArea = xOverlap * yOverlap;
  
  const area1 = (r1.right - r1.left) * (r1.bottom - r1.top);
  const area2 = (r2.right - r2.left) * (r2.bottom - r2.top);
  
  // Return overlap percentage (IoU - Intersection over Union)
  return overlapArea / (area1 + area2 - overlapArea);
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

  // Score based on annotation type
  switch (userAnnotation.type) {
    case 'rectangle':
      const overlap = calculateRectOverlap(userAnnotation.coordinates, targetAnnotation.coordinates);
      return Math.round(overlap * 100);
    
    case 'point':
      if (userAnnotation.coordinates.length < 1 || targetAnnotation.coordinates.length < 1) return 0;
      const distance = calculatePointDistance(userAnnotation.coordinates[0], targetAnnotation.coordinates[0]);
      // Convert distance to a score (closer = higher score)
      const maxDistance = 50; // Pixels
      const pointScore = Math.max(0, (maxDistance - distance) / maxDistance);
      return Math.round(pointScore * 100);
    
    case 'polygon':
      // For simplicity, we'll just count matching vertices (in a real app, you'd use a more sophisticated algorithm)
      const correctVertices = userAnnotation.coordinates.filter((coord, i) => {
        if (i < targetAnnotation.coordinates.length) {
          const distance = calculatePointDistance(coord, targetAnnotation.coordinates[i]);
          return distance < 20; // Within 20 pixels
        }
        return false;
      }).length;
      
      return Math.round((correctVertices / Math.max(userAnnotation.coordinates.length, targetAnnotation.coordinates.length)) * 100);
    
    default:
      return 0;
  }
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};
