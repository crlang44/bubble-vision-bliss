import React from 'react';
import { Fish, Edit, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { routes, routeLabels, getCurrentRoute } from '../routes';

const Navbar: React.FC = () => {
  // Track current path to highlight active button
  const currentPath = getCurrentRoute();

  return (
    <header className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-2">
        <Fish className="text-coral h-8 w-8" />
        <h1 className="text-2xl md:text-3xl font-bold text-white">Ocean Explorer</h1>
      </div>
      
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => window.location.href = routes.home}
          className={`bg-white/80 hover:bg-white ${
            currentPath === routes.home ? 'border-2 border-coral' : ''
          }`}
        >
          <Fish className="h-4 w-4 mr-1" /> {routeLabels[routes.home]}
        </Button>
        
        <Button
          variant="outline"
          onClick={() => window.location.href = routes.quickIdGame}
          className={`bg-white/80 hover:bg-white ${
            currentPath === routes.quickIdGame ? 'border-2 border-coral' : ''
          }`}
        >
          <Zap className="h-4 w-4 mr-1" /> {routeLabels[routes.quickIdGame]}
        </Button>
        
        <Button
          variant="outline"
          onClick={() => window.location.href = routes.groundTruthEditor}
          className={`bg-white/80 hover:bg-white ${
            currentPath === routes.groundTruthEditor ? 'border-2 border-coral' : ''
          }`}
        >
          <Edit className="h-4 w-4 mr-1" /> {routeLabels[routes.groundTruthEditor]}
        </Button>
      </div>
    </header>
  );
};

export default Navbar;