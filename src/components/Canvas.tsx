import React, { useEffect, useRef, useState } from 'react';
import { Annotation, AnnotationType, Coordinate, generateId, TargetAnnotation, labelColors } from '../utils/annotationUtils';
import { toast } from 'sonner';
import { useIsTouch, useIsAndroidTablet } from '../hooks/use-mobile';
import { Eye, EyeOff, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  availableLabels: string[]; // New prop for available labels
  onLabelChange: (label: string) => void; // New prop for label change
}

// Extend Annotation type for local use
interface CanvasAnnotation extends Annotation {
  _deleteButtonPosition?: Coordinate;
  _displayCoordinates?: Coordinate[];
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
  disabled = false, // Default to not disabled
  availableLabels,
  onLabelChange
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

  // Add constants for label and delete button size
  const LABEL_HEIGHT = 16;
  const BASE_DELETE_BTN_SIZE = 20; // Fixed size in pixels

  // Add cursor style and hovered annotation state
  const [cursorStyle, setCursorStyle] = useState<'crosshair' | 'pointer' | 'nwse-resize' | 'nesw-resize' | 'move'>('crosshair');
  const [hoveredAnnotationId, setHoveredAnnotationId] = useState<string | null>(null);
  const [resizingAnnotation, setResizingAnnotation] = useState<{
    id: string;
    handle: 'nw' | 'ne' | 'sw' | 'se';
    startCoords: { x: number; y: number };
  } | null>(null);
  const [hoveredResizeHandle, setHoveredResizeHandle] = useState<{
    id: string;
    handle: 'nw' | 'ne' | 'sw' | 'se';
  } | null>(null);
  const [movingAnnotation, setMovingAnnotation] = useState<{
    id: string;
    startCoords: { x: number; y: number };
    originalCoords: Coordinate[];
  } | null>(null);
  const [showLabelPopup, setShowLabelPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [tempAnnotation, setTempAnnotation] = useState<Annotation | null>(null);

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
      
      if (process.env.NODE_ENV !== 'production') {
        console.log('Scaling target annotations:', {
          original: targetAnnotations,
          scaled,
          canvasSize,
          originalDimensions: { originalWidth, originalHeight }
        });
      }
    } else {
      setScaledTargetAnnotations([]);
    }
  }, [targetAnnotations, canvasSize, originalWidth, originalHeight]);

  // Load the image - only when imageUrl changes, not on every render
  useEffect(() => {
    // Only reload the image if the URL has actually changed
    if (imageUrl === prevImageUrlRef.current && isImageLoaded) {
      console.log("Same image URL, skipping reload:", imageUrl);
      return;
    }
    
    console.log("Loading new image:", imageUrl);
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
      
      // Calculate scale to fit the image fully inside the container (object-fit: contain)
      const scaleX = containerWidth / img.width;
      const scaleY = containerHeight / img.height;
      const newScale = Math.min(scaleX, scaleY); // Use min to ensure full image is visible
      
      // Calculate new dimensions to fit container
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
      const newScale = Math.min(scaleX, scaleY); // Use min to ensure full image is visible
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
      console.log('Drawing ground truth annotations:', scaledTargetAnnotations.length);
      scaledTargetAnnotations.forEach(target => {
        drawAnnotation(ctx, target, true);
      });
    }
  };

  // Utility to normalize rectangle coordinates
  const getNormalizedRect = (start, end) => {
    const left = Math.min(start.x, end.x);
    const right = Math.max(start.x, end.x);
    const top = Math.min(start.y, end.y);
    const bottom = Math.max(start.y, end.y);
    return { left, right, top, bottom };
  };

  // Add function to get resize handle positions
  const getResizeHandlePositions = (annotation: Annotation) => {
    if (!annotation._displayCoordinates || annotation._displayCoordinates.length < 2) return null;
    const [start, end] = annotation._displayCoordinates;
    const { left, right, top, bottom } = getNormalizedRect(start, end);
    return {
      nw: { x: left, y: top },
      ne: { x: right, y: top },
      sw: { x: left, y: bottom },
      se: { x: right, y: bottom }
    };
  };

  // Add function to check if point is in resize handle
  const isPointInResizeHandle = (point: { x: number; y: number }, handlePos: { x: number; y: number }) => {
    const handleSize = 8;
    return (
      point.x >= handlePos.x - handleSize &&
      point.x <= handlePos.x + handleSize &&
      point.y >= handlePos.y - handleSize &&
      point.y <= handlePos.y + handleSize
    );
  };

  // Add function to check if a point is inside the delete button
  const isPointInDeleteButton = (point: { x: number; y: number }, buttonPos: { x: number; y: number }) => {
    const buttonSize = BASE_DELETE_BTN_SIZE;
    return (
      point.x >= buttonPos.x - buttonSize / 2 &&
      point.x <= buttonPos.x + buttonSize / 2 &&
      point.y >= buttonPos.y - buttonSize / 2 &&
      point.y <= buttonPos.y + buttonSize / 2
    );
  };

  // Update getDeleteButtonPosition to position the button at the corner
  function getDeleteButtonPosition(displayCoords) {
    if (!displayCoords || displayCoords.length < 2) return undefined;
    const [start, end] = displayCoords;
    const { right, top } = getNormalizedRect(start, end);
    // Position at the top-right corner of the box
    return { 
      x: right, 
      y: top 
    };
  }

  // Update drawAnnotation to use normalized rect and overlay delete button
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
    // Draw resize handles if it's a user annotation (not target) and not being drawn
    if (!isTarget && (annotation as Annotation).isComplete && !isDrawing) {
      const handlePositions = getResizeHandlePositions(annotation as Annotation);
      if (handlePositions) {
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        for (const [handle, pos] of Object.entries(handlePositions)) {
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
      }
    }
  };

  // Update handlePointerDown to handle delete, resize, move, and draw
  const handlePointerDown = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (movingAnnotation || resizingAnnotation) return;
    let offsetX: number, offsetY: number;
    if ('touches' in e) {
      const touch = e.touches[0];
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      offsetX = touch.clientX - rect.left;
      offsetY = touch.clientY - rect.top;
    } else {
      const { offsetX: mouseX, offsetY: mouseY } = getCanvasCoordinates(e);
      offsetX = mouseX;
      offsetY = mouseY;
    }
    const point = { x: offsetX, y: offsetY };

    // Check for label click
    const clickedLabel = annotations.find(annotation => 
      annotation.isComplete && 
      isPointInLabel(point, annotation)
    );

    if (clickedLabel) {
      // Show label popup for the clicked annotation
      setTempAnnotation(clickedLabel);
      
      // Position the popup near the label
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!containerRect) return;

      // Calculate popup position
      const [start, end] = (clickedLabel as any)._displayCoordinates;
      const { left, right, top } = getNormalizedRect(start, end);
      
      let popupX = left;
      let popupY = top - 5;

      // Adjust X position if popup would be clipped
      const POPUP_WIDTH = 200;
      if (popupX + POPUP_WIDTH/2 > containerRect.width) {
        popupX = containerRect.width - POPUP_WIDTH/2;
      }
      if (popupX - POPUP_WIDTH/2 < 0) {
        popupX = POPUP_WIDTH/2;
      }

      // Adjust Y position if popup would be clipped
      const POPUP_HEIGHT = 300;
      if (popupY - POPUP_HEIGHT < 0) {
        popupY = top + POPUP_HEIGHT/2;
      }

      setPopupPosition({
        x: popupX,
        y: popupY
      });
      setShowLabelPopup(true);
      return;
    }

    // Check for delete button
    const clickedDelete = annotations.find(annotation => 
      annotation.isComplete && 
      (annotation as any)._deleteButtonPosition && 
      isPointInDeleteButton(point, (annotation as any)._deleteButtonPosition)
    );
    if (clickedDelete) {
      const updatedAnnotations = annotations.filter(a => a.id !== clickedDelete.id);
      onAnnotationUpdate(updatedAnnotations);
      return;
    }

    // Check for resize handle
    for (const annotation of annotations) {
      if (!annotation.isComplete) continue;
      const handlePositions = getResizeHandlePositions(annotation);
      if (!handlePositions) continue;
      for (const [handle, pos] of Object.entries(handlePositions)) {
        if (isPointInResizeHandle(point, pos)) {
          handleResizeStart(e, annotation.id, handle as 'nw' | 'ne' | 'sw' | 'se');
          return;
        }
      }
    }
    // Check for box center (for moving)
    const centerAnnotation = annotations.find(annotation => isPointInBoxCenter(point, annotation));
    if (centerAnnotation) {
      setMovingAnnotation({
        id: centerAnnotation.id,
        startCoords: point,
        originalCoords: centerAnnotation._displayCoordinates || centerAnnotation.coordinates
      });
      return;
    }
    // If we're not interacting with an existing annotation, start drawing
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

  // Update handleMouseMove to set cursorStyle for resize, move, and default
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { offsetX, offsetY } = getCanvasCoordinates(e);
    const point = { x: offsetX, y: offsetY };

    // Check if mouse is over any label
    const hoveredLabel = annotations.find(annotation => 
      annotation.isComplete && 
      isPointInLabel(point, annotation)
    );
    if (hoveredLabel) {
      setCursorStyle('pointer');
      return;
    }

    // Check if mouse is over any delete button
    const hoveredAnnotation = annotations.find(annotation => 
      annotation.isComplete && 
      (annotation as any)._deleteButtonPosition && 
      isPointInDeleteButton(point, (annotation as any)._deleteButtonPosition)
    );
    if (hoveredAnnotation) {
      setHoveredAnnotationId(hoveredAnnotation.id);
      setCursorStyle('pointer');
      return;
    }

    // Check if mouse is over any resize handle
    let foundResizeHandle = false;
    for (const annotation of annotations) {
      if (!annotation.isComplete) continue;
      const handlePositions = getResizeHandlePositions(annotation);
      if (!handlePositions) continue;
      for (const [handle, pos] of Object.entries(handlePositions)) {
        if (isPointInResizeHandle(point, pos)) {
          setHoveredResizeHandle({ id: annotation.id, handle: handle as 'nw' | 'ne' | 'sw' | 'se' });
          // Set appropriate cursor based on handle position
          switch (handle) {
            case 'nw':
            case 'se':
              setCursorStyle('nwse-resize');
              break;
            case 'ne':
            case 'sw':
              setCursorStyle('nesw-resize');
              break;
          }
          foundResizeHandle = true;
          break;
        }
      }
      if (foundResizeHandle) break;
    }

    // Check if mouse is over any box
    if (!foundResizeHandle) {
      const boxAnnotation = annotations.find(annotation => isPointInBoxCenter(point, annotation));
      if (boxAnnotation) {
        setCursorStyle('move');
        return;
      }
    }
    
    setHoveredResizeHandle(null);
    setCursorStyle('crosshair');
  };

  // Combined function to handle both mouse and touch move events
  const handlePointerMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (movingAnnotation) {
      if ('touches' in e) {
        e.preventDefault();
      }
      let offsetX: number, offsetY: number;
      if ('touches' in e) {
        const touch = e.touches[0];
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        offsetX = touch.clientX - rect.left;
        offsetY = touch.clientY - rect.top;
      } else {
        const { offsetX: mouseX, offsetY: mouseY } = getCanvasCoordinates(e);
        offsetX = mouseX;
        offsetY = mouseY;
      }
      const annotation = annotations.find(a => a.id === movingAnnotation.id);
      if (!annotation || !(annotation as any)._displayCoordinates) return;
      const dx = offsetX - movingAnnotation.startCoords.x;
      const dy = offsetY - movingAnnotation.startCoords.y;
      const newCoords = movingAnnotation.originalCoords.map(coord => ({
        x: coord.x + dx,
        y: coord.y + dy
      }));
      const updatedAnnotation = {
        ...annotation,
        _displayCoordinates: newCoords,
        coordinates: scaleToScoring(newCoords),
        _deleteButtonPosition: getDeleteButtonPosition(newCoords)
      };
      const updatedAnnotations = annotations.map(a => 
        a.id === annotation.id ? updatedAnnotation : a
      );
      onAnnotationUpdate(updatedAnnotations);
      redrawCanvas();
      return;
    }
    if (resizingAnnotation) {
      if ('touches' in e) {
        e.preventDefault();
      }
      let offsetX: number, offsetY: number;
      if ('touches' in e) {
        const touch = e.touches[0];
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        offsetX = touch.clientX - rect.left;
        offsetY = touch.clientY - rect.top;
      } else {
        const { offsetX: mouseX, offsetY: mouseY } = getCanvasCoordinates(e);
        offsetX = mouseX;
        offsetY = mouseY;
      }
      const annotation = annotations.find(a => a.id === resizingAnnotation.id);
      if (!annotation || !(annotation as any)._displayCoordinates) return;
      const [start, end] = (annotation as any)._displayCoordinates;
      const newCoords = [...(annotation as any)._displayCoordinates];
      switch (resizingAnnotation.handle) {
        case 'nw':
          newCoords[0] = { x: offsetX, y: offsetY };
          break;
        case 'ne':
          newCoords[0] = { x: start.x, y: offsetY };
          newCoords[1] = { x: offsetX, y: end.y };
          break;
        case 'sw':
          newCoords[0] = { x: offsetX, y: start.y };
          newCoords[1] = { x: end.x, y: offsetY };
          break;
        case 'se':
          newCoords[1] = { x: offsetX, y: offsetY };
          break;
      }
      const updatedAnnotation = {
        ...annotation,
        _displayCoordinates: newCoords,
        coordinates: scaleToScoring(newCoords),
        _deleteButtonPosition: getDeleteButtonPosition(newCoords)
      };
      const updatedAnnotations = annotations.map(a => 
        a.id === annotation.id ? updatedAnnotation : a
      );
      onAnnotationUpdate(updatedAnnotations);
      redrawCanvas();
      return;
    }
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
      
      // Log touch move for debugging
      console.log('Touch move:', { x: offsetX, y: offsetY });
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

  // Update handlePointerUp to remove label popup
  const handlePointerUp = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (movingAnnotation) {
      setMovingAnnotation(null);
      return;
    }
    if (resizingAnnotation) {
      setResizingAnnotation(null);
      return;
    }
    if (!isDrawing || !currentAnnotation || !touchStartRef.current) return;
    e.preventDefault();
    let endX: number, endY: number;
    if ('changedTouches' in e) {
      const touch = e.changedTouches[0];
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      endX = touch.clientX - rect.left;
      endY = touch.clientY - rect.top;
    } else {
      const { offsetX: mouseX, offsetY: mouseY } = getCanvasCoordinates(e);
      endX = mouseX;
      endY = mouseY;
    }
    // Calculate the distance moved
    const dx = endX - touchStartRef.current.x;
    const dy = endY - touchStartRef.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const MIN_DRAG_DISTANCE = 10;
    if (distance < MIN_DRAG_DISTANCE) {
      setIsDrawing(false);
      setCurrentAnnotation(null);
      touchStartRef.current = null;
      return;
    }

    // Complete the annotation without showing popup
    const updatedAnnotation = { ...currentAnnotation, isComplete: true };
    const displayCoords = updatedAnnotation.coordinates.length === 2 ? 
      updatedAnnotation.coordinates : 
      [updatedAnnotation.coordinates[0], { x: endX, y: endY }];
    
    const finalAnnotation = {
      ...updatedAnnotation,
      coordinates: displayCoords,
      _displayCoordinates: displayCoords,
      _deleteButtonPosition: getDeleteButtonPosition(displayCoords)
    };

    // Scale the annotation to original image coordinates for proper scoring
    const scoringCoordinates = scaleToScoring(finalAnnotation._displayCoordinates || finalAnnotation.coordinates);
    const scoringAnnotation = {
      ...finalAnnotation,
      coordinates: scoringCoordinates
    };
    
    onAnnotationComplete(scoringAnnotation);
    
    setIsDrawing(false);
    setCurrentAnnotation(null);
    touchStartRef.current = null;
  };

  // Add function to check if a point is inside a label
  const isPointInLabel = (point: { x: number; y: number }, annotation: Annotation) => {
    if (!annotation.isComplete || !(annotation as any)._displayCoordinates || (annotation as any)._displayCoordinates.length < 2) return false;
    const [start, end] = (annotation as any)._displayCoordinates;
    const { left, right, top, bottom } = getNormalizedRect(start, end);
    
    // Calculate label position
    const labelX = left;
    const labelY = top - 5;
    const labelWidth = 100; // Approximate width of label
    const labelHeight = LABEL_HEIGHT;
    
    // Check if point is within label bounds
    return point.x >= labelX - 3 && 
           point.x <= labelX + labelWidth + 3 && 
           point.y >= labelY - 12 && 
           point.y <= labelY + labelHeight - 12;
  };

  // Add handleLabelSelect function
  const handleLabelSelect = (label: string) => {
    if (!tempAnnotation) return;
    
    // Scale the annotation to original image coordinates for proper scoring
    const scoringCoordinates = scaleToScoring(tempAnnotation._displayCoordinates || tempAnnotation.coordinates);
    const scoringAnnotation = {
      ...tempAnnotation,
      label,
      color: labelColors[label] || annotationColors.rectangle,
      coordinates: scoringCoordinates
    };
    
    onAnnotationComplete(scoringAnnotation);
    onLabelChange(label); // Update the current label in parent
    setShowLabelPopup(false);
    setTempAnnotation(null);
  };

  // Handle pointer cancel/leave events for touch devices
  const handlePointerCancel = () => {
    if (isDrawing) {
      setIsDrawing(false);
      setCurrentAnnotation(null);
      touchStartRef.current = null;
      console.log('Touch cancelled');
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

  // Redraw canvas when annotations change
  useEffect(() => {
    if (isImageLoaded) {
      redrawCanvas();
    }
  }, [annotations, currentAnnotation, isImageLoaded, scaledTargetAnnotations, showGroundTruth]);

  // Add isPointInBoxCenter function
  const isPointInBoxCenter = (point: { x: number; y: number }, annotation: Annotation) => {
    if (!annotation.isComplete || !(annotation as any)._displayCoordinates || (annotation as any)._displayCoordinates.length < 2) return false;
    const [start, end] = (annotation as any)._displayCoordinates;
    const left = Math.min(start.x, end.x);
    const right = Math.max(start.x, end.x);
    const top = Math.min(start.y, end.y);
    const bottom = Math.max(start.y, end.y);
    return point.x >= left && point.x <= right && point.y >= top && point.y <= bottom;
  };

  // Add handleResizeStart function
  const handleResizeStart = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>, annotationId: string, handle: 'nw' | 'ne' | 'sw' | 'se') => {
    e.preventDefault();
    let offsetX: number, offsetY: number;
    if ('touches' in e) {
      const touch = e.touches[0];
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      offsetX = touch.clientX - rect.left;
      offsetY = touch.clientY - rect.top;
    } else {
      const { offsetX: mouseX, offsetY: mouseY } = getCanvasCoordinates(e);
      offsetX = mouseX;
      offsetY = mouseY;
    }
    setResizingAnnotation({
      id: annotationId,
      handle,
      startCoords: { x: offsetX, y: offsetY }
    });
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
        className={`${disabled ? 'cursor-default' : 'cursor-crosshair'} touch-canvas ${isAndroidTablet ? 'android-tablet-canvas' : ''}`}
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
            <div className="w-4 h-4 bg-ocean-medium rounded-full mr-2"></div>
            Loading image...
          </div>
        </div>
      )}

      {/* Label Selection Popup */}
      {showLabelPopup && tempAnnotation && (
        <div 
          className="absolute z-50 bg-white rounded-lg shadow-lg p-2 border border-gray-200"
          style={{
            left: `${popupPosition.x}px`,
            top: `${popupPosition.y}px`,
            transform: 'translate(-50%, -100%)',
            marginTop: '-8px',
            maxWidth: '200px',
            maxHeight: '300px',
            overflowY: 'auto'
          }}
        >
          <div className="flex flex-col gap-1">
            {availableLabels.map((label) => (
              <Button
                key={label}
                variant="outline"
                size="sm"
                onClick={() => handleLabelSelect(label)}
                className="text-xs whitespace-nowrap"
                style={{
                  borderColor: labelColors[label],
                  color: labelColors[label]
                }}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Add overlay delete button rendering */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2 }}>
        {annotations.map(annotation => {
          // Always use up-to-date display coordinates for delete button position
          const displayCoords = annotation._displayCoordinates || scaleToDisplay(annotation.coordinates);
          const delBtn = getDeleteButtonPosition(displayCoords);
          if (!delBtn) return null;
          const { x, y } = delBtn;
          const isHovered = hoveredAnnotationId === annotation.id;
          return (
            <button
              key={`delete-${annotation.id}`}
              className={`absolute bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 pointer-events-auto border border-gray-300 cursor-pointer z-50 ${isHovered ? 'scale-110 bg-red-50 ring-2 ring-red-200' : 'hover:bg-red-50'}`}
              style={{
                left: `${x}px`,
                top: `${y}px`,
                transform: 'translate(-50%, -50%)',
                width: `${BASE_DELETE_BTN_SIZE}px`,
                height: `${BASE_DELETE_BTN_SIZE}px`,
                position: 'absolute',
                zIndex: 50
              }}
              onClick={(e) => {
                e.stopPropagation();
                const updatedAnnotations = annotations.filter(a => a.id !== annotation.id);
                onAnnotationUpdate(updatedAnnotations);
              }}
              aria-label="Delete annotation"
            >
              <X className="w-4 h-4 text-red-600" />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Canvas;
