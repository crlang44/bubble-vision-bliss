import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

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
  
  // Use refs to avoid unnecessary interval recreation
  const timerRef = React.useRef<{
    timerId: number | null;
    duration: number;
    onTimeUp: () => void;
    onTimerUpdate?: (timeLeft: number) => void;
    isWarning: boolean;
  }>({
    timerId: null,
    duration,
    onTimeUp,
    onTimerUpdate,
    isWarning,
  });
  
  // Keep ref values up to date
  useEffect(() => {
    timerRef.current.duration = duration;
    timerRef.current.onTimeUp = onTimeUp;
    timerRef.current.onTimerUpdate = onTimerUpdate;
    timerRef.current.isWarning = isWarning;
  }, [duration, onTimeUp, onTimerUpdate, isWarning]);
  
  // Set up the timer effect - only when isRunning changes
  useEffect(() => {
    // If timer is running and we don't have an interval running
    if (isRunning && !timerRef.current.timerId) {
      console.log('Timer starting');
      
      // Create a new interval
      const id = window.setInterval(() => {
        setTimeLeft(prevTime => {
          const newTime = prevTime <= 1 ? 0 : prevTime - 1;
      
          // Add a warning when less than 30% remain
          if (newTime <= timerRef.current.duration * 0.3 && !timerRef.current.isWarning) {
            setIsWarning(true);
          }
          
          // Notify parent component about time update (for time bonus calculation)
          if (timerRef.current.onTimerUpdate) {
            timerRef.current.onTimerUpdate(newTime);
          }
          
          if (newTime <= 0) {
            // Clear the timer
            if (timerRef.current.timerId) {
              clearInterval(timerRef.current.timerId);
              timerRef.current.timerId = null;
            }
            timerRef.current.onTimeUp();
            return 0;
          }
          return newTime;
        });
      }, 1000);
      
      // Store the interval ID
      timerRef.current.timerId = id;
      setIntervalId(id);
    }
    // If timer is not running but we have an interval
    else if (!isRunning && timerRef.current.timerId) {
      console.log('Timer stopped');
      clearInterval(timerRef.current.timerId);
      timerRef.current.timerId = null;
      setIntervalId(null);
    }
    
    // Clean up on unmount
    return () => {
      if (timerRef.current.timerId) {
        console.log('Cleaning up timer interval');
        clearInterval(timerRef.current.timerId);
        timerRef.current.timerId = null;
      }
    };
  }, [isRunning]);
  
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
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Clock className="text-ocean-dark h-5 w-5" />
          <span className="font-semibold">{label}</span>
        </div>
        <div className={`text-xl font-bold ${isWarning ? 'text-red-500 animate-pulse' : 'text-ocean-dark'}`}>{timeLeft} seconds</div>
      </div>
      <div className="w-full bg-gray-200 h-2 rounded-full mt-2">
        <div
          className={getProgressColor() + " h-2 rounded-full transition-all duration-1000"}
          style={{ width: `${timePercentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default Timer;
