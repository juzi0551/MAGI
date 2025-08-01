
import React, { createContext, useContext, useCallback, ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface AudioContextType {
  isAudioEnabled: boolean;
  audioVolume: number;
  toggleAudio: () => void;
  setAudioVolume: (volume: number) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};

interface AudioProviderProps {
  children: ReactNode;
}

export const AudioProvider: React.FC<AudioProviderProps> = ({ children }) => {
  const { value: isAudioEnabled, setValue: setIsAudioEnabled } = useLocalStorage<boolean>('audioEnabled', { defaultValue: true });
  const { value: audioVolume, setValue: setAudioVolume } = useLocalStorage<number>('audioVolume', { defaultValue: 30 });

  const toggleAudio = useCallback(() => {
    setIsAudioEnabled((prev: boolean) => !prev);
  }, [setIsAudioEnabled]);

  const setVolume = useCallback((volume: number) => {
    setAudioVolume(volume);
  }, [setAudioVolume]);

  const value = {
    isAudioEnabled,
    audioVolume,
    toggleAudio,
    setAudioVolume: setVolume,
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
};
