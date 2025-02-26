import React, { useState } from 'react';
import styled from 'styled-components';
import { HistoryItem, deleteHistoryItem } from '../services/historyService';

interface HistoryListProps {
  historyItems: HistoryItem[];
  onSelectItem: (item: HistoryItem) => void;
  onHistoryChange: () => void;
}

const HistoryItemContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 12px;
  margin-bottom: 10px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const ItemInfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const ItemInfo = styled.div`
  flex: 1;
  cursor: pointer;
  min-width: 0;
  margin-right: 10px;
`;

const FileNameContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FileName = styled.div`
  font-size: 1.1rem;
  font-weight: 500;
  color: #333;
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
`;

const EditIcon = styled.span`
  cursor: pointer;
  color: #666;
  font-size: 0.9rem;
  
  &:hover {
    color: #2196f3;
  }
`;

const FileNameInput = styled.input`
  font-size: 1.1rem;
  font-weight: 500;
  color: #333;
  border: 1px solid #2196f3;
  border-radius: 4px;
  padding: 2px 8px;
  margin-bottom: 5px;
  width: 100%;
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.3);
  }
`;

const ItemDate = styled.div`
  font-size: 0.9rem;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 4px;
`;

const ActionButton = styled.button`
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  flex-shrink: 0;
  font-size: 0.85rem;
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const ViewTextButton = styled(ActionButton)`
  background-color: #2196f3;
  color: white;
  
  &:hover {
    background-color: #1976d2;
  }
`;

const DownloadButton = styled(ActionButton)`
  background-color: #4caf50;
  color: white;
  
  &:hover {
    background-color: #388e3c;
  }
`;

const DeleteButton = styled(ActionButton)`
  background-color: #f44336;
  color: white;
  
  &:hover {
    background-color: #d32f2f;
  }
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 20px;
  color: #666;
  font-size: 1.1rem;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 20px;
  color: #2196f3;
  font-size: 1.1rem;
`;

// Modal components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  padding: 24px;
  position: relative;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  border-bottom: 1px solid #eee;
  padding-bottom: 12px;
`;

const ModalTitle = styled.h3`
  margin: 0;
  color: #333;
  font-size: 1.3rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  
  &:hover {
    color: #333;
  }
`;

const TranscriptText = styled.div`
  white-space: pre-wrap;
  line-height: 1.6;
  color: #333;
  font-size: 1rem;
  padding: 8px 0;
`;

const HistoryList: React.FC<HistoryListProps> = ({ 
  historyItems, 
  onSelectItem,
  onHistoryChange
}) => {
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedTranscript, setSelectedTranscript] = useState<string>('');
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editedFileName, setEditedFileName] = useState<string>('');
  
  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this item from history?')) {
      setDeletingIds(prev => new Set(prev).add(id));
      try {
        const success = await deleteHistoryItem(id);
        if (success) {
          onHistoryChange();
        } else {
          alert('Failed to delete history item. Please try again.');
        }
      } catch (error) {
        console.error('Error deleting history item:', error);
        alert('Error deleting history item. Please try again.');
      } finally {
        setDeletingIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }
    }
  };
  
  const handleViewText = (item: HistoryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTranscript(item.transcription.text);
    setSelectedFileName(item.fileName);
    setShowModal(true);
  };
  
  const handleDownloadText = (item: HistoryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Create a blob with the text content
    const blob = new Blob([item.transcription.text], { type: 'text/plain' });
    
    // Create a URL for the blob
    const url = URL.createObjectURL(blob);
    
    // Create a temporary anchor element
    const a = document.createElement('a');
    a.href = url;
    
    // Set the file name (remove extension and add .txt)
    const fileName = item.fileName.replace(/\.[^/.]+$/, '') + '.txt';
    a.download = fileName;
    
    // Append to the body, click, and remove
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Release the URL object
    URL.revokeObjectURL(url);
  };
  
  const startEditing = (item: HistoryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingItemId(item.id);
    setEditedFileName(item.fileName);
  };
  
  const handleFileNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedFileName(e.target.value);
  };
  
  const handleFileNameKeyDown = (item: HistoryItem, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      saveFileName(item);
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };
  
  const saveFileName = (item: HistoryItem) => {
    // In a real application, you would update the filename on the server here
    // For now, we'll just update it locally
    item.fileName = editedFileName;
    setEditingItemId(null);
    // Trigger a refresh of the history items
    onHistoryChange();
  };
  
  const cancelEditing = () => {
    setEditingItemId(null);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  const isLoading = historyItems.length === 0 && deletingIds.size === 0;
  
  return (
    <>
      {isLoading ? (
        <LoadingMessage>Loading history...</LoadingMessage>
      ) : historyItems.length === 0 ? (
        <EmptyMessage>No history items yet</EmptyMessage>
      ) : (
        historyItems.map(item => (
          <HistoryItemContainer key={item.id}>
            <ItemInfoRow onClick={() => onSelectItem(item)}>
              <ItemInfo>
                <FileNameContainer>
                  {editingItemId === item.id ? (
                    <FileNameInput 
                      value={editedFileName}
                      onChange={handleFileNameChange}
                      onKeyDown={(e) => handleFileNameKeyDown(item, e)}
                      onBlur={() => saveFileName(item)}
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <>
                      <FileName title={item.fileName}>{item.fileName}</FileName>
                      <EditIcon 
                        onClick={(e) => startEditing(item, e)}
                        title="Edit title"
                      >
                        ✎
                      </EditIcon>
                    </>
                  )}
                </FileNameContainer>
                <ItemDate>{formatDate(item.date)}</ItemDate>
              </ItemInfo>
            </ItemInfoRow>
            <ButtonsContainer>
              <ViewTextButton 
                onClick={(e) => handleViewText(item, e)}
                title="View original transcript text"
              >
                View Text
              </ViewTextButton>
              <DownloadButton 
                onClick={(e) => handleDownloadText(item, e)}
                title="Download transcript as text file"
              >
                Download
              </DownloadButton>
              <DeleteButton 
                onClick={(e) => handleDelete(item.id, e)}
                disabled={deletingIds.has(item.id)}
                title="Delete this item from history"
              >
                {deletingIds.has(item.id) ? 'Deleting...' : 'Delete'}
              </DeleteButton>
            </ButtonsContainer>
          </HistoryItemContainer>
        ))
      )}
      
      {/* Modal for displaying transcript text */}
      {showModal && (
        <ModalOverlay onClick={() => setShowModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>{selectedFileName}</ModalTitle>
              <CloseButton onClick={() => setShowModal(false)}>&times;</CloseButton>
            </ModalHeader>
            <TranscriptText>{selectedTranscript}</TranscriptText>
          </ModalContent>
        </ModalOverlay>
      )}
    </>
  );
};

export default HistoryList; 