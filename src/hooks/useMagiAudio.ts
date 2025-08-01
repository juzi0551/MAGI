import { useRef, useCallback } from 'react';
import { FinalStatus } from '../types';

type ProcessingSound = {
  osc: OscillatorNode;
  lfo: OscillatorNode;
  gain: GainNode;
};

export const useMagiAudio = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const processingSoundRef = useRef<ProcessingSound | null>(null);

  const initialize = useCallback(() => {
    if (!audioContextRef.current) {
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        const context = new AudioContext();
        audioContextRef.current = context;
        masterGainRef.current = context.createGain();
        masterGainRef.current.connect(context.destination);
        return true;
      } catch (e) {
        console.error("Web Audio API is not supported in this browser.", e);
        return false;
      }
    }
    return true;
  }, []);

  const setVolume = useCallback((volume: number) => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.setValueAtTime(volume, audioContextRef.current?.currentTime ?? 0);
    }
  }, []);

  const playProcessingSound = useCallback(() => {
    if (!initialize() || !audioContextRef.current || !masterGainRef.current) return () => {};

    if (processingSoundRef.current) {
        return () => {};
    }

    const context = audioContextRef.current;
    const masterGain = masterGainRef.current;

    const gain = context.createGain();
    gain.gain.setValueAtTime(0.5, context.currentTime);

    const lfo = context.createOscillator();
    lfo.type = 'square';
    lfo.frequency.setValueAtTime(10, context.currentTime);
    lfo.connect(gain.gain);

    const osc = context.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(2080, context.currentTime);
    osc.connect(gain);
    gain.connect(masterGain);

    lfo.start(0);
    osc.start(0);

    processingSoundRef.current = { osc, lfo, gain };

    return () => {
      if (processingSoundRef.current) {
        const { osc, lfo } = processingSoundRef.current;
        const stopTime = context.currentTime;
        osc.stop(stopTime);
        lfo.stop(stopTime);
        processingSoundRef.current = null;
      }
    };
  }, [initialize]);

  const stopProcessingSound = useCallback(() => {
    if (processingSoundRef.current && audioContextRef.current) {
        const { osc, lfo } = processingSoundRef.current;
        const stopTime = audioContextRef.current.currentTime;
        osc.stop(stopTime);
        lfo.stop(stopTime);
        processingSoundRef.current = null;
    }
  }, []);

  const playDecisionSound = useCallback((status: FinalStatus) => {
    if (!initialize() || !audioContextRef.current || !masterGainRef.current) return;

    const context = audioContextRef.current;
    const masterGain = masterGainRef.current;

    let frequency: number;
    switch (status) {
      case 'yes':
        frequency = 2000;
        break;
      case 'no':
      case 'error':
        frequency = 3400;
        break;
      case 'conditional':
        frequency = 2700;
        break;
      case 'info':
      default:
        frequency = 2200;
        break;
    }

    const osc = context.createOscillator();
    osc.frequency.setValueAtTime(frequency, context.currentTime);
    osc.connect(masterGain);
    osc.start(0);
    osc.stop(context.currentTime + 0.8);
  }, [initialize]);

  return {
    initialize,
    setVolume,
    playProcessingSound,
    stopProcessingSound,
    playDecisionSound,
  };
};