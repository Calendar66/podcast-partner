export interface TranscriptSegment {
  id: number;
  start: number;
  end: number;
  text: string;
  speaker?: string;
}

export interface AudioState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
}

export interface TranscriptionResult {
  segments: TranscriptSegment[];
  text: string;
  id?: string;
  language?: string;
} 