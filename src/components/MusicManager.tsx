// src/components/MusicManager.tsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useMusic } from './MusicProvider';

const MusicManager: React.FC = () => {
  const location = useLocation();
  const { changeTrack } = useMusic();

  useEffect(() => {
    // Change track based on current route
    if (location.pathname === '/quick-id') {
      changeTrack('quickId');
    } else {
      changeTrack('main');
    }
  }, [location.pathname, changeTrack]);

  return null; // This component doesn't render anything
};

export default MusicManager;
