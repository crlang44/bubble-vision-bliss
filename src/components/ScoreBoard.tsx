
import React, { useEffect } from 'react';
import { Annotation, TargetAnnotation, calculateScore } from '../utils/annotationUtils';
import { Trophy, Target, Clock, BarChart } from 'lucide-react';

interface ScoreBoardProps {
  userAnnotations: Annotation[];
  targetAnnotations: TargetAnnotation[];
  timeBonus: number;
  isComplete: boolean;
  cumulativeScore?: number;
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({ 
  userAnnotations, 
  targetAnnotations, 
  timeBonus, 
  isComplete,
  cumulativeScore = 0
}) => {
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
      found: bestMatch.score > 0
    };
  });
  
  // Calculate total score - normalized to 100 points regardless of annotation count
  const totalAnnotationScore = annotationScores.reduce((sum, item) => sum + item.score, 0);
  
  // Normalize to 100 points maximum for annotations
  const normalizedAnnotationScore = targetAnnotations.length 
    ? Math.round((totalAnnotationScore / targetAnnotations.length))
    : 0;
  
  // Final score combines normalized annotation score (0-100) with time bonus (0-25)
  const finalScore = normalizedAnnotationScore + timeBonus;
  
  // Cumulative score including the current round's score
  const totalCumulativeScore = cumulativeScore + finalScore;
  
  console.log('Normalized annotation score:', normalizedAnnotationScore, 'Time bonus:', timeBonus);
  console.log('Final calculated score:', finalScore, 'Cumulative score:', totalCumulativeScore);
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-ocean-dark">Your Score</h3>
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
        
        <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-100">
          <span className="text-sm font-medium">Normalized Score:</span>
          <span className="font-medium">{normalizedAnnotationScore} / 100</span>
        </div>
        
        <div className="h-px bg-gray-200 my-2"></div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-ocean-medium" />
            <span className="text-sm">Time Bonus</span>
          </div>
          <span className="font-medium">{timeBonus} pts</span>
        </div>
      </div>
      
      <div className="bg-gray-50 p-3 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="font-medium">Round Score:</span>
          <span className="text-xl font-bold text-ocean-dark">{finalScore}</span>
        </div>
        
        <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-1">
            <BarChart className="w-4 h-4 text-purple-600" />
            <span className="font-medium">Cumulative Score:</span>
          </div>
          <span className="text-xl font-bold text-purple-700">{totalCumulativeScore}</span>
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
