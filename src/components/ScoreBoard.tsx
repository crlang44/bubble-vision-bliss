
import React, { useEffect, useRef, useState } from 'react';
import { Annotation, TargetAnnotation, calculateScore } from '../utils/annotationUtils';
import { Trophy, Target, Clock, Award } from 'lucide-react';

interface ScoreBoardProps {
  userAnnotations: Annotation[];
  targetAnnotations: TargetAnnotation[];
  timeBonus: number;
  isComplete: boolean;
  cumulativeScore: number;
  onScoreChange?: (score: number) => void;
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({ 
  userAnnotations, 
  targetAnnotations, 
  timeBonus, 
  isComplete,
  cumulativeScore = 0,
  onScoreChange
}) => {
  // Use a ref to track if we've already updated the score for this round
  const hasUpdatedScore = useRef(false);
  // Track the animated cumulative score
  const [displayCumulativeScore, setDisplayCumulativeScore] = useState(cumulativeScore);
  // Track if animation is in progress
  const [isAnimating, setIsAnimating] = useState(false);
  // Track the final calculated score to prevent changes after completion
  const [finalCalculatedScore, setFinalCalculatedScore] = useState<number | null>(null);
  // Track the final time bonus
  const [finalTimeBonus, setFinalTimeBonus] = useState<number | null>(null);
  
  // Debug output to see what we're working with
  useEffect(() => {
    console.log('ScoreBoard - User Annotations:', userAnnotations);
    console.log('ScoreBoard - Target Annotations:', targetAnnotations);
  }, [userAnnotations, targetAnnotations]);

  // Calculate scores for each annotation
  const annotationScores = targetAnnotations.map(target => {
    // Find all possible matching annotations with the same label and type
    const possibleMatches = userAnnotations.filter(
      user => user.label === target.label && user.type === target.type
    );
    
    if (possibleMatches.length === 0) {
      console.log(`No matches found for target: ${target.label} (${target.type})`);
      return {
        label: target.label,
        score: 0,
        found: false
      };
    }
    
    // Calculate score for each possible match
    const scoredMatches = possibleMatches.map(match => {
      const score = calculateScore(match, target);
      console.log(`Score for ${match.label} (${match.id}):`, score, 'Match coords:', match.coordinates, 'Target coords:', target.coordinates);
      return {
        annotation: match,
        score
      };
    });
    
    // Choose the match with the highest score
    const bestMatch = scoredMatches.reduce(
      (best, current) => current.score > best.score ? current : best,
      { annotation: possibleMatches[0], score: 0 }
    );
    
    console.log(`Best match for ${target.label}:`, bestMatch.score);
    
    return {
      label: target.label,
      score: bestMatch.score,
      found: bestMatch.score > 1 // Changed from > 0 to > 1 to be consistent with the 1% threshold
    };
  });
  
  // Calculate total score
  const totalAnnotationScore = annotationScores.reduce((sum, item) => sum + item.score, 0);
  
  // Normalize score based on number of annotations (0-100 scale)
  const normalizedScore = targetAnnotations.length 
    ? Math.round(totalAnnotationScore / targetAnnotations.length) 
    : 0;
  
  // Use the final calculated values if they exist, otherwise calculate them
  const actualTimeBonus = finalTimeBonus !== null ? finalTimeBonus : timeBonus;
  const calculatedFinalScore = finalCalculatedScore !== null 
    ? finalCalculatedScore 
    : Math.round(normalizedScore + actualTimeBonus);
  
  // Animation function for cumulative score
  const animateScore = (from, to, duration) => {
    setIsAnimating(true);
    const startTime = performance.now();
    const updateScore = (timestamp) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const currentValue = Math.floor(from + (to - from) * progress);
      setDisplayCumulativeScore(currentValue);
      
      if (progress < 1) {
        requestAnimationFrame(updateScore);
      } else {
        setDisplayCumulativeScore(to);
        setIsAnimating(false);
      }
    };
    
    requestAnimationFrame(updateScore);
  };
  
  // Update parent component with score when complete, but only once
  useEffect(() => {
    if (isComplete && onScoreChange && !hasUpdatedScore.current) {
      // Lock in the final values when the game is complete
      setFinalCalculatedScore(calculatedFinalScore);
      setFinalTimeBonus(timeBonus);
      
      onScoreChange(calculatedFinalScore);
      hasUpdatedScore.current = true;
      
      // Animate the score change
      const newCumulativeScore = cumulativeScore + calculatedFinalScore;
      animateScore(cumulativeScore, newCumulativeScore, 1000); // 1 second animation
      
      console.log('ScoreBoard - Final score locked in:', calculatedFinalScore, 'Final time bonus:', timeBonus);
    }
    
    // Reset the flag when isComplete changes to false
    if (!isComplete) {
      hasUpdatedScore.current = false;
      setFinalCalculatedScore(null);
      setFinalTimeBonus(null);
    }
  }, [isComplete, calculatedFinalScore, onScoreChange, cumulativeScore, timeBonus]);
  
  // Initialize display score on first render
  useEffect(() => {
    setDisplayCumulativeScore(cumulativeScore);
  }, []);
  
  // Use for display
  const finalScore = calculatedFinalScore;
  
  console.log('Final calculated score:', finalScore, 'Normalized annotation score:', normalizedScore, 'Time bonus:', actualTimeBonus);
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-4">
      {/* Prominent cumulative score at the top */}
      <div className="bg-ocean-gradient rounded-lg p-3 mb-4 shadow-inner">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Award className="text-yellow-300 w-6 h-6" />
            <span className="text-white font-bold text-lg">Total Score:</span>
          </div>
          <div className="flex items-center">
            <span className={`text-3xl font-bold text-white ${isAnimating ? 'animate-pulse' : ''}`}>
              {displayCumulativeScore}
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-ocean-dark">Round Score</h3>
        <div className="flex items-center gap-1">
          <Trophy className="text-yellow-500 w-5 h-5" />
          <span className="text-2xl font-bold">{finalScore}</span>
          <span className="text-gray-500">/125</span>
        </div>
      </div>
      
      <div className="space-y-3 mb-4">
        <h4 className="text-sm font-medium text-gray-600 flex items-center gap-1">
          <Target className="w-4 h-4" /> Annotation Accuracy
        </h4>
        
        {annotationScores.map((item, index) => (
          <div key={index} className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${item.found ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm">{item.label}</span>
            </div>
            <span className="font-medium">{item.score}%</span>
          </div>
        ))}
        
        <div className="h-px bg-gray-200 my-2"></div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-ocean-medium" />
            <span className="text-sm">Time Bonus</span>
          </div>
          <span className="font-medium">{actualTimeBonus} pts</span>
        </div>
      </div>
      
      <div className="bg-gray-50 p-3 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="font-medium">Total Round Score:</span>
          <span className="text-xl font-bold text-ocean-dark">{finalScore}</span>
        </div>
        
        {finalScore >= 100 && (
          <div className="text-center mt-3 text-green-600 font-medium">
            Excellent work! You're an annotation expert!
          </div>
        )}
        {finalScore >= 70 && finalScore < 100 && (
          <div className="text-center mt-3 text-blue-600 font-medium">
            Good job! Keep practicing to improve!
          </div>
        )}
        {finalScore < 70 && (
          <div className="text-center mt-3 text-amber-600 font-medium">
            Nice try! Practice makes perfect!
          </div>
        )}
      </div>
    </div>
  );
};

export default ScoreBoard;
