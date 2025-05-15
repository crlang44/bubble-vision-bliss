// src/components/MusicControl.tsx
import React from 'react';
import { Volume2, VolumeX, Music } from 'lucide-react';
import { useMusic } from './MusicProvider';

const MusicControl: React.FC = () => {
  const { isPlaying, volume, isMuted, togglePlay, toggleMute, changeVolume } = useMusic();

  return (
    <div 
      className="music-control-ocean fixed bottom-4 right-4 rounded-lg p-3 z-50"
      style={{ width: '260px' }} // Slightly wider to fit percentage
    >
      <div className="flex items-center gap-3">
        <button
          onClick={togglePlay}
          className="p-2 rounded-full transition-colors"
          aria-label={isPlaying ? 'Pause music' : 'Play music'}
        >
          <Music className={`h-5 w-5 ${isPlaying ? 'text-blue-600' : 'text-gray-600'}`} />
        </button>
        
        <button
          onClick={toggleMute}
          className="p-2 rounded-full transition-colors"
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? (
            <VolumeX className="h-5 w-5 text-gray-600" />
          ) : (
            <Volume2 className="h-5 w-5 text-gray-600" />
          )}
        </button>
        
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={isMuted ? 0 : volume}
          onChange={(e) => changeVolume(parseFloat(e.target.value))}
          className="w-24"
          aria-label="Volume control"
        />
        
        <span className="text-xs text-gray-600 w-10 text-right">
          {Math.round((isMuted ? 0 : volume) * 100)}%
        </span>
      </div>
    </div>
  );
};

export default MusicControl;