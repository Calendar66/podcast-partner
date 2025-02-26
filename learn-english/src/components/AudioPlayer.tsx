import React, { useRef, useState, useEffect } from 'react';
import styled from 'styled-components';
import { formatTime } from '../utils/audioUtils';
import { AudioState } from '../types';

interface AudioPlayerProps {
  audioUrl: string;
  onTimeUpdate: (currentTime: number) => void;
  onDurationChange: (duration: number) => void;
  onPlayStateChange: (isPlaying: boolean) => void;
}

const PlayerContainer = styled.div`
  width: 100%;
  padding: 20px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
`;

const ControlsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
`;

const PlayButton = styled.button`
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #1976d2;
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.3);
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const TimeDisplay = styled.div`
  font-size: 1rem;
  color: #666;
  font-family: monospace;
`;

const ProgressContainer = styled.div`
  width: 100%;
  height: 10px;
  background-color: #e0e0e0;
  border-radius: 5px;
  cursor: pointer;
  position: relative;
`;

const ProgressBar = styled.div<{ width: string }>`
  height: 100%;
  background-color: #2196f3;
  border-radius: 5px;
  width: ${props => props.width};
  transition: width 0.1s linear;
`;

const SpeedControl = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const SpeedSlider = styled.input`
  -webkit-appearance: none;
  width: 100px;
  height: 5px;
  border-radius: 5px;
  background: #e0e0e0;
  outline: none;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 15px;
    height: 15px;
    border-radius: 50%;
    background: #2196f3;
    cursor: pointer;
  }
  
  &::-moz-range-thumb {
    width: 15px;
    height: 15px;
    border-radius: 50%;
    background: #2196f3;
    cursor: pointer;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SpeedLabel = styled.span`
  font-size: 0.9rem;
  color: #666;
  min-width: 40px;
`;

const ErrorMessage = styled.div`
  color: #f44336;
  margin-top: 10px;
  text-align: center;
  font-size: 0.9rem;
`;

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  onTimeUpdate,
  onDurationChange,
  onPlayStateChange
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [audioState, setAudioState] = useState<AudioState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0
  });
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Reset state when audio URL changes
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    setAudioState({
      isPlaying: false,
      currentTime: 0,
      duration: 0
    });
  }, [audioUrl]);
  
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const handleTimeUpdate = () => {
      const currentTime = audio.currentTime;
      setAudioState(prev => ({ ...prev, currentTime }));
      onTimeUpdate(currentTime);
    };
    
    const handleDurationChange = () => {
      const duration = audio.duration;
      setAudioState(prev => ({ ...prev, duration }));
      onDurationChange(duration);
    };
    
    const handleEnded = () => {
      setAudioState(prev => ({ ...prev, isPlaying: false }));
      onPlayStateChange(false);
    };
    
    const handleCanPlay = () => {
      setIsLoading(false);
    };
    
    const handleError = (e: ErrorEvent) => {
      console.error('Audio playback error:', e);
      setError('Error loading audio. Please try again.');
      setIsLoading(false);
      setAudioState(prev => ({ ...prev, isPlaying: false }));
      onPlayStateChange(false);
    };
    
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError as EventListener);
    
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError as EventListener);
    };
  }, [onTimeUpdate, onDurationChange, onPlayStateChange]);
  
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.playbackRate = playbackRate;
  }, [playbackRate]);
  
  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio || isLoading || error) return;
    
    try {
      if (audioState.isPlaying) {
        audio.pause();
      } else {
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              // Playback started successfully
              setAudioState(prev => ({ ...prev, isPlaying: true }));
              onPlayStateChange(true);
            })
            .catch(err => {
              // Playback failed
              console.error('Error playing audio:', err);
              setError('Error playing audio. Please try again.');
              setAudioState(prev => ({ ...prev, isPlaying: false }));
              onPlayStateChange(false);
            });
        }
        return; // Return early to avoid setting state before promise resolves
      }
    } catch (err) {
      console.error('Error toggling play/pause:', err);
      setError('Error playing audio. Please try again.');
      setAudioState(prev => ({ ...prev, isPlaying: false }));
      onPlayStateChange(false);
      return;
    }
    
    setAudioState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
    onPlayStateChange(!audioState.isPlaying);
  };
  
  // Add keyboard event listeners for controlling playback
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore keyboard events when user is typing in an input field
      if (e.target instanceof HTMLInputElement || 
          e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      const audio = audioRef.current;
      if (!audio || isLoading || error) return;
      
      switch (e.code) {
        case 'Space':
          e.preventDefault(); // Prevent page scrolling
          togglePlayPause();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          const newTimeBackward = Math.max(0, audio.currentTime - 5);
          audio.currentTime = newTimeBackward;
          setAudioState(prev => ({ ...prev, currentTime: newTimeBackward }));
          onTimeUpdate(newTimeBackward);
          break;
        case 'ArrowRight':
          e.preventDefault();
          const newTimeForward = Math.min(audio.duration, audio.currentTime + 5);
          audio.currentTime = newTimeForward;
          setAudioState(prev => ({ ...prev, currentTime: newTimeForward }));
          onTimeUpdate(newTimeForward);
          break;
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLoading, error, onTimeUpdate, togglePlayPause]);
  
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const progressBar = progressRef.current;
    const audio = audioRef.current;
    if (!progressBar || !audio || isLoading || error) return;
    
    const rect = progressBar.getBoundingClientRect();
    const clickPosition = (e.clientX - rect.left) / rect.width;
    const newTime = clickPosition * audioState.duration;
    
    audio.currentTime = newTime;
    setAudioState(prev => ({ ...prev, currentTime: newTime }));
    onTimeUpdate(newTime);
  };
  
  const handlePlaybackRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setPlaybackRate(value);
  };
  
  const retryLoadAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    setIsLoading(true);
    setError(null);
    audio.load(); // Reload the audio
  };
  
  return (
    <PlayerContainer>
      <audio ref={audioRef} src={audioUrl} preload="auto" />
      
      <ControlsContainer>
        <PlayButton 
          onClick={togglePlayPause} 
          disabled={isLoading || !!error}
        >
          {isLoading ? '⏳' : audioState.isPlaying ? '❚❚' : '▶'}
        </PlayButton>
        
        <TimeDisplay>
          {formatTime(audioState.currentTime)} / {formatTime(audioState.duration)}
        </TimeDisplay>
        
        <SpeedControl>
          <SpeedLabel>{playbackRate.toFixed(1)}x</SpeedLabel>
          <SpeedSlider 
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={playbackRate}
            onChange={handlePlaybackRateChange}
            disabled={isLoading || !!error}
          />
        </SpeedControl>
      </ControlsContainer>
      
      <ProgressContainer 
        ref={progressRef} 
        onClick={handleProgressClick}
        style={{ cursor: isLoading || !!error ? 'not-allowed' : 'pointer' }}
      >
        <ProgressBar width={`${(audioState.currentTime / audioState.duration) * 100}%`} />
      </ProgressContainer>
      
      {error && (
        <ErrorMessage>
          {error}
          <button 
            onClick={retryLoadAudio}
            style={{ marginLeft: '10px', cursor: 'pointer' }}
          >
            Retry
          </button>
        </ErrorMessage>
      )}
    </PlayerContainer>
  );
};

export default AudioPlayer; 