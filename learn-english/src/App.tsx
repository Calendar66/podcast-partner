import React from 'react';
import styled from 'styled-components';
import PodcastPlayer from './pages/PodcastPlayer';
import './App.css';

const AppContainer = styled.div`
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px 0;
`;

function App() {
  return (
    <AppContainer>
      <PodcastPlayer />
    </AppContainer>
  );
}

export default App;
