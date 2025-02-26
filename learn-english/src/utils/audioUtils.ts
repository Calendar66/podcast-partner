import { TranscriptSegment } from '../types';

/**
 * Find the current segment based on the current playback time
 */
export const findCurrentSegment = (
  segments: TranscriptSegment[],
  currentTime: number
): TranscriptSegment | null => {
  if (!segments || segments.length === 0) return null;
  
  // Find the segment that contains the current time
  const currentSegment = segments.find(
    segment => currentTime >= segment.start && currentTime <= segment.end
  );
  
  return currentSegment || null;
};

/**
 * Find the previous, current, and next segments to display in the carousel
 * Always returns 3 segments with the current segment in the middle
 */
export const getSegmentsToDisplay = (
  segments: TranscriptSegment[],
  currentTime: number,
  maxSegments: number = 3
): TranscriptSegment[] => {
  if (!segments || segments.length === 0) return [];
  
  // Find the current segment index
  const currentIndex = segments.findIndex(
    segment => currentTime >= segment.start && currentTime <= segment.end
  );
  
  // If no current segment is found, find the next upcoming segment
  if (currentIndex === -1) {
    const nextSegmentIndex = segments.findIndex(segment => currentTime < segment.start);
    if (nextSegmentIndex === -1) return []; // No upcoming segments
    
    // For upcoming segments, show the next segment in the middle position if possible
    const prevIndex = Math.max(0, nextSegmentIndex - 1);
    const nextIndex = Math.min(segments.length - 1, nextSegmentIndex + 1);
    
    // Create an array with up to 3 segments
    const result: TranscriptSegment[] = [];
    
    // Add previous segment if available
    if (prevIndex < nextSegmentIndex) {
      result.push(segments[prevIndex]);
    }
    
    // Add the upcoming segment (middle position)
    result.push(segments[nextSegmentIndex]);
    
    // Add next segment if available
    if (nextIndex > nextSegmentIndex && nextIndex < segments.length) {
      result.push(segments[nextIndex]);
    }
    
    return result;
  }
  
  // For current segment, get previous, current, and next
  const result: TranscriptSegment[] = [];
  
  // Add previous segment if available
  if (currentIndex > 0) {
    result.push(segments[currentIndex - 1]);
  }
  
  // Add current segment (middle position)
  result.push(segments[currentIndex]);
  
  // Add next segment if available
  if (currentIndex < segments.length - 1) {
    result.push(segments[currentIndex + 1]);
  }
  
  return result;
};

/**
 * Format time in seconds to MM:SS format
 */
export const formatTime = (timeInSeconds: number): string => {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}; 