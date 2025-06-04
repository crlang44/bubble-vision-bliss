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
    <nav className="w-full mb-6" role="navigation" aria-label="Main navigation">
      <div className="flex justify-between items-center px-4 py-3">
        {/* Logo and Title Section */}
        <div className="flex items-center gap-3">
          <img 
            src="/lovable-uploads/c5bd120b-ed39-4828-9d92-541b6aef9cf9.png" 
            alt="Ocean Explorer Logo" 
            className="h-8 w-auto flex-shrink-0" 
            loading="lazy" 
          />
          <div className="flex flex-col">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white leading-tight">
              {currentPageTitle}
            </h1>
            <span className="text-xs text-white/70 hidden sm:block">
              Ocean Explorer Challenge
            </span>
          </div>
        </div>
        
        {/* Score and Actions Section */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Score Display */}
          {bestScore > 0 && (
            <div className="bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-900 px-3 rounded-lg text-sm font-bold flex items-center gap-1.5 shadow-md h-9">
              <Trophy className="h-4 w-4 text-amber-800" />
              <span className="hidden sm:inline">Best:</span>
              <span>{bestScore}</span>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowInstructions(true)}
              className="bg-white/90 hover:bg-white text-ocean-dark border-0 font-medium transition-all duration-200 hover:scale-105 flex items-center gap-1.5 h-9 px-3 min-w-[80px] sm:min-w-[120px]"
              aria-label="Show game instructions"
            >
              <HelpCircle className="h-4 w-4" />
              <span className="hidden sm:inline">How to Play</span>
              <span className="sm:hidden">Help</span>
            </Button>
            
            <Button
              variant="default"
              size="sm"
              onClick={() => window.location.href = otherPageRoute}
              className="bg-ocean-dark hover:bg-ocean-medium text-white border-0 font-medium transition-all duration-200 hover:scale-105 flex items-center gap-1.5 h-9 px-3 min-w-[80px] sm:min-w-[120px]"
              aria-label={`Switch to ${otherPageTitle}`}
            >
              <Gamepad2 className="h-4 w-4" />
              <span className="hidden sm:inline">{otherPageTitle}</span>
              <span className="sm:hidden">Switch</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
