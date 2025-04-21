
import React, { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';

interface TimerProps {
  duration: number; // in seconds
  onTimeUp: () => void;
  isRunning: boolean;
}

const Timer: React.FC<TimerProps> = ({ duration, onTimeUp, isRunning }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  
  useEffect(() => {
    // Reset timer when duration changes
    setTimeLeft(duration);
  }, [duration]);
  
  useEffect(() => {
    if (!isRunning) return;
    
    const interval = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(interval);
          onTimeUp();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isRunning, onTimeUp]);
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Calculate percentage for progress bar
  const timePercentage = (timeLeft / duration) * 100;
  
  // Determine color based on time left
  let colorClass = 'bg-green-500';
  if (timePercentage <= 50 && timePercentage > 25) {
    colorClass = 'bg-yellow-500';
  } else if (timePercentage <= 25) {
    colorClass = 'bg-red-500';
  }
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700">Time Left</span>
        <span className="text-sm font-medium text-gray-700 flex items-center">
          {timeLeft <= 10 && <AlertCircle className="w-4 h-4 text-red-500 mr-1 animate-pulse" />}
          {formatTime(timeLeft)}
        </span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full ${colorClass} transition-all duration-500 ease-linear`}
          style={{ width: `${timePercentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default Timer;
