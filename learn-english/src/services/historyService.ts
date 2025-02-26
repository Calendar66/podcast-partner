import { TranscriptionResult } from '../types';
import axios from 'axios';

// Define the history item structure
export interface HistoryItem {
  id: string;
  fileName: string;
  date: string;
  audioUrl: string; // This will be a server URL to the audio file
  transcription: TranscriptionResult;
}

// API URL
const API_BASE_URL = 'http://localhost:9000';

// Get all history items
export const getHistoryItems = async (): Promise<HistoryItem[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/history`);
    return response.data;
  } catch (error) {
    console.error('Error fetching history from server:', error);
    return [];
  }
};

// Add a new history item
export const addHistoryItem = async (
  fileName: string,
  audioFile: File,
  transcription: TranscriptionResult
): Promise<HistoryItem | null> => {
  try {
    // The transcription process already saves the history item on the server
    // if the save_to_history parameter is set to true in the transcription request
    // We just need to return the item with the ID that was generated on the server
    if (transcription.id) {
      return {
        id: transcription.id,
        fileName,
        date: new Date().toISOString(),
        audioUrl: `${API_BASE_URL}/history/audio/${transcription.id}_${fileName}`,
        transcription
      };
    }
    return null;
  } catch (error) {
    console.error('Error adding history item:', error);
    return null;
  }
};

// Delete a history item
export const deleteHistoryItem = async (id: string): Promise<boolean> => {
  try {
    await axios.delete(`${API_BASE_URL}/history/${id}`);
    return true;
  } catch (error) {
    console.error('Error deleting history item:', error);
    return false;
  }
};

// Helper function to generate a unique ID (used only as fallback)
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}; 