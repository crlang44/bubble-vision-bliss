import React, { useEffect, useState } from 'react';
import { AlertCircle, Clock } from 'lucide-react';
import { Progress } from "@/components/ui/progress";

interface TimerProps {
  duration: number; // in seconds
  onTimeUp: () => void;
  isRunning: boolean;
  onTimerUpdate?: (timeLeft: number) => void;
  label?: string; // Optional label for timer
}

const Timer: React.FC<TimerProps> = ({ duration, onTimeUp, isRunning, onTimerUpdate, label = "Time Remaining:" }) => {
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
      setIntervalId(null);
    }
    
    // Only start if isRunning is true
    if (!isRunning) {
      return;
    }
    
    // Create a new interval
    const id = window.setInterval(() => {
      setTimeLeft(prevTime => {
        const newTime = prevTime <= 1 ? 0 : prevTime - 1;
    
        // Add a warning when less than 30% remain
        if (newTime <= duration * 0.3 && !isWarning) {
          setIsWarning(true);
        }
        
        // Notify parent component about time update (for time bonus calculation)
        if (onTimerUpdate && isRunning) {
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
      if (id) {
        clearInterval(id);
      }
    };
  }, [isRunning, onTimeUp, isWarning, onTimerUpdate, duration]);
  
  // Format time as seconds only
  const formatTime = (seconds: number): string => `${seconds} sec${seconds !== 1 ? 's' : ''}`;
  
  // Calculate percentage for progress bar
  const timePercentage = (timeLeft / duration) * 100;
  
  // Determine the color based on the time percentage
  const getProgressColor = () => {
    if (timePercentage > 50) return "bg-green-500";
    if (timePercentage > 25) return "bg-yellow-500";
    return "bg-red-500";
  };
  
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Clock className="text-ocean-dark h-5 w-5" />
          <span className="font-semibold">{label}</span>
        </div>
        <div className={`text-xl font-bold ${isWarning ? 'text-red-500 animate-pulse' : 'text-ocean-dark'}`}>
          {formatTime(timeLeft)}
        </div>
      </div>
      <Progress 
        value={timePercentage} 
        className="h-2 bg-gray-200"
        indicatorClassName={`${getProgressColor()} transition-all duration-1000 ease-linear`}
      />
    </div>
  );
};

export default Timer;
