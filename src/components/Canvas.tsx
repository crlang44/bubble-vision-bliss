
import React, { useEffect, useRef, useState } from 'react';
import { Annotation, AnnotationType, Coordinate, generateId } from '../utils/annotationUtils';
import { toast } from 'sonner';

interface CanvasProps {
  imageUrl: string;
  selectedTool: AnnotationType | null;
  currentLabel: string;
  onAnnotationComplete: (annotation: Annotation) => void;
  annotations: Annotation[];
  onAnnotationUpdate: (annotations: Annotation[]) => void;
}

const Canvas: React.FC<CanvasProps> = ({
  imageUrl,
  selectedTool,
  currentLabel,
  onAnnotationComplete,
  annotations,
  onAnnotationUpdate
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentAnnotation, setCurrentAnnotation] = useState<Annotation | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [scale, setScale] = useState(1);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // Colors for different annotation types
  const annotationColors = {
    rectangle: '#FF719A', // coral
    polygon: '#6E59A5',   // seaweed
    point: '#0EA5E9'      // ocean
  };

  // Load the image
  useEffect(() => {
    setIsImageLoaded(false);
    const img = new Image();
    img.src = imageUrl;
    
    img.onload = () => {
      if (!containerRef.current) return;
      
      // Get container dimensions
      const container = containerRef.current;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      
      // Calculate scale to fit the image while maintaining aspect ratio
      const scaleX = containerWidth / img.width;
      const scaleY = containerHeight / img.height;
      const newScale = Math.min(scaleX, scaleY, 1); // Don't scale up if image is smaller
      
      // Calculate new dimensions
      const newWidth = img.width * newScale;
      const newHeight = img.height * newScale;
      
      setCanvasSize({ width: newWidth, height: newHeight });
      setScale(newScale);
      imageRef.current = img;
      setIsImageLoaded(true);
      
      // Draw the initial canvas immediately after image loads
      setTimeout(() => {
        redrawCanvas();
      }, 0);
    };
    
    img.onerror = () => {
      toast.error('Failed to load image');
    };
  }, [imageUrl]);

  // Initial render of the image when isImageLoaded changes
  useEffect(() => {
    if (isImageLoaded && canvasRef.current && imageRef.current) {
      const canvas = canvasRef.current;
      canvas.width = canvasSize.width;
      canvas.height = canvasSize.height;
      redrawCanvas();
    }
  }, [isImageLoaded, canvasSize]);

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
    
    // Draw all completed annotations
    annotations.forEach(annotation => {
      drawAnnotation(ctx, annotation);
    });
    
    // Draw the current annotation being created
    if (currentAnnotation) {
      drawAnnotation(ctx, currentAnnotation);
    }
  };

  // Draw a single annotation
  const drawAnnotation = (ctx: CanvasRenderingContext2D, annotation: Annotation) => {
    const { type, coordinates, color, isComplete } = annotation;
    
    if (coordinates.length === 0) return;
    
    ctx.strokeStyle = color;
    ctx.fillStyle = isComplete ? `${color}20` : `${color}10`; // More transparent if not complete
    ctx.lineWidth = 2;
    
    switch (type) {
      case 'rectangle':
        if (coordinates.length >= 2) {
          const [start, end] = coordinates;
          const width = end.x - start.x;
          const height = end.y - start.y;
          
          ctx.beginPath();
          ctx.rect(start.x, start.y, width, height);
          ctx.fill();
          ctx.stroke();
        }
        break;
        
      case 'polygon':
        if (coordinates.length >= 2) {
          ctx.beginPath();
          ctx.moveTo(coordinates[0].x, coordinates[0].y);
          
          for (let i = 1; i < coordinates.length; i++) {
            ctx.lineTo(coordinates[i].x, coordinates[i].y);
          }
          
          if (isComplete) {
            ctx.closePath();
          }
          
          ctx.fill();
          ctx.stroke();
        }
        break;
        
      case 'point':
        ctx.beginPath();
        ctx.arc(coordinates[0].x, coordinates[0].y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        break;
    }
    
    // Draw label if annotation is complete
    if (isComplete) {
      ctx.font = '12px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 0.5;
      
      let x, y;
      
      if (type === 'rectangle' && coordinates.length >= 2) {
        x = coordinates[0].x;
        y = coordinates[0].y - 5;
      } else if (type === 'polygon' && coordinates.length > 0) {
        x = coordinates[0].x;
        y = coordinates[0].y - 5;
      } else if (type === 'point' && coordinates.length > 0) {
        x = coordinates[0].x + 10;
        y = coordinates[0].y - 5;
      } else {
        return;
      }
      
      // Draw label background
      const labelWidth = ctx.measureText(annotation.label).width + 6;
      ctx.fillStyle = color;
      ctx.fillRect(x - 3, y - 12, labelWidth, 16);
      
      // Draw label text
      ctx.fillStyle = '#ffffff';
      ctx.fillText(annotation.label, x, y);
    }
  };

  // Handle mouse down event
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!selectedTool || !canvasRef.current) return;
    
    const { offsetX, offsetY } = getCanvasCoordinates(e);
    
    setIsDrawing(true);
    
    // Create a new annotation
    const newAnnotation: Annotation = {
      id: generateId(),
      type: selectedTool,
      coordinates: [{ x: offsetX, y: offsetY }],
      label: currentLabel || 'Unknown',
      color: annotationColors[selectedTool],
      isComplete: false
    };
    
    setCurrentAnnotation(newAnnotation);
    
    // If it's a polygon or point, we need to start collecting coordinates
    if (selectedTool === 'polygon' || selectedTool === 'point') {
      // For point, we complete it right away
      if (selectedTool === 'point') {
        newAnnotation.isComplete = true;
        onAnnotationComplete(newAnnotation);
        setIsDrawing(false);
        setCurrentAnnotation(null);
      }
    }
  };

  // Handle mouse move event
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentAnnotation || !selectedTool) return;
    
    const { offsetX, offsetY } = getCanvasCoordinates(e);
    
    if (selectedTool === 'rectangle') {
      // For rectangle, we update the second coordinate (end point)
      const updatedAnnotation = { ...currentAnnotation };
      if (updatedAnnotation.coordinates.length === 1) {
        updatedAnnotation.coordinates.push({ x: offsetX, y: offsetY });
      } else {
        updatedAnnotation.coordinates[1] = { x: offsetX, y: offsetY };
      }
      setCurrentAnnotation(updatedAnnotation);
    }
    
    redrawCanvas();
  };

  // Handle mouse up event
  const handleMouseUp = () => {
    if (!isDrawing || !currentAnnotation || !selectedTool) return;
    
    if (selectedTool === 'rectangle') {
      // Complete the rectangle
      const updatedAnnotation = { ...currentAnnotation, isComplete: true };
      onAnnotationComplete(updatedAnnotation);
      setIsDrawing(false);
      setCurrentAnnotation(null);
    }
  };

  // Handle mouse click for polygon
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!selectedTool || selectedTool !== 'polygon') return;
    
    const { offsetX, offsetY } = getCanvasCoordinates(e);
    
    if (!currentAnnotation) {
      // Start a new polygon
      const newAnnotation: Annotation = {
        id: generateId(),
        type: 'polygon',
        coordinates: [{ x: offsetX, y: offsetY }],
        label: currentLabel || 'Unknown',
        color: annotationColors.polygon,
        isComplete: false
      };
      setCurrentAnnotation(newAnnotation);
      setIsDrawing(true);
    } else {
      // Add a point to the existing polygon
      const updatedAnnotation = { ...currentAnnotation };
      updatedAnnotation.coordinates.push({ x: offsetX, y: offsetY });
      setCurrentAnnotation(updatedAnnotation);
    }
  };

  // Handle double click to complete polygon
  const handleDoubleClick = () => {
    if (!currentAnnotation || currentAnnotation.type !== 'polygon') return;
    
    if (currentAnnotation.coordinates.length >= 3) {
      const updatedAnnotation = { ...currentAnnotation, isComplete: true };
      onAnnotationComplete(updatedAnnotation);
    } else {
      toast.error('A polygon needs at least 3 points');
    }
    
    setIsDrawing(false);
    setCurrentAnnotation(null);
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

  // Redraw canvas when annotations change
  useEffect(() => {
    if (isImageLoaded) {
      redrawCanvas();
    }
  }, [annotations, currentAnnotation, isImageLoaded]);

  return (
    <div 
      ref={containerRef} 
      className="flex items-center justify-center w-full h-full bg-gray-100 rounded-xl overflow-hidden relative"
    >
      <canvas
        ref={canvasRef}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="cursor-crosshair"
        width={canvasSize.width}
        height={canvasSize.height}
        style={{ display: isImageLoaded ? 'block' : 'none' }}
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
