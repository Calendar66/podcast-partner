import React from 'react';
import styled from 'styled-components';
import HistoryList from './HistoryList';
import { HistoryItem } from '../services/historyService';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  historyItems: HistoryItem[];
  onSelectItem: (item: HistoryItem) => void;
  onHistoryChange: () => void;
}

const SidebarContainer = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  right: ${props => props.isOpen ? '0' : '-320px'};
  width: 320px;
  height: 100vh;
  background-color: #fff;
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
  transition: right 0.3s ease;
  z-index: 1000;
  overflow-y: auto;
  padding-top: 60px;
`;

const ToggleButton = styled.button<{ isOpen: boolean }>`
  position: fixed;
  top: 20px;
  right: ${props => props.isOpen ? '330px' : '20px'};
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: right 0.3s ease, background-color 0.2s;
  z-index: 1001;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  
  &:hover {
    background-color: #1976d2;
  }
  
  &:focus {
    outline: none;
  }
`;

const HistoryBadge = styled.div<{ count: number }>`
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: ${props => props.count > 0 ? '#f44336' : 'transparent'};
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 12px;
  display: ${props => props.count > 0 ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  font-weight: bold;
`;

const SidebarContent = styled.div`
  padding: 0 15px;
`;

const SidebarTitle = styled.h2`
  font-size: 1.5rem;
  color: #2196f3;
  margin-bottom: 15px;
  padding: 0 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const HistoryCount = styled.span`
  font-size: 1rem;
  background-color: #e0e0e0;
  color: #666;
  padding: 2px 8px;
  border-radius: 10px;
`;

const Overlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: ${props => props.isOpen ? 'block' : 'none'};
`;

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  toggleSidebar,
  historyItems,
  onSelectItem,
  onHistoryChange
}) => {
  return (
    <>
      <ToggleButton isOpen={isOpen} onClick={toggleSidebar}>
        {isOpen ? '→' : '←'}
        <HistoryBadge count={historyItems.length}>{historyItems.length > 9 ? '9+' : historyItems.length}</HistoryBadge>
      </ToggleButton>
      
      <Overlay isOpen={isOpen} onClick={toggleSidebar} />
      
      <SidebarContainer isOpen={isOpen}>
        <SidebarTitle>
          History
          <HistoryCount>{historyItems.length} items</HistoryCount>
        </SidebarTitle>
        <SidebarContent>
          <HistoryList
            historyItems={historyItems}
            onSelectItem={(item) => {
              onSelectItem(item);
              if (window.innerWidth < 768) {
                toggleSidebar(); // Close sidebar on mobile after selection
              }
            }}
            onHistoryChange={onHistoryChange}
          />
        </SidebarContent>
      </SidebarContainer>
    </>
  );
};

export default Sidebar; 