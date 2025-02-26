import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import { TranscriptSegment } from '../types';

interface TranscriptCarouselProps {
  segments: TranscriptSegment[];
  currentTime: number;
  maxSegments?: number;
}

// Define a type for segment positions
type SegmentPosition = 'far-previous' | 'previous' | 'current' | 'next' | 'far-next';

const CarouselContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 450px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin: 15px 0;
  position: relative;
  overflow: hidden;
`;

const SegmentsWrapper = styled.div`
  width: 100%;
  position: relative;
  height: auto;
  transition: transform 0.5s ease-in-out;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const SegmentContainer = styled.div<{ 
  isActive: boolean; 
  position: SegmentPosition;
  isTransitioning: boolean;
}>`
  width: ${props => {
    if (props.position === 'current') return '90%';
    if (props.position === 'previous' || props.position === 'next') return '85%';
    return '80%';
  }};
  padding: 10px 15px;
  margin: 5px 0;
  background-color: ${props => props.isActive ? '#e3f2fd' : 'white'};
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.5s ease;
  transform: ${props => {
    if (props.position === 'current') return 'scale(1.05)';
    return 'scale(1)';
  }};
  border-left: 5px solid ${props => props.isActive ? '#2196f3' : 'transparent'};
  opacity: ${props => {
    if (props.position === 'current') return 1;
    return props.position === 'far-previous' || props.position === 'far-next' ? 0.5 : 0.7;
  }};
  font-size: ${props => props.position === 'current' ? '1.1em' : '0.9em'};
  position: relative;
  max-width: 900px;
`;

const SpeakerLabel = styled.div`
  font-size: 1rem;
  color: #666;
  margin-bottom: 6px;
  font-weight: bold;
`;

const SegmentText = styled.div<{ position: SegmentPosition }>`
  font-size: ${props => {
    if (props.position === 'current') return '1.8rem';
    if (props.position === 'previous' || props.position === 'next') return '1.4rem';
    return '1.2rem';
  }};
  line-height: 1.6;
  color: ${props => props.position === 'current' ? '#000' : '#333'};
  font-weight: ${props => props.position === 'current' ? '600' : '500'};
  transition: all 0.5s ease;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: normal;
  width: 100%;
  padding: 0 5px;
  text-align: left;
`;

const EmptyMessage = styled.div`
  font-size: 1.4rem;
  color: #666;
  text-align: center;
  padding: 20px;
`;

