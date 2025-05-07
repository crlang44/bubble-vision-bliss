
import React, { useEffect, useState } from 'react';
import { AlertCircle, Clock } from 'lucide-react';
import { Progress } from "@/components/ui/progress";

interface TimerProps {
  duration: number; // in seconds
  onTimeUp: () => void;
  isRunning: boolean;
  onTimerUpdate?: (timeLeft: number) => void;
}

const Timer: React.FC<TimerProps> = ({ duration, onTimeUp, isRunning, onTimerUpdate }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isWarning, setIsWarning] = useState(false);
  const [intervalId, setIntervalId] = useState<number | null>(null);
  
  // Reset timer when duration changes
  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);
  
  // Set up the timer effect
  useEffect(() => {
    // Clear any existing interval
    if (intervalId) {
      clearInterval(intervalId);
    }
    
    // Only stop if isRunning is explicitly set to false
    if (!isRunning) return;
    
    // Create a new interval
    const id = window.setInterval(() => {
      setTimeLeft(prevTime => {
        const newTime = prevTime <= 1 ? 0 : prevTime - 1;
        
        // Add a warning when less than 30 seconds remain
        if (newTime <= 30 && !isWarning) {
          setIsWarning(true);
        }
        
        // Notify parent component about time update (for time bonus calculation)
        if (onTimerUpdate) {
          onTimerUpdate(newTime);
        }
        
        if (newTime <= 0) {
          clearInterval(id);
          onTimeUp();
          return 0;
        }
        return newTime;
      });
    }, 1000);
    
    // Store the interval ID
    setIntervalId(id);
    
    // Clean up on unmount or when dependencies change
    return () => {
      if (id) clearInterval(id);
    };
  }, [isRunning, onTimeUp, isWarning, onTimerUpdate, duration]);
  
  // Format time as minutes:seconds
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Calculate percentage for progress bar
  const timePercentage = (timeLeft / duration) * 100;
  
  // Determine the color based on the time percentage
  const getProgressColor = () => {
    if (timePercentage > 50) return "bg-ocean-medium";
    if (timePercentage > 25) return "bg-coral";
    return "bg-ocean-dark";
  };
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700 flex items-center">
          <Clock className="w-4 h-4 mr-1" />
          Time Left
        </span>
        <span className={`text-sm font-medium ${isWarning ? 'text-red-500 animate-pulse' : 'text-gray-700'} flex items-center`}>
          {isWarning && <AlertCircle className="w-4 h-4 text-red-500 mr-1" />}
          {formatTime(timeLeft)}
        </span>
      </div>
      <Progress 
        value={timePercentage} 
        className="h-2 bg-ocean-light" 
        indicatorClassName={getProgressColor()} 
      />
    </div>
  );
};

export default Timer;
