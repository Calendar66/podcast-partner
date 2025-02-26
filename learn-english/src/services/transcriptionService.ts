import axios from 'axios';
import { TranscriptionResult } from '../types';

// Configure this to point to your local Whisper API endpoint
const WHISPER_API_URL = 'http://localhost:9000/transcribe';

export const transcribeAudio = async (audioFile: File): Promise<TranscriptionResult> => {
  try {
    const formData = new FormData();
    formData.append('file', audioFile);
    formData.append('language', 'en');
    formData.append('response_format', 'verbose_json');
    formData.append('save_to_history', 'true');
    
    const response = await axios.post(WHISPER_API_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    // Process the response to match our TranscriptionResult format
    const segments = response.data.segments.map((segment: any, index: number) => ({
      id: index,
      start: segment.start,
      end: segment.end,
      text: segment.text,
      // If the Whisper API provides speaker diarization, we can use it here
      speaker: segment.speaker || undefined,
    }));
    
    return {
      segments,
      text: response.data.text,
      id: response.data.id,
      language: response.data.language
    };
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw error;
  }
};

// Fallback function for development/testing when Whisper API is not available
export const mockTranscribeAudio = async (audioFile: File): Promise<TranscriptionResult> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Return mock data
  return {
    segments: [
      { id: 0, start: 0, end: 3.5, text: "Hello, how are you doing today?", speaker: "Speaker 1" },
      { id: 1, start: 3.8, end: 7.2, text: "I'm doing great, thanks for asking! How about you?", speaker: "Speaker 2" },
      { id: 2, start: 7.5, end: 12.0, text: "I'm pretty good. I've been learning English with this new app.", speaker: "Speaker 1" },
      { id: 3, start: 12.3, end: 17.8, text: "That sounds interesting! What features does it have?", speaker: "Speaker 2" },
      { id: 4, start: 18.1, end: 25.0, text: "It transcribes podcasts and shows the text synchronized with the audio. It's really helpful for understanding native speakers.", speaker: "Speaker 1" },
    ],
    text: "Hello, how are you doing today? I'm doing great, thanks for asking! How about you? I'm pretty good. I've been learning English with this new app. That sounds interesting! What features does it have? It transcribes podcasts and shows the text synchronized with the audio. It's really helpful for understanding native speakers.",
    id: "mock-id-" + Date.now()
  };
}; 