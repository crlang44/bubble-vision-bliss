// src/components/MusicProvider.tsx
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

interface MusicContextType {
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  currentTrack: string;
  togglePlay: () => void;
  toggleMute: () => void;
  changeVolume: (volume: number) => void;
  changeTrack: (track: string) => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

const TRACKS = {
  main: '/music/background-music.mp3',
  quickId: '/music/quick-id-music.mp3',
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTrack, setCurrentTrack] = useState('main');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isInitializedRef = useRef(false);

  // Initialize audio only once
  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    audioRef.current = new Audio(TRACKS.main);
    audioRef.current.loop = true;
    
    // Load user preferences
    const savedVolume = localStorage.getItem('musicVolume');
    const savedMuted = localStorage.getItem('musicMuted');
    const savedPlaying = localStorage.getItem('musicPlaying');
    
    let initialVolume = volume;
    if (savedVolume) {
      initialVolume = parseFloat(savedVolume);
      setVolume(initialVolume);
    }
    
    if (savedMuted) {
      setIsMuted(savedMuted === 'true');
    }
    
    // Set initial volume
    audioRef.current.volume = savedMuted === 'true' ? 0 : initialVolume;
    
    if (savedPlaying === 'true') {
      audioRef.current.play().catch(() => {
        console.log('Autoplay prevented by browser');
      });
      setIsPlaying(true);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Handle track changes
  useEffect(() => {
    if (!audioRef.current || !isInitializedRef.current) return;
    
    const wasPlaying = !audioRef.current.paused;
    const currentTime = audioRef.current.currentTime;
    
    audioRef.current.pause();
    audioRef.current.src = TRACKS[currentTrack as keyof typeof TRACKS];
    audioRef.current.load();
    
    // Apply current volume settings
    audioRef.current.volume = isMuted ? 0 : volume;
    
    if (wasPlaying) {
      audioRef.current.play();
    }
  }, [currentTrack]);

  // Handle volume changes - this is the key fix
  useEffect(() => {
    if (!audioRef.current) return;
    
    // Just update the volume property, don't recreate anything
    audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      localStorage.setItem('musicPlaying', 'false');
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        localStorage.setItem('musicPlaying', 'true');
      }).catch(err => {
        console.error('Play error:', err);
      });
    }
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    localStorage.setItem('musicMuted', newMuted.toString());
  };

  const changeVolume = (newVolume: number) => {
    setVolume(newVolume);
    localStorage.setItem('musicVolume', newVolume.toString());
  };

  const changeTrack = (track: string) => {
    setCurrentTrack(track);
  };

  const value = {
    isPlaying,
    volume,
    isMuted,
    currentTrack,
    togglePlay,
    toggleMute,
    changeVolume,
    changeTrack,
  };

  return <MusicContext.Provider value={value}>{children}</MusicContext.Provider>;
};