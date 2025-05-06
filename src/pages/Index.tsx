
import React from 'react';
import BubbleBackground from '../components/BubbleBackground';
import Instructions from '../components/Instructions';
import AnnotationTools from '../components/AnnotationTools';
import ScoreBoard from '../components/ScoreBoard';
import ImageSelector from '../components/ImageSelector';
import { calculateScore } from '../utils/annotationUtils';
import GameHeader from '../components/GameHeader';
import GameArea from '../components/GameArea';
import GameCompletionDialog from '../components/GameCompletionDialog';
import { GameProvider, useGameContext } from '../contexts/GameContext';

// Constants
const TIMER_DURATION = 120; // 2 minutes in seconds

const IndexContent = () => {
  const {
    selectedImage,
    annotations,
    gameComplete,
    showGroundTruth,
    isTimerRunning,
    timeBonus,
    currentLabel,
    selectedTool,
    showInstructions,
    cumulativeScore,
    bestScore,
    availableLabels,
    showCompletionDialog,
    isLastImage,
    allImagesAnnotated,
    
    setShowInstructions,
    handleInstructionsClosed,
    handleSelectTool,
    handleClearAnnotations,
    handleLabelChange,
    handleAnnotationComplete,
    handleImageSelect,
    handleTimeUp,
    handleTimerUpdate,
    handleSubmit,
    handleScoreUpdate,
    handleResetCumulativeScore,
    handlePlayAgain,
    handleNewImage,
    handleGoToQuickIDGame,
    toggleGroundTruth,
    setShowCompletionDialog,
    currentImages,
    setAnnotations
  } = useGameContext();
  
  return (
    <div className="min-h-screen bg-ocean-gradient relative">
      <BubbleBackground bubbleCount={30} />
      
      <div className="container mx-auto py-6 px-4 relative z-10">
        <GameHeader 
          cumulativeScore={cumulativeScore}
          bestScore={bestScore}
          onResetScore={handleResetCumulativeScore}
          onShowInstructions={() => setShowInstructions(true)}
        />
        
        {showInstructions && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Instructions onClose={handleInstructionsClosed} />
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-1">
            <ImageSelector 
              images={currentImages} 
              onSelectImage={handleImageSelect} 
              selectedImageId={selectedImage?.id || null}
            />
          </div>
          
          <GameArea 
            selectedImage={selectedImage}
            annotations={annotations}
            gameComplete={gameComplete}
            showGroundTruth={showGroundTruth}
            isTimerRunning={isTimerRunning}
            timeBonus={timeBonus}
            onAnnotationComplete={handleAnnotationComplete}
            onAnnotationsUpdate={setAnnotations}
            onToggleGroundTruth={toggleGroundTruth}
            onTimeUp={handleTimeUp}
            onTimerUpdate={handleTimerUpdate}
            onSubmit={handleSubmit}
            onNewImage={handleNewImage}
            isLastImage={isLastImage}
            allImagesAnnotated={allImagesAnnotated}
            timerDuration={TIMER_DURATION}
          />
          
          <div className="lg:col-span-1">
            {!gameComplete ? (
              <AnnotationTools
                selectedTool={selectedTool}
                onSelectTool={handleSelectTool}
                onClearAnnotations={handleClearAnnotations}
                currentLabel={currentLabel}
                onLabelChange={handleLabelChange}
                labels={availableLabels}
              />
            ) : (
              <div className="space-y-4">
                <ScoreBoard 
                  userAnnotations={annotations}
                  targetAnnotations={selectedImage?.targetAnnotations || []}
                  timeBonus={timeBonus}
                  isComplete={gameComplete}
                  cumulativeScore={cumulativeScore}
                  onScoreChange={handleScoreUpdate}
                />
              </div>
            )}
          </div>
        </div>
        
        <footer className="mt-8 text-center text-white/80 text-sm">
          <p>Ocean Annotation Game - A fun way to learn computer vision annotation techniques</p>
        </footer>
      </div>

      <GameCompletionDialog 
        open={showCompletionDialog}
        onOpenChange={(open) => {
          if (!open && allImagesAnnotated) {
            // If closing the dialog and all images are annotated, reset for a new game
            setAnnotatedImages(new Set());
          }
          setShowCompletionDialog(open);
        }}
        cumulativeScore={cumulativeScore}
        bestScore={bestScore}
        onPlayAgain={handlePlayAgain}
        onGoToQuickIDGame={handleGoToQuickIDGame}
        allImagesAnnotated={allImagesAnnotated}
      />
    </div>
  );
};

const Index = () => {
  return (
    <GameProvider>
      <IndexContent />
    </GameProvider>
  );
};

export default Index;
