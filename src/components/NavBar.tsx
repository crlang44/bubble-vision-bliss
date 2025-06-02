import React from 'react';
import { Button } from '@/components/ui/button';
import { Trophy, RefreshCcw, Fish } from 'lucide-react';
import { routes } from '../routes';

interface NavBarProps {
  pageType: 'annotation' | 'quickId';
  cumulativeScore?: number;
  bestScore?: number;
  onResetScore?: () => void;
  setShowInstructions: (show: boolean) => void;
}

const NavBar: React.FC<NavBarProps> = ({ 
  pageType, 
  cumulativeScore = 0, 
  bestScore = 0, 
  onResetScore,
  setShowInstructions
}) => {
  const isAnnotationPage = pageType === 'annotation';
  
  // Add console log to debug
  console.log("NavBar rendering with:", { pageType, cumulativeScore, bestScore });
  
  return (
    <header className="flex justify-between items-center mb-1 bg-transparent pt-2 rounded-lg z-50 relative min-h-0">
      <div className="flex items-center gap-2">
        <img src="/lovable-uploads/c5bd120b-ed39-4828-9d92-541b6aef9cf9.png" alt="Organization Logo" className="h-7 w-auto" loading="lazy" />
        <h1 className="text-xl md:text-2xl font-bold text-white">
          {isAnnotationPage ? 'Ocean Annotation' : 'Quick ID Challenge'}
        </h1>
      </div>
      
      <div className="flex gap-2 items-center">
        {/* Best score display - only show if best score is provided */}
        {bestScore > 0 && (
          <div className="bg-white/80 hover:bg-white text-ocean-dark px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 h-9 transition-all duration-200 shadow-sm hover:shadow-md border border-ocean-dark/20 hover:border-ocean-dark/40">
            <Trophy className="h-4 w-4 text-yellow-600" />
            <span>Best: {bestScore}</span>
          </div>
        )}
        
        <Button
          variant="outline"
          onClick={() => window.location.href = isAnnotationPage ? routes.quickIdGame : routes.home}
          className="bg-white/80 hover:bg-white text-ocean-dark px-3 py-1.5 h-9 text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200 border border-ocean-dark/20 hover:border-ocean-dark/40"
        >
          {isAnnotationPage ? 'Play Quick ID Game' : 'Play Ocean Annotation'}
        </Button>

        <Button
          variant="outline"
          onClick={() => setShowInstructions(true)}
          className="bg-white/80 hover:bg-white text-ocean-dark w-9 h-9 flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-200 border border-ocean-dark/20 hover:border-ocean-dark/40"
        >
          <span className="text-lg font-bold">?</span>
        </Button>
      </div>
    </header>
  );
};

export default NavBar;