const TranscriptCarousel: React.FC<TranscriptCarouselProps> = ({
  segments,
  currentTime,
  maxSegments = 7
}) => {
  const [displayedSegments, setDisplayedSegments] = useState<TranscriptSegment[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [prevActiveIndex, setPrevActiveIndex] = useState<number | null>(null);
  const prevSegmentsRef = useRef<TranscriptSegment[]>([]);
  
  // Determine the position of each segment
  const getSegmentPosition = (index: number, segments: TranscriptSegment[], currentTime: number): SegmentPosition => {
    if (segments.length <= 3) {
      // For 1-3 segments, use the original logic
      if (segments.length === 1) return 'current';
      if (segments.length === 2) {
        const firstIsActive = currentTime >= segments[0].start && currentTime <= segments[0].end;
        if (index === 0) return firstIsActive ? 'current' : 'previous';
        return firstIsActive ? 'next' : 'current';
      }
      
      if (index === 0) return 'previous';
      if (index === 1) return 'current';
      return 'next';
    }
    
    // For 7 segments, we want the middle one (index 3) to be current
    const middleIndex = Math.min(3, Math.floor(segments.length / 2));
    
    if (index === middleIndex) return 'current';
    if (index === middleIndex - 1) return 'previous';
    if (index === middleIndex + 1) return 'next';
    if (index < middleIndex - 1) return 'far-previous';
    return 'far-next';
  };
  
  // Extended function to get 7 segments with current in the middle (position 4)
  const getSegmentsToDisplayExtended = (
    allSegments: TranscriptSegment[],
    currentTime: number,
    maxSegments: number = 7
  ): TranscriptSegment[] => {
    if (!allSegments || allSegments.length === 0) return [];
    
    // Find the current segment index
    const currentIndex = allSegments.findIndex(
      segment => currentTime >= segment.start && currentTime <= segment.end
    );
    
    // If no current segment is found, find the next upcoming segment
    if (currentIndex === -1) {
      const nextSegmentIndex = allSegments.findIndex(segment => currentTime < segment.start);
      if (nextSegmentIndex === -1) return []; // No upcoming segments
      
      // For upcoming segments, show the next segment in the middle position (4th position)
      const middlePosition = 3; // 0-indexed, so 3 is the 4th position
      
      // Calculate how many segments to show before and after
      const segmentsBeforeMiddle = Math.min(middlePosition, nextSegmentIndex);
      const segmentsAfterMiddle = Math.min(maxSegments - middlePosition - 1, allSegments.length - nextSegmentIndex - 1);
      
      // Calculate start and end indices
      const startIndex = Math.max(0, nextSegmentIndex - segmentsBeforeMiddle);
      const endIndex = Math.min(allSegments.length - 1, nextSegmentIndex + segmentsAfterMiddle);
      
      // Create the result array
      const result: TranscriptSegment[] = [];
      for (let i = startIndex; i <= endIndex; i++) {
        result.push(allSegments[i]);
      }
      
      return result;
    }
    
    // For current segment, we want it to be in the middle (4th position)
    const middlePosition = 3; // 0-indexed, so 3 is the 4th position
    
    // Calculate how many segments to show before and after
    const segmentsBeforeMiddle = Math.min(middlePosition, currentIndex);
    const segmentsAfterMiddle = Math.min(maxSegments - middlePosition - 1, allSegments.length - currentIndex - 1);
    
    // Calculate start and end indices
    const startIndex = Math.max(0, currentIndex - segmentsBeforeMiddle);
    const endIndex = Math.min(allSegments.length - 1, currentIndex + segmentsAfterMiddle);
    
    // Create the result array
    const result: TranscriptSegment[] = [];
    for (let i = startIndex; i <= endIndex; i++) {
      result.push(allSegments[i]);
    }
    
    return result;
  };
  
  useEffect(() => {
    // Override maxSegments to always be 7
    const segmentsToDisplay = getSegmentsToDisplayExtended(segments, currentTime, 7);
    
    // Find the active segment index in both current and previous sets
    const currentActiveIndex = segmentsToDisplay.findIndex(
      segment => currentTime >= segment.start && currentTime <= segment.end
    );
    
    const prevActiveIndex = prevSegmentsRef.current.findIndex(
      segment => currentTime >= segment.start && currentTime <= segment.end
    );
    
    // Check if we need to transition
    const needsTransition = 
      prevSegmentsRef.current.length > 0 && 
      JSON.stringify(prevSegmentsRef.current) !== JSON.stringify(segmentsToDisplay);
    
    if (needsTransition) {
      setIsTransitioning(true);
      setPrevActiveIndex(prevActiveIndex);
      
      // After a short delay, update the segments
      setTimeout(() => {
        setDisplayedSegments(segmentsToDisplay);
        prevSegmentsRef.current = segmentsToDisplay;
        
        // After the transition completes, reset the transition state
        setTimeout(() => {
          setIsTransitioning(false);
        }, 300);
      }, 200);
    } else {
      // No transition needed, just update
      setDisplayedSegments(segmentsToDisplay);
      prevSegmentsRef.current = segmentsToDisplay;
    }
  }, [segments, currentTime]);
  
  if (!segments || segments.length === 0) {
    return (
      <CarouselContainer>
        <EmptyMessage>No transcript available</EmptyMessage>
      </CarouselContainer>
    );
  }
  
  if (displayedSegments.length === 0) {
    return (
      <CarouselContainer>
        <EmptyMessage>No active segments at this time</EmptyMessage>
      </CarouselContainer>
    );
  }
  
  return (
    <CarouselContainer>
      <SegmentsWrapper 
        style={{ 
          opacity: isTransitioning ? 0.8 : 1,
          transform: isTransitioning ? 'translateY(-10px)' : 'translateY(0)'
        }}
      >
        {displayedSegments.map((segment, index) => {
          const isActive = currentTime >= segment.start && currentTime <= segment.end;
          const position = getSegmentPosition(index, displayedSegments, currentTime);
          
          return (
            <SegmentContainer 
              key={segment.id}
              isActive={isActive}
              position={position}
              isTransitioning={isTransitioning}
            >
              {segment.speaker && <SpeakerLabel>{segment.speaker}</SpeakerLabel>}
              <SegmentText position={position}>{segment.text}</SegmentText>
            </SegmentContainer>
          );
        })}
      </SegmentsWrapper>
    </CarouselContainer>
  );
};

export default TranscriptCarousel; 