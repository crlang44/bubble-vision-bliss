import React from 'react';
import QuickIDGame from '../components/QuickIDGame';

const QuickIDGamePage: React.FC = () => {
  // Set page title via document API
  React.useEffect(() => {
    document.title = "Quick ID Challenge - Ocean Explorer";
  }, []);

  return <QuickIDGame />;
};

export default QuickIDGamePage;