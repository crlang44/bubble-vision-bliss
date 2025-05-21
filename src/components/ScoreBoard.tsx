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

  // Calculate best score (from localStorage, fallback to 0)
  const bestScore = Number(localStorage.getItem('oceanAnnotationBestScore')) || 0;

  // Calculate overall annotation accuracy (average of annotationScores)
  const accuracy = annotationScores.length
    ? Math.round(annotationScores.reduce((sum, item) => sum + item.score, 0) / annotationScores.length)
    : 0;

  // Feedback message and color/icon
  let feedbackMsg = '';
  let feedbackColor = '';
  let feedbackIcon = null;
  if (finalScore >= 100) {
    feedbackMsg = "Amazing job! You're an annotation expert!";
    feedbackColor = 'text-green-600';
    feedbackIcon = <Award className="w-6 h-6 text-green-500" />;
  } else if (finalScore >= 70) {
    feedbackMsg = 'Good work! Keep practicing to improve!';
    feedbackColor = 'text-blue-600';
    feedbackIcon = <Award className="w-6 h-6 text-blue-500" />;
  } else {
    feedbackMsg = 'Nice try! Practice makes perfect!';
    feedbackColor = 'text-amber-600';
    feedbackIcon = <Award className="w-6 h-6 text-amber-500" />;
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch sm:justify-between divide-y sm:divide-y-0 sm:divide-x divide-gray-200">
        {/* Total Score */}
        <div className="flex-1 flex flex-col items-center justify-center pb-4 sm:pb-0 sm:pr-6">
          <div className="flex items-center gap-2 mb-1">
            <Award className="text-yellow-300 w-6 h-6" />
            <span className="text-ocean-dark font-bold text-lg">Total Score</span>
          </div>
          <span className={`text-3xl font-bold text-ocean-dark ${isAnimating ? 'animate-pulse' : ''}`}>{displayCumulativeScore}</span>
        </div>
        {/* Annotation Accuracy */}
        <div className="flex-1 flex flex-col items-center justify-center py-4 sm:py-0 sm:px-6">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-ocean-medium" />
            <span className="text-gray-700 font-medium">Accuracy</span>
          </div>
          <span className="text-2xl font-bold text-ocean-dark">{accuracy}%</span>
        </div>
        {/* Time Bonus */}
        <div className="flex-1 flex flex-col items-center justify-center py-4 sm:py-0 sm:px-6">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-ocean-medium" />
            <span className="text-gray-700 font-medium">Time Bonus</span>
          </div>
          <span className="text-2xl font-bold text-ocean-dark">+{actualTimeBonus} pts</span>
        </div>
        {/* Feedback Message */}
        <div className="flex-1 flex flex-col items-center justify-center pt-4 sm:pt-0 sm:pl-6">
          <div className={`flex items-center gap-2 mb-1 ${feedbackColor}`}>{feedbackIcon}<span className="font-semibold">{feedbackMsg}</span></div>
        </div>
      </div>
      {/* Annotation breakdown (optional, can be toggled or shown below) */}
      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-600 flex items-center gap-1 mb-2">
          <Target className="w-4 h-4" /> Annotation Breakdown
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {annotationScores.map((item, index) => (
            <div key={index} className="flex justify-between items-center bg-gray-50 rounded px-2 py-1">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${item.found ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm">{item.label}</span>
              </div>
              <span className="font-medium">{item.score}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScoreBoard;
