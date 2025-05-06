
import React from 'react';
import QuickIDGame from '../components/QuickIDGame';
import NavBar from '../components/NavBar';

const QuickIDGamePage: React.FC = () => {
  // Set page title via document API
  React.useEffect(() => {
    document.title = "Quick ID Challenge - Ocean Explorer";
  }, []);

  return (
    <div className="min-h-screen bg-ocean-gradient relative">
      <div className="container mx-auto py-6 px-4 relative z-10">
        <NavBar />
        <QuickIDGame />
      </div>
    </div>
  );
};

export default QuickIDGamePage;
