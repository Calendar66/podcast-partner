import React, { useState, useRef } from 'react';
import styled from 'styled-components';

interface FileUploaderProps {
  onFileSelected: (file: File) => void;
  isLoading: boolean;
  acceptedFileTypes?: string;
}

const UploaderContainer = styled.div`
  width: 100%;
  padding: 30px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const DropZone = styled.div<{ isDragOver: boolean; isLoading: boolean }>`
  width: 100%;
  height: 200px;
  border: 2px dashed ${props => props.isDragOver ? '#2196f3' : '#ccc'};
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: ${props => props.isLoading ? 'not-allowed' : 'pointer'};
  background-color: ${props => props.isDragOver ? 'rgba(33, 150, 243, 0.05)' : 'transparent'};
  transition: all 0.2s ease;
  opacity: ${props => props.isLoading ? 0.7 : 1};
  
  &:hover {
    border-color: ${props => props.isLoading ? '#ccc' : '#2196f3'};
    background-color: ${props => props.isLoading ? 'transparent' : 'rgba(33, 150, 243, 0.05)'};
  }
`;

const UploadIcon = styled.div`
  font-size: 3rem;
  color: #666;
  margin-bottom: 10px;
`;

const UploadText = styled.p`
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 5px;
`;

const UploadSubtext = styled.p`
  font-size: 0.9rem;
  color: #999;
`;

const HiddenInput = styled.input`
  display: none;
`;

const LoadingSpinner = styled.div`
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-top: 4px solid #2196f3;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  margin-top: 15px;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const FileUploader: React.FC<FileUploaderProps> = ({
  onFileSelected,
  isLoading,
  acceptedFileTypes = 'audio/wav,audio/mp3,audio/mpeg'
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && !isLoading) {
      onFileSelected(files[0]);
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!isLoading) {
      setIsDragOver(true);
    }
  };
  
  const handleDragLeave = () => {
    setIsDragOver(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (isLoading) return;
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.includes('audio')) {
        onFileSelected(file);
      } else {
        alert('Please upload an audio file (WAV or MP3)');
      }
    }
  };
  
  const handleClick = () => {
    if (!isLoading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  return (
    <UploaderContainer>
      <DropZone
        isDragOver={isDragOver}
        isLoading={isLoading}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <UploadIcon>🎧</UploadIcon>
        <UploadText>{isLoading ? 'Processing...' : 'Upload Audio File'}</UploadText>
        <UploadSubtext>Drag & drop or click to browse</UploadSubtext>
        {isLoading && <LoadingSpinner />}
      </DropZone>
      <HiddenInput
        type="file"
        ref={fileInputRef}
        accept={acceptedFileTypes}
        onChange={handleFileChange}
        disabled={isLoading}
      />
    </UploaderContainer>
  );
};

export default FileUploader; 