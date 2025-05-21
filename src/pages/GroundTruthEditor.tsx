import React, { useState, useEffect } from 'react';
import Canvas from '../components/Canvas';
import AnnotationTools from '../components/AnnotationTools';
import ImageSelector from '../components/ImageSelector';
import { Annotation, AnnotationType, TargetAnnotation, calculateScore } from '../utils/annotationUtils';
import { oceanImages, OceanImage } from '../data/oceanImages';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Save, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const GroundTruthEditor = () => {
  const [selectedTool, setSelectedTool] = useState<AnnotationType | null>('rectangle');
  const [currentLabel, setCurrentLabel] = useState('Whale');
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedImage, setSelectedImage] = useState<OceanImage | null>(null);
  const [availableLabels, setAvailableLabels] = useState<string[]>(['Whale', 'Fish']);
  const [customLabel, setCustomLabel] = useState('');
  const [showGroundTruth, setShowGroundTruth] = useState(true);
  const [score, setScore] = useState(0);
  
  // Debug logging to help identify issues with annotations
  useEffect(() => {
    if (selectedImage) {
      console.log("Selected image:", selectedImage.title);
      console.log("Target annotations:", selectedImage.targetAnnotations);
    }
  }, [selectedImage]);
  
  useEffect(() => {
    if (oceanImages.length > 0 && !selectedImage) {
      setSelectedImage(oceanImages[0]);
    }
  }, []);
  
  useEffect(() => {
    if (!selectedImage) return;
    
    // Load existing annotations as user annotations for editing
    const existingAnnotations: Annotation[] = selectedImage.targetAnnotations.map(target => ({
      ...target,
      color: getColorForType(target.type),
      isComplete: true
    }));
    
    setAnnotations(existingAnnotations);
    
    // Calculate score based on existing annotations against ground truth
    if (existingAnnotations.length > 0 && selectedImage.targetAnnotations.length > 0) {
      let totalScore = 0;
      existingAnnotations.forEach(annotation => {
        // Find matching target annotation by label
        const matchingTargets = selectedImage.targetAnnotations.filter(
          target => target.label === annotation.label
        );
        
        if (matchingTargets.length > 0) {
          // Find the best score among all possible matches
          const scores = matchingTargets.map(target => calculateScore(annotation, target));
          totalScore += Math.max(...scores);
        }
      });
      
      // Average score
      setScore(Math.round(totalScore / existingAnnotations.length));
    } else {
      setScore(0);
    }
  }, [selectedImage]);
  
  const getColorForType = (type: AnnotationType): string => {
    const colors = {
      rectangle: '#FF719A',
      polygon: '#6E59A5',
      point: '#0EA5E9'
    };
    return colors[type];
  };
  
  const handleSelectTool = (tool: AnnotationType | null) => {
    setSelectedTool(tool);
  };
  
  const handleClearAnnotations = () => {
    setAnnotations([]);
    setScore(0);
    toast('All annotations cleared');
  };
  
  const handleAnnotationComplete = (annotation: Annotation) => {
    const newAnnotations = [...annotations, annotation];
    setAnnotations(newAnnotations);
    toast(`Added ${annotation.label} annotation`);
    
    // Recalculate score
    updateScore(newAnnotations);
  };
  
  const updateScore = (currentAnnotations: Annotation[]) => {
    if (!selectedImage || !selectedImage.targetAnnotations.length) {
      setScore(0);
      return;
    }
    
    let totalScore = 0;
    let annotationsWithScore = 0;
    
    currentAnnotations.forEach(annotation => {
      // Find matching target annotation by label
      const matchingTargets = selectedImage.targetAnnotations.filter(
        target => target.label === annotation.label
      );
      
      if (matchingTargets.length > 0) {
        // Find the best score among all possible matches
        const scores = matchingTargets.map(target => calculateScore(annotation, target));
        totalScore += Math.max(...scores);
        annotationsWithScore++;
      }
    });
    
    // Average score (avoid division by zero)
    setScore(annotationsWithScore ? Math.round(totalScore / annotationsWithScore) : 0);
  };
  
  const handleLabelChange = (label: string) => {
    setCurrentLabel(label);
  };
  
  const handleImageSelect = (image: OceanImage) => {
    if (image.id !== selectedImage?.id) {
      setSelectedImage(image);
    }
  };
  
  const handleAddCustomLabel = () => {
    if (customLabel && !availableLabels.includes(customLabel)) {
      setAvailableLabels([...availableLabels, customLabel]);
      setCurrentLabel(customLabel);
      setCustomLabel('');
      toast(`Added new label: ${customLabel}`);
    }
  };
  
  const handleAnnotationUpdate = (updatedAnnotations: Annotation[]) => {
    setAnnotations(updatedAnnotations);
    updateScore(updatedAnnotations);
  };
  
  const handleSaveGroundTruth = () => {
    if (!selectedImage) return;
    
    const targetAnnotations: TargetAnnotation[] = annotations.map(annotation => ({
      id: annotation.id,
      type: annotation.type,
      coordinates: annotation.coordinates,
      label: annotation.label
    }));
    
    const updatedOceanImages = oceanImages.map(image => {
      if (image.id === selectedImage.id) {
        return {
          ...image,
          targetAnnotations
        };
      }
      return image;
    });
    
    const fileContent = `import { TargetAnnotation } from "../utils/annotationUtils";

export interface OceanImage {
  id: string;
  title: string;
  imagePath: string;
  difficulty: 'easy' | 'medium' | 'hard';
  targetAnnotations: TargetAnnotation[];
  description: string;
}

export const oceanImages: OceanImage[] = ${JSON.stringify(updatedOceanImages, null, 2)}`;
    
    const blob = new Blob([fileContent], { type: 'text/plain' });
    
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = 'oceanImages.ts';
    
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    // Update oceanImages in memory too
    for (let i = 0; i < oceanImages.length; i++) {
      if (oceanImages[i].id === selectedImage.id) {
        oceanImages[i].targetAnnotations = targetAnnotations;
      }
    }
    
    toast.success('Ground truth annotations saved! Download the file and replace src/data/oceanImages.ts');
    
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '9999';
    
    const modalContent = document.createElement('div');
    modalContent.style.backgroundColor = 'white';
    modalContent.style.padding = '20px';
    modalContent.style.borderRadius = '8px';
    modalContent.style.width = '80%';
    modalContent.style.maxWidth = '600px';
    
    const modalTitle = document.createElement('h3');
    modalTitle.textContent = 'Ground Truth Annotations Saved';
    modalTitle.style.marginBottom = '10px';
    
    const modalDescription = document.createElement('p');
    modalDescription.innerHTML = `
      <ol style="margin-left: 20px; list-style-type: decimal;">
        <li>A file named <strong>oceanImages.ts</strong> has been downloaded to your computer.</li>
        <li>Replace the existing file at <strong>src/data/oceanImages.ts</strong> with this downloaded file.</li>
        <li>Restart your development server to see the changes.</li>
      </ol>
    `;
    modalDescription.style.marginBottom = '10px';
    
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.style.marginTop = '10px';
    closeButton.style.padding = '8px 16px';
    closeButton.style.backgroundColor = '#0EA5E9';
    closeButton.style.color = 'white';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '4px';
    closeButton.style.cursor = 'pointer';
    
    closeButton.onclick = () => {
      document.body.removeChild(modal);
    };
    
    modalContent.appendChild(modalTitle);
    modalContent.appendChild(modalDescription);
    modalContent.appendChild(closeButton);
    modal.appendChild(modalContent);
    
    document.body.appendChild(modal);
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-6 px-4">
        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2 text-ocean-dark hover:text-ocean-medium">
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Game</span>
            </Link>
          </div>
          
          <h1 className="text-2xl md:text-3xl font-bold text-center text-ocean-dark">
            Ground Truth Editor
          </h1>
          
          <div></div>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Select Image</CardTitle>
              </CardHeader>
              <CardContent>
                <ImageSelector 
                  images={oceanImages} 
                  onSelectImage={handleImageSelect} 
                  selectedImageId={selectedImage?.id || null}
                />
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-3 space-y-4">
            <Card>
              <CardHeader className="pb-0">
                <CardTitle className="flex justify-between items-center">
                  <span>Draw Ground Truth Annotations</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-normal">Score: {score}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowGroundTruth(!showGroundTruth)}
                      title={showGroundTruth ? "Hide Ground Truth" : "Show Ground Truth"}
                      className="p-1 h-auto"
                    >
                      {showGroundTruth ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-4">
                  Use the tools on the right to draw ground truth annotations. These will be used as the target for players to match.
                </p>
                
                <div className="h-[450px] bg-white rounded-xl shadow-lg overflow-hidden border">
                  {selectedImage ? (
                    <Canvas
                      imageUrl={selectedImage.imagePath}
                      selectedTool={selectedTool}
                      currentLabel={currentLabel}
                      onAnnotationComplete={handleAnnotationComplete}
                      annotations={annotations}
                      onAnnotationUpdate={handleAnnotationUpdate}
                      showGroundTruth={showGroundTruth}
                      targetAnnotations={selectedImage.targetAnnotations}
                      onToggleGroundTruth={() => setShowGroundTruth(!showGroundTruth)}
                      originalWidth={selectedImage.originalWidth}
                      originalHeight={selectedImage.originalHeight}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p>Please select an image</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-end">
              <Button 
                onClick={handleSaveGroundTruth}
                className="bg-ocean-dark hover:bg-ocean-medium flex items-center gap-1"
                disabled={!selectedImage || annotations.length === 0}
              >
                <Save className="h-4 w-4" /> Save Ground Truth
              </Button>
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Annotation Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <AnnotationTools
                  selectedTool={selectedTool}
                  onSelectTool={handleSelectTool}
                  onClearAnnotations={handleClearAnnotations}
                  currentLabel={currentLabel}
                  onLabelChange={handleLabelChange}
                  labels={availableLabels}
                />
                
                <div className="mt-4 space-y-2">
                  <h3 className="text-sm font-medium">Add Custom Label</h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customLabel}
                      onChange={(e) => setCustomLabel(e.target.value)}
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Enter new label"
                    />
                    <Button 
                      onClick={handleAddCustomLabel}
                      disabled={!customLabel}
                      className="bg-ocean-dark hover:bg-ocean-medium"
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2 list-disc pl-4">
                  <li>Select an image from the left panel</li>
                  <li>Choose an annotation tool (rectangle, polygon, or point)</li>
                  <li>Select or create a label for the annotation</li>
                  <li>Draw on the image to create annotations</li>
                  <li>Click "Save Ground Truth" when finished</li>
                  <li>Toggle the eye icon to show/hide ground truth</li>
                </ul>
                <p className="text-sm mt-4 text-gray-500">
                  Your score will automatically update based on how well your annotations match the ground truth.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroundTruthEditor;
