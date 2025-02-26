import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import FileUploader from '../components/FileUploader';
import AudioPlayer from '../components/AudioPlayer';
import TranscriptCarousel from '../components/TranscriptCarousel';
import Sidebar from '../components/Sidebar';
import { transcribeAudio, mockTranscribeAudio } from '../services/transcriptionService';
import { getHistoryItems, addHistoryItem, HistoryItem } from '../services/historyService';
import { TranscriptionResult, TranscriptSegment, AudioState } from '../types';

const PageContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 30px;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #2196f3;
  margin-bottom: 10px;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: #666;
`;

const NoAudioMessage = styled.div`
  text-align: center;
  padding: 40px;
  background-color: #f8f9fa;
  border-radius: 10px;
  margin-top: 20px;
`;

const PodcastPlayer: React.FC = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [transcription, setTranscription] = useState<TranscriptionResult | null>(null);
  const [audioState, setAudioState] = useState<AudioState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0
  });
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  
  // Load history items on component mount
  useEffect(() => {
    loadHistoryItems();
  }, []);
  
  const loadHistoryItems = async () => {
    setIsLoadingHistory(true);
    try {
      const items = await getHistoryItems();
      setHistoryItems(items);
    } catch (error) {
      console.error('Error loading history items:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  // Handle file upload
  const handleFileSelected = async (file: File) => {
    setAudioFile(file);
    setIsTranscribing(true);
    
    try {
      // Use mockTranscribeAudio for development, replace with transcribeAudio when API is available
      // const result = await mockTranscribeAudio(file);
      const result = await transcribeAudio(file);
      setTranscription(result);
      
      // Set the audio URL from the server
      if (result.id) {
        // Create a properly formatted URL for the audio file
        const serverAudioUrl = `http://localhost:9000/history/audio/${result.id}`;
        console.log('Loading audio from URL:', serverAudioUrl);
        setAudioUrl(serverAudioUrl);
        
        // Add to history (this is now handled by the server)
        await loadHistoryItems(); // Reload history items
      } else {
        // Fallback to local URL if no ID is returned
        const url = URL.createObjectURL(file);
        setAudioUrl(url);
      }
    } catch (error) {
      console.error('Error transcribing audio:', error);
      alert('Error transcribing audio. Please try again.');
    } finally {
      setIsTranscribing(false);
    }
  };
  
  // Handle selecting a history item
  const handleHistoryItemSelected = (item: HistoryItem) => {
    // Use the server audio URL with proper formatting
    let audioUrlToUse = item.audioUrl;
    
    // If the URL is a relative path, convert it to an absolute URL
    if (item.audioUrl.startsWith('/')) {
      audioUrlToUse = `http://localhost:9000${item.audioUrl}`;
    }
    
    // Simplify URL handling - use the base URL with the ID
    if (!audioUrlToUse.startsWith('blob:') && audioUrlToUse.includes('/history/audio/')) {
      // Extract the ID from the URL
      const urlParts = audioUrlToUse.split('/');
      const lastPart = urlParts[urlParts.length - 1];
      const id = lastPart.split('_')[0]; // Get the ID part before any underscore
      
      // Create a clean URL with just the ID
      audioUrlToUse = `http://localhost:9000/history/audio/${id}`;
    }
    
    console.log('Loading audio from URL:', audioUrlToUse);
    setAudioUrl(audioUrlToUse);
    setTranscription(item.transcription);
    setAudioState({
      isPlaying: false,
      currentTime: 0,
      duration: 0
    });
  };
  
  // Clean up object URL when component unmounts
  useEffect(() => {
    return () => {
      if (audioUrl && audioUrl.startsWith('blob:')) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);
  
  // Handle audio time update
  const handleTimeUpdate = (currentTime: number) => {
    setAudioState(prev => ({ ...prev, currentTime }));
  };
  
  // Handle audio duration change
  const handleDurationChange = (duration: number) => {
    setAudioState(prev => ({ ...prev, duration }));
  };
  
  // Handle play state change
  const handlePlayStateChange = (isPlaying: boolean) => {
    setAudioState(prev => ({ ...prev, isPlaying }));
  };
  
  return (
    <PageContainer>
      <Header>
        <Title>English Learning Podcast Player</Title>
        <Subtitle>Upload a podcast, get transcription, and learn English</Subtitle>
      </Header>
      
      <FileUploader 
        onFileSelected={handleFileSelected}
        isLoading={isTranscribing}
      />
      
      {audioUrl && (
        <AudioPlayer 
          audioUrl={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onDurationChange={handleDurationChange}
          onPlayStateChange={handlePlayStateChange}
        />
      )}
      
      {transcription && (
        <TranscriptCarousel 
          segments={transcription.segments}
          currentTime={audioState.currentTime}
          maxSegments={3}
        />
      )}
      
      {!audioUrl && !historyItems.length && !isLoadingHistory && (
        <NoAudioMessage>
          <h2>No audio file uploaded</h2>
          <p>Upload an audio file to get started</p>
        </NoAudioMessage>
      )}
      
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        historyItems={historyItems}
        onSelectItem={handleHistoryItemSelected}
        onHistoryChange={loadHistoryItems}
      />
    </PageContainer>
  );
};

export default PodcastPlayer; 