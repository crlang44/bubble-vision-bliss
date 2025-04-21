
import React from 'react';
import { Annotation, TargetAnnotation, calculateScore } from '../utils/annotationUtils';
import { Trophy, Target, Clock } from 'lucide-react';

interface ScoreBoardProps {
  userAnnotations: Annotation[];
  targetAnnotations: TargetAnnotation[];
  timeBonus: number;
  isComplete: boolean;
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({ 
  userAnnotations, 
  targetAnnotations, 
  timeBonus, 
  isComplete 
}) => {
  // Calculate scores for each annotation
  const annotationScores = targetAnnotations.map(target => {
    const matchingAnnotation = userAnnotations.find(
      user => user.label === target.label && user.type === target.type
    );
    
    if (!matchingAnnotation) {
      return {
        label: target.label,
        score: 0,
        found: false
      };
    }
    
    const score = calculateScore(matchingAnnotation, target);
    return {
      label: target.label,
      score,
      found: true
    };
  });
  
  // Calculate total score
  const totalAnnotationScore = annotationScores.reduce((sum, item) => sum + item.score, 0);
  const averageScore = targetAnnotations.length ? totalAnnotationScore / targetAnnotations.length : 0;
  const finalScore = Math.round(averageScore + timeBonus);
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-ocean-dark">Your Score</h3>
        <div className="flex items-center gap-1">
          <Trophy className="text-yellow-500 w-5 h-5" />
          <span className="text-2xl font-bold">{finalScore}</span>
          <span className="text-gray-500">/150</span>
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
          <span className="font-medium">{timeBonus} pts</span>
        </div>
      </div>
      
      <div className="bg-gray-50 p-3 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="font-medium">Total Score:</span>
          <span className="text-xl font-bold text-ocean-dark">{finalScore}</span>
        </div>
        
        {finalScore >= 120 && (
          <div className="text-center mt-3 text-green-600 font-medium">
            Excellent work! You're an annotation expert!
          </div>
        )}
        {finalScore >= 80 && finalScore < 120 && (
          <div className="text-center mt-3 text-blue-600 font-medium">
            Good job! Keep practicing to improve!
          </div>
        )}
        {finalScore < 80 && (
          <div className="text-center mt-3 text-amber-600 font-medium">
            Nice try! Practice makes perfect!
          </div>
        )}
      </div>
    </div>
  );
};

export default ScoreBoard;
