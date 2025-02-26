# Podcast partner Application

An interactive podcast partner application that displays transcripts with synchronized audio playback. The application uses Whisper for speech-to-text conversion.

![image.png](https://obsidian-picture-1313051055.cos.ap-nanjing.myqcloud.com/Obsidian/20250227005526.png)

## Motivation
Google's NotebookLLM is excellent for quickly building understanding of complex concepts. This tool offers the ability to generate **English podcasts** based on the content of a collection of notes. As someone who has a habit of listening to podcasts for half an hour every morning (I recommend my favorite morning companion podcast:生动早咖啡), I deeply understand the value of quality audio content.

To more accurately understand English podcast content and have sufficient time for shadowing practice and reflection, I developed this simple and practical application.

Of course, you can upload any audio content you need to use.

## Features

- Display transcripts with synchronized audio playback
- Seven-line display with the current line highlighted in the middle
- Smooth transitions between segments
- Audio player with playback speed control
- Upload and process audio files
![image.png](https://obsidian-picture-1313051055.cos.ap-nanjing.myqcloud.com/Obsidian/20250227005616.png)


## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)
- Python (v3.8 or later) for the Whisper API

### Installation

1. Clone this repository
2. Install dependencies for the React application:
   ```
   cd learn-english
   npm install
   ```
3. Install dependencies for the Whisper API:
   ```
   cd whisper-api
   pip install -r requirements.txt
   ```

## Running the Application

### Single Command Start (Recommended)

To start both the React application and the Whisper API server with a single command:

```
npm start
```

or

```
./start.sh
```

This will:
1. Start the Whisper API server in the background
2. Start the React application
3. Open the application in your default browser

To stop both services, press `Ctrl+C` in the terminal where you started the application.

### Manual Start

If you prefer to start the services separately:

1. Start the Whisper API server:
   ```
   cd whisper-api
   ./setup_and_run.sh
   ```

2. In a separate terminal, start the React application:
   ```
   cd learn-english
   npm start
   ```

## Usage

1. Open the application in your browser (automatically opened when you run `npm start`)
2. Upload an audio file using the file uploader
3. Once processed, the transcript will be displayed with synchronized audio playback
4. Use the audio player controls to play, pause, and adjust playback speed

## License

This project is licensed under the MIT License.