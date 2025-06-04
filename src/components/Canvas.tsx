import React, { useEffect, useRef, useState } from 'react';
import { Annotation, AnnotationType, Coordinate, generateId, TargetAnnotation, labelColors } from '../utils/annotationUtils';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import { useIsTouch, useIsAndroidTablet } from '../hooks/use-mobile';

interface CanvasProps {
  imageUrl: string;
  selectedTool: AnnotationType | null;
  currentLabel: string;
  onAnnotationComplete: (annotation: Annotation) => void;
  annotations: Annotation[];
  onAnnotationUpdate: (annotations: Annotation[]) => void;
  targetAnnotations?: TargetAnnotation[]; // New optional prop
  showGroundTruth?: boolean; // New prop to control ground truth visibility from parent
  onToggleGroundTruth?: () => void; // New prop to handle toggle from child
  originalWidth?: number; // Original image width from COCO dataset
  originalHeight?: number; // Original image height from COCO dataset
  disabled?: boolean; // New prop to disable drawing interactions
}

const Canvas: React.FC<CanvasProps> = ({
  imageUrl,
  selectedTool,
  currentLabel,
  onAnnotationComplete,
  annotations,
  onAnnotationUpdate,
  targetAnnotations = [], // Default to empty array
  showGroundTruth = false, // Default to not showing ground truth
  onToggleGroundTruth,
  originalWidth,
  originalHeight,
  disabled = false // Default to not disabled
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const prevImageUrlRef = useRef<string>(imageUrl); // Keep track of previous imageUrl
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentAnnotation, setCurrentAnnotation] = useState<Annotation | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [scale, setScale] = useState(1);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [localShowGroundTruth, setLocalShowGroundTruth] = useState(showGroundTruth);
  const [scaledTargetAnnotations, setScaledTargetAnnotations] = useState<TargetAnnotation[]>([]);
  const isTouch = useIsTouch();
  const isAndroidTablet = useIsAndroidTablet();
  
  // Add a ref to track touch events
  const touchStartRef = useRef<{x: number, y: number} | null>(null);
  const touchStartTimeRef = useRef<number>(0);

  // Store previous canvas size for rescaling
  const prevCanvasSizeRef = useRef<{ width: number; height: number }>({ width: 0, height: 0 });

  const [cursorStyle, setCursorStyle] = useState<'crosshair'>('crosshair');

  const LABEL_HEIGHT = 16;

  // Update local state when prop changes
  useEffect(() => {
    setLocalShowGroundTruth(showGroundTruth);
    
    // Force redraw when ground truth visibility changes
    if (isImageLoaded) {
      redrawCanvas();
    }
  }, [showGroundTruth, isImageLoaded]);

  // Colors for different annotation types
  const annotationColors = {
    rectangle: '#FF719A', // coral
  };

  // Scale display coordinates (from original image size to canvas size)
  const scaleToDisplay = (coordinates: Coordinate[]): Coordinate[] => {
    if (!originalWidth || !originalHeight || !canvasSize.width || !canvasSize.height) {
      return coordinates;
    }
    
    const scaleX = canvasSize.width / originalWidth;
    const scaleY = canvasSize.height / originalHeight;
    
    return coordinates.map(coord => ({
      x: Math.round(coord.x * scaleX),
      y: Math.round(coord.y * scaleY)
    }));
  };

  // Scale to scoring coordinates (from canvas size to original image size)
  const scaleToScoring = (coordinates: Coordinate[]): Coordinate[] => {
    if (!originalWidth || !originalHeight || !canvasSize.width || !canvasSize.height) {
      return coordinates;
    }
    
    const scaleX = originalWidth / canvasSize.width;
    const scaleY = originalHeight / canvasSize.height;
    
    return coordinates.map(coord => ({
      x: Math.round(coord.x * scaleX),
      y: Math.round(coord.y * scaleY)
    }));
  };

  // Scale target annotations when canvas size or target annotations change
  useEffect(() => {
    if (targetAnnotations.length > 0 && canvasSize.width > 0 && canvasSize.height > 0) {
      const scaled = targetAnnotations.map(annotation => ({
        ...annotation,
        coordinates: scaleToDisplay(annotation.coordinates)
      }));
      setScaledTargetAnnotations(scaled);
    } else {
      setScaledTargetAnnotations([]);
    }
  }, [targetAnnotations, canvasSize, originalWidth, originalHeight]);

  // Load the image - only when imageUrl changes, not on every render
  useEffect(() => {
    // Only reload the image if the URL has actually changed
    if (imageUrl === prevImageUrlRef.current && isImageLoaded) {
      return;
    }
    
    setIsImageLoaded(false);
    prevImageUrlRef.current = imageUrl; // Update the ref with current URL
    
    // Reset local ground truth display when image changes
    setLocalShowGroundTruth(showGroundTruth);
    
    // Create a new image and set up loading
    const img = new Image();
    
    // Set up loading handlers before setting src
    img.onload = () => {
      if (!containerRef.current) return;
      
      // Get container dimensions
      const container = containerRef.current;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      
      // Calculate scale to fill the container completely
      const scaleX = containerWidth / img.width;
      const scaleY = containerHeight / img.height;
      const newScale = Math.max(scaleX, scaleY); // Use max to ensure full coverage
      
      // Calculate new dimensions to fill container
      const newWidth = img.width * newScale;
      const newHeight = img.height * newScale;
      
      setCanvasSize({ width: newWidth, height: newHeight });
      setScale(newScale);
      imageRef.current = img;
      setIsImageLoaded(true);
      
      // Draw the initial canvas immediately after image loads
      requestAnimationFrame(() => {
        redrawCanvas();
      });
    };
    
    img.onerror = () => {
      toast.error('Failed to load image');
      setIsImageLoaded(false);
    };

    // Set src after handlers are set up
    img.src = imageUrl;
    
    // Cleanup
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [imageUrl]);

  // Make canvas responsive to window resize
  useEffect(() => {
    const handleResize = () => {
      if (!imageRef.current || !containerRef.current) return;
      const img = imageRef.current;
      const container = containerRef.current;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      const scaleX = containerWidth / img.width;
      const scaleY = containerHeight / img.height;
      const newScale = Math.max(scaleX, scaleY);
      const newWidth = img.width * newScale;
      const newHeight = img.height * newScale;

      // Rescale annotation coordinates if canvas size changed
      const prevSize = prevCanvasSizeRef.current;
      if (prevSize.width && prevSize.height && (prevSize.width !== newWidth || prevSize.height !== newHeight)) {
        const rescale = (coord) => ({
          x: (coord.x / prevSize.width) * newWidth,
          y: (coord.y / prevSize.height) * newHeight
        });
        // Rescale all annotations
        onAnnotationUpdate(
          annotations.map(ann => ({
            ...ann,
            coordinates: ann.coordinates.map(rescale),
            _displayCoordinates: ann._displayCoordinates
              ? ann._displayCoordinates.map(rescale)
              : undefined
          }))
        );
      }
      prevCanvasSizeRef.current = { width: newWidth, height: newHeight };
      setCanvasSize({ width: newWidth, height: newHeight });
      setScale(newScale);
      // Redraw canvas after resize
      requestAnimationFrame(() => {
        redrawCanvas();
      });
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isImageLoaded, annotations, onAnnotationUpdate]);

  // Update prevCanvasSizeRef when canvas size changes (e.g., on image load)
  useEffect(() => {
    prevCanvasSizeRef.current = { ...canvasSize };
  }, [canvasSize]);

  // Initial render of the image when isImageLoaded changes
  useEffect(() => {
    if (isImageLoaded && canvasRef.current && imageRef.current) {
      const canvas = canvasRef.current;
      canvas.width = canvasSize.width;
      canvas.height = canvasSize.height;
      redrawCanvas();
    }
  }, [isImageLoaded, canvasSize]);

  // Apply specific class to body when using canvas on Android tablet
  useEffect(() => {
    if (isAndroidTablet) {
      document.body.classList.add('canvas-active');
    }
    
    return () => {
      document.body.classList.remove('canvas-active');
    };
  }, [isAndroidTablet]);

  // Redraw the canvas with the image and all annotations
  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    
    if (!canvas || !ctx || !imageRef.current) return;
    
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw the image
    ctx.drawImage(
      imageRef.current,
      0,
      0,
      canvas.width,
      canvas.height
    );
    
    // Draw all completed annotations - make sure to scale them for display
    annotations.forEach(annotation => {
      // Check if we have stored display coordinates 
      if (annotation._displayCoordinates) {
        // Use stored display coordinates
        const displayAnnotation = {
          ...annotation,
          coordinates: annotation._displayCoordinates
        };
        drawAnnotation(ctx, displayAnnotation);
      } else {
        // Scale the original coordinates for display
        const displayCoordinates = scaleToDisplay(annotation.coordinates);
        const displayAnnotation = {
          ...annotation,
          coordinates: displayCoordinates
        };
        drawAnnotation(ctx, displayAnnotation);
      }
    });
    
    // Draw the current annotation being created
    if (currentAnnotation) {
      drawAnnotation(ctx, currentAnnotation);
    }
    
    // Draw ground truth annotations if localShowGroundTruth is true
    // Use the direct prop value instead of local state for more reliable updates
    if (showGroundTruth) {
      scaledTargetAnnotations.forEach(target => {
        drawAnnotation(ctx, target, true);
      });
    }
  };

  // Function to check if a point is inside a rectangle
  const isPointInRect = (point: { x: number, y: number }, rect: { x: number, y: number, width: number, height: number }) => {
    return point.x >= rect.x && point.x <= rect.x + rect.width &&
           point.y >= rect.y && point.y <= rect.y + rect.height;
  };

  // Update mouse move logic - remove delete icon hover check
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { offsetX, offsetY } = getCanvasCoordinates(e);
    // Keep cursor as crosshair
    setCursorStyle('crosshair');
  };

  const handlePointerDown = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    e.preventDefault(); // Prevent default browser behavior
    
    let offsetX: number, offsetY: number;
    
    // Handle touch event
    if ('touches' in e) {
      const touch = e.touches[0];
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      offsetX = touch.clientX - rect.left;
      offsetY = touch.clientY - rect.top;
    } else {
      // Handle mouse event
      const { offsetX: mouseX, offsetY: mouseY } = getCanvasCoordinates(e);
      offsetX = mouseX;
      offsetY = mouseY;
    }
    
    // Start drawing
    setIsDrawing(true);
    touchStartRef.current = { x: offsetX, y: offsetY };
    setCurrentAnnotation({
      id: Date.now().toString(),
      type: 'rectangle',
      coordinates: [{ x: offsetX, y: offsetY }],
      label: currentLabel || 'Unknown',
      color: labelColors[currentLabel] || annotationColors.rectangle,
      isComplete: false
    });
  };

  // Utility to normalize rectangle coordinates
  const getNormalizedRect = (start, end) => {
    const left = Math.min(start.x, end.x);
    const right = Math.max(start.x, end.x);
    const top = Math.min(start.y, end.y);
    const bottom = Math.max(start.y, end.y);
    return { left, right, top, bottom };
  };

  const drawAnnotation = (ctx: CanvasRenderingContext2D, annotation: Annotation | TargetAnnotation, isTarget = false) => {
    const { type, coordinates, label } = annotation;
    if (coordinates.length === 0) return;
    ctx.strokeStyle = isTarget ? 'rgba(0, 255, 0, 0.7)' : (annotation as Annotation).color;
    ctx.fillStyle = isTarget ? 'rgba(0, 255, 0, 0.2)' : `${(annotation as Annotation).color}20`;
    ctx.lineWidth = 2;
    ctx.setLineDash(isTarget ? [5, 5] : []);
    if (coordinates.length >= 2) {
      const [start, end] = coordinates;
      const { left, right, top, bottom } = getNormalizedRect(start, end);
      const width = right - left;
      const height = bottom - top;
      ctx.beginPath();
      ctx.rect(left, top, width, height);
      ctx.fill();
      ctx.stroke();
      
      // --- LABEL POSITIONING ---
      if ((annotation as Annotation).isComplete || isTarget) {
        ctx.font = '12px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 0.5;
        const labelWidth = ctx.measureText(label).width + 6;
        // Default: Top Left
        let labelX = left;
        let labelY = top - 5;
        // If label would be cut off at the top, move to bottom right
        if (labelY - LABEL_HEIGHT < 0) {
          labelX = right - labelWidth + 3;
          labelY = bottom + LABEL_HEIGHT - 5;
        }
        // Draw label background
        ctx.fillStyle = isTarget ? 'rgba(0, 255, 0, 0.7)' : (annotation as Annotation).color;
        ctx.fillRect(labelX - 3, labelY - 12, labelWidth, LABEL_HEIGHT);
        // Draw label text
        ctx.fillStyle = '#ffffff';
        ctx.fillText(label, labelX, labelY);
      }
    }
    ctx.setLineDash([]);
  };

  // Redraw canvas when annotations change
  useEffect(() => {
    if (isImageLoaded) {
      redrawCanvas();
    }
  }, [annotations, currentAnnotation, isImageLoaded, scaledTargetAnnotations, showGroundTruth]);

  // Utility: Get pointer position normalized to canvas coordinate system
  function getNormalizedPointerPosition(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement) {
    let clientX, clientY;
    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }

  // Combined function to handle both mouse and touch move events
  const handlePointerMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentAnnotation) return;
    
    e.preventDefault(); // Prevent default browser behavior
    
    let offsetX: number, offsetY: number;
    
    // Handle touch event
    if ('touches' in e) {
      const touch = e.touches[0];
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      offsetX = touch.clientX - rect.left;
      offsetY = touch.clientY - rect.top;
    } else {
      // Handle mouse event
      const { offsetX: mouseX, offsetY: mouseY } = getCanvasCoordinates(e);
      offsetX = mouseX;
      offsetY = mouseY;
    }
    
    // For rectangle, we update the second coordinate (end point)
    const updatedAnnotation = { ...currentAnnotation };
    if (updatedAnnotation.coordinates.length === 1) {
      updatedAnnotation.coordinates.push({ x: offsetX, y: offsetY });
    } else {
      updatedAnnotation.coordinates[1] = { x: offsetX, y: offsetY };
    }
    setCurrentAnnotation(updatedAnnotation);
    
    redrawCanvas();
  };

  // Combined function to handle both mouse and touch end events
  const handlePointerUp = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentAnnotation || !touchStartRef.current) return;
    
    e.preventDefault(); // Prevent default browser behavior
    
    let endX: number, endY: number;
    
    // Handle touch event
    if ('changedTouches' in e) {
      const touch = e.changedTouches[0];
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      endX = touch.clientX - rect.left;
      endY = touch.clientY - rect.top;
    } else {
      // Handle mouse event
      const { offsetX: mouseX, offsetY: mouseY } = getCanvasCoordinates(e);
      endX = mouseX;
      endY = mouseY;
    }
    
    // Calculate the distance moved
    const dx = endX - touchStartRef.current.x;
    const dy = endY - touchStartRef.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // If the pointer didn't move enough, don't complete the annotation
    const MIN_DRAG_DISTANCE = 10; // Minimum distance in pixels
    if (distance < MIN_DRAG_DISTANCE) {
      setIsDrawing(false);
      setCurrentAnnotation(null);
      touchStartRef.current = null;
      return;
    }
    
    // Complete the rectangle
    const updatedAnnotation = { ...currentAnnotation, isComplete: true };
    
    // We need to keep the display coordinates for rendering
    const displayAnnotation = { ...updatedAnnotation };
    
    // Scale the annotation to original image coordinates for proper scoring
    const scoringCoordinates = scaleToScoring(updatedAnnotation.coordinates);
    const scoringAnnotation = {
      ...updatedAnnotation,
      coordinates: scoringCoordinates,
      // Add a reference to the display coordinates for future rendering
      _displayCoordinates: updatedAnnotation.coordinates
    };
    
    onAnnotationComplete(scoringAnnotation);
    
    setIsDrawing(false);
    setCurrentAnnotation(null);
    touchStartRef.current = null;
  };

  // Handle pointer cancel/leave events for touch devices
  const handlePointerCancel = () => {
    if (isDrawing) {
      setIsDrawing(false);
      setCurrentAnnotation(null);
      touchStartRef.current = null;
    }
  };

  // Get canvas coordinates from mouse event
  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { offsetX: 0, offsetY: 0 };
    
    const rect = canvas.getBoundingClientRect();
    return {
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top
    };
  };

  return (
    <div 
      ref={containerRef} 
      className="flex items-center justify-center w-full h-full bg-gray-100 rounded-xl overflow-hidden relative"
      style={{ padding: 0 }}
    >
      {/* <div className="absolute top-2 right-2 z-10">
        <button 
          onClick={() => {
            // When the button is clicked, notify the parent component
            if (onToggleGroundTruth) onToggleGroundTruth();
            // No need to update local state here, it will be updated via the prop change
          }}
          className="bg-white/80 hover:bg-white rounded-full p-2 shadow-md"
          title={showGroundTruth ? "Hide Ground Truth" : "Show Ground Truth"}
        >
          {showGroundTruth ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div> */}
      
      {/* Preload hint for the current image */}
      <link rel="preload" as="image" href={imageUrl} />
      
      <canvas
        ref={canvasRef}
        className={`cursor-crosshair touch-canvas ${isAndroidTablet ? 'android-tablet-canvas' : ''}`}
        width={canvasSize.width}
        height={canvasSize.height}
        style={{ 
          display: isImageLoaded ? 'block' : 'none',
          opacity: isImageLoaded ? 1 : 0,
          transition: 'opacity 0.2s ease-in-out',
          objectFit: 'fill',
          cursor: cursorStyle
        }}
        onMouseDown={handlePointerDown}
        onMouseMove={(e) => {
          handlePointerMove(e);
          handleMouseMove(e);
        }}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerCancel}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
        onTouchCancel={handlePointerCancel}
      ></canvas>
      
      {!isImageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-pulse flex items-center">
            <div className="w-4 h-4 bg-ocean-medium rounded-full mr-2 animate-bounce"></div>
            Loading image...
          </div>
        </div>
      )}
    </div>
  );
};

export default Canvas;
