# English Learning Podcast Player

An application for learning English through podcast transcription and synchronized playback.

## Features

- Upload WAV or MP3 audio files (podcasts with conversations)
- Automatic transcription using locally deployed OpenAI Whisper
- Synchronized display of transcription with audio playback
- Three-line display showing previous, current, and next sentences, with the current sentence always in the middle
- Playback controls (play/pause, seek, speed control)
- Speaker identification in transcription (if available)
- Server-side history storage for previously uploaded podcasts and their transcriptions
- Persistent history across browser sessions and devices
- Robust audio playback with error handling and retry mechanisms
- Ability to delete history items

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Locally deployed OpenAI Whisper API

## Setup

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Configure the Whisper API endpoint:
   - Open `src/services/transcriptionService.ts`
   - Update the `WHISPER_API_URL` constant to point to your local Whisper API endpoint
4. Configure the API base URL:
   - Open `src/services/historyService.ts`
   - Update the `API_BASE_URL` constant to point to your local Whisper API endpoint

## Running the Application

Start the development server:

```
npm start
```

The application will be available at http://localhost:3000

## Using the Application

1. Upload an audio file (WAV or MP3) using the file uploader
2. The application will automatically transcribe the audio using the Whisper API
3. The transcription and audio file will be saved on the server
4. Once transcription is complete, use the audio player controls to play the podcast
5. The transcript will be displayed in a three-line format, showing the previous, current, and next sentences
6. The current sentence being spoken will be highlighted and displayed in the middle
7. You can control the playback speed using the speed selector
8. Previously uploaded podcasts will be saved in the history section on the server
9. You can click on a history item to load it again or delete it from history
10. If you encounter audio playback issues, the player will display an error message with a retry option

## Recent Updates

### Server-Side History Storage
- History records are now stored on the server instead of in localStorage
- Audio files are stored on the server instead of as blob URLs in the browser
- History is persistent across browser sessions and devices
- Improved error handling for audio playback
- Added loading states and feedback for history operations

### Improved Audio Playback
- Enhanced error handling for audio playback
- Added loading indicators for audio files
- Implemented retry mechanism for failed audio loading
- Better handling of audio URLs with proper encoding

## Development Notes

For development without a Whisper API, the application uses a mock transcription service. To switch between the mock and real service:

- In `src/pages/PodcastPlayer.tsx`, uncomment the line with `transcribeAudio` and comment out the line with `mockTranscribeAudio`

## License

MIT
