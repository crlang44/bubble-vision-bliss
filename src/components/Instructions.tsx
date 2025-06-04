import React from 'react';
import { Button } from './ui/button';
import { X, Target, Timer, Trophy, Sparkles, MousePointer, Box } from 'lucide-react';
import { useIsTouch } from '../hooks/use-mobile';

interface InstructionsProps {
  onClose: () => void;
}

const Instructions: React.FC<InstructionsProps> = ({ onClose }) => {
  const isTouch = useIsTouch();
  
  return (
    <>
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          @keyframes twinkle {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes bounce-slow {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
          }
          @keyframes pulse-slow {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          @keyframes slide-up {
            from { 
              opacity: 0;
              transform: translateY(20px);
            }
            to { 
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes slide-down {
            from { 
              opacity: 0;
              transform: translateY(-20px);
            }
            to { 
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-float {
            animation: float 3s ease-in-out infinite;
          }
          .animate-twinkle {
            animation: twinkle 2s ease-in-out infinite;
          }
          .animate-spin-slow {
            animation: spin-slow 8s linear infinite;
          }
          .animate-bounce-slow {
            animation: bounce-slow 2s ease-in-out infinite;
          }
          .animate-pulse-slow {
            animation: pulse-slow 2s ease-in-out infinite;
          }
          .animate-slide-up {
            animation: slide-up 0.5s ease-out forwards;
          }
          .animate-slide-down {
            animation: slide-down 0.5s ease-out forwards;
          }
          .animate-fade-in {
            animation: fade-in 0.5s ease-out forwards;
          }
        `}
      </style>
      <div className={`bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto ${isTouch ? 'touch-device' : ''} animate-fade-in`}>
        <div className="flex justify-between items-center mb-6 animate-slide-down">
          <h2 className="text-2xl font-bold text-ocean-dark">Let's Play! 🐋</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-10 w-10 hover:scale-110 transition-transform">
            <X className="h-6 w-6" />
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Step 1: Find & Draw */}
          <div className="bg-blue-50 rounded-xl p-4 flex flex-col items-center text-center animate-slide-up hover:scale-105 transition-all duration-300 hover:shadow-lg">
            <div className="bg-blue-100 p-3 rounded-full mb-3 animate-bounce-slow">
              <MousePointer className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-blue-700 mb-2">1. Find & Draw</h3>
            <p className="text-blue-600 text-sm">Look for ocean creatures and draw boxes around them!</p>
          </div>

          {/* Step 2: Choose Type */}
          <div className="bg-purple-50 rounded-xl p-4 flex flex-col items-center text-center animate-slide-up [animation-delay:100ms] hover:scale-105 transition-all duration-300 hover:shadow-lg">
            <div className="bg-purple-100 p-3 rounded-full mb-3 animate-pulse">
              <Box className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-purple-700 mb-2">2. Choose Type</h3>
            <p className="text-purple-600 text-sm">Pick what you found: Shark, Kelp, and Others!</p>
          </div>

          {/* Step 3: Be Quick */}
          <div className="bg-green-50 rounded-xl p-4 flex flex-col items-center text-center animate-slide-up [animation-delay:200ms] hover:scale-105 transition-all duration-300 hover:shadow-lg">
            <div className="bg-green-100 p-3 rounded-full mb-3 animate-spin-slow">
              <Timer className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-green-700 mb-2">3. Be Quick!</h3>
            <p className="text-green-600 text-sm">Find everything before time runs out!</p>
          </div>

          {/* Step 4: Score Points */}
          <div className="bg-yellow-50 rounded-xl p-4 flex flex-col items-center text-center animate-slide-up [animation-delay:300ms] hover:scale-105 transition-all duration-300 hover:shadow-lg">
            <div className="bg-yellow-100 p-3 rounded-full mb-3 animate-float">
              <Trophy className="h-8 w-8 text-yellow-600" />
            </div>
            <h3 className="text-lg font-semibold text-yellow-700 mb-2">4. Score Points!</h3>
            <p className="text-yellow-600 text-sm">Get points for finding creatures and being fast!</p>
          </div>
        </div>

        {/* Pro Tips */}
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 animate-slide-up [animation-delay:400ms] hover:shadow-lg transition-all duration-300">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-purple-500 animate-twinkle" />
            <h3 className="text-lg font-semibold text-purple-700">Pro Tips!</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center gap-2 hover:scale-105 transition-transform">
              <Target className="h-4 w-4 text-purple-500 animate-pulse" />
              <p className="text-sm text-purple-600">Draw tight boxes for more points!</p>
            </div>
            <div className="flex items-center gap-2 hover:scale-105 transition-transform">
              <Timer className="h-4 w-4 text-purple-500 animate-pulse" />
              <p className="text-sm text-purple-600">Faster = More bonus points!</p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center mt-8 animate-slide-up [animation-delay:500ms]">
          <Button 
            onClick={onClose} 
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white h-12 px-8 text-lg font-semibold rounded-xl shadow-lg hover:scale-105 transition-all duration-300 animate-pulse-slow"
          >
            Let's Go! 🚀
          </Button>
        </div>
      </div>
    </>
  );
};

export default Instructions;
