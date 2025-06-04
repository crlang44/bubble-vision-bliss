import React from 'react';
import { Button } from '@/components/ui/button';
import { Trophy, HelpCircle, Gamepad2 } from 'lucide-react';
import { routes, routeLabels } from '../routes';

interface NavBarProps {
  pageType: 'annotation' | 'quickId';
  bestScore?: number;
  onResetScore?: () => void;
  setShowInstructions: (show: boolean) => void;
}

const NavBar: React.FC<NavBarProps> = ({ 
  pageType, 
  bestScore = 0, 
  onResetScore,
  setShowInstructions
}) => {
  const isAnnotationPage = pageType === 'annotation';
  const currentPageTitle = isAnnotationPage ? 'Ocean Annotation' : 'Quick ID';
  const otherPageRoute = isAnnotationPage ? routes.quickId : routes.oceanAnnotation;
  const otherPageTitle = isAnnotationPage ? 'Quick ID' : 'Ocean Annotation';
  
  return (
    <header className="flex justify-between items-center mb-1 bg-transparent pt-2 rounded-lg z-50 relative min-h-0">
      <div className="flex items-center gap-2">
        <img src="/lovable-uploads/c5bd120b-ed39-4828-9d92-541b6aef9cf9.png" alt="Organization Logo" className="h-7 w-auto" loading="lazy" />
        <h1 className="text-xl md:text-2xl font-bold text-white">
          {isAnnotationPage ? 'Ocean Annotation' : 'Quick ID Challenge'}
        </h1>
      </div>
      
      <div className="flex gap-1 items-center">
        {/* Score display - only show if scores are provided */}
        {cumulativeScore !== undefined && (
          <div className="flex gap-1">
            {/* Current score display */}
            <div className="bg-white/20 text-white px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1">
              <Trophy className="h-4 w-4" />
              <span>Score: {cumulativeScore}</span>
            </div>
            
            {/* Best score display */}
            {bestScore > 0 && (
              <div className="bg-yellow-100/30 text-white px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1">
                <Trophy className="h-4 w-4 text-yellow-300" />
                <span>Best: {bestScore}</span>
              </div>
            )}
          </div>
        )}
        
        <Button
          variant="outline"
          onClick={() => setShowInstructions(true)}
          className="bg-white/80 hover:bg-white px-2 py-1 text-xs"
        >
          How to Play
        </Button>
        
        <Button
          variant="outline"
          onClick={() => window.location.href = isAnnotationPage ? routes.quickIdGame : routes.home}
          className="bg-white/80 hover:bg-white px-2 py-1 text-xs"
        >
          {isAnnotationPage ? 'Quick ID Game' : 'Ocean Annotation'}
        </Button>
      </div>
    </nav>
  );
};

export default NavBar;
